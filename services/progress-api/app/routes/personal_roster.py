from flask import Blueprint, request, jsonify
from typing import Dict
from sqlalchemy import func as sa_func
from sqlalchemy.orm.attributes import flag_modified
from app.models import get_db
from app.models.character_progress import CharacterProgress
from app.models.weekly_task_completion import WeeklyTaskCompletion
from app.models.great_vault_entry import GreatVaultEntry
from app.models.crest_entry import CrestEntry
from app.services.season_service import calculate_current_week, get_weekly_crest_cap
from app.services.task_definitions import get_task_definitions
from app.services.vault_calculator import calculate_vault_slots
from app.services.blizzard_service import BlizzardService
import logging

bp = Blueprint("personal_roster", __name__, url_prefix="/users/me")
logger = logging.getLogger(__name__)

def get_current_user_from_token():
    import os
    if os.getenv("FLASK_ENV") == "development":
        return 1  # Dev mode

    from app.middleware.auth import verify_token
    access_token = request.cookies.get("access_token")
    if not access_token:
        return None
    payload = verify_token(access_token)
    if not payload:
        return None
    return payload.get("bnet_id")

@bp.route("/characters", methods=["GET"])
def list_my_characters():
    bnet_id = get_current_user_from_token()
    if not bnet_id:
        return jsonify({"error": "Not authenticated"}), 401

    db = next(get_db())
    try:
        characters = (
            db.query(CharacterProgress)
            .filter(CharacterProgress.user_bnet_id == bnet_id)
            .order_by(CharacterProgress.display_order.asc())
            .all()
        )

        current_week = calculate_current_week()
        task_defs = get_task_definitions(current_week)
        total_tasks = len(task_defs.get("weekly", [])) + len(task_defs.get("daily", []))

        char_ids = [c.id for c in characters]

        # Aggregate task completions
        task_counts = {}
        if char_ids:
            task_rows = (
                db.query(
                    WeeklyTaskCompletion.character_id,
                    sa_func.count(WeeklyTaskCompletion.id),
                )
                .filter(
                    WeeklyTaskCompletion.character_id.in_(char_ids),
                    WeeklyTaskCompletion.week_number == current_week,
                    WeeklyTaskCompletion.completed == True,
                )
                .group_by(WeeklyTaskCompletion.character_id)
                .all()
            )
            task_counts = {row[0]: row[1] for row in task_rows}

        # Aggregate vault data
        vault_map = {}
        if char_ids:
            vault_rows = (
                db.query(GreatVaultEntry)
                .filter(
                    GreatVaultEntry.character_id.in_(char_ids),
                    GreatVaultEntry.week_number == current_week,
                )
                .all()
            )
            for v in vault_rows:
                raw = {
                    "raid_lfr": v.raid_lfr or 0,
                    "raid_normal": v.raid_normal or 0,
                    "raid_heroic": v.raid_heroic or 0,
                    "raid_mythic": v.raid_mythic or 0,
                    "m_plus_runs": v.m_plus_runs or [],
                    "highest_delve": v.highest_delve or 0,
                }
                vault_map[v.character_id] = {
                    **raw,
                    "calculated_slots": calculate_vault_slots(raw),
                }

        # Aggregate crests
        crest_week_map = {}
        crest_cumulative_map = {}
        if char_ids:
            crest_rows = (
                db.query(
                    CrestEntry.character_id,
                    CrestEntry.crest_type,
                    sa_func.sum(CrestEntry.collected),
                )
                .filter(
                    CrestEntry.character_id.in_(char_ids),
                    CrestEntry.week_number == current_week,
                )
                .group_by(CrestEntry.character_id, CrestEntry.crest_type)
                .all()
            )
            for row in crest_rows:
                cid, ctype, total = row
                if cid not in crest_week_map:
                    crest_week_map[cid] = {}
                crest_week_map[cid][ctype] = total or 0

            cumulative_rows = (
                db.query(
                    CrestEntry.character_id,
                    CrestEntry.crest_type,
                    sa_func.sum(CrestEntry.collected),
                )
                .filter(
                    CrestEntry.character_id.in_(char_ids),
                )
                .group_by(CrestEntry.character_id, CrestEntry.crest_type)
                .all()
            )
            for row in cumulative_rows:
                cid, ctype, total = row
                if cid not in crest_cumulative_map:
                    crest_cumulative_map[cid] = {}
                crest_cumulative_map[cid][ctype] = total or 0

        crest_cap = get_weekly_crest_cap(current_week)

        enriched = []
        for c in characters:
            d = c.to_dict()
            d["weekly_tasks_completed"] = task_counts.get(c.id, 0)
            d["weekly_tasks_total"] = total_tasks
            d["vault_summary"] = vault_map.get(c.id, None)
            week_crests = crest_week_map.get(c.id, None)
            cumulative_crests = crest_cumulative_map.get(c.id, None)
            d["crests_summary"] = {
                "week": week_crests,
                "cumulative": cumulative_crests,
                "cap": crest_cap,
            } if (week_crests or cumulative_crests) else None
            enriched.append(d)

        return jsonify({
            "current_week": current_week,
            "characters": enriched,
        }), 200

    finally:
        db.close()

@bp.route("/characters", methods=["POST"])
def add_my_character():
    bnet_id = get_current_user_from_token()
    if not bnet_id:
        return jsonify({"error": "Not authenticated"}), 401

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    name = data.get("name")
    realm = data.get("realm")
    region = data.get("region", "us")

    if not name or not realm:
        return jsonify({"error": "name and realm are required"}), 400

    db = next(get_db())
    try:
        # Check for duplicate
        existing = (
            db.query(CharacterProgress)
            .filter(
                CharacterProgress.character_name == name,
                CharacterProgress.realm == realm,
                CharacterProgress.user_bnet_id == bnet_id,
            )
            .first()
        )

        if existing:
            return jsonify({"error": "Character already exists in your roster"}), 409

        max_order = (
            db.query(sa_func.max(CharacterProgress.display_order))
            .filter(CharacterProgress.user_bnet_id == bnet_id)
            .scalar()
        )
        next_order = (max_order or 0) + 1

        character = CharacterProgress(
            character_name=name,
            realm=realm,
            region=region,
            guild_id=None,
            user_bnet_id=bnet_id,
            display_order=next_order,
        )
        db.add(character)

        db.commit()
        db.refresh(character)

        return jsonify(character.to_dict()), 201

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to add character: {e}")
        return jsonify({"error": "Failed to add character"}), 500
    finally:
        db.close()

@bp.route("/characters/batch", methods=["POST"])
def batch_add_characters():
    """Add multiple characters at once from Battle.net character picker"""
    bnet_id = get_current_user_from_token()
    if not bnet_id:
        return jsonify({"error": "Not authenticated"}), 401

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    characters_to_add = data.get("characters", [])
    if not characters_to_add:
        return jsonify({"error": "No characters provided"}), 400

    db = next(get_db())
    try:
        # Get current max display_order
        max_order = (
            db.query(sa_func.max(CharacterProgress.display_order))
            .filter(CharacterProgress.user_bnet_id == bnet_id)
            .scalar()
        ) or 0

        # Get existing characters to skip duplicates
        existing = (
            db.query(CharacterProgress.character_name, CharacterProgress.realm)
            .filter(CharacterProgress.user_bnet_id == bnet_id)
            .all()
        )
        existing_set = {(name.lower(), realm.lower()) for name, realm in existing}

        added = []
        skipped = []

        for char_data in characters_to_add:
            name = char_data.get("name")
            realm = char_data.get("realm")
            region = char_data.get("region", "us")
            class_name = char_data.get("class_name")

            if not name or not realm:
                continue

            if (name.lower(), realm.lower()) in existing_set:
                skipped.append({"name": name, "realm": realm, "reason": "already_exists"})
                continue

            max_order += 1
            character = CharacterProgress(
                character_name=name,
                realm=realm,
                region=region,
                class_name=class_name,
                guild_id=None,
                user_bnet_id=bnet_id,
                display_order=max_order,
            )
            db.add(character)
            db.flush()  # Get the ID
            added.append(character.to_dict())
            existing_set.add((name.lower(), realm.lower()))

        db.commit()

        return jsonify({
            "added": added,
            "skipped": skipped,
        }), 201

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to batch add characters: {e}")
        return jsonify({"error": "Failed to add characters"}), 500
    finally:
        db.close()


@bp.route("/characters/<int:cid>", methods=["DELETE"])
def delete_my_character(cid: int):
    bnet_id = get_current_user_from_token()
    if not bnet_id:
        return jsonify({"error": "Not authenticated"}), 401

    db = next(get_db())
    try:
        character = (
            db.query(CharacterProgress)
            .filter(
                CharacterProgress.id == cid,
                CharacterProgress.user_bnet_id == bnet_id,
            )
            .first()
        )

        if not character:
            return jsonify({"error": "Character not found"}), 404

        db.delete(character)
        db.commit()
        return jsonify({"message": "Character deleted"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": "Failed to delete"}), 500
    finally:
        db.close()

@bp.route("/characters/reorder", methods=["POST"])
def reorder_my_characters():
    bnet_id = get_current_user_from_token()
    if not bnet_id:
        return jsonify({"error": "Not authenticated"}), 401

    data = request.get_json()
    order_list = data.get("order", [])

    db = next(get_db())
    try:
        for item in order_list:
            char_id = item.get("id")
            display_order = item.get("display_order")
            if char_id is None or display_order is None:
                continue

            character = (
                db.query(CharacterProgress)
                .filter(
                    CharacterProgress.id == char_id,
                    CharacterProgress.user_bnet_id == bnet_id,
                )
                .first()
            )
            if character:
                character.display_order = display_order

        db.commit()
        return jsonify({"message": "Reordered"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": "Failed to reorder"}), 500
    finally:
        db.close()

@bp.route("/characters/<int:cid>/gear/sync", methods=["POST"])
def sync_my_character_gear(cid: int):
    """Sync character gear from Blizzard API"""
    bnet_id = get_current_user_from_token()
    if not bnet_id:
        return jsonify({"error": "Unauthorized"}), 401

    db = next(get_db())

    try:
        char = db.query(CharacterProgress).filter(
            CharacterProgress.id == cid,
            CharacterProgress.user_bnet_id == bnet_id
        ).first()

        if not char:
            return jsonify({"error": "Character not found"}), 404

        from flask import current_app
        region = getattr(char, "region", None) or current_app.config.get("BLIZZARD_REGION", "us")
        blizz = BlizzardService(region=region)

        # Use existing sync logic from gear service if we want to be thorough, but for MVP personal roster:
        from app.services.gear_parser import parse_equipment_response, calculate_avg_ilvl
        from app.services.stats_parser import parse_character_stats
        from app.services.raiderio_service import RaiderIOService, parse_raiderio_profile, extract_raiderio_gear_icons
        from datetime import datetime, timezone, timedelta

        gear_data = blizz.get_character_equipment(char.character_name, char.realm)
        stats_data = blizz.get_character_stats(char.character_name, char.realm)

        # Sync character profile (class, spec, role, avatar)
        profile_data = blizz.get_character_profile(char.character_name, char.realm)
        if profile_data:
            char.class_name = profile_data.get("character_class", {}).get("name")
            char.spec = profile_data.get("active_spec", {}).get("name")
            if char.class_name and char.spec:
                char.role = blizz._determine_role(char.class_name, char.spec)
            media_href = profile_data.get("media", {}).get("href")
            if media_href:
                avatar_url, render_url = blizz._fetch_media_assets(media_href)
                if avatar_url:
                    char.avatar_url = avatar_url
                if render_url:
                    char.render_url = render_url

        # Sync Raider.IO if never synced or older than 6 hours
        now = datetime.now(timezone.utc)
        rio_icons: Dict[str, str] = {}
        if not char.last_raiderio_sync or now - char.last_raiderio_sync > timedelta(hours=6):
            rio_service = RaiderIOService()
            rio_data = rio_service.get_character_profile(char.character_name, char.realm, region)
            if rio_data:
                mplus, raid, recent_runs = parse_raiderio_profile(rio_data)
                char.mythic_plus_score = mplus
                char.raid_progress = raid
                char.last_raiderio_sync = now

                # Collect icons now; apply after Blizzard gear parse so item_ids are current
                rio_icons = extract_raiderio_gear_icons(rio_data)

                # Update this week's Great Vault entry with M+ runs
                current_week = calculate_current_week(region)
                vault_entry = db.query(GreatVaultEntry).filter(
                    GreatVaultEntry.character_id == char.id,
                    GreatVaultEntry.week_number == current_week
                ).first()

                if not vault_entry:
                    vault_entry = GreatVaultEntry(
                        character_id=char.id,
                        week_number=current_week,
                    )
                    db.add(vault_entry)

                vault_entry.m_plus_runs = recent_runs

        # Auto-fill raid vault slots from Blizzard + WarcraftLogs (always runs on sync)
        current_week = calculate_current_week(region)
        vault_entry = db.query(GreatVaultEntry).filter(
            GreatVaultEntry.character_id == char.id,
            GreatVaultEntry.week_number == current_week
        ).first()

        if not vault_entry:
            vault_entry = GreatVaultEntry(
                character_id=char.id,
                week_number=current_week,
            )
            db.add(vault_entry)

        try:
            from app.services.vault_autofill import auto_fill_raid_vault
            auto_fill_raid_vault(
                char=char,
                vault_entry=vault_entry,
                current_week=current_week,
                region=region,
                db=db,
            )
        except Exception as e:
            logger.warning(f"Raid vault auto-fill failed (non-fatal): {e}")

        if gear_data:
            from app.services.gear_parser import create_empty_gear
            existing_gear = char.parsed_gear if char.parsed_gear else create_empty_gear()
            parsed_gear, equipped_ilvl = parse_equipment_response(gear_data, existing_gear)
            avg_ilvl = calculate_avg_ilvl(parsed_gear)

            char.gear_details = gear_data
            char.current_ilvl = avg_ilvl
            char.last_gear_sync = datetime.now(timezone.utc)

            # Apply raider.io icons first (fast CDN URLs from zamimg)
            for slot_name, icon_url in rio_icons.items():
                if slot_name in parsed_gear and icon_url:
                    if not parsed_gear[slot_name].get("icon_url"):
                        parsed_gear[slot_name]["icon_url"] = icon_url

            # Blizzard API fallback for any slots still missing icons
            try:
                for slot_name, slot_data in parsed_gear.items():
                    if isinstance(slot_data, dict):
                        item_id = slot_data.get("item_id", 0)
                        existing_icon = slot_data.get("icon_url", "")
                        if item_id and not existing_icon:
                            icon_url = blizz.get_item_icon_url(item_id)
                            if icon_url:
                                parsed_gear[slot_name]["icon_url"] = icon_url
            except Exception as e:
                logger.warning(f"Failed to fetch some icon URLs: {e}")

            char.parsed_gear = parsed_gear

            if stats_data:
                parsed_stats = parse_character_stats(stats_data)
                char.character_stats = parsed_stats

        # Always commit any updates (Raider.IO or Gear)
        flag_modified(char, 'parsed_gear')
        db.commit()

        if gear_data:
            return jsonify({"message": "Synced successfully", "ilvl": avg_ilvl})
        else:
            return jsonify({"error": "Failed to sync gear from Blizzard, but Raider.IO updated"}), 206

    finally:
        db.close()

@bp.route("/characters/<int:cid>/gear/sync-all", methods=["POST"])
def sync_all_my_characters(cid: int):
    """Sync all characters for the user"""
    bnet_id = get_current_user_from_token()
    if not bnet_id:
        return jsonify({"error": "Unauthorized"}), 401

    db = next(get_db())

    try:
        chars = db.query(CharacterProgress).filter(
            CharacterProgress.user_bnet_id == bnet_id
        ).all()

        results = []
        for char in chars:
            try:
                from flask import current_app
                region = getattr(char, "region", None) or current_app.config.get("BLIZZARD_REGION", "us")
                blizz = BlizzardService(region=region)
                gear_data = blizz.get_character_equipment(char.character_name, char.realm)
                stats_data = blizz.get_character_stats(char.character_name, char.realm)

                # Sync character profile (class, spec, role, avatar)
                profile_data = blizz.get_character_profile(char.character_name, char.realm)
                if profile_data:
                    char.class_name = profile_data.get("character_class", {}).get("name")
                    char.spec = profile_data.get("active_spec", {}).get("name")
                    if char.class_name and char.spec:
                        char.role = blizz._determine_role(char.class_name, char.spec)
                    media_href = profile_data.get("media", {}).get("href")
                    if media_href:
                        avatar_url, render_url = blizz._fetch_media_assets(media_href)
                        if avatar_url:
                            char.avatar_url = avatar_url
                        if render_url:
                            char.render_url = render_url

                from datetime import datetime, timezone, timedelta
                from app.services.raiderio_service import RaiderIOService, parse_raiderio_profile, extract_raiderio_gear_icons

                now = datetime.now(timezone.utc)
                rio_icons: Dict[str, str] = {}
                if not char.last_raiderio_sync or now - char.last_raiderio_sync > timedelta(hours=6):
                    rio_service = RaiderIOService()
                    rio_data = rio_service.get_character_profile(char.character_name, char.realm, region)
                    if rio_data:
                        mplus, raid, recent_runs = parse_raiderio_profile(rio_data)
                        char.mythic_plus_score = mplus
                        char.raid_progress = raid
                        char.last_raiderio_sync = now

                        # Collect icons now; apply after Blizzard gear parse so item_ids are current
                        rio_icons = extract_raiderio_gear_icons(rio_data)

                        # Update this week's Great Vault entry with M+ runs
                        current_week = calculate_current_week(region)
                        vault_entry = db.query(GreatVaultEntry).filter(
                            GreatVaultEntry.character_id == char.id,
                            GreatVaultEntry.week_number == current_week
                        ).first()

                        if not vault_entry:
                            vault_entry = GreatVaultEntry(
                                character_id=char.id,
                                week_number=current_week,
                            )
                            db.add(vault_entry)

                        vault_entry.m_plus_runs = recent_runs

                # Auto-fill raid vault slots from Blizzard + WarcraftLogs (always runs)
                current_week = calculate_current_week(region)
                vault_entry = db.query(GreatVaultEntry).filter(
                    GreatVaultEntry.character_id == char.id,
                    GreatVaultEntry.week_number == current_week
                ).first()

                if not vault_entry:
                    vault_entry = GreatVaultEntry(
                        character_id=char.id,
                        week_number=current_week,
                    )
                    db.add(vault_entry)

                try:
                    from app.services.vault_autofill import auto_fill_raid_vault
                    auto_fill_raid_vault(
                        char=char,
                        vault_entry=vault_entry,
                        current_week=current_week,
                        region=region,
                        db=db,
                    )
                except Exception as e:
                    logger.warning(f"Raid vault auto-fill failed for {char.character_name} (non-fatal): {e}")

                if gear_data:
                    from app.services.gear_parser import parse_equipment_response, calculate_avg_ilvl, create_empty_gear
                    from app.services.stats_parser import parse_character_stats
                    from datetime import datetime, timezone

                    existing_gear = char.parsed_gear if char.parsed_gear else create_empty_gear()
                    parsed_gear, equipped_ilvl = parse_equipment_response(gear_data, existing_gear)
                    avg_ilvl = calculate_avg_ilvl(parsed_gear)

                    char.gear_details = gear_data
                    char.current_ilvl = avg_ilvl
                    char.last_gear_sync = datetime.now(timezone.utc)

                    # Apply raider.io icons first (fast CDN URLs from zamimg)
                    for slot_name, icon_url in rio_icons.items():
                        if slot_name in parsed_gear and icon_url:
                            if not parsed_gear[slot_name].get("icon_url"):
                                parsed_gear[slot_name]["icon_url"] = icon_url

                    # Blizzard API fallback for any slots still missing icons
                    try:
                        for slot_name, slot_data in parsed_gear.items():
                            if isinstance(slot_data, dict):
                                item_id = slot_data.get("item_id", 0)
                                existing_icon = slot_data.get("icon_url", "")
                                if item_id and not existing_icon:
                                    icon_url = blizz.get_item_icon_url(item_id)
                                    if icon_url:
                                        parsed_gear[slot_name]["icon_url"] = icon_url
                    except Exception as icon_err:
                        logger.warning(f"Failed to fetch some icon URLs for {char.character_name}: {icon_err}")

                    char.parsed_gear = parsed_gear

                    if stats_data:
                        parsed_stats = parse_character_stats(stats_data)
                        char.character_stats = parsed_stats

                    results.append({"name": char.character_name, "status": "ok"})
                else:
                    results.append({"name": char.character_name, "status": "error"})

                flag_modified(char, 'parsed_gear')

            except Exception as e:
                logger.error(f"Error syncing {char.character_name}: {e}")
                results.append({"name": char.character_name, "status": "error"})

        db.commit()
        return jsonify({"results": results})

    finally:
        db.close()

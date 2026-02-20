"""Gear routes - character gear management and Blizzard API sync"""

from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from app.models import get_db
from app.models.character_progress import CharacterProgress
from app.services.permission_service import PermissionService
from app.services.blizzard_service import BlizzardService
from app.services.gear_parser import parse_equipment_response, calculate_avg_ilvl, create_empty_gear
from app.services.stats_parser import parse_character_stats
from app.services.bis_sync_service import sync_bis_with_gear
import logging

bp = Blueprint("gear", __name__, url_prefix="/guilds")
logger = logging.getLogger(__name__)


def get_current_user_from_token():
    """Extract bnet_id from JWT token in cookie"""
    import os
    if os.getenv("FLASK_ENV") == "development":
        return 1  # Dev mode: always return test user bnet_id

    from app.middleware.auth import verify_token

    access_token = request.cookies.get("access_token")
    if not access_token:
        return None

    payload = verify_token(access_token)
    if not payload:
        return None

    return payload.get("bnet_id")


def check_permission(bnet_id: int, guild_id: int, tool: str = "progress"):
    """Check user permission for guild tool access"""
    import os
    if os.getenv("FLASK_ENV") == "development":
        return {"allowed": True, "rank_id": 0}
    perm_service = PermissionService()
    return perm_service.check_permission(bnet_id, guild_id, tool)


@bp.route("/<int:gid>/characters/<int:cid>/gear", methods=["GET"])
def get_gear(gid: int, cid: int):
    """
    Get character gear data.

    Returns parsed gear (16-slot format) and average item level.
    """
    bnet_id = get_current_user_from_token()
    if not bnet_id:
        return jsonify({"error": "Not authenticated"}), 401

    perm_check = check_permission(bnet_id, gid)
    if not perm_check.get("allowed"):
        return jsonify({"error": "Access denied"}), 403

    db = next(get_db())

    try:
        character = (
            db.query(CharacterProgress)
            .filter(
                CharacterProgress.id == cid,
                CharacterProgress.guild_id == gid,
            )
            .first()
        )

        if not character:
            return jsonify({"error": "Character not found"}), 404

        parsed_gear = character.parsed_gear or create_empty_gear()
        avg_ilvl = calculate_avg_ilvl(parsed_gear) if character.parsed_gear else 0.0

        return jsonify({
            "character_id": cid,
            "character_name": character.character_name,
            "realm": character.realm,
            "parsed_gear": parsed_gear,
            "avg_ilvl": avg_ilvl,
            "current_ilvl": character.current_ilvl,
            "character_stats": character.character_stats,
            "last_gear_sync": character.last_gear_sync.isoformat() if character.last_gear_sync else None,
        }), 200

    finally:
        db.close()


@bp.route("/<int:gid>/characters/<int:cid>/gear", methods=["POST"])
def update_gear_slot(gid: int, cid: int):
    """
    Manually update gear for a specific slot.

    Request body:
    {
        "slot": "head",
        "ilvl": 272,
        "item_name": "Crown of the Harbinger",
        "item_id": 12345,
        "track": "Myth"
    }
    """
    bnet_id = get_current_user_from_token()
    if not bnet_id:
        return jsonify({"error": "Not authenticated"}), 401

    perm_check = check_permission(bnet_id, gid)
    if not perm_check.get("allowed"):
        return jsonify({"error": "Access denied"}), 403

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    slot = data.get("slot")
    if not slot:
        return jsonify({"error": "slot is required"}), 400

    db = next(get_db())

    try:
        character = (
            db.query(CharacterProgress)
            .filter(
                CharacterProgress.id == cid,
                CharacterProgress.guild_id == gid,
            )
            .first()
        )

        if not character:
            return jsonify({"error": "Character not found"}), 404

        # Initialize parsed_gear if empty
        parsed_gear = character.parsed_gear or create_empty_gear()

        if slot not in parsed_gear:
            return jsonify({"error": f"Invalid slot: {slot}"}), 400

        # Update the slot
        updatable = ["ilvl", "item_name", "item_id", "track", "quality", "sockets", "enchanted"]
        for field in updatable:
            if field in data:
                parsed_gear[slot][field] = data[field]

        character.parsed_gear = parsed_gear
        character.current_ilvl = calculate_avg_ilvl(parsed_gear)

        db.commit()

        logger.info(f"Gear slot {slot} updated for character {cid} in guild {gid}")

        return jsonify({
            "character_id": cid,
            "slot": slot,
            "parsed_gear": parsed_gear,
            "avg_ilvl": character.current_ilvl,
        }), 200

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update gear slot: {e}")
        return jsonify({"error": "Failed to update gear"}), 500

    finally:
        db.close()


@bp.route("/<int:gid>/characters/<int:cid>/gear/sync", methods=["POST"])
def sync_gear(gid: int, cid: int):
    """
    Sync character gear from Blizzard API.

    Fetches equipment and stats from Blizzard API, parses them,
    updates the character record, and syncs BiS list.
    """
    bnet_id = get_current_user_from_token()
    if not bnet_id:
        return jsonify({"error": "Not authenticated"}), 401

    perm_check = check_permission(bnet_id, gid)
    if not perm_check.get("allowed"):
        return jsonify({"error": "Access denied"}), 403

    db = next(get_db())

    try:
        character = (
            db.query(CharacterProgress)
            .filter(
                CharacterProgress.id == cid,
                CharacterProgress.guild_id == gid,
            )
            .first()
        )

        if not character:
            return jsonify({"error": "Character not found"}), 404

        blizzard = BlizzardService()

        # Fetch equipment from Blizzard API
        equipment_data = blizzard.get_character_equipment(
            character.character_name, character.realm
        )

        if not equipment_data:
            return jsonify({"error": "Failed to fetch gear from Blizzard API"}), 502

        # Parse equipment into 16-slot format
        existing_gear = character.parsed_gear or create_empty_gear()
        parsed_gear, _ = parse_equipment_response(equipment_data, existing_gear)

        # Calculate average ilvl
        avg_ilvl = calculate_avg_ilvl(parsed_gear)

        # Fetch character profile (class, spec, level, avatar)
        profile_data = blizzard.get_character_profile(
            character.character_name, character.realm
        )
        if profile_data:
            class_name = profile_data.get("character_class", {}).get("name")
            spec_name = profile_data.get("active_spec", {}).get("name")
            level = profile_data.get("level")

            if class_name:
                character.class_name = class_name
            if spec_name:
                character.spec = spec_name
            if class_name and spec_name:
                character.role = blizzard._determine_role(class_name, spec_name)
            if level:
                character.level = level

            # Extract avatar URL from profile media
            media = profile_data.get("media")
            if media and isinstance(media, dict):
                avatar_href = media.get("href")
                if avatar_href:
                    # Fetch the media endpoint for the actual avatar URL
                    avatar_data = blizzard._fetch_media_avatar(avatar_href)
                    if avatar_data:
                        character.avatar_url = avatar_data

        # Fetch and parse character stats
        stats_data = blizzard.get_character_stats(
            character.character_name, character.realm
        )
        character_stats = parse_character_stats(stats_data) if stats_data else None

        # Update character record
        character.parsed_gear = parsed_gear
        character.gear_details = equipment_data
        character.current_ilvl = avg_ilvl
        character.last_gear_sync = datetime.now(timezone.utc)
        if character_stats:
            character.character_stats = character_stats

        # Sync BiS list against new gear
        bis_synced = sync_bis_with_gear(cid, db)

        db.commit()

        logger.info(
            f"Gear synced for {character.character_name}-{character.realm} "
            f"(ilvl={avg_ilvl}, bis_synced={bis_synced})"
        )

        return jsonify({
            "character_id": cid,
            "character_name": character.character_name,
            "realm": character.realm,
            "avg_ilvl": avg_ilvl,
            "parsed_gear": parsed_gear,
            "character_stats": character_stats,
            "bis_items_synced": bis_synced,
            "last_gear_sync": character.last_gear_sync.isoformat(),
        }), 200

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to sync gear: {e}")
        return jsonify({"error": "Failed to sync gear from Blizzard"}), 500

    finally:
        db.close()


@bp.route("/<int:gid>/characters/<int:cid>/gear/sync-all", methods=["POST"])
def sync_all_gear(gid: int, cid: int):
    """
    Sync gear for all characters in the guild (batch operation).

    This is a guild-level operation triggered from any character context.
    Returns results for each character.
    """
    bnet_id = get_current_user_from_token()
    if not bnet_id:
        return jsonify({"error": "Not authenticated"}), 401

    perm_check = check_permission(bnet_id, gid)
    if not perm_check.get("allowed"):
        return jsonify({"error": "Access denied"}), 403

    db = next(get_db())

    try:
        characters = (
            db.query(CharacterProgress)
            .filter(CharacterProgress.guild_id == gid)
            .all()
        )

        if not characters:
            return jsonify({"error": "No characters found in guild"}), 404

        blizzard = BlizzardService()
        results = []

        for character in characters:
            result = {
                "character_id": character.id,
                "character_name": character.character_name,
                "realm": character.realm,
                "status": "pending",
            }

            try:
                equipment_data = blizzard.get_character_equipment(
                    character.character_name, character.realm
                )

                if not equipment_data:
                    result["status"] = "failed"
                    result["error"] = "Blizzard API returned no data"
                    results.append(result)
                    continue

                existing_gear = character.parsed_gear or create_empty_gear()
                parsed_gear, _ = parse_equipment_response(equipment_data, existing_gear)
                avg_ilvl = calculate_avg_ilvl(parsed_gear)

                # Fetch profile for class/spec/role/level/avatar
                profile_data = blizzard.get_character_profile(
                    character.character_name, character.realm
                )
                if profile_data:
                    class_name = profile_data.get("character_class", {}).get("name")
                    spec_name = profile_data.get("active_spec", {}).get("name")
                    level = profile_data.get("level")

                    if class_name:
                        character.class_name = class_name
                    if spec_name:
                        character.spec = spec_name
                    if class_name and spec_name:
                        character.role = blizzard._determine_role(class_name, spec_name)
                    if level:
                        character.level = level

                    media = profile_data.get("media")
                    if media and isinstance(media, dict):
                        avatar_href = media.get("href")
                        if avatar_href:
                            avatar_url = blizzard._fetch_media_avatar(avatar_href)
                            if avatar_url:
                                character.avatar_url = avatar_url

                character.parsed_gear = parsed_gear
                character.gear_details = equipment_data
                character.current_ilvl = avg_ilvl
                character.last_gear_sync = datetime.now(timezone.utc)

                # Sync BiS list
                bis_synced = sync_bis_with_gear(character.id, db)

                result["status"] = "success"
                result["avg_ilvl"] = avg_ilvl
                result["bis_items_synced"] = bis_synced

            except Exception as e:
                result["status"] = "error"
                result["error"] = str(e)
                logger.error(
                    f"Failed to sync gear for {character.character_name}: {e}"
                )

            results.append(result)

        db.commit()

        success_count = sum(1 for r in results if r["status"] == "success")
        logger.info(
            f"Batch gear sync for guild {gid}: {success_count}/{len(results)} succeeded"
        )

        return jsonify({
            "guild_id": gid,
            "total": len(results),
            "success": success_count,
            "results": results,
        }), 200

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to batch sync gear: {e}")
        return jsonify({"error": "Failed to batch sync gear"}), 500

    finally:
        db.close()

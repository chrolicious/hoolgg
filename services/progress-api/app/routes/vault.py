"""Vault routes - Great Vault progress tracking and reward calculation"""

from flask import Blueprint, request, jsonify
from app.models import get_db
from app.models.character_progress import CharacterProgress
from app.models.great_vault_entry import GreatVaultEntry
from app.services.permission_service import PermissionService
from app.services.season_service import calculate_current_week
from app.services.vault_calculator import calculate_vault_slots
import logging

bp = Blueprint("vault", __name__, url_prefix="/guilds")
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


@bp.route("/<int:gid>/characters/<int:cid>/vault", methods=["GET"])
def get_vault(gid: int, cid: int):
    """
    Get Great Vault data with calculated reward slots.

    Returns vault progress for the current week and calculated
    reward item levels for raid, dungeon, and world slots.
    """
    bnet_id = get_current_user_from_token()
    if not bnet_id:
        return jsonify({"error": "Not authenticated"}), 401

    perm_check = check_permission(bnet_id, gid)
    if not perm_check.get("allowed"):
        return jsonify({"error": "Access denied"}), 403

    db = next(get_db())

    try:
        # Verify character belongs to guild
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

        current_week = calculate_current_week()

        # Fetch vault entry for current week
        vault_entry = (
            db.query(GreatVaultEntry)
            .filter(
                GreatVaultEntry.character_id == cid,
                GreatVaultEntry.week_number == current_week,
            )
            .first()
        )

        if vault_entry:
            vault_data = vault_entry.to_dict()
            # Calculate reward slots
            calculated_slots = calculate_vault_slots(vault_data)
        else:
            vault_data = {
                "character_id": cid,
                "week_number": current_week,
                "raid_lfr": 0,
                "raid_normal": 0,
                "raid_heroic": 0,
                "raid_mythic": 0,
                "m_plus_runs": [],
                "highest_delve": 0,
                "world_vault": None,
            }
            calculated_slots = calculate_vault_slots(vault_data)

        return jsonify({
            "character_id": cid,
            "character_name": character.character_name,
            "current_week": current_week,
            "progress": vault_data,
            "calculated_slots": calculated_slots,
        }), 200

    finally:
        db.close()


@bp.route("/<int:gid>/characters/<int:cid>/vault", methods=["POST"])
def update_vault(gid: int, cid: int):
    """
    Update Great Vault progress for a specific week (upsert).

    Request body:
    {
        "week_number": 3,
        "raid_lfr": 0,
        "raid_normal": 8,
        "raid_heroic": 6,
        "raid_mythic": 2,
        "m_plus_runs": [12, 11, 10, 10, 9, 8, 7, 5],
        "highest_delve": 8,
        "world_vault": null
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

    week_number = data.get("week_number")
    if week_number is None:
        return jsonify({"error": "week_number is required"}), 400

    db = next(get_db())

    try:
        # Verify character belongs to guild
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

        # Upsert vault entry
        entry = (
            db.query(GreatVaultEntry)
            .filter(
                GreatVaultEntry.character_id == cid,
                GreatVaultEntry.week_number == week_number,
            )
            .first()
        )

        if entry:
            # Update existing fields
            updatable = [
                "raid_lfr", "raid_normal", "raid_heroic", "raid_mythic",
                "m_plus_runs", "highest_delve", "world_vault",
            ]
            for field in updatable:
                if field in data:
                    setattr(entry, field, data[field])
        else:
            entry = GreatVaultEntry(
                character_id=cid,
                week_number=week_number,
                raid_lfr=data.get("raid_lfr", 0),
                raid_normal=data.get("raid_normal", 0),
                raid_heroic=data.get("raid_heroic", 0),
                raid_mythic=data.get("raid_mythic", 0),
                m_plus_runs=data.get("m_plus_runs"),
                highest_delve=data.get("highest_delve", 0),
                world_vault=data.get("world_vault"),
            )
            db.add(entry)

        db.commit()

        # Calculate reward slots for the response
        vault_data = entry.to_dict()
        calculated_slots = calculate_vault_slots(vault_data)

        logger.info(
            f"Vault updated: character={cid}, week={week_number}"
        )

        return jsonify({
            "character_id": cid,
            "progress": vault_data,
            "calculated_slots": calculated_slots,
        }), 200

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update vault: {e}")
        return jsonify({"error": "Failed to update vault data"}), 500

    finally:
        db.close()

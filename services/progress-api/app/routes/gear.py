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

bp = Blueprint("gear", __name__, url_prefix="/users/me")
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




@bp.route("/characters/<int:cid>/gear", methods=["GET"])
def get_gear(cid: int):
    """
    Get character gear data.

    Returns parsed gear (16-slot format) and average item level.
    """
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


@bp.route("/characters/<int:cid>/gear", methods=["POST"])
def update_gear_slot(cid: int):
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
                CharacterProgress.user_bnet_id == bnet_id,
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



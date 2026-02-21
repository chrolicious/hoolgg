"""Crest routes - weekly crest collection tracking per character"""

from flask import Blueprint, request, jsonify
from app.models import get_db
from app.models.character_progress import CharacterProgress
from app.models.crest_entry import CrestEntry
from app.services.permission_service import PermissionService
from app.services.season_service import calculate_current_week, get_weekly_crest_cap
import logging

bp = Blueprint("crests", __name__, url_prefix="/users/me")
logger = logging.getLogger(__name__)

# Valid crest types for The War Within / Midnight
CREST_TYPES = ["Weathered", "Carved", "Runed", "Gilded"]


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




@bp.route("/characters/<int:cid>/crests", methods=["GET"])
def get_crests(cid: int):
    """
    Get crest data for a character with history across all crest types.

    Returns current week data and historical entries grouped by crest type.
    """
    bnet_id = get_current_user_from_token()
    if not bnet_id:
        return jsonify({"error": "Not authenticated"}), 401


    db = next(get_db())

    try:
        # Verify character belongs to guild
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

        current_week = calculate_current_week()
        crest_cap = get_weekly_crest_cap(current_week)

        # Fetch all crest entries for this character
        entries = (
            db.query(CrestEntry)
            .filter(CrestEntry.character_id == cid)
            .order_by(CrestEntry.week_number.asc())
            .all()
        )

        # Group by crest type with history
        crests_by_type = {}
        for crest_type in CREST_TYPES:
            type_entries = [e for e in entries if e.crest_type == crest_type]
            current = next(
                (e for e in type_entries if e.week_number == current_week), None
            )

            crests_by_type[crest_type] = {
                "current_week": current.to_dict() if current else {
                    "crest_type": crest_type,
                    "week_number": current_week,
                    "collected": 0,
                },
                "history": [e.to_dict() for e in type_entries],
                "total_collected": sum(e.collected or 0 for e in type_entries),
            }

        return jsonify({
            "character_id": cid,
            "character_name": character.character_name,
            "current_week": current_week,
            "crest_cap": crest_cap,
            "crests": crests_by_type,
        }), 200

    finally:
        db.close()


@bp.route("/characters/<int:cid>/crests", methods=["POST"])
def update_crest(cid: int):
    """
    Update crest count for a specific type and week (upsert).

    Request body:
    {
        "crest_type": "Gilded",
        "week_number": 3,
        "collected": 45
    }
    """
    bnet_id = get_current_user_from_token()
    if not bnet_id:
        return jsonify({"error": "Not authenticated"}), 401


    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    crest_type = data.get("crest_type")
    week_number = data.get("week_number")
    collected = data.get("collected")

    if not crest_type or week_number is None or collected is None:
        return jsonify({"error": "crest_type, week_number, and collected are required"}), 400

    if crest_type not in CREST_TYPES:
        return jsonify({"error": f"Invalid crest_type. Must be one of: {CREST_TYPES}"}), 400

    db = next(get_db())

    try:
        # Verify character belongs to guild
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

        # Upsert: find existing or create new
        entry = (
            db.query(CrestEntry)
            .filter(
                CrestEntry.character_id == cid,
                CrestEntry.crest_type == crest_type,
                CrestEntry.week_number == week_number,
            )
            .first()
        )

        if entry:
            entry.collected = collected
        else:
            entry = CrestEntry(
                character_id=cid,
                crest_type=crest_type,
                week_number=week_number,
                collected=collected,
            )
            db.add(entry)

        db.commit()

        logger.info(
            f"Crest updated: character={cid}, type={crest_type}, "
            f"week={week_number}, collected={collected}"
        )

        return jsonify(entry.to_dict()), 200

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update crest: {e}")
        return jsonify({"error": "Failed to update crest data"}), 500

    finally:
        db.close()

"""Parses routes - WarcraftLogs parse data retrieval"""

from flask import Blueprint, request, jsonify
from app.models import get_db
from app.models.character_progress import CharacterProgress
import logging

bp = Blueprint("parses", __name__, url_prefix="/users/me")
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


@bp.route("/characters/<int:cid>/parses", methods=["GET"])
def get_parses(cid: int):
    """
    Get WarcraftLogs parse data for a character.

    Returns stored per-boss parse percentages, kill counts, and spec info
    from the most recent WarcraftLogs sync.
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

        parses = character.warcraftlogs_data if character.warcraftlogs_data else {}
        last_synced = (
            character.last_warcraftlogs_sync.isoformat()
            if character.last_warcraftlogs_sync
            else None
        )

        return jsonify({
            "character_id": cid,
            "character_name": character.character_name,
            "parses": parses,
            "last_synced": last_synced,
        }), 200

    finally:
        db.close()

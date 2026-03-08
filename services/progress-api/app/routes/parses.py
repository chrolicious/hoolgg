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

        raw = character.warcraftlogs_data or {}

        # Auto-fetch if no data exists yet (self-healing on first load)
        if not raw:
            from app.services.warcraftlogs_service import WarcraftLogsService
            from datetime import datetime, timezone
            wcl = WarcraftLogsService()
            wcl_parses = wcl.get_character_parses(
                character.character_name, character.realm, character.region or "us"
            )
            if wcl_parses:
                character.warcraftlogs_data = wcl_parses
                character.last_warcraftlogs_sync = datetime.now(timezone.utc)
                db.commit()
                raw = wcl_parses

        last_synced = (
            character.last_warcraftlogs_sync.isoformat()
            if character.last_warcraftlogs_sync
            else None
        )

        # Detect legacy flat format (pre-multi-season) and migrate shape
        # Old format: {"Boss (Heroic)": {...}, ...}
        # New format: {"tww_s3": {...}, "mn_s1": {...}}
        if raw and not any(k in raw for k in ("tww_s3", "mn_s1")):
            seasons = {"tww_s3": raw}
        else:
            seasons = raw

        return jsonify({
            "character_id": cid,
            "character_name": character.character_name,
            "seasons": seasons,
            "last_synced": last_synced,
        }), 200

    finally:
        db.close()


@bp.route("/characters/<int:cid>/parses/sync", methods=["POST"])
def sync_parses(cid: int):
    """
    Force a fresh WarcraftLogs fetch for a character, bypassing the TTL cache.
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

        from app.services.warcraftlogs_service import WarcraftLogsService
        from datetime import datetime, timezone

        wcl = WarcraftLogsService()
        wcl_parses = wcl.get_character_parses(
            character.character_name, character.realm, character.region or "us"
        )

        if wcl_parses:
            character.warcraftlogs_data = wcl_parses
            character.last_warcraftlogs_sync = datetime.now(timezone.utc)
            db.commit()
            raw = wcl_parses
        else:
            raw = character.warcraftlogs_data or {}

        if raw and not any(k in raw for k in ("tww_s3", "mn_s1")):
            seasons = {"tww_s3": raw}
        else:
            seasons = raw

        last_synced = (
            character.last_warcraftlogs_sync.isoformat()
            if character.last_warcraftlogs_sync
            else None
        )

        return jsonify({
            "character_id": cid,
            "character_name": character.character_name,
            "seasons": seasons,
            "last_synced": last_synced,
            "found": bool(wcl_parses),
        }), 200

    finally:
        db.close()

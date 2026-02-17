"""Progress tracking routes - character progression, targets, and guild overview"""

from flask import Blueprint, request, jsonify, current_app
from app.models import get_db
from app.models.character_progress import CharacterProgress
from app.models.weekly_target import WeeklyTarget
from app.models.guild_message import GuildMessage
from app.services.blizzard_service import BlizzardService
from app.services.warcraftlogs_service import WarcraftLogsService
from app.services.permission_service import PermissionService
from app.services.cache_service import CacheService
import logging

bp = Blueprint("progress", __name__, url_prefix="/guilds")
logger = logging.getLogger(__name__)


def get_current_user_from_token():
    """Extract bnet_id from JWT token in cookie"""
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
    perm_service = PermissionService()
    return perm_service.check_permission(bnet_id, guild_id, tool)


@bp.route("/<int:guild_id>/progress/characters", methods=["GET"])
def get_guild_characters(guild_id: int):
    """
    Get all characters in guild with their progress

    Returns list of characters with current iLvl, target, and progress status
    """
    bnet_id = get_current_user_from_token()
    if not bnet_id:
        return jsonify({"error": "Not authenticated"}), 401

    # Check permission
    perm_check = check_permission(bnet_id, guild_id)
    if not perm_check.get("allowed"):
        return jsonify({"error": "Access denied"}), 403

    db = next(get_db())

    try:
        # Fetch all characters for this guild
        characters = (
            db.query(CharacterProgress)
            .filter(CharacterProgress.guild_id == guild_id)
            .all()
        )

        # Get current expansion and week (hardcoded for now - could be dynamic)
        expansion_id = "12.0"
        current_week = 5  # This would come from a date calculation

        # Fetch weekly target for current week
        target = (
            db.query(WeeklyTarget)
            .filter(
                WeeklyTarget.expansion_id == expansion_id,
                WeeklyTarget.week == current_week,
            )
            .first()
        )

        target_ilvl = target.ilvl_target if target else None

        # Build response
        result = []
        for char in characters:
            char_data = char.to_dict()

            # Add progress info
            if char.current_ilvl and target_ilvl:
                delta = char.current_ilvl - target_ilvl
                if delta >= 0:
                    status = "ahead"
                    message = f"Ahead of schedule! Target: {target_ilvl}, Current: {char.current_ilvl}"
                else:
                    status = "behind"
                    message = f"{abs(delta):.1f} iLvl behind. Target: {target_ilvl}, Current: {char.current_ilvl}"
            else:
                status = "unknown"
                message = "Target not set or iLvl not fetched"

            char_data["progress"] = {
                "target_ilvl": target_ilvl,
                "current_week": current_week,
                "status": status,
                "message": message,
            }

            result.append(char_data)

        return jsonify({
            "guild_id": guild_id,
            "characters": result,
            "expansion": expansion_id,
            "current_week": current_week,
        }), 200

    finally:
        db.close()


@bp.route("/<int:guild_id>/progress/character/<string:character_name>", methods=["GET"])
def get_character_details(guild_id: int, character_name: str):
    """
    Get detailed character progress including gear priorities

    Fetches fresh data from Blizzard API if cache is stale
    """
    bnet_id = get_current_user_from_token()
    if not bnet_id:
        return jsonify({"error": "Not authenticated"}), 401

    # Check permission
    perm_check = check_permission(bnet_id, guild_id)
    if not perm_check.get("allowed"):
        return jsonify({"error": "Access denied"}), 403

    # Get realm from query params or use default
    realm = request.args.get("realm")
    if not realm:
        return jsonify({"error": "realm parameter required"}), 400

    db = next(get_db())
    cache_service = CacheService()
    blizzard_service = BlizzardService()

    try:
        # Check cache first
        cached_data = cache_service.get_character_data(character_name, realm)

        if cached_data:
            logger.info(f"Using cached data for {character_name}-{realm}")
            character_data = cached_data
        else:
            logger.info(f"Fetching fresh data from Blizzard for {character_name}-{realm}")

            # Fetch from Blizzard
            character_data = blizzard_service.get_character_data(character_name, realm)

            if not character_data:
                return jsonify({"error": "Character not found or Blizzard API error"}), 404

            # Cache the data
            cache_service.cache_character_data(character_name, realm, character_data)

            # Update or create CharacterProgress record
            existing = (
                db.query(CharacterProgress)
                .filter(
                    CharacterProgress.character_name == character_name,
                    CharacterProgress.realm == realm,
                    CharacterProgress.guild_id == guild_id,
                )
                .first()
            )

            if existing:
                existing.current_ilvl = character_data.get("current_ilvl")
                existing.gear_details = character_data.get("gear_details")
                existing.class_name = character_data.get("class_name")
                existing.spec = character_data.get("spec")
                existing.role = character_data.get("role")
            else:
                new_char = CharacterProgress(
                    character_name=character_name,
                    realm=realm,
                    guild_id=guild_id,
                    class_name=character_data.get("class_name"),
                    spec=character_data.get("spec"),
                    role=character_data.get("role"),
                    current_ilvl=character_data.get("current_ilvl"),
                    gear_details=character_data.get("gear_details"),
                )
                db.add(new_char)

            db.commit()

        # Get current week target
        expansion_id = "12.0"
        current_week = 5

        target = (
            db.query(WeeklyTarget)
            .filter(
                WeeklyTarget.expansion_id == expansion_id,
                WeeklyTarget.week == current_week,
            )
            .first()
        )

        target_ilvl = target.ilvl_target if target else None

        # Calculate gear priorities
        char_obj = (
            db.query(CharacterProgress)
            .filter(
                CharacterProgress.character_name == character_name,
                CharacterProgress.realm == realm,
                CharacterProgress.guild_id == guild_id,
            )
            .first()
        )

        gear_priorities = char_obj.get_gear_priorities() if char_obj else []

        return jsonify({
            "character": character_data,
            "target_ilvl": target_ilvl,
            "current_week": current_week,
            "gear_priorities": gear_priorities,
        }), 200

    except Exception as e:
        db.rollback()
        logger.error(f"Error fetching character details: {e}")
        return jsonify({"error": "Failed to fetch character details"}), 500

    finally:
        db.close()


@bp.route("/<int:guild_id>/progress/members", methods=["GET"])
def get_guild_overview(guild_id: int):
    """
    Get guild progress overview (GM only)

    Shows all guild members with progress status, sortable by iLvl, class, etc.
    """
    bnet_id = get_current_user_from_token()
    if not bnet_id:
        return jsonify({"error": "Not authenticated"}), 401

    # Check permission - must be Officer or above
    perm_service = PermissionService()
    if not perm_service.is_officer_or_above(bnet_id, guild_id):
        return jsonify({"error": "Access denied - Officer rank required"}), 403

    db = next(get_db())

    try:
        # Fetch all characters
        characters = (
            db.query(CharacterProgress)
            .filter(CharacterProgress.guild_id == guild_id)
            .all()
        )

        # Get current target
        expansion_id = "12.0"
        current_week = 5

        target = (
            db.query(WeeklyTarget)
            .filter(
                WeeklyTarget.expansion_id == expansion_id,
                WeeklyTarget.week == current_week,
            )
            .first()
        )

        target_ilvl = target.ilvl_target if target else None

        # Build overview
        members = []
        for char in characters:
            status = "unknown"
            if char.current_ilvl and target_ilvl:
                if char.current_ilvl >= target_ilvl:
                    status = "on_track"
                else:
                    status = "behind"

            members.append({
                "character_name": char.character_name,
                "realm": char.realm,
                "class_name": char.class_name,
                "spec": char.spec,
                "role": char.role,
                "current_ilvl": char.current_ilvl,
                "target_ilvl": target_ilvl,
                "status": status,
                "last_updated": char.last_updated.isoformat() if char.last_updated else None,
            })

        # Apply sorting if requested
        sort_by = request.args.get("sort", "ilvl")
        if sort_by == "ilvl":
            members.sort(key=lambda x: x.get("current_ilvl") or 0, reverse=True)
        elif sort_by == "name":
            members.sort(key=lambda x: x.get("character_name", ""))
        elif sort_by == "class":
            members.sort(key=lambda x: x.get("class_name", ""))

        # Apply filters
        class_filter = request.args.get("class")
        role_filter = request.args.get("role")
        status_filter = request.args.get("status")

        if class_filter:
            members = [m for m in members if m.get("class_name") == class_filter]
        if role_filter:
            members = [m for m in members if m.get("role") == role_filter]
        if status_filter:
            members = [m for m in members if m.get("status") == status_filter]

        return jsonify({
            "guild_id": guild_id,
            "members": members,
            "target_ilvl": target_ilvl,
            "current_week": current_week,
            "expansion": expansion_id,
        }), 200

    finally:
        db.close()


@bp.route("/<int:guild_id>/progress/message", methods=["GET"])
def get_guild_message(guild_id: int):
    """
    Get weekly guidance message for guild

    Returns the GM's weekly message (if set)
    """
    bnet_id = get_current_user_from_token()
    if not bnet_id:
        return jsonify({"error": "Not authenticated"}), 401

    # Check permission
    perm_check = check_permission(bnet_id, guild_id)
    if not perm_check.get("allowed"):
        return jsonify({"error": "Access denied"}), 403

    db = next(get_db())

    try:
        message = (
            db.query(GuildMessage)
            .filter(GuildMessage.guild_id == guild_id)
            .first()
        )

        if message:
            return jsonify(message.to_dict()), 200
        else:
            return jsonify({
                "guild_id": guild_id,
                "gm_message": None,
                "updated_at": None,
            }), 200

    finally:
        db.close()


@bp.route("/<int:guild_id>/progress/message", methods=["PUT"])
def set_guild_message(guild_id: int):
    """
    Set weekly guidance message (GM only)

    Request body:
    {
        "message": "Focus on gearing your DPS. Mythic+ runs this week!"
    }
    """
    bnet_id = get_current_user_from_token()
    if not bnet_id:
        return jsonify({"error": "Not authenticated"}), 401

    # Check if user is GM
    perm_service = PermissionService()
    if not perm_service.is_guild_master(bnet_id, guild_id):
        return jsonify({"error": "Access denied - Guild Master only"}), 403

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    message_text = data.get("message")

    db = next(get_db())

    try:
        # Find or create guild message
        message = (
            db.query(GuildMessage)
            .filter(GuildMessage.guild_id == guild_id)
            .first()
        )

        if message:
            message.gm_message = message_text
            message.created_by = bnet_id
        else:
            message = GuildMessage(
                guild_id=guild_id,
                gm_message=message_text,
                created_by=bnet_id,
            )
            db.add(message)

        db.commit()

        logger.info(f"Guild message updated for guild {guild_id} by bnet_id={bnet_id}")

        return jsonify(message.to_dict()), 200

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update guild message: {e}")
        return jsonify({"error": "Failed to update message"}), 500

    finally:
        db.close()


@bp.route("/<int:guild_id>/progress/roadmap", methods=["GET"])
def get_expansion_roadmap(guild_id: int):
    """
    Get expansion roadmap (weekly targets)

    Returns all weekly targets for current expansion
    """
    bnet_id = get_current_user_from_token()
    if not bnet_id:
        return jsonify({"error": "Not authenticated"}), 401

    # Check permission
    perm_check = check_permission(bnet_id, guild_id)
    if not perm_check.get("allowed"):
        return jsonify({"error": "Access denied"}), 403

    db = next(get_db())

    try:
        expansion_id = "12.0"

        targets = (
            db.query(WeeklyTarget)
            .filter(WeeklyTarget.expansion_id == expansion_id)
            .order_by(WeeklyTarget.week.asc())
            .all()
        )

        roadmap = {
            "expansion_id": expansion_id,
            "weeks": [target.to_dict() for target in targets],
        }

        return jsonify(roadmap), 200

    finally:
        db.close()


@bp.route("/<int:guild_id>/progress/comparisons", methods=["GET"])
def get_wcl_comparisons(guild_id: int):
    """
    Get WarcraftLogs comparison data (public data only)

    Compares guild to realm averages
    """
    bnet_id = get_current_user_from_token()
    if not bnet_id:
        return jsonify({"error": "Not authenticated"}), 401

    # Check permission
    perm_check = check_permission(bnet_id, guild_id)
    if not perm_check.get("allowed"):
        return jsonify({"error": "Access denied"}), 403

    # Get guild info from query params
    guild_name = request.args.get("guild_name")
    realm = request.args.get("realm")
    region = request.args.get("region", "us")

    if not guild_name or not realm:
        return jsonify({"error": "guild_name and realm parameters required"}), 400

    wcl_service = WarcraftLogsService()

    try:
        comparison = wcl_service.compare_to_realm(guild_name, realm, region)

        return jsonify(comparison), 200

    except Exception as e:
        logger.error(f"Failed to fetch WCL comparisons: {e}")
        return jsonify({"error": "Failed to fetch comparison data"}), 500

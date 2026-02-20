"""Profession routes - character profession slots and weekly progress"""

from flask import Blueprint, request, jsonify
from app.models import get_db
from app.models.character_progress import CharacterProgress
from app.models.character_profession import CharacterProfession
from app.models.profession_progress import ProfessionProgress
from app.services.permission_service import PermissionService
from app.services.season_service import calculate_current_week
import logging

bp = Blueprint("professions", __name__, url_prefix="/guilds")
logger = logging.getLogger(__name__)

# Available professions in WoW
AVAILABLE_PROFESSIONS = [
    "Alchemy", "Blacksmithing", "Enchanting", "Engineering",
    "Herbalism", "Inscription", "Jewelcrafting", "Leatherworking",
    "Mining", "Skinning", "Tailoring", "Cooking", "Fishing",
]


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


@bp.route("/<int:gid>/characters/<int:cid>/professions", methods=["GET"])
def get_professions(gid: int, cid: int):
    """
    Get profession data for a character.

    Returns assigned professions and their weekly progress for the current week.
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

        # Fetch assigned professions
        professions = (
            db.query(CharacterProfession)
            .filter(CharacterProfession.character_id == cid)
            .order_by(CharacterProfession.slot_index.asc())
            .all()
        )

        # Fetch weekly progress for assigned professions
        profession_names = [p.profession_name for p in professions]
        progress_entries = (
            db.query(ProfessionProgress)
            .filter(
                ProfessionProgress.character_id == cid,
                ProfessionProgress.week_number == current_week,
                ProfessionProgress.profession_name.in_(profession_names),
            )
            .all()
        ) if profession_names else []

        progress_map = {p.profession_name: p for p in progress_entries}

        # Build response
        result = []
        for prof in professions:
            progress = progress_map.get(prof.profession_name)
            result.append({
                "profession": prof.to_dict(),
                "weekly_progress": progress.to_dict() if progress else None,
            })

        return jsonify({
            "character_id": cid,
            "character_name": character.character_name,
            "current_week": current_week,
            "professions": result,
        }), 200

    finally:
        db.close()


@bp.route("/<int:gid>/characters/<int:cid>/professions", methods=["PUT"])
def set_professions(gid: int, cid: int):
    """
    Set profession slots for a character (replaces existing).

    Request body:
    {
        "professions": ["Blacksmithing", "Mining"]
    }
    """
    bnet_id = get_current_user_from_token()
    if not bnet_id:
        return jsonify({"error": "Not authenticated"}), 401

    perm_check = check_permission(bnet_id, gid)
    if not perm_check.get("allowed"):
        return jsonify({"error": "Access denied"}), 403

    data = request.get_json()
    if not data or "professions" not in data:
        return jsonify({"error": "professions list is required"}), 400

    profession_list = data["professions"]
    if not isinstance(profession_list, list) or len(profession_list) > 2:
        return jsonify({"error": "Maximum 2 professions allowed"}), 400

    # Validate profession names
    for name in profession_list:
        if name not in AVAILABLE_PROFESSIONS:
            return jsonify({"error": f"Invalid profession: {name}"}), 400

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

        # Delete existing professions
        db.query(CharacterProfession).filter(
            CharacterProfession.character_id == cid
        ).delete()

        # Create new profession assignments
        new_profs = []
        for idx, name in enumerate(profession_list):
            prof = CharacterProfession(
                character_id=cid,
                profession_name=name,
                slot_index=idx,
            )
            db.add(prof)
            new_profs.append(prof)

        db.commit()

        logger.info(
            f"Professions set for character {cid}: {profession_list}"
        )

        return jsonify({
            "character_id": cid,
            "professions": [p.to_dict() for p in new_profs],
        }), 200

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to set professions: {e}")
        return jsonify({"error": "Failed to set professions"}), 500

    finally:
        db.close()


@bp.route("/<int:gid>/characters/<int:cid>/professions/progress", methods=["POST"])
def update_profession_progress(gid: int, cid: int):
    """
    Update weekly profession progress (upsert).

    Request body:
    {
        "profession_name": "Blacksmithing",
        "week_number": 3,
        "weekly_quest": true,
        "patron_orders": false,
        "treatise": true,
        "knowledge_points": 15,
        "concentration": 200
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

    profession_name = data.get("profession_name")
    week_number = data.get("week_number")

    if not profession_name or week_number is None:
        return jsonify({"error": "profession_name and week_number are required"}), 400

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

        # Upsert profession progress
        entry = (
            db.query(ProfessionProgress)
            .filter(
                ProfessionProgress.character_id == cid,
                ProfessionProgress.profession_name == profession_name,
                ProfessionProgress.week_number == week_number,
            )
            .first()
        )

        if entry:
            # Update existing fields
            updatable = ["weekly_quest", "patron_orders", "treatise", "knowledge_points", "concentration"]
            for field in updatable:
                if field in data:
                    setattr(entry, field, data[field])
        else:
            entry = ProfessionProgress(
                character_id=cid,
                profession_name=profession_name,
                week_number=week_number,
                weekly_quest=data.get("weekly_quest", False),
                patron_orders=data.get("patron_orders", False),
                treatise=data.get("treatise", False),
                knowledge_points=data.get("knowledge_points", 0),
                concentration=data.get("concentration", 0),
            )
            db.add(entry)

        db.commit()

        logger.info(
            f"Profession progress updated: character={cid}, "
            f"profession={profession_name}, week={week_number}"
        )

        return jsonify(entry.to_dict()), 200

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update profession progress: {e}")
        return jsonify({"error": "Failed to update profession progress"}), 500

    finally:
        db.close()

"""Talent build routes - saved talent configurations per character"""

from flask import Blueprint, request, jsonify
from app.models import get_db
from app.models.character_progress import CharacterProgress
from app.models.talent_build import TalentBuild
from app.services.permission_service import PermissionService
import logging

bp = Blueprint("talents", __name__, url_prefix="/guilds")
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


@bp.route("/<int:gid>/characters/<int:cid>/talents", methods=["GET"])
def list_talent_builds(gid: int, cid: int):
    """
    List all saved talent builds for a character.

    Returns builds grouped by category (Raid, M+, PvP).
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

        builds = (
            db.query(TalentBuild)
            .filter(TalentBuild.character_id == cid)
            .order_by(TalentBuild.category.asc(), TalentBuild.name.asc())
            .all()
        )

        return jsonify({
            "character_id": cid,
            "character_name": character.character_name,
            "builds": [b.to_dict() for b in builds],
            "total": len(builds),
        }), 200

    finally:
        db.close()


@bp.route("/<int:gid>/characters/<int:cid>/talents", methods=["POST"])
def add_talent_build(gid: int, cid: int):
    """
    Add a talent build to the character.

    Request body:
    {
        "category": "Raid",
        "name": "Mythic Prog Build",
        "talent_string": "BYGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAc..."
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

    category = data.get("category")
    name = data.get("name")
    talent_string = data.get("talent_string")

    if not category or not name or not talent_string:
        return jsonify({"error": "category, name, and talent_string are required"}), 400

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

        build = TalentBuild(
            character_id=cid,
            category=category,
            name=name,
            talent_string=talent_string,
        )
        db.add(build)
        db.commit()

        logger.info(
            f"Talent build added: character={cid}, category={category}, name={name}"
        )

        return jsonify(build.to_dict()), 201

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to add talent build: {e}")
        return jsonify({"error": "Failed to add talent build"}), 500

    finally:
        db.close()


@bp.route("/<int:gid>/characters/<int:cid>/talents/<int:talent_id>", methods=["PUT"])
def update_talent_build(gid: int, cid: int, talent_id: int):
    """
    Update a talent build.

    Request body (all fields optional):
    {
        "category": "M+",
        "name": "Fortified Build",
        "talent_string": "BYGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAd..."
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

        build = (
            db.query(TalentBuild)
            .filter(
                TalentBuild.id == talent_id,
                TalentBuild.character_id == cid,
            )
            .first()
        )

        if not build:
            return jsonify({"error": "Talent build not found"}), 404

        # Update allowed fields
        updatable_fields = ["category", "name", "talent_string"]
        for field in updatable_fields:
            if field in data:
                setattr(build, field, data[field])

        db.commit()

        logger.info(f"Talent build {talent_id} updated for character {cid}")

        return jsonify(build.to_dict()), 200

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update talent build: {e}")
        return jsonify({"error": "Failed to update talent build"}), 500

    finally:
        db.close()


@bp.route("/<int:gid>/characters/<int:cid>/talents/<int:talent_id>", methods=["DELETE"])
def delete_talent_build(gid: int, cid: int, talent_id: int):
    """
    Delete a talent build.
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

        build = (
            db.query(TalentBuild)
            .filter(
                TalentBuild.id == talent_id,
                TalentBuild.character_id == cid,
            )
            .first()
        )

        if not build:
            return jsonify({"error": "Talent build not found"}), 404

        build_name = build.name
        db.delete(build)
        db.commit()

        logger.info(f"Talent build {talent_id} ({build_name}) deleted for character {cid}")

        return jsonify({"message": f"Talent build '{build_name}' deleted"}), 200

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to delete talent build: {e}")
        return jsonify({"error": "Failed to delete talent build"}), 500

    finally:
        db.close()

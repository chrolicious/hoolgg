"""Character roster routes - CRUD for guild roster characters"""

from flask import Blueprint, request, jsonify
from app.models import get_db
from app.models.character_progress import CharacterProgress
from app.services.permission_service import PermissionService
import logging

bp = Blueprint("characters", __name__, url_prefix="/guilds")
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
    import os
    if os.getenv("FLASK_ENV") == "development":
        return {"allowed": True, "rank_id": 0}
    perm_service = PermissionService()
    return perm_service.check_permission(bnet_id, guild_id, tool)


@bp.route("/<int:gid>/characters", methods=["GET"])
def list_characters(gid: int):
    """
    List all characters for a guild, sorted by display_order.

    Returns list of characters with their roster configuration.
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
            .order_by(CharacterProgress.display_order.asc())
            .all()
        )

        return jsonify({
            "guild_id": gid,
            "characters": [c.to_dict() for c in characters],
        }), 200

    finally:
        db.close()


@bp.route("/<int:gid>/characters", methods=["POST"])
def add_character(gid: int):
    """
    Add a character to the guild roster.

    Request body:
    {
        "name": "Arthas",
        "realm": "area-52",
        "class_name": "Death Knight",
        "spec": "Frost"
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

    name = data.get("name")
    realm = data.get("realm")
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
                CharacterProgress.guild_id == gid,
            )
            .first()
        )

        if existing:
            return jsonify({"error": "Character already exists in this guild"}), 409

        # Determine next display_order
        from sqlalchemy import func as sa_func

        max_order = (
            db.query(sa_func.max(CharacterProgress.display_order))
            .filter(CharacterProgress.guild_id == gid)
            .scalar()
        )
        next_order = (max_order or 0) + 1

        character = CharacterProgress(
            character_name=name,
            realm=realm,
            guild_id=gid,
            class_name=data.get("class_name"),
            spec=data.get("spec"),
            role=data.get("role"),
            user_bnet_id=data.get("user_bnet_id"),
            display_order=next_order,
        )
        db.add(character)
        db.commit()

        logger.info(f"Character {name}-{realm} added to guild {gid}")

        return jsonify(character.to_dict()), 201

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to add character: {e}")
        return jsonify({"error": "Failed to add character"}), 500

    finally:
        db.close()


@bp.route("/<int:gid>/characters/<int:cid>", methods=["PUT"])
def update_character(gid: int, cid: int):
    """
    Update character configuration.

    Request body (all fields optional):
    {
        "display_order": 2,
        "class_name": "Death Knight",
        "spec": "Unholy",
        "role": "DPS"
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

        # Update allowed fields
        updatable_fields = ["display_order", "class_name", "spec", "role", "user_bnet_id"]
        for field in updatable_fields:
            if field in data:
                setattr(character, field, data[field])

        db.commit()

        logger.info(f"Character {cid} updated in guild {gid}")

        return jsonify(character.to_dict()), 200

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update character: {e}")
        return jsonify({"error": "Failed to update character"}), 500

    finally:
        db.close()


@bp.route("/<int:gid>/characters/<int:cid>", methods=["DELETE"])
def delete_character(gid: int, cid: int):
    """
    Delete a character and cascade to all related data.

    Related data (crest entries, profession progress, task completions,
    BiS items, talent builds, vault entries, character professions)
    is automatically cascaded via foreign key ON DELETE CASCADE.
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

        char_name = character.character_name
        db.delete(character)
        db.commit()

        logger.info(f"Character {char_name} (id={cid}) deleted from guild {gid}")

        return jsonify({"message": f"Character {char_name} deleted"}), 200

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to delete character: {e}")
        return jsonify({"error": "Failed to delete character"}), 500

    finally:
        db.close()


@bp.route("/<int:gid>/characters/reorder", methods=["POST"])
def reorder_characters(gid: int):
    """
    Reorder characters in the roster.

    Request body:
    {
        "order": [
            {"id": 1, "display_order": 0},
            {"id": 2, "display_order": 1},
            {"id": 3, "display_order": 2}
        ]
    }
    """
    bnet_id = get_current_user_from_token()
    if not bnet_id:
        return jsonify({"error": "Not authenticated"}), 401

    perm_check = check_permission(bnet_id, gid)
    if not perm_check.get("allowed"):
        return jsonify({"error": "Access denied"}), 403

    data = request.get_json()
    if not data or "order" not in data:
        return jsonify({"error": "order list is required"}), 400

    order_list = data["order"]
    if not isinstance(order_list, list):
        return jsonify({"error": "order must be a list"}), 400

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
                    CharacterProgress.guild_id == gid,
                )
                .first()
            )

            if character:
                character.display_order = display_order

        db.commit()

        logger.info(f"Reordered {len(order_list)} characters in guild {gid}")

        return jsonify({"message": "Characters reordered"}), 200

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to reorder characters: {e}")
        return jsonify({"error": "Failed to reorder characters"}), 500

    finally:
        db.close()

"""BiS (Best-in-Slot) routes - gear target tracking per character"""

from flask import Blueprint, request, jsonify
from app.models import get_db
from app.models.character_progress import CharacterProgress
from app.models.bis_item import BisItem
from app.services.permission_service import PermissionService
import logging

bp = Blueprint("bis", __name__, url_prefix="/guilds")
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


@bp.route("/<int:gid>/characters/<int:cid>/bis", methods=["GET"])
def list_bis_items(gid: int, cid: int):
    """
    List all BiS items for a character.

    Returns the full BiS list with obtained/synced status.
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

        items = (
            db.query(BisItem)
            .filter(BisItem.character_id == cid)
            .order_by(BisItem.slot.asc())
            .all()
        )

        obtained_count = sum(1 for i in items if i.obtained)

        return jsonify({
            "character_id": cid,
            "character_name": character.character_name,
            "items": [i.to_dict() for i in items],
            "total": len(items),
            "obtained": obtained_count,
        }), 200

    finally:
        db.close()


@bp.route("/<int:gid>/characters/<int:cid>/bis", methods=["POST"])
def add_bis_item(gid: int, cid: int):
    """
    Add a BiS item to the character's list.

    Request body:
    {
        "slot": "Head",
        "item_name": "Crown of the Harbinger",
        "item_id": 12345,
        "target_ilvl": 278
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
    item_name = data.get("item_name")
    if not slot or not item_name:
        return jsonify({"error": "slot and item_name are required"}), 400

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

        item = BisItem(
            character_id=cid,
            slot=slot,
            item_name=item_name,
            item_id=data.get("item_id"),
            target_ilvl=data.get("target_ilvl"),
        )
        db.add(item)
        db.commit()

        logger.info(f"BiS item added: character={cid}, slot={slot}, item={item_name}")

        return jsonify(item.to_dict()), 201

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to add BiS item: {e}")
        return jsonify({"error": "Failed to add BiS item"}), 500

    finally:
        db.close()


@bp.route("/<int:gid>/characters/<int:cid>/bis/<int:bis_id>", methods=["PUT"])
def update_bis_item(gid: int, cid: int, bis_id: int):
    """
    Update a BiS item.

    Request body (all fields optional):
    {
        "slot": "Head",
        "item_name": "Crown of the Harbinger",
        "item_id": 12345,
        "target_ilvl": 278,
        "obtained": true
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

        item = (
            db.query(BisItem)
            .filter(
                BisItem.id == bis_id,
                BisItem.character_id == cid,
            )
            .first()
        )

        if not item:
            return jsonify({"error": "BiS item not found"}), 404

        # Update allowed fields
        updatable_fields = ["slot", "item_name", "item_id", "target_ilvl", "obtained"]
        for field in updatable_fields:
            if field in data:
                setattr(item, field, data[field])

        # If manually set obtained, mark as not synced (manual override)
        if "obtained" in data:
            item.synced = False

        db.commit()

        logger.info(f"BiS item {bis_id} updated for character {cid}")

        return jsonify(item.to_dict()), 200

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update BiS item: {e}")
        return jsonify({"error": "Failed to update BiS item"}), 500

    finally:
        db.close()


@bp.route("/<int:gid>/characters/<int:cid>/bis/<int:bis_id>", methods=["DELETE"])
def delete_bis_item(gid: int, cid: int, bis_id: int):
    """
    Delete a BiS item from the character's list.
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

        item = (
            db.query(BisItem)
            .filter(
                BisItem.id == bis_id,
                BisItem.character_id == cid,
            )
            .first()
        )

        if not item:
            return jsonify({"error": "BiS item not found"}), 404

        item_name = item.item_name
        db.delete(item)
        db.commit()

        logger.info(f"BiS item {bis_id} ({item_name}) deleted for character {cid}")

        return jsonify({"message": f"BiS item '{item_name}' deleted"}), 200

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to delete BiS item: {e}")
        return jsonify({"error": "Failed to delete BiS item"}), 500

    finally:
        db.close()

"""Task routes - weekly and daily task tracking per character"""

from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from app.models import get_db
from app.models.character_progress import CharacterProgress
from app.models.weekly_task_completion import WeeklyTaskCompletion
from app.services.permission_service import PermissionService
from app.services.season_service import calculate_current_week
from app.services.task_definitions import get_task_definitions, get_all_task_ids
import logging

bp = Blueprint("tasks", __name__, url_prefix="/guilds")
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


@bp.route("/<int:gid>/characters/<int:cid>/tasks", methods=["GET"])
def get_tasks(gid: int, cid: int):
    """
    Get task definitions and completion status for the current week.

    Returns task definitions merged with the character's completion state.
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

        # Support optional week query param, fall back to current week
        requested_week = request.args.get("week", type=int)
        current_week = requested_week if requested_week is not None else calculate_current_week()
        task_defs = get_task_definitions(current_week)

        # Fetch completions for the requested week
        completions = (
            db.query(WeeklyTaskCompletion)
            .filter(
                WeeklyTaskCompletion.character_id == cid,
                WeeklyTaskCompletion.week_number == current_week,
            )
            .all()
        )

        completion_map = {
            (c.task_type, c.task_id): c for c in completions
        }

        # Merge definitions with completion state
        def merge_tasks(task_list, task_type):
            merged = []
            for task in task_list:
                completion = completion_map.get((task_type, task["id"]))
                merged.append({
                    "id": task["id"],
                    "label": task["label"],
                    "done": completion.completed if completion else False,
                    "completed_at": (
                        completion.completed_at.isoformat()
                        if completion and completion.completed_at
                        else None
                    ),
                })
            return merged

        weekly_tasks = merge_tasks(task_defs.get("weekly", []), "weekly")
        daily_tasks = merge_tasks(task_defs.get("daily", []), "daily")

        return jsonify({
            "character_id": cid,
            "character_name": character.character_name,
            "current_week": current_week,
            "week_name": task_defs.get("name", ""),
            "weekly": weekly_tasks,
            "daily": daily_tasks,
        }), 200

    finally:
        db.close()


@bp.route("/<int:gid>/characters/<int:cid>/tasks", methods=["POST"])
def toggle_task(gid: int, cid: int):
    """
    Toggle task completion status.

    Request body:
    {
        "task_id": "heroic_clear",
        "task_type": "weekly",
        "week_number": 3,
        "completed": true
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

    task_id = data.get("task_id")
    task_type = data.get("task_type")
    week_number = data.get("week_number")
    completed = data.get("completed")

    if not task_id or not task_type or week_number is None or completed is None:
        return jsonify({
            "error": "task_id, task_type, week_number, and completed are required"
        }), 400

    if task_type not in ("weekly", "daily"):
        return jsonify({"error": "task_type must be 'weekly' or 'daily'"}), 400

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

        # Validate task_id exists in definitions
        valid_ids = get_all_task_ids(week_number)
        if task_id not in valid_ids:
            return jsonify({"error": f"Unknown task_id: {task_id}"}), 400

        # Upsert completion record
        entry = (
            db.query(WeeklyTaskCompletion)
            .filter(
                WeeklyTaskCompletion.character_id == cid,
                WeeklyTaskCompletion.week_number == week_number,
                WeeklyTaskCompletion.task_type == task_type,
                WeeklyTaskCompletion.task_id == task_id,
            )
            .first()
        )

        if entry:
            entry.completed = completed
            entry.completed_at = datetime.now(timezone.utc) if completed else None
        else:
            entry = WeeklyTaskCompletion(
                character_id=cid,
                week_number=week_number,
                task_type=task_type,
                task_id=task_id,
                completed=completed,
                completed_at=datetime.now(timezone.utc) if completed else None,
            )
            db.add(entry)

        db.commit()

        logger.info(
            f"Task toggled: character={cid}, task={task_id}, "
            f"type={task_type}, week={week_number}, completed={completed}"
        )

        return jsonify(entry.to_dict()), 200

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to toggle task: {e}")
        return jsonify({"error": "Failed to toggle task"}), 500

    finally:
        db.close()


@bp.route("/<int:gid>/characters/<int:cid>/tasks/reset-daily", methods=["POST"])
def reset_daily_tasks(gid: int, cid: int):
    """
    Reset all daily task completions for the current week.

    Deletes daily task completion records so they appear unchecked again.
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

        deleted_count = (
            db.query(WeeklyTaskCompletion)
            .filter(
                WeeklyTaskCompletion.character_id == cid,
                WeeklyTaskCompletion.week_number == current_week,
                WeeklyTaskCompletion.task_type == "daily",
            )
            .delete()
        )

        db.commit()

        logger.info(
            f"Daily tasks reset: character={cid}, week={current_week}, "
            f"deleted={deleted_count}"
        )

        return jsonify({
            "message": f"Reset {deleted_count} daily tasks",
            "character_id": cid,
            "week_number": current_week,
        }), 200

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to reset daily tasks: {e}")
        return jsonify({"error": "Failed to reset daily tasks"}), 500

    finally:
        db.close()

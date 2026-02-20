"""Season routes - season timeline, week info, and task definitions"""

from flask import Blueprint, request, jsonify
from app.services.permission_service import PermissionService
from app.services.season_service import (
    calculate_current_week,
    get_weekly_target,
    get_weekly_crest_cap,
    SEASON_WEEK_DATES,
    WEEKLY_TARGETS,
)
from app.services.task_definitions import get_task_definitions
import logging

bp = Blueprint("season", __name__, url_prefix="/guilds")
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


@bp.route("/<int:gid>/season", methods=["GET"])
def get_season_timeline(gid: int):
    """
    Get season timeline with current week, all week dates, and targets.

    Returns the full season schedule and current position within it.
    """
    bnet_id = get_current_user_from_token()
    if not bnet_id:
        return jsonify({"error": "Not authenticated"}), 401

    perm_check = check_permission(bnet_id, gid)
    if not perm_check.get("allowed"):
        return jsonify({"error": "Access denied"}), 403

    region = request.args.get("region", "us")
    current_week = calculate_current_week(region)

    # Build week timeline
    weeks = []
    for week_num, start_date in SEASON_WEEK_DATES:
        target_ilvl = get_weekly_target(week_num)
        crest_cap = get_weekly_crest_cap(week_num)
        task_defs = get_task_definitions(week_num)

        weeks.append({
            "week_number": week_num,
            "start_date": start_date.isoformat(),
            "target_ilvl": target_ilvl,
            "crest_cap": crest_cap,
            "name": task_defs.get("name", ""),
            "is_current": week_num == current_week,
        })

    return jsonify({
        "guild_id": gid,
        "region": region,
        "current_week": current_week,
        "current_target_ilvl": get_weekly_target(current_week),
        "current_crest_cap": get_weekly_crest_cap(current_week),
        "weeks": weeks,
    }), 200


@bp.route("/<int:gid>/season/tasks/<int:week>", methods=["GET"])
def get_week_tasks(gid: int, week: int):
    """
    Get task definitions for a specific week.

    Returns the weekly and daily task lists for the given week number.
    """
    bnet_id = get_current_user_from_token()
    if not bnet_id:
        return jsonify({"error": "Not authenticated"}), 401

    perm_check = check_permission(bnet_id, gid)
    if not perm_check.get("allowed"):
        return jsonify({"error": "Access denied"}), 403

    task_defs = get_task_definitions(week)

    return jsonify({
        "guild_id": gid,
        "week_number": week,
        "name": task_defs.get("name", ""),
        "weekly": task_defs.get("weekly", []),
        "daily": task_defs.get("daily", []),
        "target_ilvl": get_weekly_target(week),
        "crest_cap": get_weekly_crest_cap(week),
    }), 200

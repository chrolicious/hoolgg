"""Permission check middleware - verify rank on every request"""

from functools import wraps
from flask import request, jsonify, current_app
from app.models import get_db
from app.models.guild_member import GuildMember
from app.models.guild_permission import GuildPermission
from app.services.jwt_service import verify_token
import redis
import json


def get_current_user_bnet_id():
    """Extract bnet_id from JWT token"""
    access_token = request.cookies.get("access_token")
    if not access_token:
        return None

    payload = verify_token(access_token, token_type="access")
    if not payload:
        return None

    return payload.get("bnet_id")


def check_permission_cached(bnet_id: int, guild_id: int, tool_name: str) -> dict:
    """
    Check permission with Redis caching (5-min TTL)

    Returns: {"allowed": bool, "rank_id": int, "reason": str}
    """
    cache_key = f"perm:{bnet_id}:{guild_id}:{tool_name}"

    # Try cache first
    try:
        redis_url = current_app.config.get("REDIS_URL")
        if redis_url:
            redis_client = redis.from_url(redis_url)
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
    except Exception as e:
        current_app.logger.warning(f"Redis cache read failed: {e}")

    # Check database
    db = next(get_db())

    try:
        # Find user's character in this guild
        member = (
            db.query(GuildMember)
            .filter(GuildMember.bnet_id == bnet_id, GuildMember.guild_id == guild_id)
            .first()
        )

        if not member:
            result = {"allowed": False, "rank_id": None, "reason": "Not a guild member"}
            return result

        # Find permission for this tool
        permission = (
            db.query(GuildPermission)
            .filter(
                GuildPermission.guild_id == guild_id,
                GuildPermission.tool_name == tool_name,
            )
            .first()
        )

        if not permission:
            result = {
                "allowed": False,
                "rank_id": member.rank_id,
                "reason": f"Tool '{tool_name}' not configured",
            }
            return result

        if not permission.enabled:
            result = {
                "allowed": False,
                "rank_id": member.rank_id,
                "reason": f"Tool '{tool_name}' is disabled",
            }
            return result

        # Check rank requirement
        if member.rank_id <= permission.min_rank_id:
            result = {
                "allowed": True,
                "rank_id": member.rank_id,
                "reason": "Authorized",
            }
        else:
            result = {
                "allowed": False,
                "rank_id": member.rank_id,
                "reason": f"Rank {member.rank_name} insufficient (requires rank {permission.min_rank_id} or higher)",
            }

        # Cache result (5 min TTL)
        try:
            if redis_url:
                redis_client.setex(cache_key, 300, json.dumps(result))
        except Exception as e:
            current_app.logger.warning(f"Redis cache write failed: {e}")

        return result

    finally:
        db.close()


def require_permission(tool_name: str):
    """
    Decorator to require permission for an endpoint

    Usage:
        @require_permission("progress")
        def my_endpoint(guild_id):
            ...

    The endpoint must have a guild_id parameter (from URL or JSON body).
    """

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Get bnet_id from token
            bnet_id = get_current_user_bnet_id()
            if not bnet_id:
                return jsonify({"error": "Not authenticated"}), 401

            # Get guild_id from URL params or JSON body
            guild_id = kwargs.get("guild_id")
            if not guild_id:
                data = request.get_json()
                guild_id = data.get("guild_id") if data else None

            if not guild_id:
                return jsonify({"error": "guild_id required"}), 400

            # Check permission
            perm_result = check_permission_cached(bnet_id, guild_id, tool_name)

            if not perm_result["allowed"]:
                return (
                    jsonify(
                        {
                            "error": "Permission denied",
                            "reason": perm_result["reason"],
                            "your_rank": perm_result["rank_id"],
                        }
                    ),
                    403,
                )

            # Permission granted - call the endpoint
            return func(*args, **kwargs)

        return wrapper

    return decorator


def invalidate_permission_cache(bnet_id: int = None, guild_id: int = None):
    """
    Invalidate permission cache

    Args:
        bnet_id: Invalidate all permissions for this user
        guild_id: Invalidate all permissions for this guild
    """
    try:
        redis_url = current_app.config.get("REDIS_URL")
        if not redis_url:
            return

        redis_client = redis.from_url(redis_url)

        if bnet_id and guild_id:
            # Invalidate specific user in specific guild
            pattern = f"perm:{bnet_id}:{guild_id}:*"
        elif bnet_id:
            # Invalidate all guilds for this user
            pattern = f"perm:{bnet_id}:*"
        elif guild_id:
            # Invalidate all users in this guild
            pattern = f"perm:*:{guild_id}:*"
        else:
            # Invalidate everything (use sparingly)
            pattern = "perm:*"

        # Scan and delete matching keys
        for key in redis_client.scan_iter(match=pattern):
            redis_client.delete(key)

        current_app.logger.info(f"Invalidated permission cache: {pattern}")

    except Exception as e:
        current_app.logger.warning(f"Failed to invalidate cache: {e}")

"""Authentication and permission middleware"""

from functools import wraps
from flask import request, jsonify, current_app
from app.services.permission_service import PermissionService


def get_current_user():
    """Extract current user from JWT token in cookie"""
    access_token = request.cookies.get("access_token")
    if not access_token:
        return None

    payload = PermissionService.verify_token(access_token)
    if not payload:
        return None

    return payload.get("bnet_id")


def require_auth(f):
    """Decorator to require authentication"""

    @wraps(f)
    def decorated_function(*args, **kwargs):
        bnet_id = get_current_user()
        if not bnet_id:
            return jsonify({"error": "Not authenticated"}), 401

        # Add bnet_id to kwargs so route can use it
        kwargs["bnet_id"] = bnet_id
        return f(*args, **kwargs)

    return decorated_function


def require_permission(tool: str = "recruitment"):
    """Decorator to require specific tool permission"""

    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            bnet_id = get_current_user()
            if not bnet_id:
                return jsonify({"error": "Not authenticated"}), 401

            # Get guild_id from route parameters
            guild_id = kwargs.get("guild_id")
            if not guild_id:
                return jsonify({"error": "Guild ID required"}), 400

            # Check permission
            permission = PermissionService.check_permission(bnet_id, guild_id, tool)

            if not permission.get("allowed"):
                return (
                    jsonify(
                        {
                            "error": "Permission denied",
                            "message": "You don't have access to this tool in this guild",
                        }
                    ),
                    403,
                )

            # Add permission info to kwargs
            kwargs["bnet_id"] = bnet_id
            kwargs["permission"] = permission

            return f(*args, **kwargs)

        return decorated_function

    return decorator

"""Authentication middleware"""

from functools import wraps
from flask import request, jsonify
from app.services.jwt_service import verify_token


def require_auth(func):
    """
    Decorator to require authentication for an endpoint

    Usage:
        @require_auth
        def my_endpoint():
            bnet_id = request.user['bnet_id']
            ...

    The decorator adds request.user with bnet_id from the JWT token.
    """

    @wraps(func)
    def wrapper(*args, **kwargs):
        # Get token from Authorization header (Bearer token)
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            # Fallback to cookie
            access_token = request.cookies.get("access_token")
        else:
            # Extract Bearer token
            parts = auth_header.split()
            if len(parts) != 2 or parts[0].lower() != "bearer":
                return jsonify({"error": "Invalid Authorization header format"}), 401
            access_token = parts[1]

        if not access_token:
            return jsonify({"error": "Not authenticated"}), 401

        # Verify token
        payload = verify_token(access_token, token_type="access")
        if not payload:
            return jsonify({"error": "Invalid or expired token"}), 401

        bnet_id = payload.get("bnet_id")
        if not bnet_id:
            return jsonify({"error": "Invalid token payload"}), 401

        # Add user info to request context
        request.user = {"bnet_id": bnet_id}

        # Call the endpoint
        return func(*args, **kwargs)

    return wrapper


def require_guild_member(func):
    """
    Decorator to require guild membership for an endpoint

    Usage:
        @require_auth
        @require_guild_member
        def my_endpoint(guild_id):
            ...

    The endpoint must have a guild_id parameter (from URL).
    This decorator must be used after @require_auth.
    """

    @wraps(func)
    def wrapper(*args, **kwargs):
        # Ensure user is authenticated
        if not hasattr(request, "user") or not request.user:
            return jsonify({"error": "Not authenticated"}), 401

        bnet_id = request.user["bnet_id"]

        # Get guild_id from URL params
        guild_id = kwargs.get("guild_id")
        if not guild_id:
            return jsonify({"error": "guild_id required"}), 400

        # Check if user is a member of this guild
        from app.models import get_db
        from app.models.guild_member import GuildMember

        db = next(get_db())

        try:
            member = (
                db.query(GuildMember)
                .filter(GuildMember.bnet_id == bnet_id, GuildMember.guild_id == guild_id)
                .first()
            )

            if not member:
                return jsonify({"error": "Not a member of this guild"}), 403

            # Add member info to request context
            request.member = {
                "rank_id": member.rank_id,
                "rank_name": member.rank_name,
                "character_name": member.character_name,
            }

            # Permission granted - call the endpoint
            return func(*args, **kwargs)

        finally:
            db.close()

    return wrapper

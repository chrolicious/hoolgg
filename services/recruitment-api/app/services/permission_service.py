"""Permission checking service - integrates with guild-api"""

import requests
from typing import Dict, Optional
from flask import current_app


class PermissionService:
    """Service for checking permissions via guild-api"""

    @staticmethod
    def check_permission(bnet_id: int, guild_id: int, tool: str = "recruitment") -> Dict:
        """
        Check if user has permission to access recruitment tools in a guild

        Returns:
            {
                "allowed": bool,
                "rank_id": int,
                "rank_name": str,
                "tool_enabled": bool
            }
        """
        try:
            guild_api_url = current_app.config["GUILD_API_URL"]
            url = f"{guild_api_url}/guilds/{guild_id}/permissions/check"

            params = {"bnet_id": bnet_id, "tool": tool}

            response = requests.get(url, params=params, timeout=5)
            response.raise_for_status()

            return response.json()

        except requests.exceptions.RequestException as e:
            current_app.logger.error(f"Permission check failed: {e}")
            # Fail closed - deny access if we can't check permissions
            return {
                "allowed": False,
                "rank_id": None,
                "rank_name": None,
                "tool_enabled": False,
                "error": str(e),
            }

    @staticmethod
    def verify_token(access_token: str) -> Optional[Dict]:
        """
        Verify JWT token (shared secret with guild-api)

        For simplicity, we'll decode the JWT ourselves using the shared secret.
        In production, you might want to call guild-api to verify.
        """
        try:
            import jwt

            secret = current_app.config["JWT_SECRET_KEY"]
            payload = jwt.decode(access_token, secret, algorithms=["HS256"])

            # Check token type
            if payload.get("type") != "access":
                return None

            return payload

        except jwt.ExpiredSignatureError:
            current_app.logger.warning("Token expired")
            return None
        except jwt.InvalidTokenError as e:
            current_app.logger.warning(f"Invalid token: {e}")
            return None

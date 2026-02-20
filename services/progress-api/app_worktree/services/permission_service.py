"""Permission service - check user permissions via guild-api"""

import requests
from typing import Optional, Dict, Any
import logging
from flask import current_app

logger = logging.getLogger(__name__)


class PermissionService:
    """Service for checking user permissions via guild-api"""

    def check_permission(
        self, bnet_id: int, guild_id: int, tool: str = "progress"
    ) -> Dict[str, Any]:
        """
        Check if user has permission to access a tool in a guild

        Args:
            bnet_id: User's Bnet ID
            guild_id: Guild ID
            tool: Tool name (default: "progress")

        Returns:
            Dict with permission check result:
            {
                "allowed": bool,
                "rank_id": int,
                "rank_name": str,
                "character_name": str
            }
        """
        guild_api_url = current_app.config.get("GUILD_API_URL")
        if not guild_api_url:
            logger.error("GUILD_API_URL not configured")
            return {"allowed": False, "error": "Permission service not configured"}

        endpoint = f"{guild_api_url}/guilds/{guild_id}/permissions/check"
        params = {"bnet_id": bnet_id, "tool": tool}

        try:
            response = requests.get(endpoint, params=params, timeout=5)
            response.raise_for_status()

            data = response.json()
            logger.info(
                f"Permission check for bnet_id={bnet_id}, guild={guild_id}, tool={tool}: "
                f"allowed={data.get('allowed')}"
            )
            return data

        except requests.HTTPError as e:
            if e.response.status_code == 403:
                logger.info(f"Permission denied for bnet_id={bnet_id}, guild={guild_id}")
                return {"allowed": False, "error": "Access denied"}
            else:
                logger.error(f"HTTP error checking permissions: {e.response.status_code}")
                return {"allowed": False, "error": "Permission check failed"}

        except requests.RequestException as e:
            logger.error(f"Failed to check permissions: {e}")
            return {"allowed": False, "error": "Permission service unavailable"}

    def is_guild_master(self, bnet_id: int, guild_id: int) -> bool:
        """
        Check if user is Guild Master

        Args:
            bnet_id: User's Bnet ID
            guild_id: Guild ID

        Returns:
            True if user is GM (rank_id == 0)
        """
        perm_check = self.check_permission(bnet_id, guild_id)
        return perm_check.get("rank_id") == 0

    def is_officer_or_above(self, bnet_id: int, guild_id: int) -> bool:
        """
        Check if user is Officer or GM

        Args:
            bnet_id: User's Bnet ID
            guild_id: Guild ID

        Returns:
            True if user is Officer+ (rank_id <= 1)
        """
        perm_check = self.check_permission(bnet_id, guild_id)
        rank_id = perm_check.get("rank_id")
        return rank_id is not None and rank_id <= 1

"""Blizzard API integration service - fetch character gear and calculate iLvl"""

import requests
from typing import Optional, Dict, Any
import logging
from flask import current_app

logger = logging.getLogger(__name__)


class BlizzardService:
    """Service for interacting with Blizzard API"""

    def __init__(self, region: Optional[str] = None):
        self.access_token: Optional[str] = None
        self.token_expires_at: Optional[float] = None
        self._region = region  # Per-instance region override

    def _get_region(self) -> str:
        return self._region or current_app.config.get("BLIZZARD_REGION", "us")

    def _get_oauth_url(self) -> str:
        """Get OAuth URL for region"""
        return f"https://{self._get_region()}.battle.net"

    def _get_api_url(self) -> str:
        """Get API URL for region"""
        return f"https://{self._get_region()}.api.blizzard.com"

    def _get_access_token(self) -> Optional[str]:
        """
        Get OAuth access token from Blizzard

        Uses client credentials flow for server-to-server API calls
        """
        import time

        # Check if we have a valid cached token
        if self.access_token and self.token_expires_at:
            if time.time() < self.token_expires_at - 60:  # 1 min buffer
                return self.access_token

        client_id = current_app.config.get("BLIZZARD_CLIENT_ID")
        client_secret = current_app.config.get("BLIZZARD_CLIENT_SECRET")

        if not client_id or not client_secret:
            logger.error("Blizzard API credentials not configured")
            return None

        oauth_url = self._get_oauth_url()
        token_endpoint = f"{oauth_url}/oauth/token"

        try:
            response = requests.post(
                token_endpoint,
                data={"grant_type": "client_credentials"},
                auth=(client_id, client_secret),
                timeout=10,
            )
            response.raise_for_status()

            data = response.json()
            self.access_token = data.get("access_token")
            expires_in = data.get("expires_in", 3600)
            self.token_expires_at = time.time() + expires_in

            logger.info("Successfully obtained Blizzard API access token")
            return self.access_token

        except requests.RequestException as e:
            logger.error(f"Failed to get Blizzard access token: {e}")
            return None

    def get_character_equipment(
        self, character_name: str, realm_slug: str
    ) -> Optional[Dict[str, Any]]:
        """
        Fetch character equipment from Blizzard API

        Args:
            character_name: Character name (case-insensitive)
            realm_slug: Realm slug (e.g., "area-52")

        Returns:
            Dict with character equipment data or None if failed
        """
        access_token = self._get_access_token()
        if not access_token:
            logger.error("Cannot fetch character equipment without access token")
            return None

        api_url = self._get_api_url()
        namespace = f"profile-{self._get_region()}"

        # Normalize character name
        character_name_lower = character_name.lower()
        realm_slug_lower = realm_slug.lower()

        endpoint = (
            f"{api_url}/profile/wow/character/{realm_slug_lower}/"
            f"{character_name_lower}/equipment"
        )

        params = {"namespace": namespace, "locale": "en_US"}

        headers = {"Authorization": f"Bearer {access_token}"}

        timeout = current_app.config.get("BLIZZARD_API_TIMEOUT", 10)

        try:
            response = requests.get(endpoint, params=params, headers=headers, timeout=timeout)
            response.raise_for_status()

            data = response.json()
            logger.info(
                f"Successfully fetched equipment for {character_name}-{realm_slug}"
            )
            return data

        except requests.HTTPError as e:
            if e.response.status_code == 404:
                logger.warning(
                    f"Character not found: {character_name}-{realm_slug}"
                )
            else:
                logger.error(
                    f"HTTP error fetching character equipment: {e.response.status_code}"
                )
            return None

        except requests.RequestException as e:
            logger.error(f"Failed to fetch character equipment: {e}")
            return None

    def get_character_profile(
        self, character_name: str, realm_slug: str
    ) -> Optional[Dict[str, Any]]:
        """
        Fetch character profile (class, spec, etc.) from Blizzard API

        Args:
            character_name: Character name
            realm_slug: Realm slug

        Returns:
            Dict with character profile data or None if failed
        """
        access_token = self._get_access_token()
        if not access_token:
            return None

        api_url = self._get_api_url()
        namespace = f"profile-{self._get_region()}"

        character_name_lower = character_name.lower()
        realm_slug_lower = realm_slug.lower()

        endpoint = f"{api_url}/profile/wow/character/{realm_slug_lower}/{character_name_lower}"

        params = {"namespace": namespace, "locale": "en_US"}
        headers = {"Authorization": f"Bearer {access_token}"}
        timeout = current_app.config.get("BLIZZARD_API_TIMEOUT", 10)

        try:
            response = requests.get(endpoint, params=params, headers=headers, timeout=timeout)
            response.raise_for_status()

            data = response.json()
            logger.info(f"Successfully fetched profile for {character_name}-{realm_slug}")
            return data

        except requests.RequestException as e:
            logger.error(f"Failed to fetch character profile: {e}")
            return None

    def get_character_stats(
        self, character_name: str, realm_slug: str
    ) -> Optional[Dict[str, Any]]:
        """
        Fetch character statistics from Blizzard API

        Args:
            character_name: Character name
            realm_slug: Realm slug

        Returns:
            Dict with character statistics data or None if failed
        """
        access_token = self._get_access_token()
        if not access_token:
            return None

        api_url = self._get_api_url()
        namespace = f"profile-{self._get_region()}"

        character_name_lower = character_name.lower()
        realm_slug_lower = realm_slug.lower()

        endpoint = (
            f"{api_url}/profile/wow/character/{realm_slug_lower}/"
            f"{character_name_lower}/statistics"
        )

        params = {"namespace": namespace, "locale": "en_US"}
        headers = {"Authorization": f"Bearer {access_token}"}
        timeout = current_app.config.get("BLIZZARD_API_TIMEOUT", 10)

        try:
            response = requests.get(endpoint, params=params, headers=headers, timeout=timeout)
            response.raise_for_status()

            data = response.json()
            logger.info(f"Successfully fetched stats for {character_name}-{realm_slug}")
            return data

        except requests.HTTPError as e:
            if e.response.status_code == 404:
                logger.warning(f"Stats not found for character: {character_name}-{realm_slug}")
            else:
                logger.error(f"HTTP error fetching character stats: {e.response.status_code}")
            return None

        except requests.RequestException as e:
            logger.error(f"Failed to fetch character stats: {e}")
            return None

    def get_item_icon_url(self, item_id: int) -> Optional[str]:
        """
        Fetch the icon URL for a WoW item from Blizzard's static game data API.

        Args:
            item_id: The WoW item ID

        Returns:
            Icon URL string or None if failed
        """
        if not item_id:
            return None

        access_token = self._get_access_token()
        if not access_token:
            return None

        region = self._get_region()
        api_url = self._get_api_url()
        # Static game data uses static-{region} namespace, not profile-{region}
        namespace = f"static-{region}"

        endpoint = f"{api_url}/data/wow/media/item/{item_id}"
        params = {"namespace": namespace, "locale": "en_US"}
        headers = {"Authorization": f"Bearer {access_token}"}
        timeout = current_app.config.get("BLIZZARD_API_TIMEOUT", 10)

        try:
            response = requests.get(endpoint, params=params, headers=headers, timeout=timeout)
            response.raise_for_status()
            data = response.json()

            assets = data.get("assets", [])
            for asset in assets:
                if asset.get("key") == "icon":
                    return asset.get("value")
            return None

        except requests.RequestException as e:
            logger.debug(f"Failed to fetch icon for item {item_id}: {e}")
            return None

    def calculate_average_ilvl(self, equipment_data: Dict[str, Any]) -> Optional[float]:
        """
        Calculate average item level from equipment data

        Args:
            equipment_data: Equipment data from Blizzard API

        Returns:
            Average iLvl as float or None if cannot calculate
        """
        equipped_items = equipment_data.get("equipped_items", [])
        if not equipped_items:
            logger.warning("No equipped items found in equipment data")
            return None

        # Sum up all item levels
        total_ilvl = 0
        item_count = 0

        for item in equipped_items:
            # Item level is in item.level.value
            level_data = item.get("level", {})
            item_level = level_data.get("value")

            if item_level:
                total_ilvl += item_level
                item_count += 1

        if item_count == 0:
            logger.warning("No valid item levels found")
            return None

        avg_ilvl = total_ilvl / item_count
        logger.info(f"Calculated average iLvl: {avg_ilvl:.2f} from {item_count} items")

        return round(avg_ilvl, 2)

    def get_character_data(
        self, character_name: str, realm_slug: str
    ) -> Optional[Dict[str, Any]]:
        """
        Fetch full character data (profile + equipment + calculated iLvl)

        Args:
            character_name: Character name
            realm_slug: Realm slug

        Returns:
            Dict with combined character data or None if failed
        """
        profile = self.get_character_profile(character_name, realm_slug)
        equipment = self.get_character_equipment(character_name, realm_slug)

        if not profile or not equipment:
            return None

        avg_ilvl = self.calculate_average_ilvl(equipment)

        # Extract relevant profile data
        character_class = profile.get("character_class", {}).get("name", "Unknown")
        active_spec = profile.get("active_spec", {}).get("name", "Unknown")

        # Determine role from spec (simplified - could be more sophisticated)
        role = self._determine_role(character_class, active_spec)

        return {
            "character_name": character_name,
            "realm": realm_slug,
            "class_name": character_class,
            "spec": active_spec,
            "role": role,
            "current_ilvl": avg_ilvl,
            "gear_details": equipment,
        }

    def _determine_role(self, character_class: str, spec: str) -> str:
        """
        Determine role from class and spec

        Simple heuristic - could be enhanced with more data
        """
        # Tank specs
        tank_specs = [
            "Protection",
            "Blood",
            "Guardian",
            "Vengeance",
            "Brewmaster",
        ]

        # Healer specs
        healer_specs = [
            "Holy",
            "Discipline",
            "Restoration",
            "Mistweaver",
            "Preservation",
        ]

        if spec in tank_specs:
            return "Tank"
        elif spec in healer_specs:
            return "Healer"
        else:
            return "DPS"

    def _fetch_media_assets(self, media_href: str) -> tuple[Optional[str], Optional[str]]:
        """
        Fetch both avatar and render URLs from the media endpoint.

        Args:
            media_href: Full URL to the character-media endpoint

        Returns:
            Tuple of (avatar_url, render_url) - either can be None
        """
        access_token = self._get_access_token()
        if not access_token:
            return None, None

        headers = {"Authorization": f"Bearer {access_token}"}
        timeout = current_app.config.get("BLIZZARD_API_TIMEOUT", 10)

        try:
            response = requests.get(media_href, headers=headers, timeout=timeout)
            response.raise_for_status()
            data = response.json()

            assets = data.get("assets", [])
            asset_map = {a.get("key"): a.get("value") for a in assets}

            # Get avatar (bust portrait)
            avatar_url = asset_map.get("avatar")

            # Get full-body render (prefer main-raw, fallback to main)
            render_url = asset_map.get("main-raw") or asset_map.get("main")

            # Legacy fallback
            if not render_url:
                render_url = data.get("render_url")

            return avatar_url, render_url

        except requests.RequestException as e:
            logger.warning(f"Failed to fetch character media: {e}")
            return None, None

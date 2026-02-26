"""WarcraftLogs API integration service - fetch public realm comparison data"""

import requests
from typing import Optional, Dict, Any, List
import logging
from flask import current_app

logger = logging.getLogger(__name__)


class WarcraftLogsService:
    """Service for interacting with WarcraftLogs public API"""

    def __init__(self):
        self.access_token: Optional[str] = None
        self.token_expires_at: Optional[float] = None

    def _get_access_token(self) -> Optional[str]:
        """
        Get OAuth access token from WarcraftLogs

        Uses client credentials flow
        """
        import time

        # Check if we have a valid cached token
        if self.access_token and self.token_expires_at:
            if time.time() < self.token_expires_at - 60:  # 1 min buffer
                return self.access_token

        client_id = current_app.config.get("WARCRAFTLOGS_CLIENT_ID")
        client_secret = current_app.config.get("WARCRAFTLOGS_CLIENT_SECRET")

        if not client_id or not client_secret:
            logger.warning("WarcraftLogs API credentials not configured")
            return None

        token_endpoint = "https://www.warcraftlogs.com/oauth/token"

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

            logger.info("Successfully obtained WarcraftLogs API access token")
            return self.access_token

        except requests.RequestException as e:
            logger.error(f"Failed to get WarcraftLogs access token: {e}")
            return None

    def get_realm_rankings(
        self, realm_slug: str, region: str = "us"
    ) -> Optional[Dict[str, Any]]:
        """
        Fetch realm guild rankings from WarcraftLogs

        Args:
            realm_slug: Realm slug (e.g., "area-52")
            region: Region code (us, eu, kr, tw)

        Returns:
            Dict with realm ranking data or None if failed
        """
        access_token = self._get_access_token()
        if not access_token:
            logger.warning("Cannot fetch realm rankings without access token")
            return {"error": "WarcraftLogs API not configured"}

        # WarcraftLogs uses GraphQL API
        graphql_endpoint = "https://www.warcraftlogs.com/api/v2/client"

        # GraphQL query for realm rankings
        query = """
        query RealmRankings($realm: String!, $region: String!) {
          worldData {
            zone(id: 1273) {
              rankings(
                realm: $realm
                region: $region
                metric: speed
                page: 1
              ) {
                rankings {
                  guild {
                    name
                    server {
                      name
                      region
                    }
                  }
                  rankPercent
                  averagePerformance
                }
              }
            }
          }
        }
        """

        variables = {"realm": realm_slug, "region": region.upper()}

        headers = {"Authorization": f"Bearer {access_token}"}

        try:
            response = requests.post(
                graphql_endpoint,
                json={"query": query, "variables": variables},
                headers=headers,
                timeout=15,
            )
            response.raise_for_status()

            data = response.json()

            if "errors" in data:
                logger.error(f"GraphQL errors: {data['errors']}")
                return None

            logger.info(f"Successfully fetched realm rankings for {realm_slug}")
            return data.get("data", {})

        except requests.RequestException as e:
            logger.error(f"Failed to fetch realm rankings: {e}")
            return None

    def get_guild_performance_summary(
        self, guild_name: str, realm_slug: str, region: str = "us"
    ) -> Optional[Dict[str, Any]]:
        """
        Get simplified performance summary for a guild

        Args:
            guild_name: Guild name
            realm_slug: Realm slug
            region: Region code

        Returns:
            Simplified performance summary or None
        """
        # This is a simplified placeholder
        # In production, you'd query WCL for specific guild performance data

        access_token = self._get_access_token()
        if not access_token:
            return {
                "guild_name": guild_name,
                "realm": realm_slug,
                "region": region,
                "percentile": None,
                "message": "WarcraftLogs integration not configured",
            }

        # For now, return a mock summary
        # Real implementation would query WCL GraphQL API
        return {
            "guild_name": guild_name,
            "realm": realm_slug,
            "region": region,
            "percentile": 75.0,  # Placeholder
            "average_dps": None,
            "average_hps": None,
            "message": "Performance data is illustrative - full WCL integration pending",
        }

    def compare_to_realm(
        self, guild_name: str, realm_slug: str, region: str = "us"
    ) -> Dict[str, Any]:
        """
        Compare guild to realm averages

        Args:
            guild_name: Guild name
            realm_slug: Realm slug
            region: Region code

        Returns:
            Comparison data
        """
        guild_perf = self.get_guild_performance_summary(guild_name, realm_slug, region)
        realm_rankings = self.get_realm_rankings(realm_slug, region)

        # Calculate realm average (simplified)
        realm_average = 60.0  # Placeholder

        if realm_rankings and isinstance(realm_rankings, dict):
            # Extract actual realm data if available
            # This would parse the rankings and calculate averages
            pass

        return {
            "guild_performance": guild_perf,
            "realm_average": realm_average,
            "comparison": {
                "vs_realm_average": (
                    guild_perf.get("percentile", 0) - realm_average
                    if guild_perf and guild_perf.get("percentile")
                    else None
                ),
            },
        }

    # WCL zone ID for the current raid tier (Liberation of Undermine)
    CURRENT_ZONE_ID = 42

    def get_character_parses(
        self, character_name: str, realm_slug: str, region: str = "us"
    ) -> Optional[Dict[str, Any]]:
        """
        Fetch per-boss parse percentiles for a character from the current raid tier.

        Returns dict keyed by boss name:
        {"Boss1": {"best_parse": 95.2, "median_parse": 88.1, "kills": 5, "spec": "Fury"}, ...}
        """
        access_token = self._get_access_token()
        if not access_token:
            return None

        graphql_endpoint = "https://www.warcraftlogs.com/api/v2/client"

        query = """
        query CharacterParses($name: String!, $serverSlug: String!, $serverRegion: String!, $zoneID: Int!) {
          characterData {
            character(name: $name, serverSlug: $serverSlug, serverRegion: $serverRegion) {
              heroic: zoneRankings(zoneID: $zoneID, difficulty: 4)
              mythic: zoneRankings(zoneID: $zoneID, difficulty: 5)
            }
          }
        }
        """

        variables = {
            "name": character_name,
            "serverSlug": realm_slug,
            "serverRegion": region.upper(),
            "zoneID": self.CURRENT_ZONE_ID,
        }

        headers = {"Authorization": f"Bearer {access_token}"}

        try:
            response = requests.post(
                graphql_endpoint,
                json={"query": query, "variables": variables},
                headers=headers,
                timeout=15,
            )
            response.raise_for_status()

            data = response.json()
            if "errors" in data:
                logger.error(f"WCL GraphQL errors: {data['errors']}")
                return None

            character_data = (
                data.get("data", {})
                .get("characterData", {})
                .get("character", {})
            )

            if not character_data:
                logger.warning(f"No WCL data for {character_name}-{realm_slug}")
                return None

            return self._parse_zone_rankings(character_data)

        except requests.RequestException as e:
            logger.error(f"Failed to fetch WCL parses: {e}")
            return None

    def get_character_kills_in_range(
        self, character_name: str, realm_slug: str, region: str = "us",
        start_time: int = 0, end_time: int = 0,
    ) -> Optional[List[Dict[str, Any]]]:
        """
        Fetch raid kills for a character from the current tier.

        Uses zoneRankings to get total kills per boss per difficulty.
        Note: WCL doesn't support arbitrary time ranges on zoneRankings,
        so this returns all-time kills for the current tier. The Blizzard
        encounters API is the primary source for weekly kill tracking.

        Returns list of kills:
        [{"boss": "Boss1", "difficulty": "heroic", "kills": 6, "parse": 85.2}, ...]
        """
        access_token = self._get_access_token()
        if not access_token:
            return None

        graphql_endpoint = "https://www.warcraftlogs.com/api/v2/client"

        query = """
        query CharacterKills($name: String!, $serverSlug: String!, $serverRegion: String!, $zoneID: Int!) {
          characterData {
            character(name: $name, serverSlug: $serverSlug, serverRegion: $serverRegion) {
              normal: zoneRankings(zoneID: $zoneID, difficulty: 3)
              heroic: zoneRankings(zoneID: $zoneID, difficulty: 4)
              mythic: zoneRankings(zoneID: $zoneID, difficulty: 5)
            }
          }
        }
        """

        variables = {
            "name": character_name,
            "serverSlug": realm_slug,
            "serverRegion": region.upper(),
            "zoneID": self.CURRENT_ZONE_ID,
        }

        headers = {"Authorization": f"Bearer {access_token}"}

        try:
            response = requests.post(
                graphql_endpoint,
                json={"query": query, "variables": variables},
                headers=headers,
                timeout=15,
            )
            response.raise_for_status()

            data = response.json()
            if "errors" in data:
                logger.error(f"WCL GraphQL errors: {data['errors']}")
                return None

            character_data = (
                data.get("data", {})
                .get("characterData", {})
                .get("character", {})
            )

            if not character_data:
                return []

            kills = []
            for diff_name in ["normal", "heroic", "mythic"]:
                zone_data = character_data.get(diff_name)
                if not zone_data or not isinstance(zone_data, dict):
                    continue
                rankings = zone_data.get("rankings", [])
                for ranking in rankings:
                    total_kills = ranking.get("totalKills", 0)
                    if total_kills > 0:
                        kills.append({
                            "boss": ranking.get("encounter", {}).get("name", "Unknown"),
                            "difficulty": diff_name,
                            "kills": total_kills,
                            "parse": ranking.get("rankPercent", 0),
                        })

            return kills

        except requests.RequestException as e:
            logger.error(f"Failed to fetch WCL kills: {e}")
            return None

    def _parse_zone_rankings(self, character_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Parse zoneRankings response into a simplified per-boss dict."""
        result = {}

        for diff_name in ["heroic", "mythic"]:
            zone_data = character_data.get(diff_name)
            if not zone_data or not isinstance(zone_data, dict):
                continue
            rankings = zone_data.get("rankings", [])
            for ranking in rankings:
                boss_name = ranking.get("encounter", {}).get("name", "Unknown")
                key = f"{boss_name} ({diff_name.title()})"
                result[key] = {
                    "best_parse": ranking.get("rankPercent"),
                    "median_parse": ranking.get("medianPercent"),
                    "kills": ranking.get("totalKills", 0),
                    "spec": ranking.get("bestSpec") or ranking.get("spec"),
                }

        return result if result else None

"""Raider.IO API integration service - fetch Mythic+ scores and raid progress."""

import requests
import time
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

class RaiderIOService:
    """Service for interacting with Raider.IO API"""

    def get_character_profile(
        self, character_name: str, realm_slug: str, region: str = "us"
    ) -> Optional[Dict[str, Any]]:
        """
        Fetch character profile with M+ scores and raid progress.
        Implements exponential backoff to handle strict rate limits.
        """
        endpoint = "https://raider.io/api/v1/characters/profile"
        params = {
            "region": region,
            "realm": realm_slug,
            "name": character_name,
            "fields": "mythic_plus_scores_by_season:current,raid_progression,mythic_plus_recent_runs,gear"
        }

        max_retries = 3
        base_delay = 2

        for attempt in range(max_retries):
            try:
                response = requests.get(endpoint, params=params, timeout=10)

                if response.status_code == 200:
                    return response.json()

                if response.status_code == 429:
                    # Rate limited - exponential backoff
                    delay = base_delay * (2 ** attempt)
                    logger.warning(f"Raider.IO rate limit hit. Retrying in {delay}s...")
                    time.sleep(delay)
                    continue

                if response.status_code == 400:
                    logger.warning(f"Character not found on Raider.IO: {character_name}-{realm_slug}")
                    return None

                response.raise_for_status()

            except requests.RequestException as e:
                logger.error(f"Error fetching from Raider.IO: {e}")
                if attempt < max_retries - 1:
                    delay = base_delay * (2 ** attempt)
                    time.sleep(delay)
                else:
                    return None

        return None


def parse_raiderio_profile(data: Dict[str, Any]) -> tuple[float, Optional[Dict[str, Any]], list[int]]:
    """
    Parse Raider.IO profile data to extract M+ score, raid progression, and recent M+ runs.
    Returns: (mythic_plus_score, raid_progression_json, list_of_recent_run_levels)
    """
    if not data:
        return 0.0, None, []

    mplus_score = 0.0
    seasons = data.get("mythic_plus_scores_by_season", [])
    if seasons and isinstance(seasons, list) and len(seasons) > 0:
        scores = seasons[0].get("scores", {})
        mplus_score = float(scores.get("all", 0.0))

    raid_progress = data.get("raid_progression")

    # Extract recent runs
    recent_runs = data.get("mythic_plus_recent_runs", [])
    run_levels = [run.get("mythic_level", 0) for run in recent_runs if "mythic_level" in run]

    return mplus_score, raid_progress, run_levels


# Mapping from raider.io slot names to our internal slot names
_RIO_SLOT_MAP: Dict[str, str] = {
    "finger1": "ring1",
    "finger2": "ring2",
    "mainhand": "main_hand",
    "offhand": "off_hand",
}


def extract_raiderio_gear_icons(data: Dict[str, Any]) -> Dict[str, str]:
    """
    Extract gear icon URLs from a Raider.IO character profile response.

    Maps raider.io slot names to internal slot names and constructs full
    icon URLs using the Wowhead/Zamimg CDN.

    Args:
        data: Raw Raider.IO API response containing a 'gear' field

    Returns:
        Dict mapping internal slot name -> full icon URL string.
        Returns empty dict if data is missing or malformed.
    """
    try:
        if not data:
            return {}

        gear = data.get("gear")
        if not gear or not isinstance(gear, dict):
            return {}

        items = gear.get("items")
        if not items or not isinstance(items, dict):
            return {}

        result: Dict[str, str] = {}
        for rio_slot, item_data in items.items():
            if not isinstance(item_data, dict):
                continue

            icon_name = item_data.get("icon")
            if not icon_name:
                continue

            # Map rio slot name to internal slot name, defaulting to the rio name
            internal_slot = _RIO_SLOT_MAP.get(rio_slot, rio_slot)
            icon_url = f"https://wow.zamimg.com/images/wow/icons/large/{icon_name}.jpg"
            result[internal_slot] = icon_url

        return result

    except Exception as e:
        logger.warning(f"Failed to extract raider.io gear icons: {e}")
        return {}

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
            "fields": "mythic_plus_scores_by_season:current,raid_progression"
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


def parse_raiderio_profile(data: Dict[str, Any]) -> tuple[float, Optional[Dict[str, Any]]]:
    """
    Parse Raider.IO profile data to extract M+ score and raid progression.
    Returns: (mythic_plus_score, raid_progression_json)
    """
    if not data:
        return 0.0, None
        
    mplus_score = 0.0
    seasons = data.get("mythic_plus_scores_by_season", [])
    if seasons and isinstance(seasons, list) and len(seasons) > 0:
        scores = seasons[0].get("scores", {})
        mplus_score = float(scores.get("all", 0.0))
        
    raid_progress = data.get("raid_progression")
    
    return mplus_score, raid_progress

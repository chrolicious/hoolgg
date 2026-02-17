"""Raider.io API integration service"""

import requests
from typing import Dict, List, Optional
from flask import current_app


class RaiderIOService:
    """Service for interacting with Raider.io API"""

    @staticmethod
    def search_characters(
        name: Optional[str] = None,
        realm: Optional[str] = None,
        region: str = "us",
        role: Optional[str] = None,
        character_class: Optional[str] = None,
        min_mythic_score: Optional[int] = None,
    ) -> List[Dict]:
        """
        Search for characters on Raider.io

        Note: Raider.io doesn't have a general search API, so we implement
        a simpler approach: search by name/realm if provided.

        For broader search, we'd need to scrape or use their undocumented endpoints.
        For MVP, we'll focus on exact character lookups.
        """
        if not name or not realm:
            return []

        try:
            api_url = current_app.config["RAIDER_IO_API_URL"]
            url = f"{api_url}/characters/profile"

            params = {
                "region": region,
                "realm": realm,
                "name": name,
                "fields": "mythic_plus_scores_by_season:current,raid_progression,gear",
            }

            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()

            # Transform to our format
            character = RaiderIOService._transform_character(data)

            # Apply filters
            if role and character.get("role") != role:
                return []
            if character_class and character.get("character_class") != character_class:
                return []
            if min_mythic_score and character.get("raider_io_score", 0) < min_mythic_score:
                return []

            return [character]

        except requests.exceptions.RequestException as e:
            current_app.logger.error(f"Raider.io API error: {e}")
            return []

    @staticmethod
    def get_character_profile(name: str, realm: str, region: str = "us") -> Optional[Dict]:
        """Get detailed character profile from Raider.io"""
        try:
            api_url = current_app.config["RAIDER_IO_API_URL"]
            url = f"{api_url}/characters/profile"

            params = {
                "region": region,
                "realm": realm,
                "name": name,
                "fields": "mythic_plus_scores_by_season:current,raid_progression,gear,mythic_plus_ranks,raid_achievement_meta",
            }

            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()
            return RaiderIOService._transform_character(data)

        except requests.exceptions.RequestException as e:
            current_app.logger.error(f"Raider.io API error: {e}")
            return None

    @staticmethod
    def _transform_character(data: Dict) -> Dict:
        """Transform Raider.io response to our candidate format"""
        # Extract mythic+ score
        mythic_score = 0
        if "mythic_plus_scores_by_season" in data:
            seasons = data["mythic_plus_scores_by_season"]
            if seasons:
                mythic_score = seasons[0].get("scores", {}).get("all", 0)

        # Extract raid progression
        raid_progress = ""
        if "raid_progression" in data:
            # Get current tier (first key in dict)
            progression = data["raid_progression"]
            if progression:
                current_tier = list(progression.keys())[0]
                tier_data = progression[current_tier]
                raid_progress = tier_data.get("summary", "")

        # Extract gear
        ilvl = data.get("gear", {}).get("item_level_equipped", 0)

        # Extract class and spec
        character_class = data.get("class", "Unknown")
        spec = data.get("active_spec_name", "")
        role = data.get("active_spec_role", "")

        return {
            "candidate_name": data.get("name", ""),
            "realm": data.get("realm", ""),
            "region": data.get("region", "us"),
            "character_class": character_class,
            "spec": spec,
            "role": role,
            "ilvl": ilvl,
            "raider_io_score": int(mythic_score),
            "mythic_plus_rating": int(mythic_score),
            "raid_progress": raid_progress,
            "source": "raider_io",
            "external_url": data.get("profile_url", ""),
        }

"""Blizzard API service - character and guild data fetching"""

import requests
from typing import Dict, List, Optional
from flask import current_app
from app.services.rate_limiter import with_rate_limit_and_circuit_breaker


class BlizzardAPIError(Exception):
    """Custom exception for Blizzard API errors"""

    pass


def get_api_base_url(region: str) -> str:
    """Get the API base URL for a region"""
    region_urls = {
        "us": "https://us.api.blizzard.com",
        "eu": "https://eu.api.blizzard.com",
        "kr": "https://kr.api.blizzard.com",
        "tw": "https://tw.api.blizzard.com",
        "cn": "https://gateway.battlenet.com.cn",
    }
    return region_urls.get(region.lower(), "https://us.api.blizzard.com")


@with_rate_limit_and_circuit_breaker
def fetch_user_characters(access_token: str, region: str = "us") -> List[Dict]:
    """
    Fetch all WoW characters for a user from Blizzard API

    Args:
        access_token: Blizzard OAuth access token
        region: API region (us, eu, kr, tw, cn)

    Returns:
        List of character dictionaries with basic info

    Raises:
        BlizzardAPIError: If API call fails
    """
    api_base = get_api_base_url(region)
    url = f"{api_base}/profile/user/wow"

    headers = {"Authorization": f"Bearer {access_token}"}
    params = {"namespace": f"profile-{region}", "locale": "en_US"}

    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        # Extract character list
        accounts = data.get("wow_accounts", [])
        characters = []

        for account in accounts:
            for character in account.get("characters", []):
                characters.append(
                    {
                        "name": character.get("name"),
                        "realm": character.get("realm", {}).get("slug"),
                        "level": character.get("level"),
                        "playable_class": character.get("playable_class", {}).get("name"),
                        "playable_race": character.get("playable_race", {}).get("name"),
                        "faction": character.get("faction", {}).get("name"),
                    }
                )

        return characters

    except requests.RequestException as e:
        current_app.logger.error(f"Failed to fetch characters: {e}")
        raise BlizzardAPIError(f"Failed to fetch characters: {str(e)}")


@with_rate_limit_and_circuit_breaker
def fetch_character_guild(
    access_token: str, character_name: str, realm_slug: str, region: str = "us"
) -> Optional[Dict]:
    """
    Fetch guild membership for a specific character

    Args:
        access_token: Blizzard OAuth access token
        character_name: Character name
        realm_slug: Realm slug (e.g., "area-52")
        region: API region

    Returns:
        Guild data dict with name, realm, and rank info, or None if not in guild

    Raises:
        BlizzardAPIError: If API call fails
    """
    api_base = get_api_base_url(region)
    char_lower = character_name.lower()
    url = f"{api_base}/profile/wow/character/{realm_slug}/{char_lower}"

    headers = {"Authorization": f"Bearer {access_token}"}
    params = {"namespace": f"profile-{region}", "locale": "en_US"}

    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        guild_data = data.get("guild")
        if not guild_data:
            return None

        # Fetch rank information
        rank_info = data.get("rank", 0)

        return {
            "name": guild_data.get("name"),
            "realm": guild_data.get("realm", {}).get("slug"),
            "faction": guild_data.get("faction", {}).get("name"),
            "rank_id": rank_info,
            "rank_name": f"Rank {rank_info}",  # Default, will be updated from roster
        }

    except requests.HTTPError as e:
        if e.response.status_code == 404:
            # Character not found or not in a guild
            return None
        current_app.logger.error(f"Failed to fetch guild for {character_name}: {e}")
        raise BlizzardAPIError(f"Failed to fetch guild: {str(e)}")
    except requests.RequestException as e:
        current_app.logger.error(f"Failed to fetch guild for {character_name}: {e}")
        raise BlizzardAPIError(f"Failed to fetch guild: {str(e)}")


@with_rate_limit_and_circuit_breaker
def fetch_guild_roster(
    access_token: str, guild_name: str, realm_slug: str, region: str = "us"
) -> List[Dict]:
    """
    Fetch complete guild roster with rank information

    Args:
        access_token: Blizzard OAuth access token
        guild_name: Guild name
        realm_slug: Realm slug
        region: API region

    Returns:
        List of guild members with character name, rank ID, and rank name

    Raises:
        BlizzardAPIError: If API call fails
    """
    api_base = get_api_base_url(region)
    guild_lower = guild_name.lower().replace(" ", "-")
    url = f"{api_base}/data/wow/guild/{realm_slug}/{guild_lower}/roster"

    headers = {"Authorization": f"Bearer {access_token}"}
    params = {"namespace": f"profile-{region}", "locale": "en_US"}

    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        members = []
        for member in data.get("members", []):
            character = member.get("character", {})
            rank = member.get("rank", 0)

            members.append(
                {
                    "character_name": character.get("name"),
                    "realm": character.get("realm", {}).get("slug"),
                    "level": character.get("level"),
                    "rank_id": rank,
                    # Note: Blizzard API doesn't provide rank names in roster
                    # These are custom per guild and need to be fetched separately
                    "rank_name": f"Rank {rank}",
                }
            )

        return members

    except requests.RequestException as e:
        current_app.logger.error(f"Failed to fetch guild roster: {e}")
        raise BlizzardAPIError(f"Failed to fetch guild roster: {str(e)}")


@with_rate_limit_and_circuit_breaker
def fetch_guild_rank_names(
    access_token: str, guild_name: str, realm_slug: str, region: str = "us"
) -> Dict[int, str]:
    """
    Fetch guild rank names (custom per guild)

    Args:
        access_token: Blizzard OAuth access token
        guild_name: Guild name
        realm_slug: Realm slug
        region: API region

    Returns:
        Dictionary mapping rank_id to rank_name (e.g., {0: "Guild Master", 1: "Officer"})

    Raises:
        BlizzardAPIError: If API call fails
    """
    api_base = get_api_base_url(region)
    guild_lower = guild_name.lower().replace(" ", "-")
    url = f"{api_base}/data/wow/guild/{realm_slug}/{guild_lower}"

    headers = {"Authorization": f"Bearer {access_token}"}
    params = {"namespace": f"profile-{region}", "locale": "en_US"}

    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        # Extract rank names from guild data
        ranks = {}
        for rank in data.get("ranks", []):
            rank_id = rank.get("id", 0)
            rank_name = rank.get("name", f"Rank {rank_id}")
            ranks[rank_id] = rank_name

        return ranks

    except requests.RequestException as e:
        current_app.logger.error(f"Failed to fetch guild rank names: {e}")
        raise BlizzardAPIError(f"Failed to fetch guild rank names: {str(e)}")

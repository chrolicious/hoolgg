"""Vault calculator service - Great Vault reward ilvl calculation.

Calculates reward item levels for raid, dungeon (M+), and world
vault slots based on a character's weekly Great Vault progress.
"""

import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)


# Great Vault ilvl reward table for Season 1
# Maps key level / boss difficulty / activity tier to reward ilvl
#
# Raid vault: reward ilvl by difficulty
RAID_VAULT_ILVL: Dict[str, int] = {
    "lfr": 239,
    "normal": 252,
    "heroic": 265,
    "mythic": 278,
}

# Raid vault thresholds: how many boss kills needed per slot
RAID_SLOT_THRESHOLDS: List[int] = [2, 4, 6]

# M+ vault: reward ilvl by key level completed
# Key level -> vault reward ilvl
MPLUS_VAULT_ILVL: Dict[int, int] = {
    2: 249,
    3: 252,
    4: 255,
    5: 258,
    6: 262,
    7: 265,
    8: 268,
    9: 272,
    10: 275,
    11: 278,
    12: 278,   # +12 caps at same as +10/+11 for vault
}

# M+ vault thresholds: how many runs needed per slot
MPLUS_SLOT_THRESHOLDS: List[int] = [1, 4, 8]

# World/Delve vault: reward ilvl by highest delve tier
DELVE_VAULT_ILVL: Dict[int, int] = {
    1: 236,
    2: 236,
    3: 239,
    4: 242,
    5: 246,
    6: 249,
    7: 252,
    8: 255,
    9: 258,
    10: 262,
    11: 265,
}


def _get_mplus_vault_ilvl(key_level: int) -> int:
    """
    Get vault reward ilvl for a given M+ key level.

    Args:
        key_level: Mythic+ key level completed

    Returns:
        Reward item level, or 0 if key level too low
    """
    if key_level <= 1:
        return 0
    # Clamp to max known key level
    clamped = min(key_level, max(MPLUS_VAULT_ILVL.keys()))
    return MPLUS_VAULT_ILVL.get(clamped, 0)


def _get_delve_vault_ilvl(delve_tier: int) -> int:
    """
    Get vault reward ilvl for a given delve tier.

    Args:
        delve_tier: Highest delve tier completed

    Returns:
        Reward item level, or 0 if tier too low
    """
    if delve_tier < 1:
        return 0
    clamped = min(delve_tier, max(DELVE_VAULT_ILVL.keys()))
    return DELVE_VAULT_ILVL.get(clamped, 0)


def calculate_vault_slots(vault_entry: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate Great Vault reward ilvls from a GreatVaultEntry.

    Takes vault progress data and returns calculated reward ilvls
    for each of the 7 vault slots (3 raid, 3 dungeon, 1 world).

    Args:
        vault_entry: Dict with vault progress, expected keys:
            - raid_lfr (int): LFR boss kills
            - raid_normal (int): Normal boss kills
            - raid_heroic (int): Heroic boss kills
            - raid_mythic (int): Mythic boss kills
            - m_plus_runs (list): List of completed M+ key levels (ints)
            - highest_delve (int): Highest delve tier completed

    Returns:
        Dict with calculated vault slots:
            - raid_slots: list of 3 dicts with {unlocked, ilvl, difficulty}
            - dungeon_slots: list of 3 dicts with {unlocked, ilvl, key_level}
            - world_slots: list of 1 dict with {unlocked, ilvl, source}
    """
    result: Dict[str, Any] = {
        "raid_slots": [],
        "dungeon_slots": [],
        "world_slots": [],
    }

    # --- Raid slots ---
    # Determine best raid difficulty with enough kills
    raid_kills = {
        "mythic": vault_entry.get("raid_mythic", 0),
        "heroic": vault_entry.get("raid_heroic", 0),
        "normal": vault_entry.get("raid_normal", 0),
        "lfr": vault_entry.get("raid_lfr", 0),
    }

    # Calculate total kills per difficulty (cumulative: mythic counts for heroic, etc.)
    cumulative_kills = {
        "mythic": raid_kills["mythic"],
        "heroic": raid_kills["mythic"] + raid_kills["heroic"],
        "normal": raid_kills["mythic"] + raid_kills["heroic"] + raid_kills["normal"],
        "lfr": sum(raid_kills.values()),
    }

    for threshold in RAID_SLOT_THRESHOLDS:
        slot = {"unlocked": False, "ilvl": 0, "difficulty": None}

        # Find highest difficulty where we have enough kills
        for diff in ("mythic", "heroic", "normal", "lfr"):
            if cumulative_kills[diff] >= threshold:
                slot["unlocked"] = True
                slot["ilvl"] = RAID_VAULT_ILVL[diff]
                slot["difficulty"] = diff
                break

        result["raid_slots"].append(slot)

    # --- Dungeon (M+) slots ---
    m_plus_runs = vault_entry.get("m_plus_runs") or []

    # Sort runs by key level descending
    sorted_runs = sorted(
        [r for r in m_plus_runs if isinstance(r, (int, float)) and r > 0],
        reverse=True,
    )

    for i, threshold in enumerate(MPLUS_SLOT_THRESHOLDS):
        slot = {"unlocked": False, "ilvl": 0, "key_level": 0}

        if len(sorted_runs) >= threshold:
            # The vault reward for slot N is based on the Nth best key
            # (e.g., slot 1 = best key, slot 2 = 4th best, slot 3 = 8th best)
            key_index = threshold - 1
            if key_index < len(sorted_runs):
                key_level = int(sorted_runs[key_index])
                slot["unlocked"] = True
                slot["ilvl"] = _get_mplus_vault_ilvl(key_level)
                slot["key_level"] = key_level

        result["dungeon_slots"].append(slot)

    # --- World slot (Delves) ---
    # Use delve_runs if available, fall back to legacy highest_delve
    delve_runs = vault_entry.get("delve_runs") or []
    highest_delve = 0

    if delve_runs:
        # Filter valid delve tiers and find the highest
        valid_delves = [d for d in delve_runs if isinstance(d, (int, float)) and d > 0]
        if valid_delves:
            highest_delve = int(max(valid_delves))
    else:
        # Fall back to legacy highest_delve field
        highest_delve = vault_entry.get("highest_delve", 0) or 0

    world_slot = {"unlocked": False, "ilvl": 0, "source": "delve"}

    if highest_delve > 0:
        world_slot["unlocked"] = True
        world_slot["ilvl"] = _get_delve_vault_ilvl(highest_delve)
        world_slot["source"] = f"Delve T{highest_delve}"

    result["world_slots"].append(world_slot)

    logger.debug(
        f"Vault calculation complete: "
        f"raid={sum(1 for s in result['raid_slots'] if s['unlocked'])}/3, "
        f"dungeon={sum(1 for s in result['dungeon_slots'] if s['unlocked'])}/3, "
        f"world={sum(1 for s in result['world_slots'] if s['unlocked'])}/1"
    )

    return result

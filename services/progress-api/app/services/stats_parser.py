"""Stats parser service - parse Blizzard API character statistics.

Extracts primary stats (strength, agility, intellect, stamina),
secondary stats (crit, haste, mastery, versatility with both rating
and percentage), and armor from the Blizzard API stats response.
"""

import logging
from typing import Dict, Any, Optional, Union

logger = logging.getLogger(__name__)


def parse_character_stats(stats_data: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Parse character stats from Blizzard API response.

    Extracts and normalizes primary stats, secondary stats, and armor
    from the raw Blizzard API statistics endpoint response.

    Args:
        stats_data: Raw stats response from Blizzard API
            (from /profile/wow/character/{realm}/{name}/statistics)

    Returns:
        Dict with normalized stat values:
            - strength, agility, intellect, stamina (int)
            - crit_rating, crit_rating_pct (int, float)
            - haste_rating, haste_rating_pct (int, float)
            - mastery_rating, mastery_rating_pct (int, float)
            - versatility, versatility_pct (int, float)
            - armor (int)
    """
    if not stats_data:
        logger.warning("No stats data provided to parse")
        return {}

    stats: Dict[str, Any] = {}

    # Primary stats
    for stat in ("strength", "agility", "intellect", "stamina"):
        stat_obj = stats_data.get(stat, {})
        if isinstance(stat_obj, dict):
            stats[stat] = stat_obj.get("effective", 0)
        else:
            stats[stat] = 0

    # Secondary stats - try multiple field name variations

    # Critical Strike
    crit_obj = stats_data.get(
        "melee_crit",
        stats_data.get("spell_crit", stats_data.get("ranged_crit", {})),
    )
    if isinstance(crit_obj, dict):
        stats["crit_rating"] = crit_obj.get("rating", 0)
        stats["crit_rating_pct"] = crit_obj.get("value", 0)
    else:
        stats["crit_rating"] = 0
        stats["crit_rating_pct"] = 0

    # Haste
    haste_obj = stats_data.get(
        "melee_haste",
        stats_data.get("spell_haste", stats_data.get("ranged_haste", {})),
    )
    if isinstance(haste_obj, dict):
        stats["haste_rating"] = haste_obj.get("rating", 0)
        stats["haste_rating_pct"] = haste_obj.get("value", 0)
    else:
        stats["haste_rating"] = 0
        stats["haste_rating_pct"] = 0

    # Mastery
    mastery_obj = stats_data.get("mastery", {})
    if isinstance(mastery_obj, dict):
        stats["mastery_rating"] = mastery_obj.get("rating", 0)
        stats["mastery_rating_pct"] = mastery_obj.get("value", 0)
    else:
        stats["mastery_rating"] = 0
        stats["mastery_rating_pct"] = 0

    # Versatility - has different structure (flat values instead of nested)
    vers_rating = stats_data.get("versatility", 0)
    vers_pct = stats_data.get("versatility_damage_done_bonus", 0)

    if isinstance(vers_rating, (int, float)):
        stats["versatility"] = vers_rating
    else:
        stats["versatility"] = 0

    if isinstance(vers_pct, (int, float)):
        stats["versatility_pct"] = vers_pct
    else:
        stats["versatility_pct"] = 0

    # Armor
    armor_obj = stats_data.get("armor", {})
    if isinstance(armor_obj, dict):
        stats["armor"] = armor_obj.get("effective", 0)
    else:
        stats["armor"] = 0

    logger.debug(
        f"Parsed character stats: "
        f"str={stats.get('strength')}, agi={stats.get('agility')}, "
        f"int={stats.get('intellect')}, sta={stats.get('stamina')}, "
        f"ilvl-relevant secondaries parsed"
    )

    return stats

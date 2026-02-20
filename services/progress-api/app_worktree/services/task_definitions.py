"""Task definitions for weekly roster progression tracking.

Contains the full WEEKLY_TASKS dict with all week definitions (weeks -2 to 9+).
Each week has: name, weekly tasks list, daily tasks list.
Each task has: id, label, done (default False).

Based on Larias' Raider's Guide for Midnight (updated Feb 18).
"""

import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


# Week-specific tasks based on Midnight Season 1 progression
WEEKLY_TASKS: Dict[int, Dict[str, Any]] = {
    -2: {
        "name": "Early Access (Feb 26 - Mar 2)",
        "weekly": [
            {"id": "level_chars", "label": "Level character to max", "done": False},
            {"id": "dmf_xp", "label": "Darkmoon Faire opens Sunday — use 10% XP/Renown bonus", "done": False},
            {"id": "weekly_events", "label": "Complete weekly events if available", "done": False},
            {"id": "level_prey", "label": "Level Prey if possible", "done": False},
            {
                "id": "hold_quests_dmf",
                "label": "Minimize side quests until Sunday — stack with DMF 10% Renown bonus",
                "done": False,
            },
        ],
        "daily": [],
    },
    -1: {
        "name": "Pre-Season Week 1 (Mar 3 - M0 at reduced ilvl)",
        "weekly": [
            {"id": "no_crests", "label": "Do NOT spend any crests", "done": False},
            {
                "id": "renown_voidspire",
                "label": "Raise Voidspire to Renown 7 (free Champion head piece)",
                "done": False,
            },
            {
                "id": "renown_harati",
                "label": "Raise Hara'ti to Renown 8 (free Champion waist piece)",
                "done": False,
            },
            {
                "id": "renown_silvermoon",
                "label": "Raise Silvermoon & Amani to Renown 9 (free Champion necklace + trinket)",
                "done": False,
            },
            {"id": "weekly_events", "label": "Complete weekly events", "done": False},
            {"id": "unlock_delves", "label": "Unlock Delves to Tier 8+ (Tier 11 if available)", "done": False},
            {"id": "prey", "label": "Do Prey if it gives useful rewards (Champion pieces)", "done": False},
            {"id": "world_quests", "label": "Do any world quests that give gear upgrades", "done": False},
            {
                "id": "m0_tour",
                "label": "Complete M0 World Tour — drops 3/6 Veteran 240 (do NOT upgrade)",
                "done": False,
            },
        ],
        "daily": [],
    },
    0: {
        "name": "Pre-Season Week 2 (Mar 10 - M0 at reduced ilvl)",
        "weekly": [
            {"id": "no_crests", "label": "Do NOT spend any crests", "done": False},
            {"id": "unlock_delves", "label": "Unlock Delves to Tier 8+ (Tier 11 if available)", "done": False},
            {"id": "prey", "label": "Do Prey if it gives useful rewards (Champion pieces)", "done": False},
            {"id": "world_quests", "label": "Do any world quests that give gear upgrades", "done": False},
            {"id": "weekly_events", "label": "Complete weekly events", "done": False},
            {
                "id": "m0_tour",
                "label": "Complete M0 World Tour — drops 3/6 Veteran 240 (do NOT upgrade)",
                "done": False,
            },
            {
                "id": "craft_246",
                "label": "Craft 246 pieces in 3-5 slots (60x Veteran each) — only if raiding Tue Mar 17",
                "done": False,
            },
        ],
        "daily": [],
    },
    1: {
        "name": "S1 Week 1 — Heroic Week, no M+ (Mar 17)",
        "weekly": [
            {"id": "no_hero_myth", "label": "Do NOT spend Heroic or Mythic crests", "done": False},
            {"id": "lfr_tier", "label": "Do LFR for tier pieces (unlocks catalyst charges at 4-set)", "done": False},
            {
                "id": "m0_tour",
                "label": "Complete M0 World Tour — now drops 1/6 Champion 246",
                "done": False,
            },
            {"id": "world_boss", "label": "Kill world boss for 2/6 Champion 250 item", "done": False},
            {"id": "prey", "label": "Do Prey if it gives useful rewards", "done": False},
            {
                "id": "pvp_quest",
                "label": "Do PvP quest for guaranteed Hero track neck/ring (don't upgrade)",
                "done": False,
            },
            {"id": "delves", "label": "Do bountiful Delves with coffer keys (use map)", "done": False},
            {
                "id": "craft_246",
                "label": "Craft 246 pieces in 3-5 slots (60x Veteran each) — bracers/belt/boots + 2 embellishments",
                "done": False,
            },
            {
                "id": "craft_233",
                "label": "Craft remaining empty slots at 233 (60x Adventurer each)",
                "done": False,
            },
            {
                "id": "spend_low_crests",
                "label": "Spend non-Heroic/Mythic crests on temp upgrades (prefer trinkets)",
                "done": False,
            },
            {"id": "normal_clear", "label": "Clear Normal raid", "done": False},
            {"id": "heroic_clear", "label": "Clear Heroic raid", "done": False},
        ],
        "daily": [],
    },
    2: {
        "name": "S1 Week 2 — Mythic + M+ opens (Mar 24)",
        "weekly": [
            {"id": "no_hero_myth", "label": "Do NOT spend Heroic or Mythic crests", "done": False},
            {"id": "lfr_tier", "label": "Do LFR for tier pieces", "done": False},
            {"id": "world_boss", "label": "Kill world boss for 2/6 Champion 250 item", "done": False},
            {"id": "prey", "label": "Do Prey if useful rewards", "done": False},
            {"id": "delves", "label": "Bountiful Delves with coffer keys (optional if no upgrades)", "done": False},
            {
                "id": "spend_low_crests",
                "label": "Spend non-Heroic/Mythic crests on temp upgrades (prefer trinkets)",
                "done": False,
            },
            {
                "id": "farm_mplus",
                "label": "Farm +10s for 3/6h 266 gear, vault slots, and crests (+8s min if +10s too hard)",
                "done": False,
            },
            {"id": "normal_clear", "label": "Full clear Normal raid", "done": False},
            {"id": "heroic_clear", "label": "Full clear Heroic raid", "done": False},
            {"id": "mythic_prog", "label": "Begin Mythic progression", "done": False},
        ],
        "daily": [],
    },
    3: {
        "name": "S1 Week 3 — Final Raid opens (Mar 31)",
        "weekly": [
            {
                "id": "vault_open",
                "label": "Open vault for 272+ Myth item — upgrade AFTER crafting",
                "done": False,
            },
            {
                "id": "craft_weapon",
                "label": "Craft 2H Mythic weapon at 5/6 285 (60 Myth crests)",
                "done": False,
            },
            {"id": "lfr_tier", "label": "Do LFR for tier if no 4-set yet", "done": False},
            {"id": "farm_m12", "label": "Farm +12s for vault slots and crests", "done": False},
            {"id": "raid_reclear", "label": "Reclear all raids (Normal/Heroic/Mythic)", "done": False},
            {
                "id": "spend_heroic",
                "label": "After reclear: spend 300 Heroic crests — upgrade 10 items 3/6→4/6 (30c each). Leave 1 ring, trinket, and next craft slot unupgraded",
                "done": False,
            },
            {
                "id": "upgrade_myth",
                "label": "Upgrade 1/6 272 Myth vault item to 4/6 282 (60 Myth crests)",
                "done": False,
            },
        ],
        "daily": [],
    },
    4: {
        "name": "S1 Week 4 — Progression (Apr 7)",
        "weekly": [
            {"id": "vault", "label": "Open vault for 272+ Myth item", "done": False},
            {"id": "farm_m12", "label": "Farm +12s for vault slots and crests", "done": False},
            {
                "id": "heroic_crests",
                "label": "Heroic: upgrade 2x 3/6→4/6 (60c) + 1x 4/6→5/6 (40c) = 100 crests. Prefer ring/trinket unlikely to be replaced",
                "done": False,
            },
            {
                "id": "myth_upgrades",
                "label": "Myth: upgrade 1/6→4/6 (60c) + 2/6→4/6 (50c) + best 4/6→5/6 (50c) = 160 crests",
                "done": False,
            },
        ],
        "daily": [],
    },
    5: {
        "name": "S1 Week 5 — Progression (Apr 14)",
        "weekly": [
            {"id": "vault", "label": "Open vault for 272+ Myth item", "done": False},
            {"id": "farm_m12", "label": "Farm +12s for vault slots and crests", "done": False},
            {
                "id": "craft_second",
                "label": "Craft 2nd item at 5/6 285 Mythic (60 Myth crests) — prefer slot with Heroic item",
                "done": False,
            },
            {
                "id": "heroic_crests",
                "label": "Heroic: upgrade 2x 4/6→5/6 (80 crests). Pick items unlikely to be replaced",
                "done": False,
            },
            {
                "id": "myth_upgrade",
                "label": "Myth: upgrade 1/6 272 vault item to 4/6 282 (60 crests)",
                "done": False,
            },
        ],
        "daily": [],
    },
    6: {
        "name": "S1 Week 6 — Progression (Apr 21)",
        "weekly": [
            {"id": "vault", "label": "Open vault for 272+ Myth item", "done": False},
            {"id": "farm_m12", "label": "Farm +12s for vault slots and crests", "done": False},
            {
                "id": "heroic_crests",
                "label": "Heroic: upgrade 3x 4/6→5/6 (120 crests). Pick items unlikely to be replaced",
                "done": False,
            },
            {
                "id": "myth_upgrade",
                "label": "Myth: upgrade 1/6→4/6 (30c) + 3/6→4/6 (30c) = 60 crests",
                "done": False,
            },
        ],
        "daily": [],
    },
    7: {
        "name": "S1 Week 7 — Progression (Apr 28)",
        "weekly": [
            {"id": "vault", "label": "Open vault for 272+ Myth item", "done": False},
            {"id": "farm_m12", "label": "Farm +12s for vault slots and crests", "done": False},
            {
                "id": "craft_third",
                "label": "Craft 3rd item at 5/6 285 Mythic (60 Myth crests) — prefer slot with Heroic item",
                "done": False,
            },
            {
                "id": "heroic_crests",
                "label": "Heroic: upgrade last 2x 4/6→5/6 (80 crests)",
                "done": False,
            },
            {
                "id": "myth_upgrade",
                "label": "Myth: upgrade 1/6→3/6 279 (30 crests)",
                "done": False,
            },
        ],
        "daily": [],
    },
    8: {
        "name": "S1 Week 8 — Done with Heroic crests (May 5)",
        "weekly": [
            {"id": "vault", "label": "Open vault for 272+ Myth item", "done": False},
            {"id": "farm_m12", "label": "Farm +12s for vault slots and crests", "done": False},
            {
                "id": "heroic_final",
                "label": "Heroic: upgrade last 2x 5/6→6/6 (100 crests) — DONE with Heroic crests",
                "done": False,
            },
            {
                "id": "myth_upgrades",
                "label": "Myth: 1/6→2/6 (10c) + 3x 2/6→3/6 (60c) + 1x 3/6→4/6 (30c) = 100 crests",
                "done": False,
            },
        ],
        "daily": [],
    },
    9: {
        "name": "S1 Week 9+ — Final Optimization (May 12+)",
        "weekly": [
            {"id": "vault", "label": "Open vault and optimize picks", "done": False},
            {"id": "farm_m12", "label": "Farm +12s and cap crests", "done": False},
            {
                "id": "craft_remaining",
                "label": "Craft remaining slots at 5/6 Mythic (60 crests each)",
                "done": False,
            },
            {"id": "push_282", "label": "Get every item to at least 4/6 282 Mythic", "done": False},
            {"id": "upgrade_289", "label": "Start upgrading to 5/6 285 then 6/6 289", "done": False},
        ],
        "daily": [],
    },
}


def get_task_definitions(week: int) -> Dict[str, Any]:
    """
    Get task definitions for a specific week.

    Weeks 10+ follow the same progression pattern as week 9.

    Args:
        week: Week number (-2 to 12)

    Returns:
        Dict with 'name', 'weekly' tasks list, and 'daily' tasks list
    """
    if week in WEEKLY_TASKS:
        return WEEKLY_TASKS[week]

    # Weeks 10+ use week 9 definition
    if week >= 9:
        return WEEKLY_TASKS[9]

    # Fallback for weeks before -2
    if week < -2:
        return WEEKLY_TASKS[-2]

    # Fallback
    logger.warning(f"No task definition found for week {week}, using default")
    return {
        "name": "Unknown Week",
        "weekly": [],
        "daily": [],
    }


def get_all_task_ids(week: int) -> List[str]:
    """
    Get all task IDs for a specific week.

    Args:
        week: Week number

    Returns:
        List of task ID strings (both weekly and daily)
    """
    tasks = get_task_definitions(week)
    ids = [t["id"] for t in tasks.get("weekly", [])]
    ids.extend(t["id"] for t in tasks.get("daily", []))
    return ids

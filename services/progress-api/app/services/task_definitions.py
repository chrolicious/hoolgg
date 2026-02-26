"""Task definitions for weekly roster progression tracking.

Contains the full WEEKLY_TASKS dict with all week definitions (weeks -2 to 9+).
Each week has: name, weekly tasks list, daily tasks list.
Each task has: id, label, done (default False).

Based on Larias' Raider's Guide for Midnight (updated Feb 21).
"""

import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

WEEKLY_TASKS: Dict[int, Dict[str, Any]] = {
    -2: {
        "name": "Early Access (Feb 26 - Mar 3)",
        "weekly": [
            {"id": "level_chars", "label": "Level character to max", "done": False},
            {"id": "weekly_events", "label": "Complete weekly events if available", "done": False},
            {"id": "level_prey", "label": "Level Prey if possible", "done": False},
        ],
        "daily": [],
        "tips": [
            "Darkmoon Faire opens Sunday — use the 10% XP/Renown bonus",
            "Minimize side quests until Sunday to stack DMF 10% Renown",
        ],
    },
    -1: {
        "name": "Pre-Season Week 1 (Mar 3)",
        "weekly": [
            {"id": "renown_push", "label": "Raise The Singularity to 7, Hara'ti to 8, Silvermoon/Amani to 9 for free Champion gear", "done": False},
            {"id": "weekly_events", "label": "Complete weekly events", "done": False},
            {"id": "unlock_delves", "label": "Unlock Delves to Tier 8 (Tier 11 if available)", "done": False},
            {"id": "prey", "label": "Do Prey if it gives useful rewards (Champion pieces)", "done": False},
            {"id": "world_quests", "label": "Complete world quests giving gear upgrades", "done": False},
            {"id": "m0_tour", "label": "Complete M0 World Tour (drops 3/6 Veteran 240)", "done": False},
        ],
        "daily": [],
        "tips": [
            "Do NOT spend any crests unless instructed",
            "Do NOT upgrade M0 gear — save crests for later",
        ],
    },
    0: {
        "name": "Pre-Season Week 2 (Mar 10)",
        "weekly": [
            {"id": "unlock_delves", "label": "Unlock Delves to Tier 8 (Tier 11 if available)", "done": False},
            {"id": "prey", "label": "Do Prey if it gives useful rewards", "done": False},
            {"id": "world_quests", "label": "Complete world quests giving gear upgrades", "done": False},
            {"id": "weekly_events", "label": "Complete weekly events", "done": False},
            {"id": "m0_tour", "label": "Complete M0 World Tour (drops 3/6 Veteran 240)", "done": False},
            {"id": "craft_246", "label": "Craft 2x 246 ilvl pieces (80x Vet Dawncrests each) before reset", "done": False},
        ],
        "daily": [],
        "tips": [
            "Do NOT spend any crests unless instructed",
            "Only craft if you plan to raid on Mar 17",
        ],
    },
    1: {
        "name": "Season 1 Week 1 — Heroic Week (Mar 17)",
        "weekly": [
            {"id": "lfr_tier", "label": "Do LFR for tier pieces", "done": False},
            {"id": "m0_tour", "label": "Complete M0 World Tour (drops 1/6 Champion 246)", "done": False},
            {"id": "world_boss", "label": "Kill World Boss for 2/6 Champion 250", "done": False},
            {"id": "pvp_quest", "label": "Do PvP quest for guaranteed Hero track neck/ring", "done": False},
            {"id": "delves", "label": "Do Bountiful Delves with coffer keys (use map)", "done": False},
            {"id": "craft_246", "label": "Craft 2x 246 ilvl pieces (80x Vet Dawncrests each) before raid", "done": False},
            {"id": "spend_low_crests", "label": "Spend ALL Veteran/Champion crests upgrading everything possible before raid", "done": False},
            {"id": "raid_clear", "label": "Clear Normal/Heroic raid", "done": False},
        ],
        "daily": [],
        "tips": [
            "Do NOT spend Heroic or Mythic crests this week",
            "Do NOT upgrade PvP neck/ring — save crests",
        ],
    },
    2: {
        "name": "Season 1 Week 2 — Mythic & M+ Opens (Mar 24)",
        "weekly": [
            {"id": "craft_mythic", "label": "Craft Mythic Embellished item (1 spark) if recommended by class discord", "done": False},
            {"id": "lfr_tier", "label": "Do LFR for tier pieces", "done": False},
            {"id": "world_boss", "label": "Kill World Boss", "done": False},
            {"id": "delves", "label": "Do Bountiful Delves with coffer keys", "done": False},
            {"id": "delves_t11", "label": "Do at least 1x T11 Delve for cracked keystone quest (20 free Heroic/Mythic crests)", "done": False},
            {"id": "spend_low_crests", "label": "Spend ALL Veteran/Champion crests upgrading everything possible", "done": False},
            {"id": "farm_mplus", "label": "Farm +10s (3/6h 266) or +8s (2/6h)", "done": False},
            {"id": "raid_clear", "label": "Full clear Normal/Heroic raids", "done": False},
            {"id": "upgrade_heroic", "label": "Before Mythic: Upgrade 11 items 3/6->4/6 269 (220 Heroic Crests)", "done": False},
        ],
        "daily": [],
        "tips": [
            "Do NOT spend Heroic or Mythic crests this week",
        ],
    },
    3: {
        "name": "Season 1 Week 3 — Final Raid Opens (Mar 31)",
        "weekly": [
            {"id": "vault", "label": "Open Vault for 272+ Myth item", "done": False},
            {"id": "craft_weapon", "label": "Craft 2H Mythic weapon 285 (80 Mythic Crests)", "done": False},
            {"id": "lfr_tier", "label": "Do LFR for tier pieces if no 4-set", "done": False},
            {"id": "farm_m10", "label": "Farm +10s for vault slots and crests", "done": False},
            {"id": "raid_reclear", "label": "Reclear the raid", "done": False},
            {"id": "heroic_crests", "label": "Heroic: Upgrade 2x 4/6->6/6 276 (80 Heroic Crests). Save 20.", "done": False},
            {"id": "myth_upgrade", "label": "Mythic: Upgrade 1/6 Mythic vault to 6/6 289 (80 Mythic crests)", "done": False},
        ],
        "daily": [],
        "tips": [
            "Upgrade vault items AFTER crafting to optimize crest spending",
        ],
    },
    4: {
        "name": "Season 1 Week 4 (Apr 7)",
        "weekly": [
            {"id": "vault", "label": "Open Vault for 272+ Myth item", "done": False},
            {"id": "farm_m10", "label": "Farm +10s for vault slots and crests", "done": False},
            {"id": "heroic_crests", "label": "Heroic: Upgrade 2x 4/6->6/6 276 (80 Heroic Crests). Save 20.", "done": False},
            {"id": "myth_vault", "label": "Mythic: Upgrade 1/6 Mythic vault to 6/6 289 (80 Mythic crests)", "done": False},
            {"id": "myth_raid", "label": "Mythic: Upgrade raid drop 2/6->6/6 289 (80 Mythic crests)", "done": False},
        ],
        "daily": [],
        "tips": [],
    },
    5: {
        "name": "Season 1 Week 5 (Apr 14)",
        "weekly": [
            {"id": "vault", "label": "Open Vault for 272+ Myth item", "done": False},
            {"id": "farm_m10", "label": "Farm +10s for vault slots and crests", "done": False},
            {"id": "craft_second", "label": "Craft 2nd item 5/6 285 Mythic (80 Mythic crests)", "done": False},
            {"id": "heroic_crests", "label": "Heroic: Upgrade 2x 4/6->6/6 276 (80 Heroic Crests). Save 20.", "done": False},
            {"id": "myth_vault", "label": "Mythic: Upgrade 1/6 Mythic vault to 6/6 289 (80 Mythic crests)", "done": False},
        ],
        "daily": [],
        "tips": [],
    },
    6: {
        "name": "Season 1 Week 6 — Done with Heroic (Apr 21)",
        "weekly": [
            {"id": "vault", "label": "Open Vault for 272+ Myth item", "done": False},
            {"id": "farm_m12", "label": "Farm +12s for vault slots and crests", "done": False},
            {"id": "heroic_final", "label": "Heroic: Upgrade 1x 4/6->6/6 276 (40 Heroic Crests) — DONE with Heroic", "done": False},
            {"id": "myth_vault", "label": "Mythic: Upgrade 1/6 Mythic vault to 6/6 289 (80 Mythic crests)", "done": False},
            {"id": "myth_raid", "label": "Mythic: Upgrade raid drop 2/6->5/6 285 (60 Mythic crests)", "done": False},
        ],
        "daily": [],
        "tips": [],
    },
    7: {
        "name": "Season 1 Week 7+ (Apr 28 on)",
        "weekly": [
            {"id": "vault", "label": "Open Vault and optimize picks", "done": False},
            {"id": "farm_m12", "label": "Farm +12s for vault slots and crests", "done": False},
            {"id": "upgrade_mythic", "label": "Upgrade Mythic items as you get them (prioritize to 6/6 289)", "done": False},
            {"id": "plan_oh", "label": "Plan Off-Hand craft for 6/6 main hand w/ embellishment", "done": False},
        ],
        "daily": [],
        "tips": [
            "Do not craft in any slot if you can get >1/6 Mythic from vault",
        ],
    },
}

def get_task_definitions(week: int) -> Dict[str, Any]:
    """
    Get task definitions for a specific week.
    """
    if week in WEEKLY_TASKS:
        return WEEKLY_TASKS[week]
    if week >= 7:
        return WEEKLY_TASKS[7]
    if week < -2:
        return WEEKLY_TASKS[-2]
    
    logger.warning(f"No task definition found for week {week}, using default")
    return {"name": "Unknown Week", "weekly": [], "daily": []}

def get_all_task_ids(week: int) -> List[str]:
    """
    Get all task IDs for a specific week.
    """
    tasks = get_task_definitions(week)
    ids = [t["id"] for t in tasks.get("weekly", [])]
    ids.extend(t["id"] for t in tasks.get("daily", []))
    return ids

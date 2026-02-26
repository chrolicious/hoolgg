"""Task definitions for weekly roster progression tracking.

Contains the full WEEKLY_TASKS dict with all week definitions (weeks -2 to 9+).
Each week has: name, weekly tasks list, daily tasks list, tips list.
Each task has: id, label, done (default False).

Based on Larias' Raider's Guide for Midnight (updated Feb 25).
"""

import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

WEEKLY_TASKS: Dict[int, Dict[str, Any]] = {
    -2: {
        "name": "Early Access (Feb 26 - Mar 3)",
        "weekly": [
            {"id": "level_chars", "label": "Level character to max (use Warmode for bonus XP)", "done": False},
            {"id": "weekly_events", "label": "Complete weekly events (Soiree, Abundance, Legends, Stormarion)", "done": False},
            {"id": "prey_normal", "label": "Complete Prey Normal 4x for Adventurer gear", "done": False},
            {"id": "unlock_delves", "label": "Unlock Delves — progress to Tier 8 (Tier 11 if available)", "done": False},
            {"id": "world_rares", "label": "Kill world rares for renown (once per rare weekly)", "done": False},
        ],
        "daily": [],
        "tips": [
            "Darkmoon Faire opens Sunday — use the 10% XP/Renown bonus",
            "Hold final renown turn-in quests until DMF buff is active",
            "Level with Warmode enabled for bonus XP",
        ],
    },
    -1: {
        "name": "Pre-Season Week 1 (Mar 3)",
        "weekly": [
            {"id": "renown_push", "label": "Raise Singularity to 7, Hara'ti to 8, Silvermoon/Amani to 9 for free Champion gear", "done": False},
            {"id": "weekly_events", "label": "Complete weekly events (Soiree, Abundance, Legends, Stormarion)", "done": False},
            {"id": "m0_tour", "label": "Complete M0 World Tour (drops 3/6 Veteran 240)", "done": False},
            {"id": "prey_hard", "label": "Complete Prey Hard 4x for Veteran gear", "done": False},
            {"id": "unlock_delves", "label": "Unlock Delves to Tier 8+ with coffer keys", "done": False},
        ],
        "daily": [],
        "tips": [
            "Do NOT spend crests yet — save for crafting in Week 2",
            "Use DMF 10% renown buff if Faire is still up",
        ],
    },
    0: {
        "name": "Pre-Season Week 2 (Mar 10)",
        "weekly": [
            {"id": "weekly_events", "label": "Complete weekly events (Soiree, Abundance, Legends, Stormarion)", "done": False},
            {"id": "m0_tour", "label": "Complete M0 World Tour (drops 3/6 Veteran 240)", "done": False},
            {"id": "prey_hard", "label": "Complete Prey Hard 4x for Veteran gear", "done": False},
            {"id": "unlock_delves", "label": "Do Delves Tier 8+ with coffer keys", "done": False},
            {"id": "craft_246", "label": "Craft 2x Veteran 5/6 246 (bracer/belt/boot) with 2x Embellishments (80 Vet Dawncrests each)", "done": False},
            {"id": "renown_push", "label": "Finish renown targets if not completed last week", "done": False},
        ],
        "daily": [],
        "tips": [
            "Only craft before reset if you plan to raid on Tuesday Mar 17",
            "If not raiding Tuesday, hold crafting until next week",
        ],
    },
    1: {
        "name": "Season 1 Week 1 — Heroic Week (Mar 17)",
        "weekly": [
            {"id": "lfr_tier", "label": "Do LFR for tier pieces (4-set enables catalyst)", "done": False},
            {"id": "m0_tour", "label": "Complete M0 World Tour (now drops 1/6 Champion 246)", "done": False},
            {"id": "world_boss", "label": "Kill World Boss for 2/6 Champion 250", "done": False},
            {"id": "pvp_quest", "label": "Do PvP quest for guaranteed Hero track neck/ring", "done": False},
            {"id": "delves", "label": "Do Bountiful Delves Tier 8+ with coffer keys (use map)", "done": False},
            {"id": "prey_nightmare", "label": "Complete Prey Nightmare 4x for Champion gear + renown", "done": False},
            {"id": "craft_246", "label": "Craft 2x Veteran 5/6 246 with Embellishments before raid (if not done last week)", "done": False},
            {"id": "spend_low_crests", "label": "Spend ALL Adventurer/Veteran/Champion crests upgrading everything before raid", "done": False},
            {"id": "raid_clear", "label": "Clear Normal/Heroic raid", "done": False},
        ],
        "daily": [],
        "tips": [
            "Do NOT spend Heroic or Mythic crests — save for Week 2 upgrades and Week 3 weapon craft",
            "Low-tier crests (Adventurer/Veteran/Champion) become worthless next week — spend them now",
            "Priority: get 4-piece tier set ASAP (unlocks catalyst charges for all content)",
        ],
    },
    2: {
        "name": "Season 1 Week 2 — Mythic & M+ Opens (Mar 24)",
        "weekly": [
            {"id": "craft_mythic", "label": "Craft Mythic Embellished item OR 2H Weapon (1 spark, 80 Mythic Crests)", "done": False},
            {"id": "lfr_tier", "label": "Do LFR for tier pieces if no 4-set", "done": False},
            {"id": "delves_t11", "label": "Complete 1x Tier 11 Delve for Cracked Keystone quest (20 free Heroic + 20 Mythic crests)", "done": False},
            {"id": "farm_mplus", "label": "Farm +10s for 3/6 Hero 266 gear, vault slots, and crests (or +8s for 2/6 Hero 263)", "done": False},
            {"id": "world_boss", "label": "Kill World Boss", "done": False},
            {"id": "delves", "label": "Do Bountiful Delves with coffer keys", "done": False},
            {"id": "spend_low_crests", "label": "Spend ALL Adventurer/Veteran/Champion crests upgrading everything", "done": False},
            {"id": "upgrade_heroic", "label": "Upgrade 11x items 3/6 -> 4/6 Hero 269 (220 Heroic Crests total)", "done": False},
            {"id": "raid_clear", "label": "Full clear Normal/Heroic raids", "done": False},
        ],
        "daily": [],
        "tips": [
            "Spend Heroic crests now on 3/6 -> 4/6 upgrades (220 total for 11 items)",
            "Do NOT hold Mythic crests — upgrade raid mythic items if you got any",
            "Check your class Discord for which crafting path (2H weapon vs armor + embellishments)",
        ],
    },
    3: {
        "name": "Season 1 Week 3 — Final Raid Opens (Mar 31)",
        "weekly": [
            {"id": "vault", "label": "Open Vault — claim 272+ Myth track item (weapons preferred)", "done": False},
            {"id": "craft_weapon", "label": "Craft 2nd Embellished item or 2H Weapon (check class Discord)", "done": False},
            {"id": "lfr_tier", "label": "Do LFR for tier pieces if no 4-set", "done": False},
            {"id": "farm_m10", "label": "Farm +10s for vault slots and crests", "done": False},
            {"id": "raid_reclear", "label": "Reclear all raids (Voidspire + Dreamrift + March on Quel'danas)", "done": False},
            {"id": "heroic_crests", "label": "Upgrade 2x items 4/6 -> 6/6 Hero 276 (80 Heroic Crests, save 20 for converting)", "done": False},
            {"id": "myth_upgrade", "label": "Upgrade 1/6 Mythic vault item -> 6/6 289 (80 Mythic Crests)", "done": False},
        ],
        "daily": [],
        "tips": [
            "Upgrade vault items AFTER crafting to optimize crest spending",
            "If vault Mythic is 1/6: upgrade Heroic counterpart to 6/6 first (converts 20 Hero -> free 2/6 Mythic)",
            "Omnitoken now available from March on Quel'danas",
        ],
    },
    4: {
        "name": "Season 1 Week 4 (Apr 7)",
        "weekly": [
            {"id": "vault", "label": "Open Vault for 272+ Myth track item", "done": False},
            {"id": "farm_m10", "label": "Farm +10s for vault slots and crests", "done": False},
            {"id": "raid_reclear", "label": "Reclear all raids", "done": False},
            {"id": "heroic_crests", "label": "Upgrade 2x items 4/6 -> 6/6 Hero 276 (80 Heroic Crests)", "done": False},
            {"id": "myth_vault", "label": "Upgrade 1/6 Mythic vault item -> 6/6 289 (80 Mythic Crests)", "done": False},
            {"id": "myth_raid", "label": "Upgrade raid drop 2/6 -> 6/6 Mythic 289 (80 Mythic Crests)", "done": False},
        ],
        "daily": [],
        "tips": [
            "Keep spending Heroic crests on 4/6 -> 6/6 upgrades each week",
        ],
    },
    5: {
        "name": "Season 1 Week 5 (Apr 14)",
        "weekly": [
            {"id": "vault", "label": "Open Vault for 272+ Myth track item", "done": False},
            {"id": "farm_m10", "label": "Farm +10s for vault slots and crests", "done": False},
            {"id": "raid_reclear", "label": "Reclear all raids", "done": False},
            {"id": "craft_second", "label": "Craft next Mythic item 5/6 285 if no unupgraded Mythic items available (80 Mythic Crests)", "done": False},
            {"id": "heroic_crests", "label": "Upgrade 2x items 4/6 -> 6/6 Hero 276 (80 Heroic Crests)", "done": False},
            {"id": "myth_upgrade", "label": "Upgrade Mythic items (vault/raid drops) toward 6/6 289", "done": False},
        ],
        "daily": [],
        "tips": [
            "Next week is your last Heroic crest week — plan final upgrades",
            "Optional: Prey Nightmare, World Boss for extra chances",
        ],
    },
    6: {
        "name": "Season 1 Week 6 — Heroic Crests Done (Apr 21)",
        "weekly": [
            {"id": "vault", "label": "Open Vault for 272+ Myth track item", "done": False},
            {"id": "farm_m12", "label": "Farm +12s for better vault slots and crests", "done": False},
            {"id": "raid_reclear", "label": "Reclear all raids", "done": False},
            {"id": "heroic_final", "label": "Final Heroic: Upgrade 1x 4/6 -> 6/6 Hero 276 (40 Heroic Crests — done with Heroic)", "done": False},
            {"id": "myth_upgrade", "label": "Upgrade Mythic items toward 6/6 289 (vault + raid drops)", "done": False},
        ],
        "daily": [],
        "tips": [
            "Last week of Heroic crest spending — after this, focus only on Mythic",
            "Move up to +12s for better vault reward quality",
        ],
    },
    7: {
        "name": "Season 1 Week 7+ (Apr 28 on)",
        "weekly": [
            {"id": "vault", "label": "Open Vault and optimize picks", "done": False},
            {"id": "farm_m12", "label": "Farm +12s for vault slots and crests", "done": False},
            {"id": "raid_reclear", "label": "Reclear all raids", "done": False},
            {"id": "upgrade_mythic", "label": "Upgrade Mythic items as obtained (prioritize 1/6 -> 6/6 at 289)", "done": False},
        ],
        "daily": [],
        "tips": [
            "Do not craft in any slot if you can get >1/6 Mythic from vault",
            "Optional: craft off-hand while keeping weapon embellishment",
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
    return {"name": "Unknown Week", "weekly": [], "daily": [], "tips": []}

def get_all_task_ids(week: int) -> List[str]:
    """
    Get all task IDs for a specific week.
    """
    tasks = get_task_definitions(week)
    ids = [t["id"] for t in tasks.get("weekly", [])]
    ids.extend(t["id"] for t in tasks.get("daily", []))
    return ids

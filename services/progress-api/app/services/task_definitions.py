"""Task definitions for weekly roster progression tracking.

Contains the full WEEKLY_TASKS dict with all week definitions (weeks -2 to 7+).
Each week has: name, weekly tasks list, daily tasks list.
Each task has: id, label, done (default False).

Based on Larias' Raider's Guide for Midnight (updated Mar 2026).
"""

import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

WEEKLY_TASKS: Dict[int, Dict[str, Any]] = {
    -2: {
        "name": "Early Access (Feb 26 – Mar 2)",
        "weekly": [
            {"id": "rested_xp", "label": "Log on to each character you plan on leveling so they start accumulating rested XP", "done": False},
            {"id": "level_warmode", "label": "Level characters warmode on to 80 — DMF opens Sunday for 10% more XP", "done": False},
            {"id": "weekly_stormalt", "label": "Complete the weekly Stormarion Assault in the Voidstorm", "done": False},
            {"id": "prey_renown", "label": "Complete 4x Prey on normal difficulty for renown", "done": False},
            {"id": "lore_hunter", "label": "Complete the Midnight Lore Hunter achievement for renown — check guide", "done": False},
            {"id": "highest_peaks", "label": "Complete the Highest Peaks achievement for renown — check guide", "done": False},
            {"id": "side_quests", "label": "Complete side quest chains for renown (can be done on alts while leveling — DMF buff does NOT give renown)", "done": False},
            {"id": "treasure_renown", "label": "Hunt down each region's treasures for free Renown — check guide", "done": False},
            {"id": "rare_renown", "label": "(Optional) Kill each rare once in each zone for renown — one-time bonus per rare, does not reset weekly", "done": False},
            {"id": "saltheril_soiree", "label": "Complete the weekly Saltheril's Soiree in Eversong Woods — grab renown quest for champion helmet if you have the renown", "done": False},
            {"id": "champion_note", "label": "NOTE: Only Singularity AND Eversong champion items available in early access — others unlock Monday after launch", "done": False},
        ],
        "daily": [],
    },
    -1: {
        "name": "Pre-Season Week 1 (Mar 3) — M0s",
        "weekly": [
            {"id": "do_not_craft", "label": "DO NOT CRAFT — save 160 Veteran crests for 2x Veteran Embellished items", "done": False},
            {"id": "alt_skip_campaign", "label": "Alt: If you don't see some quests, go to Soridormi in Silvermoon City Inn and choose 'I Stopped the Voidstorm' to skip campaign", "done": False},
            {"id": "renown_singularity", "label": "Raise The Singularity renown to rank 7 — get 1/6 Champion trinket from renown vendor quest", "done": False},
            {"id": "renown_harati", "label": "Raise Hara'ti renown to rank 8 — get 1/6 Champion belt from renown vendor quest", "done": False},
            {"id": "renown_silvermoon", "label": "Raise Silvermoon renown to rank 9 — get 1/6 Champion helm from renown vendor quest", "done": False},
            {"id": "renown_amani", "label": "Raise Amani Tribe renown to rank 9 — get 1/6 Champion necklace from renown vendor quest", "done": False},
            {"id": "weekly_dungeon_quest", "label": "Complete weekly dungeon quest from Halduron Brightwing for 1000 renown", "done": False},
            {"id": "weekly_world_event", "label": "Complete weekly world event quest for pinnacle cache from Lady Liadrin", "done": False},
            {"id": "weekly_world_tour_quest", "label": "Complete weekly world tour quest from Lorthremar for spark by doing the events below", "done": False},
            {"id": "saltheril_soiree", "label": "Complete the weekly Saltheril's Soiree in Eversong Woods", "done": False},
            {"id": "abundance_event", "label": "Complete the weekly Abundance Event in Zul'aman", "done": False},
            {"id": "legends_haranir", "label": "Complete the weekly Legends of the Haranir event in Harandar", "done": False},
            {"id": "stormarion_assault", "label": "Complete the weekly Stormarion Assault in the Voidstorm", "done": False},
            {"id": "unlock_delves", "label": "Unlock Delves through tier 8", "done": False},
            {"id": "hard_prey_4x", "label": "Complete 4x Hard Prey — first 2 give Veteran gear, all 4 give Veteran Crests (need to cap)", "done": False},
            {"id": "hard_prey_optional", "label": "(Optional) Complete 2x more Hard Prey for Veteran crests — doing 2x optional/week caps Veteran crests by end of week 2", "done": False},
            {"id": "m0_world_tour", "label": "Complete a World Tour of M0 dungeons — rewards Veteran ilvl — do NOT upgrade yet", "done": False},
            {"id": "rare_renown", "label": "(Optional) Kill each rare once in each zone for renown — one-time bonus per rare, does not reset", "done": False},
            {"id": "treasure_renown", "label": "If not done: hunt down treasures, Lore Hunter, and High Peaks for free Renown — check guide", "done": False},
            {"id": "hotfix_note", "label": "NOTE (Mar 5 hotfix): Completing 237 ilvl in every slot unlocks achievement that reduces crest upgrade cost by 50% account-wide — check guide", "done": False},
        ],
        "daily": [],
    },
    0: {
        "name": "Pre-Season Week 2 (Mar 10) — M0s",
        "weekly": [
            {"id": "do_not_craft", "label": "DO NOT CRAFT — save 160 Veteran crests for 2x Veteran Embellished items", "done": False},
            {"id": "renown_continue", "label": "If not completed, continue raising renown for Champion pieces", "done": False},
            {"id": "weekly_dungeon_quest", "label": "Complete weekly dungeon quest from Halduron Brightwing for 1000 renown", "done": False},
            {"id": "weekly_world_event", "label": "Complete weekly world event quest for pinnacle cache and spark from Lady Liadrin", "done": False},
            {"id": "saltheril_soiree", "label": "(Optional) Complete the weekly Saltheril's Soiree in Eversong Woods", "done": False},
            {"id": "abundance_event", "label": "(Optional) Complete the weekly Abundance Event in Zul'aman", "done": False},
            {"id": "legends_haranir", "label": "(Optional) Complete the weekly Legends of the Haranir event in Harandar", "done": False},
            {"id": "stormarion_assault", "label": "(Optional) Complete the weekly Stormarion Assault in the Voidstorm", "done": False},
            {"id": "unlock_delves", "label": "Unlock Delves through tier 8 if not done yet", "done": False},
            {"id": "hard_prey_4x", "label": "Complete 4x Hard Prey — first 2 give Veteran gear, all 4 give Veteran Crests", "done": False},
            {"id": "hard_prey_optional", "label": "(Optional) Complete 2x more Hard Prey for Veteran crests to cap by end of this week", "done": False},
            {"id": "m0_world_tour", "label": "Complete a World Tour of M0 dungeons — rewards Veteran ilvl — do NOT upgrade yet", "done": False},
            {"id": "rare_renown", "label": "(Optional) Kill each rare once in each zone for renown — one-time bonus per rare", "done": False},
            {"id": "upgrade_adventurer", "label": "If you have Adventurer pieces remaining, upgrade them freely", "done": False},
            {"id": "craft_if_raiding", "label": "If you raid Tuesday Mar 17: craft 2x 246 ilvl pieces before reset — check guide for details", "done": False},
        ],
        "daily": [],
    },
    1: {
        "name": "Season 1 Week 1 — Heroic Week (Mar 17)",
        "weekly": [
            {"id": "no_hero_myth_crests", "label": "DO NOT spend Heroic or Mythic crests — check guide for why we hold crests", "done": False},
            {"id": "lfr_tier", "label": "Do LFR for tier pieces — 4-set bonus lets catalyst charges drop from all content", "done": False},
            {"id": "weekly_world_event", "label": "Complete weekly world event quest for pinnacle cache and spark from Lady Liadrin", "done": False},
            {"id": "weekly_housing_quest", "label": "Complete weekly housing quest from Vaeli for Hero crests", "done": False},
            {"id": "pvp_quest", "label": "If available: complete PvP quest for guaranteed Hero track neck/ring — do NOT upgrade", "done": False},
            {"id": "pvp_ranking_optional", "label": "(Optional) Raise PvP ranking to 1600 for catalyst charge — same charge as 2,000 M+ rating next week", "done": False},
            {"id": "m0_tour_optional", "label": "(Optional) Complete World Tour of M0 dungeons — drops Champion ilvl — daily lockout", "done": False},
            {"id": "nightmare_prey", "label": "Complete 2x Nightmare Prey for Champion gear on each character", "done": False},
            {"id": "world_boss", "label": "Kill World Boss for 2/6 Champion 250 ilvl item", "done": False},
            {"id": "delves", "label": "Do T8+ Bountiful Delves with coffer keys (use map on T8+) — unlock T11 delves while doing this", "done": False},
            {"id": "craft_246", "label": "Before raid: craft 2x 246 ilvl pieces with 2x Embellishments on weak slots (160 Vet Crests, no Sparks required)", "done": False},
            {"id": "spend_low_crests", "label": "Before raid: spend ALL Adventurer, Veteran, and Champion crests upgrading everything — do NOT spend Heroic or Mythic", "done": False},
            {"id": "raid_clear", "label": "Clear Normal/Heroic raid", "done": False},
            {"id": "crest_tracking", "label": "Track crests: target 0/100 Heroic, 0/100 Mythic held going into raid", "done": False},
        ],
        "daily": [],
    },
    2: {
        "name": "Season 1 Week 2 — Mythic Week & M+ Opens (Mar 24)",
        "weekly": [
            {"id": "no_hero_myth_crests", "label": "DO NOT spend Heroic or Mythic crests — check guide for why we hold crests", "done": False},
            {"id": "weekly_world_event", "label": "Complete weekly world event quest for pinnacle cache and spark from Lady Liadrin", "done": False},
            {"id": "weekly_housing_quest", "label": "Complete weekly housing quest from Vaeli for Hero crests", "done": False},
            {"id": "lfr_tier", "label": "If no 4-set: do LFR for tier pieces — 4-set lets catalyst charges drop from all content", "done": False},
            {"id": "world_boss", "label": "(Optional) Kill World Boss for 2/6 Champion 250 ilvl item", "done": False},
            {"id": "nightmare_prey", "label": "(Optional) Complete 2x Nightmare Prey for Champion gear", "done": False},
            {"id": "delves_t11", "label": "Do at least 1x T11 Bountiful Delve to get Cracked Keystone Quest (20 free Hero/Myth crests)", "done": False},
            {"id": "spend_low_crests", "label": "Continue spending ALL Adventurer, Veteran, and Champion crests upgrading everything", "done": False},
            {"id": "farm_mplus", "label": "Farm +10s for 266 gear in every slot", "done": False},
            {"id": "upgrade_before_mythic", "label": "Before Mythic raid: upgrade 11x 3/6 Hero items once each (220 Heroic Crests)", "done": False},
            {"id": "myth_track_note", "label": "Mythic: if you got a Myth track item from vault/raid, skip to next week's upgrade advice for it", "done": False},
            {"id": "crest_tracking", "label": "Track crests: target 220/220 Heroic spent, 0/220 Mythic held — never hold Mythic crests", "done": False},
            {"id": "ending_ilvl", "label": "Target ending item level: 4×266, 11×269", "done": False},
        ],
        "daily": [],
    },
    3: {
        "name": "Season 1 Week 3 — Final Raid Opens (Mar 31)",
        "weekly": [
            {"id": "vault", "label": "Open Vault for 272+ Myth item — upgrade AFTER crafting", "done": False},
            {"id": "lfr_tier", "label": "If no 4-set: do LFR for tier pieces — check guide for why", "done": False},
            {"id": "farm_m10", "label": "Farm +10s for vault slots and crests", "done": False},
            {"id": "heroic_crests", "label": "Heroic: upgrade 2x of your 4/6 269 items to 6/6 276 (80 Heroic Crests)", "done": False},
            {"id": "myth_upgrade", "label": "Mythic: if vault item was 1/6, upgrade its heroic counterpart to 6/6 heroic first (20 Heroic Crests), then upgrade 1/6 272 Myth to 6/6 289 (80 Myth Crests)", "done": False},
            {"id": "myth_second_item", "label": "Mythic: if you got a 2nd Myth track item, skip to next week's upgrade advice for it", "done": False},
            {"id": "crest_tracking", "label": "Track crests: target 320/320 Heroic spent, 160/320 Mythic spent — never hold Mythic crests", "done": False},
            {"id": "ending_ilvl", "label": "Target ending item level: 3×266, 8×269, 2×276h, 1×285 (crafted), 1×289", "done": False},
        ],
        "daily": [],
    },
    4: {
        "name": "Season 1 Week 4 (Apr 7)",
        "weekly": [
            {"id": "vault", "label": "Open Vault for 272+ Myth item", "done": False},
            {"id": "farm_m10", "label": "Farm +10s for vault slots and crests", "done": False},
            {"id": "heroic_crests", "label": "Heroic: upgrade 2x of your 4/6 269 items to 6/6 276 (80 Heroic Crests)", "done": False},
            {"id": "myth_vault", "label": "Mythic: if vault item was 1/6, upgrade heroic counterpart to 6/6 first (20 Heroic Crests), then upgrade 1/6 272 Myth to 6/6 289 (80 Myth Crests)", "done": False},
            {"id": "myth_raid", "label": "Mythic: upgrade raid drop from 2/6 275 Myth to 6/6 289 (80 Myth Crests)", "done": False},
            {"id": "crest_tracking", "label": "Track crests: target 420/400 Heroic spent, 320/420 Mythic spent — never hold Mythic crests", "done": False},
            {"id": "ending_ilvl", "label": "Target ending item level: 2×266, 5×269, 4×276h, 1×285 (crafted), 3×289", "done": False},
        ],
        "daily": [],
    },
    5: {
        "name": "Season 1 Week 5 (Apr 14)",
        "weekly": [
            {"id": "vault", "label": "Open Vault for 272+ Myth item", "done": False},
            {"id": "farm_m10", "label": "Farm +10s for vault slots and crests", "done": False},
            {"id": "craft_next", "label": "Craft next item — check guide for which slot to prioritize", "done": False},
            {"id": "heroic_crests", "label": "Heroic: upgrade 2x of your 4/6 269 items to 6/6 276 (80 Heroic Crests)", "done": False},
            {"id": "myth_vault", "label": "Mythic: if vault item was 1/6, upgrade heroic counterpart to 6/6 first (20 Heroic Crests), then upgrade 1/6 272 Myth to 6/6 289 (80 Myth Crests)", "done": False},
            {"id": "crest_tracking", "label": "Track crests: target 520/520 Heroic spent, 480/520 Mythic spent — never hold Mythic crests", "done": False},
            {"id": "ending_ilvl", "label": "Target ending item level: 1×266, 2×269, 6×276h, 2×285 (crafted), 4×289", "done": False},
        ],
        "daily": [],
    },
    6: {
        "name": "Season 1 Week 6 — Done with Heroic Crests (Apr 21)",
        "weekly": [
            {"id": "vault", "label": "Open Vault for 272+ Myth item", "done": False},
            {"id": "farm_m10", "label": "Farm +10s for vault slots and crests", "done": False},
            {"id": "heroic_final", "label": "Heroic: upgrade your last 4/6 269 item to 6/6 276 (40 Heroic Crests) — DONE with Heroic crests after this", "done": False},
            {"id": "myth_vault", "label": "Mythic: upgrade vault/raid Myth items to 6/6 289 (80 Myth Crests each)", "done": False},
        ],
        "daily": [],
    },
    7: {
        "name": "Season 1 Week 7+ (Apr 28+)",
        "weekly": [
            {"id": "vault", "label": "Open Vault — do NOT craft if you can get a vault item higher than 1/6 Myth", "done": False},
            {"id": "upgrade_mythic", "label": "Upgrade Mythic items as you get them — prefer jumping to 6/6 289", "done": False},
            {"id": "plan_oh", "label": "Plan for possible 1H + crafted Off-Hand swap if applicable", "done": False},
            {"id": "farm_m10", "label": "Farm +10s or higher for vault slots and crests", "done": False},
        ],
        "daily": [],
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

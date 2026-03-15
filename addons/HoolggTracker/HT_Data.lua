-- HT_Data.lua
-- ALL season-specific IDs + task definitions.
-- Update IDs in this file as they are confirmed.
-- IDs of 0 are "pending" — addon handles them safely.

HT = HT or {}

-- ============================================================
-- Season anchors
-- week=-2 = Tuesday Feb 24 2026 15:00 UTC (reset before Early Access)
-- week=1  = Tuesday Mar 17 2026 15:00 UTC (S1 launch reset)
-- ============================================================
HT.SEASON_ANCHORS = {
  { week = -2, timestamp = 1771945200 },  -- Feb 24 2026 15:00 UTC
  { week = 1,  timestamp = 1773759600 },  -- Mar 17 2026 15:00 UTC
}
HT.WEEK_SECONDS = 604800

-- ============================================================
-- Crest currency IDs — update with /ht scan after login
-- ============================================================
-- Primary crest currency IDs (totalEarned + balance)
HT.CREST_IDS = {
  adventurer = 3383,
  veteran    = 3341,
  champion   = 3343,
  hero       = 3345,
  myth       = 3347,
}
HT.CREST_WEEKLY_CAP = 100

HT.CREST_ORDER  = { "adventurer", "veteran", "champion", "hero", "myth" }
HT.CREST_LABELS = {
  adventurer = "Adventurer Dawncrest",
  veteran    = "Veteran Dawncrest",
  champion   = "Champion Dawncrest",
  hero       = "Hero Dawncrest",
  myth       = "Myth Dawncrest",
}

-- ============================================================
-- Midnight S1 raid + instance IDs — 0 until confirmed
-- Use /ht scan to find instance IDs from your lockout list.
-- WoW difficulty IDs: LFR=17, Normal=14, Heroic=15, Mythic=16
-- ============================================================
HT.RAID_INSTANCE_IDS = {
  midnight_s1 = 0,  -- First Midnight raid instance ID
}
HT.DIFFICULTY = { lfr = 17, normal = 14, heroic = 15, mythic = 16 }

-- ============================================================
-- Major faction IDs — 0 until confirmed
-- Use /ht scan to list faction IDs and renown levels.
-- ============================================================
HT.MAJOR_FACTION_IDS = {
  voidspire  = 2699,  -- The Singularity
  harati     = 2704,  -- Hara'ti
  silvermoon = 2710,  -- Silvermoon Court
  amani      = 2696,  -- Amani Tribe
}

-- ============================================================
-- Vault ilvl tables (from vault_calculator.py)
-- ============================================================
HT.VAULT_RAID_ILVL = { [1]=239, [2]=252, [3]=265, [4]=278 }
HT.RAID_SLOT_THRESHOLDS  = { 2, 4, 6 }

HT.VAULT_MPLUS_ILVL = {
  [2]=249,[3]=252,[4]=255,[5]=258,[6]=262,
  [7]=265,[8]=268,[9]=272,[10]=275,[11]=278,[12]=278,
}
HT.MPLUS_SLOT_THRESHOLDS = { 1, 4, 8 }

HT.VAULT_DELVE_ILVL = {
  [1]=236,[2]=236,[3]=239,[4]=242,[5]=246,[6]=249,
  [7]=252,[8]=255,[9]=258,[10]=262,[11]=265,
}

-- ============================================================
-- Profession weekly quest IDs — all 0 until confirmed
-- ============================================================
HT.PROFESSION_WEEKLY_QUEST_IDS = {
  alchemy=0, blacksmithing=0, enchanting=0, engineering=0,
  herbalism=0, inscription=0, jewelcrafting=0, leatherworking=0,
  mining=0, skinning=0, tailoring=0,
}
HT.PROFESSION_PATRON_QUEST_IDS = {
  alchemy=0, blacksmithing=0, enchanting=0, engineering=0,
  inscription=0, jewelcrafting=0, leatherworking=0, tailoring=0,
}

-- ============================================================
-- Task definitions
-- autoDetect values:
--   "level_cap"            → UnitLevel >= GetMaxPlayerLevel()
--   "renown_KEY:N"         → HT.MAJOR_FACTION_IDS[KEY] renown >= N
--   "raid_normal/heroic/mythic/lfr" → lockout on midnight_s1
--   "vault_raid_slot1"     → vault raid slot 1 unlocked
--   "vault_mplus_slot1"    → vault M+ slot 1 unlocked
--   "vault_world_slot1"    → vault world slot 1 unlocked
--   "questId:N"            → C_QuestLog.IsQuestFlaggedCompleted(N)
--   "mplus_any"            → any M+ completed this week
-- ============================================================
HT.TASK_DEFINITIONS = {
  [-2] = {
    name = "Early Access (Feb 26 - Mar 2)",
    weekly = {
      { id="level_chars",     label="Level character to max",                                         autoDetect="level_cap" },
      { id="dmf_xp",          label="Darkmoon Faire opens Sunday — use 10%% XP/Renown bonus" },
      { id="weekly_events",   label="Complete weekly events if available" },
      { id="level_prey",      label="Level Prey if possible" },
      { id="hold_quests_dmf", label="Minimize side quests until Sunday — stack with DMF 10%% Renown bonus" },
    },
  },
  [-1] = {
    name = "Pre-Season Week 1 (Mar 3 - M0 at reduced ilvl)",
    weekly = {
      { id="no_crests",         label="Do NOT spend any crests" },
      { id="renown_voidspire",  label="Raise Voidspire to Renown 7 (free Champion head piece)",          autoDetect="renown_voidspire:7" },
      { id="renown_harati",     label="Raise Hara'ti to Renown 8 (free Champion waist piece)",           autoDetect="renown_harati:8" },
      { id="renown_silvermoon", label="Raise Silvermoon & Amani to Renown 9 (free Champion necklace + trinket)", autoDetect="renown_silvermoon:9" },
      { id="weekly_events",     label="Complete weekly events" },
      { id="unlock_delves",     label="Unlock Delves to Tier 8+ (Tier 11 if available)" },
      { id="prey",              label="Do Prey if it gives useful rewards (Champion pieces)" },
      { id="world_quests",      label="Do any world quests that give gear upgrades" },
      { id="m0_tour",           label="Complete M0 World Tour — drops 3/6 Veteran 240 (do NOT upgrade)" },
    },
  },
  [0] = {
    name = "Pre-Season Week 2 (Mar 10 - M0 at reduced ilvl)",
    weekly = {
      { id="no_crests",      label="Do NOT spend any crests" },
      { id="unlock_delves",  label="Unlock Delves to Tier 8+ (Tier 11 if available)" },
      { id="prey",           label="Do Prey if it gives useful rewards (Champion pieces)" },
      { id="world_quests",   label="Do any world quests that give gear upgrades" },
      { id="weekly_events",  label="Complete weekly events" },
      { id="m0_tour",        label="Complete M0 World Tour — drops 3/6 Veteran 240 (do NOT upgrade)" },
      { id="craft_246",      label="Craft 246 pieces in 3-5 slots (60x Veteran each) — only if raiding Tue Mar 17" },
    },
  },
  [1] = {
    name = "S1 Week 1 — Heroic Week, no M+ (Mar 17)",
    weekly = {
      { id="no_hero_myth",     label="Do NOT spend Hero or Myth Dawncrest" },
      { id="lfr_tier",         label="Do LFR for tier pieces (unlocks catalyst charges at 4-set)",  autoDetect="raid_lfr" },
      { id="m0_tour",          label="Complete M0 World Tour — now drops 1/6 Champion 246" },
      { id="world_boss",       label="Kill world boss for 2/6 Champion 250 item",                   autoDetect="questId:0" },
      { id="prey",             label="Do Prey if it gives useful rewards" },
      { id="pvp_quest",        label="Do PvP quest for guaranteed Hero track neck/ring (don't upgrade)", autoDetect="questId:0" },
      { id="delves",           label="Do bountiful Delves with coffer keys (use map)",               autoDetect="vault_world_slot1" },
      { id="craft_246",        label="Craft 246 pieces in 3-5 slots (60x Veteran Dawncrest each)" },
      { id="craft_233",        label="Craft remaining empty slots at 233 (60x Adventurer Dawncrest each)" },
      { id="spend_low_crests", label="Spend Adventurer/Veteran Dawncrest on temp upgrades (prefer trinkets)" },
      { id="normal_clear",     label="Clear Normal raid",                                            autoDetect="raid_normal" },
      { id="heroic_clear",     label="Clear Heroic raid",                                            autoDetect="raid_heroic" },
    },
  },
  [2] = {
    name = "S1 Week 2 — Mythic + M+ opens (Mar 24)",
    weekly = {
      { id="no_hero_myth",     label="Do NOT spend Hero or Myth Dawncrest" },
      { id="lfr_tier",         label="Do LFR for tier pieces",                                       autoDetect="raid_lfr" },
      { id="world_boss",       label="Kill world boss for 2/6 Champion 250 item",                   autoDetect="questId:0" },
      { id="prey",             label="Do Prey if useful rewards" },
      { id="delves",           label="Bountiful Delves with coffer keys",                            autoDetect="vault_world_slot1" },
      { id="spend_low_crests", label="Spend Adventurer/Veteran Dawncrest on temp upgrades (prefer trinkets)" },
      { id="farm_mplus",       label="Farm +10s for 3/6h 266 gear, vault slots, and crests",        autoDetect="mplus_any" },
      { id="normal_clear",     label="Full clear Normal raid",                                       autoDetect="raid_normal" },
      { id="heroic_clear",     label="Full clear Heroic raid",                                       autoDetect="raid_heroic" },
      { id="mythic_prog",      label="Begin Mythic progression",                                     autoDetect="raid_mythic" },
    },
  },
  [3] = {
    name = "S1 Week 3 — Final Raid opens (Mar 31)",
    weekly = {
      { id="vault_open",   label="Open vault for 272+ Myth item — upgrade AFTER crafting",         autoDetect="vault_raid_slot1" },
      { id="craft_weapon", label="Craft 2H Mythic weapon at 5/6 285 (60 Myth Dawncrest)" },
      { id="lfr_tier",     label="Do LFR for tier if no 4-set yet",                                autoDetect="raid_lfr" },
      { id="farm_m12",     label="Farm +12s for vault slots and crests",                            autoDetect="mplus_any" },
      { id="raid_reclear", label="Reclear all raids (Normal/Heroic/Mythic)",                        autoDetect="raid_heroic" },
      { id="spend_heroic", label="After reclear: spend 300 Hero Dawncrest — upgrade 10 items 3/6->4/6" },
      { id="upgrade_myth", label="Upgrade 1/6 272 Myth vault item to 4/6 282 (60 Myth Dawncrest)" },
    },
  },
  [4] = {
    name = "S1 Week 4 — Progression (Apr 7)",
    weekly = {
      { id="vault",         label="Open vault for 272+ Myth item",                                  autoDetect="vault_raid_slot1" },
      { id="farm_m12",      label="Farm +12s for vault slots and crests",                            autoDetect="mplus_any" },
      { id="heroic_crests", label="Heroic: upgrade 2x 3/6->4/6 (60c) + 1x 4/6->5/6 (40c) = 100 crests" },
      { id="myth_upgrades", label="Myth: upgrade 1/6->4/6 (60c) + 2/6->4/6 (50c) + best 4/6->5/6 (50c) = 160 crests" },
    },
  },
  [5] = {
    name = "S1 Week 5 — Progression (Apr 14)",
    weekly = {
      { id="vault",         label="Open vault for 272+ Myth item",                                  autoDetect="vault_raid_slot1" },
      { id="farm_m12",      label="Farm +12s for vault slots and crests",                            autoDetect="mplus_any" },
      { id="craft_second",  label="Craft 2nd item at 5/6 285 Mythic (60 Myth Dawncrest)" },
      { id="heroic_crests", label="Heroic: upgrade 2x 4/6->5/6 (80 crests)" },
      { id="myth_upgrade",  label="Myth: upgrade 1/6 272 vault item to 4/6 282 (60 crests)" },
    },
  },
  [6] = {
    name = "S1 Week 6 — Progression (Apr 21)",
    weekly = {
      { id="vault",         label="Open vault for 272+ Myth item",                                  autoDetect="vault_raid_slot1" },
      { id="farm_m12",      label="Farm +12s for vault slots and crests",                            autoDetect="mplus_any" },
      { id="heroic_crests", label="Heroic: upgrade 3x 4/6->5/6 (120 crests)" },
      { id="myth_upgrade",  label="Myth: upgrade 1/6->4/6 (30c) + 3/6->4/6 (30c) = 60 crests" },
    },
  },
  [7] = {
    name = "S1 Week 7 — Progression (Apr 28)",
    weekly = {
      { id="vault",         label="Open vault for 272+ Myth item",                                  autoDetect="vault_raid_slot1" },
      { id="farm_m12",      label="Farm +12s for vault slots and crests",                            autoDetect="mplus_any" },
      { id="craft_third",   label="Craft 3rd item at 5/6 285 Mythic (60 Myth Dawncrest)" },
      { id="heroic_crests", label="Heroic: upgrade last 2x 4/6->5/6 (80 crests)" },
      { id="myth_upgrade",  label="Myth: upgrade 1/6->3/6 279 (30 crests)" },
    },
  },
  [8] = {
    name = "S1 Week 8 — Done with Hero Dawncrest (May 5)",
    weekly = {
      { id="vault",         label="Open vault for 272+ Myth item",                                  autoDetect="vault_raid_slot1" },
      { id="farm_m12",      label="Farm +12s for vault slots and crests",                            autoDetect="mplus_any" },
      { id="heroic_final",  label="Heroic: upgrade last 2x 5/6->6/6 (100 Hero Dawncrest) — DONE with Hero Dawncrest" },
      { id="myth_upgrades", label="Myth: 1/6->2/6 (10c) + 3x 2/6->3/6 (60c) + 1x 3/6->4/6 (30c) = 100 crests" },
    },
  },
  [9] = {
    name = "S1 Week 9+ — Final Optimization (May 12+)",
    weekly = {
      { id="vault",           label="Open vault and optimize picks",                                 autoDetect="vault_raid_slot1" },
      { id="farm_m12",        label="Farm +12s and cap crests",                                      autoDetect="mplus_any" },
      { id="craft_remaining", label="Craft remaining slots at 5/6 Mythic (60 crests each)" },
      { id="push_282",        label="Get every item to at least 4/6 282 Mythic" },
      { id="upgrade_289",     label="Start upgrading to 5/6 285 then 6/6 289" },
    },
  },
}

-- ============================================================
-- Midnight profession skill line IDs (expansion-specific)
-- Used with C_ProfSpecs.GetCurrencyInfoForSkillLine() and C_Traits.GetNodeInfo()
-- ============================================================
HT.MIDNIGHT_PROFESSION_IDS = {
  alchemy        = 2906,
  blacksmithing  = 2907,
  enchanting     = 2909,
  engineering    = 2910,
  herbalism      = 2912,
  inscription    = 2913,
  jewelcrafting  = 2914,
  leatherworking = 2915,
  mining         = 2916,
  skinning       = 2917,
  tailoring      = 2918,
}

-- ============================================================
-- KP source quest IDs per profession (from MKPT Init.lua — Midnight data)
-- unique = one-time permanent sources (books, world treasures)
-- weekly = weekly repeatable sources (service quests, weekly treasures, DMF)
-- ============================================================
HT.PROFESSION_KP_SOURCES = {
  alchemy = {
    unique = {89115,89117,89111,89114,89116,89113,89118,89112,93794},
    weekly = {93528,93529,93690,29506},
  },
  blacksmithing = {
    unique = {89177,89180,89183,89184,89178,89179,89182,89181,93795},
    weekly = {93530,93531,93691,29508},
  },
  enchanting = {
    unique = {89103,89107,89101,89106,89100,89104,89105,89102,92374,92186},
    weekly = {95048,95049,95050,95051,95052,95053,93532,93533,93699,93698,93697,29510},
  },
  engineering = {
    unique = {89133,89139,89135,89140,89138,89136,89137,89134,93796},
    weekly = {93534,93535,93692,29511},
  },
  herbalism = {
    unique = {89160,89158,89161,89157,89162,89159,89155,89156,93411,92174},
    weekly = {81425,81426,81427,81428,81429,81430,93700,93701,93702,93703,93704,29514},
  },
  inscription = {
    unique = {89073,89074,89069,89072,89068,89070,89071,89067,93412},
    weekly = {93536,93537,93693,29515},
  },
  jewelcrafting = {
    unique = {89122,89124,89127,89125,89129,89123,89126,89128,93222},
    weekly = {93538,93539,93694,29516},
  },
  leatherworking = {
    unique = {89096,89089,89091,89092,89094,89095,89090,89093,92371},
    weekly = {93540,93541,93695,29517},
  },
  mining = {
    unique = {89147,89145,89149,89151,89150,89144,89146,89148,92372,92187},
    weekly = {88673,88674,88675,88676,88677,88678,93705,93706,93707,93708,93709,29518},
  },
  skinning = {
    unique = {89171,89173,89170,89172,89167,89166,89168,89169,92373,92188},
    weekly = {88534,88549,88536,88537,88530,88529,93710,93711,93712,93713,93714,29519},
  },
  tailoring = {
    unique = {89079,89084,89080,89085,89078,89081,89082,89083,93201},
    weekly = {93542,93543,93696,29520},
  },
}

setmetatable(HT.TASK_DEFINITIONS, {
  __index = function(t, k)
    if type(k) == "number" and k >= 10 then return rawget(t, 9) end
    if type(k) == "number" and k < -2  then return rawget(t, -2) end
  end
})

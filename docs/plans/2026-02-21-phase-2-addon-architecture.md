# Phase 2 Architecture: Fully Automated Roster Sync

## The Ultimate Goal
Eliminate all manual data entry on hool.gg. Players simply play the game, and their progression (vault slots, raid kills, crests, professions, and talents) automatically updates on their personal web dashboard in real-time.

## System Architecture
This requires a 3-part ecosystem:
1. **The In-Game Addon (Lua):** Hooks into WoW events to monitor player actions, updates an in-game UI frame, and saves state to `SavedVariables/HoolggTracker.lua` on UI reload or logout.
2. **The Desktop Companion App (Go / Rust / Tauri):** A lightweight background process running on the user's PC. It uses file-system watchers to detect changes to the `SavedVariables` file and immediately POSTs the JSON payload to our `progress-api`.
3. **The Web Platform (Next.js / Python):** Receives the webhooks, updates the Postgres database, and reflects the changes instantly on the user's dashboard.

---

## Technical Blueprint: WoW API Hooks

To automate the granular tasks from Larias' Midnight guide, we will utilize the following World of Warcraft API hooks:

### 1. Weekly Quests & Events
* **Goal:** Track weekly caches, PvP quests, and event completions.
* **API Hooks:** `QUEST_TURNED_IN`
* **Implementation:** Maintain a dictionary of hidden `questID`s for Season 1 weekly events. Call `C_QuestLog.IsQuestFlaggedCompleted(questID)` to verify completion and auto-check the in-game task list.

### 2. Raid Kills & World Bosses
* **Goal:** Track boss defeats per difficulty for Vault slots.
* **API Hooks:** `ENCOUNTER_END`, `GetNumSavedInstances()`, `GetSavedInstanceInfo(index)`
* **Implementation:** Listen for encounter ends to instantly trigger an update, or parse the instance save manager to reconstruct the week's lockouts (LFR/Normal/Heroic/Mythic).

### 3. Mythic+ & Delves
* **Goal:** Track M+ vault slots and Bountiful Delve completions.
* **API Hooks:** `CHALLENGE_MODE_COMPLETED`, `C_MythicPlus.GetRunHistory(false, true)`
* **Implementation:** 
  * M+: Directly pull the official run history array.
  * Delves: Monitor Bountiful Coffer Key currency (`C_CurrencyInfo.GetCurrencyInfo`) and trigger on `ENCOUNTER_END` inside Delve map IDs.

### 4. Currencies (Crests & Sparks)
* **Goal:** Track crest caps and ensure players aren't hoarding or mis-spending.
* **API Hooks:** `CHAT_MSG_CURRENCY`, `C_CurrencyInfo.GetCurrencyInfo(currencyID)`
* **Implementation:** Map the currency IDs for Weathered, Carved, Runed, and Gilded crests. Track total earned vs. season maximum.

### 5. Granular Talent Builds
* **Goal:** Automatically sync the player's active talent tree.
* **API Hooks:** `TRAIT_CONFIG_UPDATED`, `C_Traits.GenerateImportString()`
* **Implementation:** When talents change, grab the active loadout name and export the official Base64 import string (e.g., `BwE...`). The web app can render this string visually.

### 6. Professions (Knowledge Points & Concentration)
* **Goal:** Track unspent KP, specialization paths, and Concentration limits.
* **API Hooks:** `TRADE_SKILL_DATA_UPDATED`, `C_ProfSpecs.GetStateForSkillLine()`, `C_CurrencyInfo.GetCurrencyInfo()` (for Concentration)
* **Implementation:** Scrape the exact state of the profession tree to warn users if they are sitting on unspent points or capping out on Concentration.

---

## Development Roadmap for Phase 2
1. **Addon Scaffold:** Create the basic `HoolggTracker` addon folder structure (`.toc`, `.lua`, `SavedVariables` registration).
2. **Event Dispatcher:** Write the core event listener loop in Lua to catch the hooks mentioned above.
3. **Companion App MVP:** Build a simple Go/Rust CLI script that `tail -f` watches the `HoolggTracker.lua` file and prints changes to the console.
4. **API Integration:** Connect the Companion App to the `progress-api` `/users/me/characters/sync-addon` endpoint (to be built).
5. **In-Game UI:** Build the draggable checklist frame to provide visual feedback to the player.
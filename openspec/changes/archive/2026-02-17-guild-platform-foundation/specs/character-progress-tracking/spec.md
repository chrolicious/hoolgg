# Character Progress Tracking Specification

Migrate midnight_tracker functionality. Track character progression, weekly iLvl targets, gear priorities, expansion roadmaps. Guild-scoped (see your guild members' progress). Compare guild performance to public WarcraftLogs data.

## ADDED Requirements

### Requirement: Character Progression Tracking
The system SHALL track character gear progression (iLvl) and compare against weekly targets.

#### Scenario: User views their character progress
- **WHEN** user navigates to `/guilds/{guild_id}/progress`
- **THEN** system displays:
  - Their characters in this guild
  - Current iLvl
  - Weekly target iLvl
  - Progress bar (current vs target)
  - Weeks until target (e.g., "Week 5 of 12")

#### Scenario: Character progression is fetched from Blizzard
- **WHEN** user views progress page
- **THEN** system queries Blizzard API for character gear details
- **AND** calculates current iLvl from equipped items
- **AND** compares to weekly target (e.g., week 1 = 215, week 5 = 265)
- **AND** displays progress

#### Scenario: User can see multi-alt progress
- **WHEN** user has alts in same guild
- **THEN** system shows all alts with their progress
- **AND** user can toggle which alts to view
- **AND** alts in other guilds are not shown (guild-scoped)

---

### Requirement: Weekly iLvl Targets
The system SHALL display weekly iLvl targets for the current expansion.

#### Scenario: Targets are expansion-specific
- **WHEN** expansion changes (e.g., 12.0 → 13.0)
- **THEN** system admin updates target table:
  ```
  week | ilvl_target
  0    | 215  (pre-season)
  1-2  | 235
  3-4  | 250
  5-8  | 265
  9-12 | 280
  ```

#### Scenario: User sees their progress against target
- **WHEN** current week is 5
- **AND** target is 265
- **AND** user's iLvl is 260
- **THEN** system displays: "⚠️ 5 iLvl behind. Target: 265, Current: 260"

#### Scenario: User ahead of target sees encouragement
- **WHEN** user's iLvl exceeds target
- **THEN** system displays: "✅ Ahead of schedule! Target: 265, Current: 285"

---

### Requirement: Gear Priority Recommendations
The system SHALL suggest which items to prioritize gearing.

#### Scenario: System identifies lowest iLvl slots
- **WHEN** user views their character
- **THEN** system analyzes equipped gear and slots
- **AND** identifies slots with lowest iLvl
- **AND** displays priority list:
  1. Chest (262)
  2. Legs (259)
  3. Gloves (262)

#### Scenario: User can mark slots as done
- **WHEN** user upgrades an item
- **AND** navigates to progress page
- **THEN** system fetches latest gear from Blizzard
- **AND** priority list updates automatically

---

### Requirement: Guild Progress Overview
The system SHALL display all guild members' progress in one view.

#### Scenario: GM views guild progress
- **WHEN** GM navigates to `/guilds/{guild_id}/progress`
- **AND** has permission to view guild progress
- **THEN** system displays table:
  - Character Name | Class | iLvl | Target | Status
  - [Character A] | Warrior | 265 | 265 | ✅ On Track
  - [Character B] | Priest | 250 | 265 | ⚠️ Behind

#### Scenario: Sorting and filtering
- **WHEN** GM clicks "iLvl" column header
- **THEN** system sorts by iLvl (ascending/descending)
- **AND** GM can filter by:
  - Class
  - Role (Tank, Healer, DPS)
  - Status (On Track, Behind, Ahead)

#### Scenario: Only characters in guild are shown
- **WHEN** user has alts in other guilds
- **THEN** this guild's progress view only shows characters in this guild
- **AND** alts in other guilds are not visible

---

### Requirement: Weekly Guidance Messages
The system SHALL display weekly guidance for raid preparation.

#### Scenario: GM writes weekly guidance
- **WHEN** GM navigates to Progress → Weekly Message
- **THEN** system shows text editor
- **AND** GM writes: "Focus on gearing your DPS. Mythic+ runs this week!"
- **AND** clicks Save

#### Scenario: All guild members see guidance
- **WHEN** guild members log in to progress tool
- **THEN** system displays GM's guidance prominently:
  "📝 **GM Message**: Focus on gearing your DPS. Mythic+ runs this week!"

#### Scenario: Guidance updates are timestamped
- **WHEN** GM updates message
- **THEN** system displays: "Last updated: Tuesday 2:45 PM"
- **AND** members know when message was written

---

### Requirement: Expansion Roadmap
The system SHALL display high-level progression path for the expansion.

#### Scenario: Roadmap shows milestones
- **WHEN** user views `/guilds/{guild_id}/progress/roadmap`
- **THEN** system displays:
  ```
  Expansion 12.0 Roadmap
  Week 1-2:   Mythic+ farm (235 ilvl) → Raid Tier 1 (235)
  Week 3-4:   Raid Tier 2 (250 ilvl)
  Week 5-8:   Mythic Raid (265 ilvl)
  Week 9-12:  Mythic+ and Mythic progression (280 ilvl)
  ```

#### Scenario: Roadmap is configurable by GM
- **WHEN** GM navigates to Settings → Expansion Roadmap
- **THEN** system allows editing milestones
- **AND** GM can customize dates and targets per guild

---

### Requirement: Public WarcraftLogs Comparison
The system SHALL allow comparing guild performance to public WCL data.

#### Scenario: Guild can compare to realm rankings
- **WHEN** user clicks "Compare to Realm"
- **THEN** system queries WarcraftLogs public API
- **AND** fetches top guilds on user's realm
- **AND** displays comparison:
  ```
  Your Guild: 75th Percentile
  Realm Average: 60th Percentile
  Top Guild: 95th Percentile
  ```

#### Scenario: Performance metrics shown
- **WHEN** WCL data is fetched
- **THEN** system displays:
  - Average DPS of your raiders
  - Damage taken per healer
  - Healing per healer
  - Uptime of buffs
- **AND** compared to realm/region averages

#### Scenario: Only public data is shown
- **WHEN** comparison is displayed
- **THEN** system only uses publicly available WCL data
- **AND** does NOT access private guild logs
- **AND** does NOT compare private guild data to other guilds

---

### Requirement: Character Data Freshness
Character gear data SHALL be fetched on-demand and cached appropriately.

#### Scenario: Data is fetched on page load
- **WHEN** user navigates to progress page
- **THEN** system queries Blizzard API for gear (if cache is stale)
- **AND** displays loading state: "Fetching latest gear..."
- **AND** once data arrives, displays progress

#### Scenario: Cache expires and data refreshes
- **WHEN** user views progress page
- **AND** cache is older than 1 hour
- **THEN** system fetches fresh data from Blizzard
- **AND** updates display
- **AND** user may not notice (if fast), or sees brief loading indicator

#### Scenario: Blizzard API is slow/down
- **WHEN** Blizzard API is slow
- **THEN** system uses cached data (if available)
- **AND** displays: "Data may be slightly outdated"
- **AND** user is not blocked

---

### Requirement: Export Progress Report
Users SHALL be able to export their progress as a report (PDF or CSV, optional).

#### Scenario: User exports progress
- **WHEN** user clicks "Export as PDF"
- **THEN** system generates report with:
  - Character name, realm, guild
  - Current iLvl and target
  - Gear breakdown
  - Weekly guidance (if set)
- **AND** user downloads PDF

#### Scenario: Export includes guild overview
- **WHEN** GM exports guild progress
- **THEN** report includes all guild members
- **AND** sorted by iLvl
- **AND** color-coded (On Track = green, Behind = red)

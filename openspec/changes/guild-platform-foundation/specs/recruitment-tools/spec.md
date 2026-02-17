# Recruitment Tools Specification

Scan multiple sources (Discord, Raider.io, WoW Progress), filter by role/class, rank candidates. Guild-scoped (post recruits to your guild).

## ADDED Requirements

### Requirement: Multi-Source Recruitment Scanning
The system SHALL scan multiple recruitment sources to find potential candidates.

#### Scenario: User initiates recruitment scan
- **WHEN** Officer navigates to `/guilds/{guild_id}/recruitment`
- **AND** clicks "Search Candidates"
- **THEN** system shows search form with filters:
  - Role (Tank, Healer, DPS)
  - Class (Warrior, Priest, etc.)
  - Min iLvl
  - Experience level (Mythic+, Casual, etc.)
  - Region (US, EU, etc.)

#### Scenario: System scans multiple sources
- **WHEN** Officer clicks "Search"
- **THEN** system queries:
  - Raider.io (player rankings)
  - WoW Progress (raid progression)
  - Discord recruitment channels (if configured)
- **AND** aggregates results in single list
- **AND** displays: Candidate Name | Class/Role | iLvl | Source | Raid Prog

#### Scenario: Results are ranked by relevance
- **WHEN** scan completes
- **THEN** system sorts by:
  1. Exact role/class match
  2. iLvl (highest first)
  3. Raid progression level
- **AND** displays best matches first

---

### Requirement: Candidate Rating and Notes
Officers SHALL be able to rate and add notes to candidates.

#### Scenario: Officer rates a candidate
- **WHEN** Officer views candidate details
- **THEN** system shows:
  - Candidate profile (Raider.io or WoW Progress)
  - Rating (1-5 stars)
  - Notes field (Officer can write: "Good DPS, plays warrior alts")
- **AND** Officer clicks "Save"

#### Scenario: Rating is saved per guild
- **WHEN** Officer rates a candidate in Guild A
- **THEN** rating is stored in guild A's recruitment data
- **AND** same candidate in Guild B has separate rating
- **AND** ratings are not shared between guilds (privacy)

#### Scenario: Officer can mark candidate as contacted
- **WHEN** Officer clicks "Contacted"
- **THEN** system marks candidate as "Pending response"
- **AND** timestamp is recorded
- **AND** candidate appears in "Pending" section of recruitment list

---

### Requirement: Candidate Management
Officers SHALL be able to organize candidates into categories.

#### Scenario: Officer creates recruitment category
- **WHEN** Officer navigates to Recruitment → Settings
- **THEN** system shows categories: Pending, Interested, Rejected, Hired
- **AND** Officer can create custom categories: "Top Picks", "Backup Options"

#### Scenario: Officer moves candidate between categories
- **WHEN** Officer clicks "Move to..."
- **THEN** system shows dropdown with all categories
- **AND** Officer selects "Interested"
- **THEN** candidate moves to Interested section

#### Scenario: Categories help track recruitment pipeline
- **WHEN** Officer views Recruitment
- **THEN** system shows summary:
  - Pending (3 candidates, awaiting response)
  - Interested (5 candidates)
  - Top Picks (2 candidates)
  - Rejected (8 candidates)

---

### Requirement: Candidate Comparison
Officers SHALL compare multiple candidates side-by-side.

#### Scenario: Officer selects multiple candidates for comparison
- **WHEN** Officer checks checkboxes for Candidate A, B, C
- **AND** clicks "Compare"
- **THEN** system displays comparison table:
  - Name | Class | iLvl | Raid Prog | Mythic+ Rating | Parse % | Notes
  - [Candidate A] | Warrior | 290 | 8/8 M | 90th | 85th | ...
  - [Candidate B] | Priest | 285 | 6/8 M | 88th | 92nd | ...

#### Scenario: Officer can score candidates
- **WHEN** displayed in comparison view
- **THEN** each candidate has "Score" column
- **AND** Officer can manually adjust score
- **AND** system sorts by score

---

### Requirement: Discord Integration (Optional)
System CAN scan Discord recruitment channels (if configured).

> **Note:** Discord integration is out of scope for the foundation release. These scenarios describe future functionality.

#### Scenario: Officer configures Discord channel
- **WHEN** Officer navigates to Recruitment → Settings
- **THEN** system shows "Discord Integration"
- **AND** "Connect Discord Server"
- **AND** Officer provides Discord server invite + recruitment channel name

#### Scenario: System scans Discord channel
- **WHEN** Discord is configured
- **AND** Officer runs recruitment scan
- **THEN** system queries Discord channel for recruitment posts
- **AND** parses role/class/link info
- **AND** adds Discord posters to candidate list with label "[Discord]"

#### Scenario: Discord candidates can be imported
- **WHEN** Officer finds candidate from Discord
- **AND** clicks "Get Profile"
- **THEN** system fetches Raider.io/WoW Progress if available
- **AND** displays full candidate info

---

### Requirement: Recruitment Pipeline View
Officers SHALL see their entire recruitment pipeline.

#### Scenario: Officer views recruitment dashboard
- **WHEN** Officer navigates to `/guilds/{guild_id}/recruitment`
- **THEN** system displays Kanban-style board:
  - Column 1: Pending Response (3)
  - Column 2: Interested (5)
  - Column 3: Top Candidates (2)
  - Column 4: Hired (1)
- **AND** can drag candidates between columns

#### Scenario: Candidate cards show summary
- **WHEN** viewing candidate card in Kanban
- **THEN** card displays:
  - Name
  - Class/Role
  - iLvl
  - Last contacted date
  - Officer notes (truncated)

---

### Requirement: Search Filters and Sorting
Officers SHALL be able to filter and sort candidates extensively.

#### Scenario: Officer filters by multiple criteria
- **WHEN** Officer navigates to recruitment list
- **THEN** system shows filter panel:
  - Role: [Tank] [Healer] [Melee DPS] [Ranged DPS]
  - Class: [Warrior] [Paladin] ... (checkboxes)
  - iLvl: [Min] [Max] (sliders)
  - Status: [Pending] [Interested] [Top Picks] (checkboxes)
  - Source: [Raider.io] [WoW Progress] [Discord]
- **AND** Officer selects filters
- **AND** list updates instantly

#### Scenario: Officer sorts by column
- **WHEN** Officer clicks "iLvl" column header
- **THEN** list sorts by iLvl (ascending)
- **AND** clicking again sorts descending
- **AND** third click removes sort (original order)

---

### Requirement: Candidate Communication (Optional)
System MAY track communication with candidates.

#### Scenario: Officer logs communication
- **WHEN** Officer clicks "Log Contact"
- **THEN** system shows form:
  - Date contacted: [date picker]
  - Method: Email / Discord / In-game whisper
  - Message: [text field]
  - Response received: [yes/no]
- **AND** Officer saves

#### Scenario: Communication history is visible
- **WHEN** viewing candidate profile
- **THEN** system displays timeline:
  - Mar 15: Contacted via Discord
  - Mar 16: Candidate responded "Interested"
  - Mar 18: Offered trial raid spot

---

### Requirement: Raid Composition Planning
Officers SHALL see how candidates fill guild needs.

#### Scenario: Officer views raid composition needs
- **WHEN** Officer navigates to Recruitment → Composition
- **THEN** system shows:
  - Raid slots: 20
  - Tanks needed: 2 (have 1)
  - Healers needed: 5 (have 4)
  - Melee DPS needed: 5 (have 6)
  - Ranged DPS needed: 8 (have 7)

#### Scenario: Officer can see coverage by role
- **WHEN** candidate list is displayed
- **THEN** each candidate card shows: "Would fill 1 Ranged DPS slot"
- **AND** system highlights candidates that fill critical needs

---

### Requirement: Candidate Profiles from External Sources
System SHALL display rich profiles from Raider.io and WoW Progress.

#### Scenario: Officer clicks candidate name
- **WHEN** Officer clicks [Candidate Name]
- **THEN** system displays profile:
  - From Raider.io: Character sheet, Mythic+ score, rankings
  - From WoW Progress: Raid progression, guild history
  - Character details: Realm, guild, achievement count
  - Links to external profiles

#### Scenario: Profile includes parse data
- **WHEN** WarcraftLogs data is available
- **THEN** profile shows:
  - Parse % by boss fight
  - Average DPS/HPS
  - Deaths per fight
  - Link to full WCL report

---

### Requirement: Guild-Scoped Recruitment
Recruitment data is isolated per guild.

#### Scenario: Officer in Guild A cannot see Guild B's candidates
- **WHEN** Officer is member of both Guild A and Guild B
- **AND** navigates to Guild A recruitment
- **THEN** only Guild A candidates are shown
- **AND** switching to Guild B shows different list

#### Scenario: Candidates are not shared between guilds
- **WHEN** Guild A rates Candidate X as "5 stars"
- **AND** Guild B has Candidate X in their search
- **THEN** Guild B does NOT see Guild A's 5-star rating
- **AND** Guild B gives independent rating

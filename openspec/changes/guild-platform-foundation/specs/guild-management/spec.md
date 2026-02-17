# Guild Management Specification

Guild creation by officers/GMs. Configure rank-based access per tool. View guild roster and member ranks. Enable/disable tools per guild.

## ADDED Requirements

### Requirement: Guild Creation by Officers/GMs
Officers (rank_id ≤ 1) in a guild SHALL be able to create a hool.gg instance for their guild.

#### Scenario: Officer initiates guild creation
- **WHEN** Officer logs into hool.gg
- **AND** system detects they are not yet in a guild instance
- **THEN** system shows "Create Guild Instance" button
- **AND** Officer clicks it

#### Scenario: Guild creation form is shown
- **WHEN** Officer clicks "Create Guild Instance"
- **THEN** system pre-fills from Blizzard API:
  - Guild name (e.g., "Eternal Empire")
  - Realm (e.g., "Area 52-US")
  - Officer's character name (creator)
- **AND** Officer can review and confirm

#### Scenario: Guild is created and stored
- **WHEN** Officer confirms guild creation
- **THEN** system creates guild entry in PostgreSQL:
  - `guilds { id, name, realm, gm_bnet_id, created_at }`
  - gm_bnet_id = Officer's bnet_id
- **AND** system creates initial guild_members entries for all guild members (from Blizzard roster)
- **AND** system initializes guild_permissions with recommended defaults (Progress for all members, Recruitment for Officers+)

#### Scenario: Only Officers/GMs can create instances
- **WHEN** Member tries to create guild instance
- **THEN** system denies request: "Only Officers or higher can create guild instances"

---

### Requirement: Guild Roster Viewing
System SHALL display all members in a guild and their ranks.

#### Scenario: GM views guild roster
- **WHEN** GM navigates to Guild Settings → Members
- **THEN** system fetches guild_members table
- **AND** displays list: Character Name, Rank, Status (online/offline)
- **AND** shows member count

#### Scenario: Roster is synced with Blizzard
- **WHEN** user views roster
- **THEN** system checks if last_sync is older than 1 hour
- **AND** if stale, triggers on-demand sync from Blizzard API
- **AND** updates guild_members table
- **AND** displays latest data

#### Scenario: Non-GMs can see member count (if configured)
- **WHEN** permission allows "Members can see roster"
- **AND** Member navigates to Members page
- **THEN** system displays guild roster
- **AND** each member's name and rank are visible

---

### Requirement: Tool Enable/Disable Configuration
GMs SHALL be able to enable or disable tools per guild.

#### Scenario: GM enables recruitment tool
- **WHEN** GM navigates to Guild Settings → Tools
- **THEN** system shows options:
  - Recruitment: [Disabled] [Enable]
  - Progress Tracking: [Disabled] [Enable]
  - More tools as they're added
- **AND** GM clicks "Enable" for Recruitment

#### Scenario: Tool is enabled with default rank permissions
- **WHEN** GM enables Recruitment
- **THEN** system:
  - Sets guild_permissions.recruitment.enabled = true
  - Sets min_rank_id = 0 (all members, default)
- **AND** system displays: "Recruitment enabled for: All Members"
- **AND** GM can adjust this

#### Scenario: Enabling tool shows it in navigation
- **WHEN** Recruitment is enabled
- **THEN** all eligible members see "Recruitment" link in sidebar
- **AND** clicking it navigates to `/guilds/{guild_id}/recruitment`

#### Scenario: Disabling tool hides it and denies access
- **WHEN** GM disables Recruitment
- **THEN** system sets enabled = false
- **AND** navigation link disappears for all members
- **AND** any requests to recruitment endpoints return 403 Forbidden

---

### Requirement: Rank-Based Tool Access Configuration
GMs SHALL set minimum rank required for each tool.

#### Scenario: GM restricts recruitment to Officers
- **WHEN** GM navigates to Tool Settings for Recruitment
- **THEN** system shows dropdown: "Which ranks can use this tool?"
  - All Members (rank ≤ 3)
  - Raider or higher (rank ≤ 2)
  - Officer or higher (rank ≤ 1)
  - GM only (rank ≤ 0)
  - Disabled
- **AND** GM selects "Officer or higher"
- **THEN** system saves min_rank_id = 1

#### Scenario: Member trying to access Officer-only tool
- **WHEN** Member clicks Recruitment link
- **THEN** system checks: min_rank_id = 1, user rank = 3
- **AND** returns 403 Forbidden with message: "Requires Officer rank"

---

### Requirement: Guild Settings UI
Provide centralized Guild Settings page for GMs to configure everything.

#### Scenario: GM navigates to Guild Settings
- **WHEN** GM clicks Guild Name dropdown (top nav)
- **THEN** system shows: "Guild Settings", "Members", "Logout"
- **AND** clicking "Guild Settings" navigates to `/guilds/{guild_id}/settings`

#### Scenario: Guild Settings page shows all configurable options
- **WHEN** GM is on Guild Settings
- **THEN** system displays tabs:
  - General (guild name, realm, description)
  - Tools (enable/disable, rank requirements)
  - Members (roster, role assignments)
  - Permissions (audit log of changes)

#### Scenario: GM can edit guild description
- **WHEN** GM clicks Edit on description field
- **THEN** system shows text input
- **AND** GM saves new description
- **THEN** system updates guild entry in PostgreSQL

---

### Requirement: Guild Instance Deactivation (Optional)
GMs can deactivate/delete their guild instance (optional for Phase 1).

#### Scenario: GM deactivates guild instance
- **WHEN** GM navigates to Guild Settings → Danger Zone
- **THEN** system shows: "Deactivate This Guild Instance"
- **AND** warning: "This cannot be undone. All guild data will be deleted."
- **AND** GM confirms deletion
- **THEN** system:
  - Sets guild.deleted_at = now()
  - Hides guild from all members
  - Keeps data in DB (soft delete, for audit trail)

#### Scenario: Deactivated guild is not shown in guild list
- **WHEN** member logs in after guild is deactivated
- **THEN** guild does not appear in "Your Guilds"
- **AND** direct URL to guild returns 404

---

### Requirement: Guild Member Synchronization
System SHALL keep guild members in sync with Blizzard API (new characters, departures).

#### Scenario: New character joins guild
- **WHEN** background sync job runs
- **AND** finds new character in guild roster (not in guild_members table)
- **THEN** system inserts new guild_members entry
- **AND** next time any member logs in, new member is visible in roster

#### Scenario: Character leaves guild
- **WHEN** sync finds character no longer in guild
- **THEN** system marks character as left (guild_id = NULL or sets a left_at timestamp)
- **AND** character loses access to guild
- **AND** character is hidden from roster (optional: show "Inactive" tag)

---

### Requirement: Default Permissions and Tools
New guilds start with sensible defaults to reduce GM setup burden.

#### Scenario: New guild has recommended defaults
- **WHEN** guild is created
- **THEN** system suggests:
  - Recruitment: Enabled for Officers+
  - Progress: Enabled for All Members
- **AND** GM can accept or customize

#### Scenario: GM can reset to defaults anytime
- **WHEN** GM clicks "Reset to Defaults" in Tools
- **THEN** system reverts all tool settings to recommended values

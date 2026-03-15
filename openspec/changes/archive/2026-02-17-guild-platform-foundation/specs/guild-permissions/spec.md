# Guild Permissions Specification

Rank-based access control. GMs configure access per tool by guild rank. Permissions are strict by default (no data visible without explicit permission). Dynamic permission checking on every request against Blizzard character rank.

## ADDED Requirements

### Requirement: Rank-Based Permission Configuration
Guild GMs SHALL configure which ranks can access which tools in their guild.

#### Scenario: GM configures recruitment access for Officers
- **WHEN** GM navigates to Guild Settings → Recruitment Tool
- **THEN** system shows permission matrix: "Which ranks can use recruitment?"
- **AND** GM selects "Officer or higher" (rank_id ≤ 1)
- **THEN** system saves this permission to guild_permissions table

#### Scenario: GM can configure per-tool access levels
- **WHEN** GM opens Guild Settings
- **THEN** system shows options for each tool:
  - Recruitment: "Officer or higher", "Raider or higher", "All members", "Disabled"
  - Progress: same options
- **AND** GMs can set different access levels for different tools

#### Scenario: Rank names are fetched from Blizzard
- **WHEN** guild is created in hool.gg
- **THEN** system fetches guild rank structure from Blizzard API
- **AND** displays rank names in permission UI: "Guild Master", "Officer", "Raider", etc.

---

### Requirement: Permission Checking on Every Request
The system SHALL check permissions on every API request. User must have sufficient rank.

#### Scenario: Authorized user accesses recruitment tool
- **WHEN** user with Officer rank calls /api/recruitment/scan
- **AND** Guild Alpha allows Officers to access recruitment
- **THEN** system checks rank (Officer = rank_id 1)
- **AND** checks guild_permissions: "recruitment" min_rank_id ≤ 1
- **THEN** request proceeds, data returned

#### Scenario: Unauthorized user is denied
- **WHEN** user with Member rank (rank_id=3) calls /api/recruitment/scan
- **AND** Guild Alpha requires Officer (rank_id ≤ 1)
- **THEN** system returns 403 Forbidden
- **AND** no data is returned

#### Scenario: Tool is disabled, all users denied
- **WHEN** GM disables recruitment tool (guild_permissions.enabled = false)
- **AND** any user calls /api/recruitment/*
- **THEN** system returns 403 Forbidden
- **AND** returns message "Recruitment tool is disabled by GM"

---

### Requirement: Default Permissions Are Strict
New guilds SHALL have default permissions that deny all access. GMs must explicitly grant.

#### Scenario: New guild has no permissions by default
- **WHEN** GM creates Guild Theta in hool.gg
- **THEN** system initializes guild_permissions with all tools disabled
- **AND** when Members try to access tools, get 403 Forbidden
- **AND** only GM can access Guild Settings to configure

#### Scenario: GM must explicitly enable tools
- **WHEN** GM wants to enable recruitment tool
- **THEN** GM must explicitly go to Settings and enable it
- **AND** set minimum rank requirement
- **THEN** other members can access (if they meet rank requirement)

---

### Requirement: Permission Checks Consider Current Rank
If character's rank changes, permissions are immediately updated on next request.

#### Scenario: Character is promoted, gains access
- **WHEN** character is promoted from Member to Officer
- **AND** sync job updates rank in guild_members
- **THEN** on next API request, character has Officer permissions
- **AND** can access Officer-only tools

#### Scenario: Character is demoted, loses access
- **WHEN** character is demoted from Officer to Member
- **AND** sync job updates rank
- **AND** user tries to access Officer-only recruitment tool
- **THEN** system checks rank (now Member)
- **AND** returns 403 Forbidden (Member not permitted)

#### Scenario: Character leaves guild, loses all access
- **WHEN** character leaves guild (guild_id becomes NULL in sync)
- **AND** user tries to access that guild's tools
- **THEN** system finds no guild membership
- **AND** returns 403 Forbidden

---

### Requirement: GM-Only Settings Access
Only GMs can modify guild permissions. Officers cannot override.

#### Scenario: Only GM can access Guild Settings
- **WHEN** Officer tries to navigate to Guild Settings
- **THEN** system checks if user's rank is GM (rank_id = 0)
- **AND** user is not GM
- **THEN** returns 403 Forbidden or hides Settings menu

#### Scenario: GM can delegate to Officers (optional future)
- **WHEN** system is extended to allow GMs to grant Officers permission to edit settings
- **THEN** GM must explicitly toggle "Officers can manage settings"
- **AND** this becomes a new permission entry

---

### Requirement: Permission Errors Are Transparent
Users denied access receive clear, actionable error messages.

#### Scenario: User denied due to low rank
- **WHEN** Member tries to access Officer-only recruitment
- **THEN** system returns message: "Recruitment tool requires Officer rank or higher. Your rank: Member"

#### Scenario: User denied due to tool being disabled
- **WHEN** any user tries to access disabled tool
- **THEN** system returns message: "This tool is currently disabled in your guild. Contact your Guild Master."

---

### Requirement: Permission Middleware in All Services
Guild-api exposes permission checking endpoint. All other services call guild-api before processing requests.

#### Scenario: Progress API checks permissions via guild-api
- **WHEN** progress-api receives /api/progress/characters request
- **THEN** progress-api extracts user's bnet_id and target guild_id
- **AND** calls guild-api: `GET /guilds/{guild_id}/permissions/check?bnet_id=X&tool=progress`
- **AND** guild-api returns: `{ "allowed": true, "rank": "Raider" }`
- **THEN** progress-api proceeds

#### Scenario: Permission check caches in Redis for speed
- **WHEN** permission check is performed
- **THEN** result is cached in Redis (TTL 5 min): `perm:bnet_id:guild_id:tool`
- **AND** next identical request uses cache (fast)
- **AND** cache is invalidated when permission is updated by GM

---

### Requirement: Audit Trail of Permission Changes
System SHALL log when GMs change permissions (optional, for future auditing).

#### Scenario: Permission change is logged
- **WHEN** GM disables recruitment tool for Guild Gamma
- **THEN** system logs: `{ timestamp, guild_id, tool, action: "disabled", changed_by_bnet_id }`
- **AND** log is stored for audit purposes

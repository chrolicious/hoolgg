# Blizzard OAuth Specification

Authenticate users via Blizzard OAuth (Bnet account). Fetch all characters, their guild memberships, and ranks on login. Gate platform access: only grant if at least one character is in a guild with a hool.gg instance AND has sufficient rank.

## ADDED Requirements

### Requirement: Blizzard OAuth Login Flow
The system SHALL authenticate users via Blizzard OAuth. Users log in once with their Bnet account and receive a JWT token pair valid across all platform services.

#### Scenario: User initiates login
- **WHEN** user clicks "Login with Blizzard" on hool.gg
- **THEN** system redirects to Blizzard OAuth consent screen
- **AND** after consent, Blizzard returns authorization code
- **AND** system exchanges code for access token from Blizzard

#### Scenario: JWT tokens are issued
- **WHEN** Blizzard OAuth succeeds
- **THEN** system issues access token (15-min lifetime, httpOnly cookie)
- **AND** system issues refresh token (7-day lifetime, httpOnly cookie)
- **AND** both tokens are marked Secure and SameSite=Lax

#### Scenario: User already logged in
- **WHEN** user visits hool.gg with valid JWT token
- **THEN** system skips OAuth and loads dashboard
- **AND** JWT is validated on every request

---

### Requirement: Character Fetching from Blizzard API
The system SHALL fetch all characters and their guild memberships from the Blizzard API on login.

#### Scenario: Character data is fetched
- **WHEN** user authenticates via Blizzard OAuth
- **THEN** system queries Blizzard API for all characters on the user's account
- **AND** for each character, system fetches guild membership and rank
- **AND** character data is stored in PostgreSQL (character_name, guild_id, rank_id, rank_name)

#### Scenario: Character with no guild is handled
- **WHEN** user has a character not in any guild
- **THEN** system stores that character with guild_id = NULL
- **AND** character is not displayed when selecting guilds

#### Scenario: Character rank is cached
- **WHEN** character data is fetched
- **THEN** rank is stored with timestamp (last_sync)
- **AND** rank is updated when character logs in (on-demand sync)

---

### Requirement: Platform Access Gating
The system SHALL grant platform access only if at least one character meets both: (1) is in a guild with a hool.gg instance, AND (2) has sufficient rank in that guild.

#### Scenario: User with eligible character gains access
- **WHEN** user logs in with Bnet account
- **THEN** system checks all characters
- **AND** finds Character A in Guild Alpha (hool.gg instance exists)
- **AND** Character A has Officer rank (meets Guild Alpha's access requirement)
- **THEN** user is granted access to Guild Alpha

#### Scenario: User with no eligible characters is denied access
- **WHEN** user logs in
- **THEN** system checks all characters
- **AND** none are in guilds with hool.gg instances
- **THEN** system displays "No accessible guilds" message
- **AND** user cannot proceed further

#### Scenario: User's character has low rank, access denied
- **WHEN** user logs in with Character B in Guild Beta
- **THEN** system checks rank (Member, rank_id=3)
- **AND** Guild Beta requires Officer (rank_id=1)
- **THEN** user is denied access to Guild Beta

> **Note:** WoW guild ranks (0-9) are custom per guild. The `rank_id` values in these scenarios are illustrative. The system uses the guild's actual Blizzard rank structure.

---

### Requirement: Token Refresh Flow
The system SHALL automatically refresh expired access tokens using the refresh token.

#### Scenario: Access token expires
- **WHEN** access token expires (15 min)
- **AND** user makes a request
- **THEN** system detects expired token
- **AND** uses refresh token to obtain new access token
- **AND** user's request continues without interruption

#### Scenario: Refresh token expires, user must re-login
- **WHEN** refresh token expires (7 days)
- **AND** user makes a request
- **THEN** system detects expired refresh token
- **AND** redirects user to login screen
- **AND** user must re-authenticate via Blizzard OAuth

---

### Requirement: Logout Clears Tokens
The system SHALL clear JWT tokens on logout, preventing further access.

#### Scenario: User logs out
- **WHEN** user clicks "Logout"
- **THEN** system clears httpOnly cookies (access_token, refresh_token)
- **AND** optionally adds token to Redis blacklist (revocation list) for 7 days
- **AND** user is redirected to login screen

#### Scenario: Attempt to use cleared token fails
- **WHEN** user tries to access protected endpoint with cleared token
- **THEN** system returns 401 Unauthorized
- **AND** user is redirected to login screen

---

### Requirement: Character Rank Sync Background Job
The system SHALL periodically sync character ranks from Blizzard API to catch demotions, promotions, or guild leaves.

#### Scenario: Scheduled sync updates ranks
- **WHEN** background job runs (every 6 hours)
- **THEN** system queries Blizzard API for all active characters
- **AND** updates guild_members table with latest rank_id and rank_name
- **AND** updates last_sync timestamp

#### Scenario: Character leaving guild is detected
- **WHEN** sync finds character no longer in guild (guild_id becomes NULL)
- **THEN** system updates guild_members.guild_id = NULL
- **AND** on next login, user loses access to that guild
- **AND** user's accessible guilds list is updated

---

### Requirement: Bnet ID is Primary User Identifier
The system SHALL use Blizzard Bnet ID as the unique user identifier across all services.

#### Scenario: User with multiple characters is one user
- **WHEN** user has Character A, B, C under same Bnet ID
- **THEN** system treats them as single user (bnet_id is primary key)
- **AND** all characters share single session/JWT token
- **AND** each character can have different permissions in different guilds

#### Scenario: User can be in multiple guilds simultaneously
- **WHEN** same bnet_id has characters in Guild A and Guild B
- **THEN** system allows user to access both guilds
- **AND** when user switches guilds in frontend, same JWT token is used
- **AND** guild context changes (via API parameters), not auth context

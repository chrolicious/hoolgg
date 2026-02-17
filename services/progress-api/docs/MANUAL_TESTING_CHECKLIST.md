# Progress API - Manual Testing Checklist

This checklist covers all API scenarios from the Character Progress Tracking specification.
Use this for manual testing on dev and staging environments.

## Environment Information

**Environment**: [ ] Dev | [ ] Staging | [ ] Production
**Tester Name**: _______________
**Date**: _______________
**Progress API URL**: _______________
**Guild API URL**: _______________

---

## Pre-Testing Setup

- [ ] Progress API health check passes: `GET /health`
- [ ] Guild API health check passes: `GET /health`
- [ ] Test user authenticated via Blizzard OAuth
- [ ] Test user has valid JWT token (access_token cookie)
- [ ] Test guild exists with ID: _______________
- [ ] Test characters added to guild roster
- [ ] Weekly targets seeded in database

---

## 1. Authentication & Authorization Tests

### 1.1 Unauthorized Access (No Token)

**Scenario**: User attempts to access protected endpoint without authentication

- [ ] **Action**: `GET /guilds/{guild_id}/progress/characters` (no token)
- [ ] **Expected**: 401 Unauthorized
- [ ] **Response Body**: `{"error": "Not authenticated"}`
- [ ] **Result**: PASS / FAIL
- [ ] **Notes**: _______________

### 1.2 Forbidden Access (No Permission)

**Scenario**: User with token but no guild membership attempts access

- [ ] **Action**: `GET /guilds/{guild_id}/progress/characters` (with token, not in guild)
- [ ] **Expected**: 403 Forbidden
- [ ] **Response Body**: `{"error": "Access denied"}`
- [ ] **Result**: PASS / FAIL
- [ ] **Notes**: _______________

### 1.3 Successful Authentication

**Scenario**: User with valid token and guild membership accesses endpoint

- [ ] **Action**: `GET /guilds/{guild_id}/progress/characters` (with valid token)
- [ ] **Expected**: 200 OK
- [ ] **Response Body**: Contains `guild_id`, `characters`, `weekly_target`
- [ ] **Result**: PASS / FAIL
- [ ] **Notes**: _______________

---

## 2. Character Progress Tracking Tests

### 2.1 View Character Progress

**Scenario**: User views their character progress

**Test Character**: _______________
**Realm**: _______________
**Current iLvl**: _______________

- [ ] **Action**: `GET /guilds/{guild_id}/progress/character/{character_name}?realm={realm}`
- [ ] **Expected**: 200 OK
- [ ] **Verify Response Contains**:
  - [ ] `character_name`
  - [ ] `realm`
  - [ ] `current_ilvl`
  - [ ] `weekly_target`
  - [ ] `ilvl_difference`
  - [ ] `status` (on_track / behind / ahead)
  - [ ] `gear_details` (equipped items)
  - [ ] `gear_priorities` (lowest iLvl slots)
- [ ] **Result**: PASS / FAIL
- [ ] **Notes**: _______________

### 2.2 Character Not Found

**Scenario**: User requests non-existent character

- [ ] **Action**: `GET /guilds/{guild_id}/progress/character/NonExistentChar?realm=area-52`
- [ ] **Expected**: 404 Not Found or 200 with fetch from Blizzard
- [ ] **Result**: PASS / FAIL
- [ ] **Notes**: _______________

### 2.3 Multi-Alt Progress

**Scenario**: User with multiple alts views all characters

**Test Alts**: _______________

- [ ] **Action**: `GET /guilds/{guild_id}/progress/characters`
- [ ] **Expected**: 200 OK
- [ ] **Verify**:
  - [ ] All user's alts in THIS guild are shown
  - [ ] Alts in OTHER guilds are NOT shown
  - [ ] Each character has current_ilvl, target, status
- [ ] **Result**: PASS / FAIL
- [ ] **Notes**: _______________

### 2.4 Blizzard API Integration

**Scenario**: Character data fetched from Blizzard API

- [ ] **Action**: `GET /guilds/{guild_id}/progress/character/{character_name}?realm={realm}`
- [ ] **Verify in Logs**:
  - [ ] Blizzard API called (check logs for API request)
  - [ ] iLvl calculated from equipped items
  - [ ] Gear details stored in database
- [ ] **Result**: PASS / FAIL
- [ ] **Notes**: _______________

### 2.5 Data Caching

**Scenario**: Character data cached to reduce API calls

- [ ] **Action**: Request same character twice within 1 hour
  - First request: `GET /guilds/{guild_id}/progress/character/{character_name}?realm={realm}`
  - Second request: (same endpoint, within 1 hour)
- [ ] **Verify**:
  - [ ] First request: Fresh data from Blizzard (check logs)
  - [ ] Second request: Cached data (check logs, Redis)
  - [ ] Response time faster on second request
- [ ] **Result**: PASS / FAIL
- [ ] **Notes**: _______________

---

## 3. Weekly Target Tests

### 3.1 Behind Target

**Scenario**: Character iLvl is below weekly target

**Test Setup**:
- Character iLvl: 260
- Weekly Target (Week 5): 265

- [ ] **Action**: `GET /guilds/{guild_id}/progress/character/{character_name}?realm={realm}`
- [ ] **Expected**: 200 OK
- [ ] **Verify Response**:
  - [ ] `status`: "behind"
  - [ ] `ilvl_difference`: -5
  - [ ] `message`: Contains "behind" or similar
- [ ] **Result**: PASS / FAIL
- [ ] **Notes**: _______________

### 3.2 On Target

**Scenario**: Character iLvl equals weekly target

**Test Setup**:
- Character iLvl: 265
- Weekly Target (Week 5): 265

- [ ] **Action**: `GET /guilds/{guild_id}/progress/character/{character_name}?realm={realm}`
- [ ] **Expected**: 200 OK
- [ ] **Verify Response**:
  - [ ] `status`: "on_track"
  - [ ] `ilvl_difference`: 0
- [ ] **Result**: PASS / FAIL
- [ ] **Notes**: _______________

### 3.3 Ahead of Target

**Scenario**: Character iLvl exceeds weekly target

**Test Setup**:
- Character iLvl: 285
- Weekly Target (Week 5): 265

- [ ] **Action**: `GET /guilds/{guild_id}/progress/character/{character_name}?realm={realm}`
- [ ] **Expected**: 200 OK
- [ ] **Verify Response**:
  - [ ] `status`: "ahead"
  - [ ] `ilvl_difference`: +20
  - [ ] `message`: Contains "ahead" or encouragement
- [ ] **Result**: PASS / FAIL
- [ ] **Notes**: _______________

---

## 4. Gear Priority Tests

### 4.1 Gear Priority Recommendations

**Scenario**: System identifies lowest iLvl slots

- [ ] **Action**: `GET /guilds/{guild_id}/progress/character/{character_name}?realm={realm}`
- [ ] **Expected**: 200 OK
- [ ] **Verify Response**:
  - [ ] `gear_priorities` is an array
  - [ ] Contains slots sorted by lowest iLvl
  - [ ] Top priority items have lowest iLvl
- [ ] **Example**:
  ```json
  "gear_priorities": [
    {"slot": "Chest", "ilvl": 262},
    {"slot": "Legs", "ilvl": 259},
    {"slot": "Gloves", "ilvl": 262}
  ]
  ```
- [ ] **Result**: PASS / FAIL
- [ ] **Notes**: _______________

---

## 5. Guild Progress Overview Tests (Officer+ Only)

### 5.1 Officer Views Guild Overview

**Scenario**: Officer or GM views all guild members' progress

**Test User Rank**: Officer (rank_id <= 1)

- [ ] **Action**: `GET /guilds/{guild_id}/progress/members`
- [ ] **Expected**: 200 OK
- [ ] **Verify Response**:
  - [ ] `members` is an array
  - [ ] Each member has: character_name, class_name, role, current_ilvl, target_ilvl, status
  - [ ] Only characters in THIS guild are shown
- [ ] **Result**: PASS / FAIL
- [ ] **Notes**: _______________

### 5.2 Member Cannot Access Guild Overview

**Scenario**: Regular member (rank > 1) attempts to view guild overview

**Test User Rank**: Member (rank_id > 1)

- [ ] **Action**: `GET /guilds/{guild_id}/progress/members`
- [ ] **Expected**: 403 Forbidden
- [ ] **Response Body**: `{"error": "Officer rank or higher required"}`
- [ ] **Result**: PASS / FAIL
- [ ] **Notes**: _______________

### 5.3 Sorting by iLvl

**Scenario**: Officer sorts guild overview by iLvl

- [ ] **Action**: `GET /guilds/{guild_id}/progress/members?sort=ilvl`
- [ ] **Expected**: 200 OK
- [ ] **Verify**:
  - [ ] Members sorted by current_ilvl (descending by default)
  - [ ] Highest iLvl first, lowest last
- [ ] **Result**: PASS / FAIL
- [ ] **Notes**: _______________

### 5.4 Filtering by Class

**Scenario**: Officer filters by class

- [ ] **Action**: `GET /guilds/{guild_id}/progress/members?class=Warrior`
- [ ] **Expected**: 200 OK
- [ ] **Verify**:
  - [ ] Only Warrior characters shown
- [ ] **Result**: PASS / FAIL
- [ ] **Notes**: _______________

### 5.5 Filtering by Role

**Scenario**: Officer filters by role

- [ ] **Action**: `GET /guilds/{guild_id}/progress/members?role=Tank`
- [ ] **Expected**: 200 OK
- [ ] **Verify**:
  - [ ] Only Tank role characters shown
- [ ] **Result**: PASS / FAIL
- [ ] **Notes**: _______________

### 5.6 Filtering by Status

**Scenario**: Officer filters by status

- [ ] **Action**: `GET /guilds/{guild_id}/progress/members?status=behind`
- [ ] **Expected**: 200 OK
- [ ] **Verify**:
  - [ ] Only characters with status="behind" shown
- [ ] **Result**: PASS / FAIL
- [ ] **Notes**: _______________

---

## 6. Weekly Guidance Message Tests (GM Only)

### 6.1 GM Sets Weekly Message

**Scenario**: GM writes weekly guidance for guild

**Test User Rank**: Guild Master (rank_id = 0)

- [ ] **Action**: `PUT /guilds/{guild_id}/progress/message`
  ```json
  {
    "message": "Focus on Mythic+ this week for gear upgrades!"
  }
  ```
- [ ] **Expected**: 200 OK
- [ ] **Verify Response**:
  - [ ] `gm_message`: "Focus on Mythic+ this week for gear upgrades!"
  - [ ] `updated_at`: Current timestamp
- [ ] **Result**: PASS / FAIL
- [ ] **Notes**: _______________

### 6.2 Members View Weekly Message

**Scenario**: All guild members can view GM's message

**Test User Rank**: Member

- [ ] **Action**: `GET /guilds/{guild_id}/progress/message`
- [ ] **Expected**: 200 OK
- [ ] **Verify Response**:
  - [ ] `gm_message`: Contains the message set by GM
  - [ ] `updated_at`: Timestamp of last update
- [ ] **Result**: PASS / FAIL
- [ ] **Notes**: _______________

### 6.3 Non-GM Cannot Set Message

**Scenario**: Officer or Member attempts to set message

**Test User Rank**: Officer or Member (rank_id > 0)

- [ ] **Action**: `PUT /guilds/{guild_id}/progress/message`
  ```json
  {
    "message": "Unauthorized message"
  }
  ```
- [ ] **Expected**: 403 Forbidden
- [ ] **Response Body**: `{"error": "Guild Master rank required"}`
- [ ] **Result**: PASS / FAIL
- [ ] **Notes**: _______________

### 6.4 Message Timestamp Updates

**Scenario**: GM updates message, timestamp updates

- [ ] **Action**: Set message, wait 1 minute, set new message
- [ ] **Verify**:
  - [ ] `updated_at` timestamp changes on second update
  - [ ] Members see "Last updated: ..." with correct time
- [ ] **Result**: PASS / FAIL
- [ ] **Notes**: _______________

---

## 7. Expansion Roadmap Tests

### 7.1 View Roadmap

**Scenario**: User views expansion roadmap

- [ ] **Action**: `GET /guilds/{guild_id}/progress/roadmap`
- [ ] **Expected**: 200 OK
- [ ] **Verify Response**:
  - [ ] `expansion_id`: Current expansion (e.g., "12.0")
  - [ ] `targets`: Array of weekly targets
  - [ ] Each target has: week, ilvl_target, description
- [ ] **Example**:
  ```json
  {
    "expansion_id": "12.0",
    "targets": [
      {"week": 1, "ilvl_target": 235, "description": "Week 1-2: Mythic+ farm"},
      {"week": 3, "ilvl_target": 250, "description": "Week 3-4: Raid Tier 2"}
    ]
  }
  ```
- [ ] **Result**: PASS / FAIL
- [ ] **Notes**: _______________

---

## 8. WarcraftLogs Comparison Tests

### 8.1 Realm Comparison

**Scenario**: Guild compares performance to realm rankings

**Test Data**:
- Guild Name: _______________
- Realm: _______________
- Region: us

- [ ] **Action**: `GET /guilds/{guild_id}/progress/comparisons?guild_name={guild_name}&realm={realm}&region=us`
- [ ] **Expected**: 200 OK or 500 (if WCL API unavailable)
- [ ] **Verify Response** (if 200):
  - [ ] `your_guild`: Contains guild's percentile
  - [ ] `realm_average`: Contains realm average percentile
  - [ ] `top_guild`: Contains top guild on realm
- [ ] **Result**: PASS / FAIL
- [ ] **Notes**: _______________

### 8.2 Public Data Only

**Scenario**: Only public WCL data is used

- [ ] **Verify**:
  - [ ] No private guild logs accessed
  - [ ] Only publicly available rankings shown
- [ ] **Result**: PASS / FAIL
- [ ] **Notes**: _______________

---

## 9. Error Handling Tests

### 9.1 Blizzard API Slow/Down

**Scenario**: Blizzard API is slow or unavailable

- [ ] **Action**: Request character data when Blizzard API is slow
- [ ] **Expected**:
  - If cached: 200 OK with cached data + warning message
  - If not cached: 500 or timeout error
- [ ] **Verify**:
  - [ ] Cached data used as fallback (if available)
  - [ ] Message: "Data may be slightly outdated"
- [ ] **Result**: PASS / FAIL
- [ ] **Notes**: _______________

### 9.2 Invalid Character Name

**Scenario**: User requests invalid character

- [ ] **Action**: `GET /guilds/{guild_id}/progress/character/InvalidName?realm=area-52`
- [ ] **Expected**: 404 Not Found or appropriate error
- [ ] **Result**: PASS / FAIL
- [ ] **Notes**: _______________

### 9.3 Guild API Unavailable

**Scenario**: Guild API is down, permission check fails

- [ ] **Action**: Stop guild-api, then request progress endpoint
- [ ] **Expected**: 500 or 503 Service Unavailable
- [ ] **Verify**: Graceful error message
- [ ] **Result**: PASS / FAIL
- [ ] **Notes**: _______________

### 9.4 Database Connection Error

**Scenario**: Database is unavailable

- [ ] **Action**: Stop database, then request endpoint
- [ ] **Expected**: 500 Internal Server Error
- [ ] **Verify**: Health check fails
- [ ] **Result**: PASS / FAIL
- [ ] **Notes**: _______________

---

## 10. Performance Tests

### 10.1 Response Time

**Scenario**: API responds within acceptable time

- [ ] **Action**: Measure response time for key endpoints
- [ ] **Endpoints to Test**:
  - [ ] `GET /guilds/{guild_id}/progress/characters` - Time: _____ ms
  - [ ] `GET /guilds/{guild_id}/progress/character/{name}` - Time: _____ ms
  - [ ] `GET /guilds/{guild_id}/progress/members` - Time: _____ ms
- [ ] **Target**: < 500ms p95
- [ ] **Result**: PASS / FAIL
- [ ] **Notes**: _______________

### 10.2 Cache Hit Rate

**Scenario**: Redis cache is effective

- [ ] **Action**: Check Redis cache hit rate
- [ ] **Command**: `redis-cli info stats | grep keyspace_hits`
- [ ] **Target**: > 80% hit rate for character data
- [ ] **Result**: PASS / FAIL
- [ ] **Notes**: _______________

---

## 11. Security Tests

### 11.1 JWT Token Validation

**Scenario**: Invalid JWT tokens are rejected

- [ ] **Action**: Request with expired token
- [ ] **Expected**: 401 Unauthorized
- [ ] **Action**: Request with malformed token
- [ ] **Expected**: 401 Unauthorized
- [ ] **Result**: PASS / FAIL
- [ ] **Notes**: _______________

### 11.2 HTTPS Enforcement

**Scenario**: HTTPS is enforced in production

- [ ] **Action**: Attempt HTTP request (not HTTPS)
- [ ] **Expected**: Redirect to HTTPS or connection refused
- [ ] **Result**: PASS / FAIL
- [ ] **Notes**: _______________

### 11.3 CORS Configuration

**Scenario**: CORS allows only approved origins

- [ ] **Action**: Make request from unauthorized origin
- [ ] **Expected**: CORS error
- [ ] **Action**: Make request from approved origin (e.g., dev.hool.gg)
- [ ] **Expected**: Success
- [ ] **Result**: PASS / FAIL
- [ ] **Notes**: _______________

---

## 12. Data Validation Tests

### 12.1 Required Fields

**Scenario**: Endpoints validate required fields

- [ ] **Action**: `PUT /guilds/{guild_id}/progress/message` without message field
- [ ] **Expected**: 400 Bad Request
- [ ] **Response**: Error message about missing field
- [ ] **Result**: PASS / FAIL
- [ ] **Notes**: _______________

### 12.2 Data Types

**Scenario**: Endpoints validate data types

- [ ] **Action**: Request with invalid guild_id (non-integer)
- [ ] **Expected**: 400 Bad Request
- [ ] **Result**: PASS / FAIL
- [ ] **Notes**: _______________

---

## Summary

**Total Tests**: _____
**Passed**: _____
**Failed**: _____
**Pass Rate**: _____%

**Critical Issues Found**: _____
**Non-Critical Issues Found**: _____

**Ready for Next Stage**: [ ] YES | [ ] NO

**Notes**: _______________

**Tester Signature**: _______________
**Date**: _______________

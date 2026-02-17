# Recruitment API - Manual Testing Checklist

This checklist covers all API scenarios from the recruitment tools specification. Use this for manual testing on dev.hool.gg and staging.hool.gg environments.

## Prerequisites

- [ ] Environment is running (dev.hool.gg:5001 or staging.hool.gg:5001)
- [ ] Database migrations have been applied
- [ ] Guild-api is accessible for permission checks
- [ ] Test user has Officer rank in a test guild
- [ ] API client ready (Postman, curl, or similar)

## Environment Setup

```bash
# Set environment variables
export API_URL="https://dev.hool.gg:5001"  # or staging.hool.gg:5001
export GUILD_ID="1"  # Your test guild ID
export ACCESS_TOKEN="your-jwt-token"  # Get from guild-api login
```

## 1. Health Check

**Test:** Verify service is running

```bash
curl $API_URL/health
```

**Expected:**
- Status: 200 OK
- Response: `{"status": "ok", "service": "recruitment-api"}`

**Result:** [ ] Pass [ ] Fail

---

## 2. Authentication & Authorization

### 2.1 Unauthorized Access

**Test:** Access endpoint without authentication

```bash
curl $API_URL/guilds/$GUILD_ID/recruitment/candidates
```

**Expected:**
- Status: 401 Unauthorized
- Error message about missing authentication

**Result:** [ ] Pass [ ] Fail

### 2.2 Insufficient Permissions

**Test:** Access with non-Officer rank (if available)

```bash
curl -H "Cookie: access_token=$MEMBER_TOKEN" \
  $API_URL/guilds/$GUILD_ID/recruitment/candidates
```

**Expected:**
- Status: 403 Forbidden
- Error message about insufficient permissions

**Result:** [ ] Pass [ ] Fail

### 2.3 Valid Authentication

**Test:** Access with Officer token

```bash
curl -H "Cookie: access_token=$ACCESS_TOKEN" \
  $API_URL/guilds/$GUILD_ID/recruitment/candidates
```

**Expected:**
- Status: 200 OK
- JSON array of candidates (may be empty)

**Result:** [ ] Pass [ ] Fail

---

## 3. Candidate Search (Spec: Multi-Source Recruitment Scanning)

### 3.1 Search with Filters

**Test:** Search candidates with role and class filters

```bash
curl -X POST -H "Cookie: access_token=$ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "raiderio",
    "filters": {
      "role": "Tank",
      "class": "Warrior",
      "min_ilvl": 290,
      "region": "US"
    }
  }' \
  $API_URL/guilds/$GUILD_ID/recruitment/search
```

**Expected:**
- Status: 200 OK
- Array of candidates matching filters
- Each candidate has: name, class, role, ilvl, source

**Result:** [ ] Pass [ ] Fail

### 3.2 Multi-Source Search

**Test:** Search across multiple sources

```bash
curl -X POST -H "Cookie: access_token=$ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sources": ["raiderio", "wowprogress"],
    "filters": {
      "role": "Healer",
      "min_ilvl": 285
    }
  }' \
  $API_URL/guilds/$GUILD_ID/recruitment/search
```

**Expected:**
- Status: 200 OK
- Aggregated results from both sources
- Results include source field

**Result:** [ ] Pass [ ] Fail

---

## 4. Candidate Management

### 4.1 Add Manual Candidate (Spec: Candidate Management)

**Test:** Add a candidate manually

```bash
curl -X POST -H "Cookie: access_token=$ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "candidate_name": "TestWarrior-Area52",
    "character_class": "Warrior",
    "role": "Tank",
    "ilvl": 295,
    "source": "manual",
    "notes": "Found in trade chat"
  }' \
  $API_URL/guilds/$GUILD_ID/recruitment/candidates
```

**Expected:**
- Status: 201 Created
- Response includes candidate ID
- All fields saved correctly

**Result:** [ ] Pass [ ] Fail
**Candidate ID:** _________________

### 4.2 List Candidates

**Test:** Get all candidates for guild

```bash
curl -H "Cookie: access_token=$ACCESS_TOKEN" \
  $API_URL/guilds/$GUILD_ID/recruitment/candidates
```

**Expected:**
- Status: 200 OK
- Array includes previously created candidate
- Guild-scoped (only this guild's candidates)

**Result:** [ ] Pass [ ] Fail

### 4.3 Get Candidate Details

**Test:** Get specific candidate

```bash
CANDIDATE_ID="<id-from-4.1>"
curl -H "Cookie: access_token=$ACCESS_TOKEN" \
  $API_URL/guilds/$GUILD_ID/recruitment/candidates/$CANDIDATE_ID
```

**Expected:**
- Status: 200 OK
- Full candidate profile
- Includes rating, notes, status, contact history

**Result:** [ ] Pass [ ] Fail

### 4.4 Update Candidate Rating (Spec: Candidate Rating and Notes)

**Test:** Rate a candidate

```bash
curl -X PUT -H "Cookie: access_token=$ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "notes": "Excellent tank, strong parses, good communication"
  }' \
  $API_URL/guilds/$GUILD_ID/recruitment/candidates/$CANDIDATE_ID
```

**Expected:**
- Status: 200 OK
- Rating updated to 5
- Notes saved

**Result:** [ ] Pass [ ] Fail

### 4.5 Update Candidate Status (Spec: Candidate Management)

**Test:** Move candidate to different category

```bash
curl -X PUT -H "Cookie: access_token=$ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Interested"
  }' \
  $API_URL/guilds/$GUILD_ID/recruitment/candidates/$CANDIDATE_ID/status
```

**Expected:**
- Status: 200 OK
- Status changed to "Interested"

**Result:** [ ] Pass [ ] Fail

### 4.6 Delete Candidate

**Test:** Remove a candidate

```bash
curl -X DELETE -H "Cookie: access_token=$ACCESS_TOKEN" \
  $API_URL/guilds/$GUILD_ID/recruitment/candidates/$CANDIDATE_ID
```

**Expected:**
- Status: 200 or 204
- Candidate removed from list

**Result:** [ ] Pass [ ] Fail

---

## 5. Contact Tracking (Spec: Candidate Communication)

### 5.1 Log Contact

**Test:** Record communication with candidate

```bash
curl -X POST -H "Cookie: access_token=$ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contacted_date": "2026-02-17T10:00:00Z",
    "method": "Discord",
    "message": "Reached out about trial raid spot",
    "response_received": true
  }' \
  $API_URL/guilds/$GUILD_ID/recruitment/candidates/$CANDIDATE_ID/contact
```

**Expected:**
- Status: 201 Created
- Contact logged successfully

**Result:** [ ] Pass [ ] Fail

### 5.2 View Contact History

**Test:** Get communication timeline

```bash
curl -H "Cookie: access_token=$ACCESS_TOKEN" \
  $API_URL/guilds/$GUILD_ID/recruitment/candidates/$CANDIDATE_ID/history
```

**Expected:**
- Status: 200 OK
- Array with contact entries
- Includes method, date, message, response status

**Result:** [ ] Pass [ ] Fail

---

## 6. Pipeline Management (Spec: Recruitment Pipeline View)

### 6.1 View Pipeline (Kanban)

**Test:** Get Kanban-style pipeline view

```bash
curl -H "Cookie: access_token=$ACCESS_TOKEN" \
  $API_URL/guilds/$GUILD_ID/recruitment/pipeline
```

**Expected:**
- Status: 200 OK
- Categories: Pending, Interested, Top Picks, Hired, Rejected
- Candidates grouped by status
- Count per category

**Result:** [ ] Pass [ ] Fail

### 6.2 Create Custom Category

**Test:** Add custom recruitment category

```bash
curl -X POST -H "Cookie: access_token=$ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Backup Options",
    "custom": true
  }' \
  $API_URL/guilds/$GUILD_ID/recruitment/categories
```

**Expected:**
- Status: 201 Created
- Category created
- Appears in category list

**Result:** [ ] Pass [ ] Fail

### 6.3 List Categories

**Test:** Get all categories

```bash
curl -H "Cookie: access_token=$ACCESS_TOKEN" \
  $API_URL/guilds/$GUILD_ID/recruitment/categories
```

**Expected:**
- Status: 200 OK
- Default categories + custom categories
- Custom flag set correctly

**Result:** [ ] Pass [ ] Fail

### 6.4 Delete Custom Category

**Test:** Remove custom category

```bash
CATEGORY_ID="<id-from-6.2>"
curl -X DELETE -H "Cookie: access_token=$ACCESS_TOKEN" \
  $API_URL/guilds/$GUILD_ID/recruitment/categories/$CATEGORY_ID
```

**Expected:**
- Status: 200 or 204
- Category removed
- Cannot delete default categories

**Result:** [ ] Pass [ ] Fail

---

## 7. Candidate Comparison (Spec: Candidate Comparison)

### 7.1 Compare Multiple Candidates

**Test:** Compare candidates side-by-side

```bash
curl -H "Cookie: access_token=$ACCESS_TOKEN" \
  "$API_URL/guilds/$GUILD_ID/recruitment/compare?candidates=$CANDIDATE_ID_1,$CANDIDATE_ID_2,$CANDIDATE_ID_3"
```

**Expected:**
- Status: 200 OK
- Comparison table with:
  - Name, Class, Role
  - iLvl, Raid Progression
  - Mythic+ Rating
  - Parse percentiles
  - Officer notes

**Result:** [ ] Pass [ ] Fail

---

## 8. Raid Composition (Spec: Raid Composition Planning)

### 8.1 View Composition Needs

**Test:** Get raid composition analysis

```bash
curl -H "Cookie: access_token=$ACCESS_TOKEN" \
  $API_URL/guilds/$GUILD_ID/recruitment/composition
```

**Expected:**
- Status: 200 OK
- Role distribution:
  - Tanks needed vs. current candidates
  - Healers needed vs. current candidates
  - Melee DPS needed vs. current candidates
  - Ranged DPS needed vs. current candidates
- Highlights critical gaps

**Result:** [ ] Pass [ ] Fail

---

## 9. Filtering and Sorting (Spec: Search Filters and Sorting)

### 9.1 Filter by Role

**Test:** Filter candidates by role

```bash
curl -H "Cookie: access_token=$ACCESS_TOKEN" \
  "$API_URL/guilds/$GUILD_ID/recruitment/candidates?role=Tank"
```

**Expected:**
- Status: 200 OK
- Only Tank candidates returned

**Result:** [ ] Pass [ ] Fail

### 9.2 Filter by Class

**Test:** Filter by class

```bash
curl -H "Cookie: access_token=$ACCESS_TOKEN" \
  "$API_URL/guilds/$GUILD_ID/recruitment/candidates?class=Warrior,Paladin"
```

**Expected:**
- Status: 200 OK
- Only Warriors and Paladins returned

**Result:** [ ] Pass [ ] Fail

### 9.3 Filter by iLvl Range

**Test:** Filter by item level

```bash
curl -H "Cookie: access_token=$ACCESS_TOKEN" \
  "$API_URL/guilds/$GUILD_ID/recruitment/candidates?min_ilvl=290&max_ilvl=300"
```

**Expected:**
- Status: 200 OK
- Only candidates with iLvl 290-300

**Result:** [ ] Pass [ ] Fail

### 9.4 Filter by Status

**Test:** Filter by recruitment status

```bash
curl -H "Cookie: access_token=$ACCESS_TOKEN" \
  "$API_URL/guilds/$GUILD_ID/recruitment/candidates?status=Interested,Top Picks"
```

**Expected:**
- Status: 200 OK
- Only candidates in specified statuses

**Result:** [ ] Pass [ ] Fail

### 9.5 Sort by iLvl

**Test:** Sort candidates

```bash
curl -H "Cookie: access_token=$ACCESS_TOKEN" \
  "$API_URL/guilds/$GUILD_ID/recruitment/candidates?sort=ilvl&order=desc"
```

**Expected:**
- Status: 200 OK
- Candidates sorted by iLvl (highest first)

**Result:** [ ] Pass [ ] Fail

### 9.6 Combined Filters

**Test:** Multiple filters + sorting

```bash
curl -H "Cookie: access_token=$ACCESS_TOKEN" \
  "$API_URL/guilds/$GUILD_ID/recruitment/candidates?role=Healer&min_ilvl=285&status=Interested&sort=rating&order=desc"
```

**Expected:**
- Status: 200 OK
- Healers, iLvl 285+, Interested status, sorted by rating

**Result:** [ ] Pass [ ] Fail

---

## 10. Guild Isolation (Spec: Guild-Scoped Recruitment)

### 10.1 Verify Guild Isolation

**Test:** Access different guild's candidates

```bash
GUILD_A_ID="1"
GUILD_B_ID="2"

# Add candidate to Guild A
curl -X POST -H "Cookie: access_token=$ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"candidate_name": "GuildA-Candidate", "character_class": "Mage", "role": "Ranged DPS", "ilvl": 290, "source": "manual"}' \
  $API_URL/guilds/$GUILD_A_ID/recruitment/candidates

# Try to access from Guild B
curl -H "Cookie: access_token=$ACCESS_TOKEN" \
  $API_URL/guilds/$GUILD_B_ID/recruitment/candidates
```

**Expected:**
- Guild B should NOT see Guild A's candidates
- Candidates are fully isolated per guild

**Result:** [ ] Pass [ ] Fail

### 10.2 Verify Rating Isolation

**Test:** Same candidate, different guilds, separate ratings

**Expected:**
- Candidate rated in Guild A has independent rating from Guild B
- Ratings are not shared between guilds

**Result:** [ ] Pass [ ] Fail

---

## 11. External API Integration

### 11.1 Raider.io Profile Fetching

**Test:** Fetch candidate profile from Raider.io

```bash
curl -X POST -H "Cookie: access_token=$ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "raiderio",
    "character_name": "RealPlayer",
    "realm": "Area 52",
    "region": "us"
  }' \
  $API_URL/guilds/$GUILD_ID/recruitment/search
```

**Expected:**
- Status: 200 OK
- Candidate data includes:
  - Mythic+ score
  - Raid progression
  - Item level
  - Link to Raider.io profile

**Result:** [ ] Pass [ ] Fail

### 11.2 WoW Progress Integration

**Test:** Search WoW Progress

```bash
curl -X POST -H "Cookie: access_token=$ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "wowprogress",
    "filters": {
      "role": "Tank",
      "min_ilvl": 290
    }
  }' \
  $API_URL/guilds/$GUILD_ID/recruitment/search
```

**Expected:**
- Status: 200 OK
- Candidates with raid progression data

**Result:** [ ] Pass [ ] Fail

### 11.3 WarcraftLogs Parse Data

**Test:** View candidate with WCL data

```bash
curl -H "Cookie: access_token=$ACCESS_TOKEN" \
  $API_URL/guilds/$GUILD_ID/recruitment/candidates/$CANDIDATE_ID
```

**Expected:**
- If WCL data available, candidate includes:
  - Parse percentiles
  - Boss fight performance
  - Link to WarcraftLogs

**Result:** [ ] Pass [ ] Fail

---

## 12. Error Handling

### 12.1 Invalid Candidate ID

**Test:** Request non-existent candidate

```bash
curl -H "Cookie: access_token=$ACCESS_TOKEN" \
  $API_URL/guilds/$GUILD_ID/recruitment/candidates/99999
```

**Expected:**
- Status: 404 Not Found
- Clear error message

**Result:** [ ] Pass [ ] Fail

### 12.2 Invalid Guild ID

**Test:** Access with invalid guild ID

```bash
curl -H "Cookie: access_token=$ACCESS_TOKEN" \
  $API_URL/guilds/99999/recruitment/candidates
```

**Expected:**
- Status: 404 Not Found or 403 Forbidden
- Clear error message

**Result:** [ ] Pass [ ] Fail

### 12.3 Malformed Request Body

**Test:** Send invalid JSON

```bash
curl -X POST -H "Cookie: access_token=$ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{invalid json}' \
  $API_URL/guilds/$GUILD_ID/recruitment/candidates
```

**Expected:**
- Status: 400 Bad Request
- Error message about invalid JSON

**Result:** [ ] Pass [ ] Fail

### 12.4 Missing Required Fields

**Test:** Create candidate without required fields

```bash
curl -X POST -H "Cookie: access_token=$ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"candidate_name": "NoClass"}' \
  $API_URL/guilds/$GUILD_ID/recruitment/candidates
```

**Expected:**
- Status: 400 Bad Request
- Error listing missing fields

**Result:** [ ] Pass [ ] Fail

---

## 13. Performance & Rate Limiting

### 13.1 Response Times

**Test:** Measure endpoint response times

```bash
time curl -H "Cookie: access_token=$ACCESS_TOKEN" \
  $API_URL/guilds/$GUILD_ID/recruitment/candidates
```

**Expected:**
- Response time < 500ms (p95)
- No timeouts

**Result:** [ ] Pass [ ] Fail
**Actual Time:** _________ms

### 13.2 Rate Limiting (if configured)

**Test:** Rapid successive requests

```bash
for i in {1..100}; do
  curl -H "Cookie: access_token=$ACCESS_TOKEN" \
    $API_URL/guilds/$GUILD_ID/recruitment/candidates
done
```

**Expected:**
- Rate limit kicks in if configured
- 429 Too Many Requests response
- Retry-After header present

**Result:** [ ] Pass [ ] Fail [ ] N/A

---

## 14. Database Migrations

### 14.1 Verify Tables Exist

**Test:** Check database schema

```bash
psql $DATABASE_URL -c "\dt recruitment_*"
```

**Expected:**
- Tables exist:
  - recruitment_candidates
  - recruitment_categories
  - recruitment_history

**Result:** [ ] Pass [ ] Fail

### 14.2 Verify Constraints

**Test:** Try to insert duplicate candidate

```bash
# Insert same candidate twice
curl -X POST -H "Cookie: access_token=$ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"candidate_name": "Duplicate-Test", "character_class": "Mage", "role": "DPS", "ilvl": 290, "source": "manual"}' \
  $API_URL/guilds/$GUILD_ID/recruitment/candidates

# Try again
curl -X POST -H "Cookie: access_token=$ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"candidate_name": "Duplicate-Test", "character_class": "Mage", "role": "DPS", "ilvl": 290, "source": "manual"}' \
  $API_URL/guilds/$GUILD_ID/recruitment/candidates
```

**Expected:**
- Second insert should fail or update existing
- Proper error handling

**Result:** [ ] Pass [ ] Fail

---

## Summary

**Total Tests:** 50+
**Passed:** _____
**Failed:** _____
**Skipped:** _____

## Issues Found

| Test | Issue Description | Severity | Assigned To |
|------|-------------------|----------|-------------|
|      |                   |          |             |

## Sign-off

- [ ] All critical tests passed
- [ ] All blocking issues resolved
- [ ] Performance meets requirements
- [ ] Ready for next environment

**Tester:** ________________________
**Date:** __________________________
**Environment:** [ ] Dev [ ] Staging
**Version:** _______________________

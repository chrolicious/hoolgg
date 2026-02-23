# TODO

## Features

### BiS Tracker - Wowhead Autocomplete
**Priority:** Medium
**Status:** Blocked by CORS

Add Wowhead item autocomplete to BiS tracker:
- Create backend proxy endpoint in progress-api to fetch Wowhead suggestions
- Endpoint: `/api/wowhead/search?q={query}`
- Proxy to `https://www.wowhead.com/search/suggestions?q={query}&type=item`
- Auto-populate item name and ID when selecting from dropdown
- Improves UX by reducing manual entry errors

**Technical approach:**
1. Add `/api/wowhead/search` endpoint in progress-api
2. Use `requests` library to proxy Wowhead API
3. Return JSON with item suggestions
4. Frontend already has structure (reverted in commit 8d537e2)

**Related commits:**
- e928d43 - Initial implementation (reverted)
- 8d537e2 - Revert due to CORS

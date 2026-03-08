# Vault Auto-Fill: Multi-Source M+ & Raid Tracking

**Date:** 2026-02-26
**Status:** Approved

## Goal

Auto-fill Great Vault slots (M+ and raid) using data from Raider.IO, WarcraftLogs, and Blizzard API. Remove manual entry for vault raid/M+ data. Achieve WowAudit-level accuracy without requiring an addon.

## Problem

Currently, M+ vault slots auto-fill from Raider.IO on sync, but raid vault slots require manual entry. Users must remember and input boss kill counts per difficulty each week. This is tedious and error-prone.

No single API gives us everything:
- **Raider.IO**: Has M+ runs with timestamps, but raid data is aggregate (no per-week breakdown)
- **WarcraftLogs**: Has timestamped raid kills, but only for logged fights
- **Blizzard API**: Has ALL kills (logged or not), but only total count + last kill timestamp

## Solution: Multi-Source Cross-Validation

Use all three sources, covering each platform's weakness with another's strength.

### Raid Kills (Weekly)

```
Step 1: Blizzard API /encounters/raids
        → completed_count per boss per difficulty
        → ground truth for TOTAL kills (catches unlogged)

Step 2: WarcraftLogs GraphQL
        → timestamped kills filtered to this reset week
        → ground truth for WHEN kills happened (only logged)

Step 3: Cross-validate
        ├─ Blizzard diff says +3 heroic kills since snapshot
        ├─ WCL says 2 heroic kills this week (with timestamps)
        ├─ Delta: 1 unlogged kill detected
        └─ Result: 3 heroic kills this week
```

### M+ Runs (Weekly)

```
Step 1: Raider.IO recent runs with completed_at timestamps
        → filter to this reset week
        → primary source (already working)

Step 2: Blizzard API mythic_keystone_profile
        → fallback for M+ rating validation
```

### Edge Cases

| Scenario | Solution |
|----------|----------|
| User joins mid-week, no snapshot | WCL timestamps + Blizzard `last_kill_timestamp` |
| Kill not logged on WCL | Blizzard diff catches it (count went up) |
| WCL shows kill, Blizzard hasn't updated | Take the higher count |
| Weekly reset just happened | Snapshot current Blizzard counts as new baseline |

## Data Flow

Enhanced sync (`POST /users/me/characters/<cid>/gear/sync`):

```
1. Blizzard gear/stats/media        (existing)
2. Raider.IO M+ score + runs        (existing)
   → auto-fill vault M+ slots       (existing)
3. Blizzard raid encounters          (NEW)
   → snapshot/diff → auto-fill vault raid slots
4. WarcraftLogs character parses     (NEW)
   → cross-validate raid kill counts
   → enrich with parse % (stored for future UI)
```

Each new step has its own cache TTL (1 hour). Rapid re-syncs skip recently-fetched sources.

## Storage Changes

### CharacterProgress model (new fields)

| Field | Type | Purpose |
|-------|------|---------|
| `raid_snapshot` | JSON | Blizzard completed_count baseline at week start |
| `raid_snapshot_week` | Integer | Which week the snapshot belongs to |
| `warcraftlogs_data` | JSON | Per-boss parse %, kill times, performance |
| `last_warcraftlogs_sync` | DateTime | WCL query cache TTL |
| `last_encounters_sync` | DateTime | Blizzard encounters cache TTL |

### GreatVaultEntry (existing, behavior change)

- `raid_lfr`, `raid_normal`, `raid_heroic`, `raid_mythic`: become auto-filled, read-only on frontend
- `m_plus_runs`: already auto-filled, no change

No new models needed.

## New Service Methods

### BlizzardService
- `get_character_encounters(name, realm, region)` — fetch `/encounters/raids`, return per-boss kill counts and timestamps

### WarcraftLogsService
- `get_character_parses(name, realm, region)` — GraphQL encounterRankings, return per-boss parse %, kills, duration
- `get_character_kills_in_range(name, realm, region, start, end)` — kills filtered by date range (reset week)

## Background Sync (APScheduler)

- Runs in Flask process via APScheduler `BackgroundScheduler`
- Interval: every 1 hour
- Only syncs characters with user activity in last 24 hours
- Staggered: spreads character syncs across the hour
- Skips characters synced < 30 min ago

## Frontend (v1 scope)

- Vault raid section: remove manual input, show read-only auto-filled counts
- Add "Last synced" timestamp to vault section
- Sync button unchanged (just does more internally)

### NOT in v1
- WCL parse % display (stored for future use)
- M+ run history page
- Boss-by-boss kill log UI
- Background sync status indicator

## Architecture Decision: Option A (Extend Existing Sync)

Chosen over separate sync services (Option B) and event-driven Redis pub/sub (Option C) for simplicity. All sync logic lives in the existing sync endpoint. APScheduler calls the same logic. Can split later if needed.

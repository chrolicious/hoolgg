# Vault Auto-Fill Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Auto-fill Great Vault raid and M+ slots using multi-source data from Blizzard API, Raider.IO, and WarcraftLogs — no manual entry needed.

**Architecture:** Extend the existing sync endpoint (`POST /users/me/characters/<cid>/gear/sync`) with two new steps: Blizzard raid encounters (snapshot/diff for kill counts) and WarcraftLogs character parses (cross-validation + enrichment). APScheduler runs background syncs hourly for active characters.

**Tech Stack:** Flask, SQLAlchemy, APScheduler, Blizzard API (REST), WarcraftLogs (GraphQL), Raider.IO (REST)

---

## Task 1: Add New Fields to CharacterProgress Model

**Files:**
- Modify: `services/progress-api/app/models/character_progress.py`
- Create: `services/progress-api/alembic/versions/005_add_vault_autofill_fields.py`

**Step 1: Add fields to the model**

Add these fields after `last_raiderio_sync` (line 40) in `character_progress.py`:

```python
# Raid encounter tracking (for vault auto-fill)
raid_snapshot = Column(JSON, nullable=True)  # Blizzard completed_count baseline per boss
raid_snapshot_week = Column(Integer, nullable=True)  # Week number of the snapshot
warcraftlogs_data = Column(JSON, nullable=True)  # Per-boss parse %, kill times
last_warcraftlogs_sync = Column(DateTime(timezone=True), nullable=True)
last_encounters_sync = Column(DateTime(timezone=True), nullable=True)
```

Also add to `to_dict()` method:

```python
"raid_snapshot_week": self.raid_snapshot_week,
"last_warcraftlogs_sync": self.last_warcraftlogs_sync.isoformat() if self.last_warcraftlogs_sync else None,
"last_encounters_sync": self.last_encounters_sync.isoformat() if self.last_encounters_sync else None,
```

**Step 2: Create alembic migration**

Create `services/progress-api/alembic/versions/005_add_vault_autofill_fields.py`:

```python
"""Add vault auto-fill fields to character_progress

Revision ID: 005_vault_autofill
Revises: 004_bnet_token
Create Date: 2026-02-26
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '005_vault_autofill'
down_revision: Union[str, None] = '004_bnet_token'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.add_column('character_progress', sa.Column('raid_snapshot', sa.JSON(), nullable=True))
    op.add_column('character_progress', sa.Column('raid_snapshot_week', sa.Integer(), nullable=True))
    op.add_column('character_progress', sa.Column('warcraftlogs_data', sa.JSON(), nullable=True))
    op.add_column('character_progress', sa.Column('last_warcraftlogs_sync', sa.DateTime(timezone=True), nullable=True))
    op.add_column('character_progress', sa.Column('last_encounters_sync', sa.DateTime(timezone=True), nullable=True))

def downgrade() -> None:
    op.drop_column('character_progress', 'last_encounters_sync')
    op.drop_column('character_progress', 'last_warcraftlogs_sync')
    op.drop_column('character_progress', 'warcraftlogs_data')
    op.drop_column('character_progress', 'raid_snapshot_week')
    op.drop_column('character_progress', 'raid_snapshot')
```

**Step 3: Run migration locally**

```bash
cd services/progress-api && alembic upgrade head
```

**Step 4: Commit**

```bash
git add services/progress-api/app/models/character_progress.py services/progress-api/alembic/versions/005_add_vault_autofill_fields.py
git commit -m "feat: add vault auto-fill fields to CharacterProgress model"
```

---

## Task 2: Add Blizzard Encounters Service Method

**Files:**
- Modify: `services/progress-api/app/services/blizzard_service.py`

**Step 1: Add `get_character_encounters` method**

Add after `get_character_stats()` (after line 225) in `blizzard_service.py`:

```python
def get_character_encounters(
    self, character_name: str, realm_slug: str
) -> Optional[Dict[str, Any]]:
    """
    Fetch raid encounter data (boss kills per difficulty) from Blizzard API.

    Returns per-expansion, per-instance, per-encounter data with
    completed_count and last_kill_timestamp per difficulty.

    Args:
        character_name: Character name
        realm_slug: Realm slug

    Returns:
        Dict with encounter data or None if failed
    """
    access_token = self._get_access_token()
    if not access_token:
        return None

    api_url = self._get_api_url()
    namespace = f"profile-{self._get_region()}"

    character_name_lower = character_name.lower()
    realm_slug_lower = realm_slug.lower()

    endpoint = (
        f"{api_url}/profile/wow/character/{realm_slug_lower}/"
        f"{character_name_lower}/encounters/raids"
    )

    params = {"namespace": namespace, "locale": "en_US"}
    headers = {"Authorization": f"Bearer {access_token}"}
    timeout = current_app.config.get("BLIZZARD_API_TIMEOUT", 10)

    try:
        response = requests.get(endpoint, params=params, headers=headers, timeout=timeout)
        response.raise_for_status()

        data = response.json()
        logger.info(f"Successfully fetched encounters for {character_name}-{realm_slug}")
        return data

    except requests.HTTPError as e:
        if e.response.status_code == 404:
            logger.warning(f"Encounters not found for: {character_name}-{realm_slug}")
        else:
            logger.error(f"HTTP error fetching encounters: {e.response.status_code}")
        return None

    except requests.RequestException as e:
        logger.error(f"Failed to fetch character encounters: {e}")
        return None
```

**Step 2: Commit**

```bash
git add services/progress-api/app/services/blizzard_service.py
git commit -m "feat: add Blizzard encounters endpoint for raid kill data"
```

---

## Task 3: Create Raid Encounter Parser

**Files:**
- Create: `services/progress-api/app/services/encounter_parser.py`

This module parses Blizzard encounter data, manages snapshots, and diffs to determine this week's kills.

**Step 1: Write the encounter parser**

```python
"""Parse Blizzard raid encounter data and diff against snapshots for weekly vault auto-fill."""

import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

# Current raid instance name (Midnight Season 1)
# Update this when new raids release
CURRENT_RAID_INSTANCE = "Liberation of Undermine"


def parse_encounter_snapshot(encounter_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Parse Blizzard /encounters/raids response into a snapshot of kill counts.

    Returns a dict keyed by difficulty with total boss kill counts:
    {
        "normal": {"total": 8, "bosses": {"Boss1": 3, "Boss2": 5}},
        "heroic": {"total": 6, "bosses": {"Boss1": 2, "Boss2": 4}},
        "mythic": {"total": 2, "bosses": {"Boss1": 1, "Boss2": 1}},
        "lfr":    {"total": 0, "bosses": {}},
    }

    Also includes last_kill_timestamps per boss per difficulty for first-week detection.
    """
    snapshot = {
        "normal": {"total": 0, "bosses": {}},
        "heroic": {"total": 0, "bosses": {}},
        "mythic": {"total": 0, "bosses": {}},
        "lfr": {"total": 0, "bosses": {}},
    }

    if not encounter_data:
        return snapshot

    expansions = encounter_data.get("expansions", [])
    for expansion in expansions:
        instances = expansion.get("instances", [])
        for instance in instances:
            instance_name = instance.get("instance", {}).get("name", "")

            # Only process current raid
            if instance_name != CURRENT_RAID_INSTANCE:
                continue

            modes = instance.get("modes", [])
            for mode in modes:
                difficulty = mode.get("difficulty", {}).get("type", "").lower()

                # Map Blizzard difficulty names to our keys
                diff_map = {
                    "normal": "normal",
                    "heroic": "heroic",
                    "mythic": "mythic",
                    "lfr": "lfr",
                }
                diff_key = diff_map.get(difficulty)
                if not diff_key:
                    continue

                encounters = mode.get("encounters", [])
                for encounter in encounters:
                    boss_name = encounter.get("encounter", {}).get("name", "Unknown")
                    completed_count = encounter.get("completed_count", 0)
                    last_kill_ts = encounter.get("last_kill_timestamp")

                    snapshot[diff_key]["bosses"][boss_name] = {
                        "kills": completed_count,
                        "last_kill_timestamp": last_kill_ts,
                    }
                    snapshot[diff_key]["total"] += completed_count

    return snapshot


def diff_snapshots(
    current: Dict[str, Any],
    baseline: Optional[Dict[str, Any]],
) -> Dict[str, int]:
    """
    Diff current snapshot against a baseline to get this week's kills.

    Returns: {"raid_normal": N, "raid_heroic": N, "raid_mythic": N, "raid_lfr": N}
    representing number of unique bosses killed per difficulty this week.

    For vault, what matters is unique bosses killed (not total kill count).
    """
    result = {"raid_lfr": 0, "raid_normal": 0, "raid_heroic": 0, "raid_mythic": 0}

    for difficulty in ["lfr", "normal", "heroic", "mythic"]:
        key = f"raid_{difficulty}"
        current_bosses = current.get(difficulty, {}).get("bosses", {})
        baseline_bosses = (baseline or {}).get(difficulty, {}).get("bosses", {})

        bosses_killed_this_week = 0
        for boss_name, boss_data in current_bosses.items():
            current_kills = boss_data.get("kills", 0) if isinstance(boss_data, dict) else boss_data
            baseline_data = baseline_bosses.get(boss_name, {})
            baseline_kills = baseline_data.get("kills", 0) if isinstance(baseline_data, dict) else baseline_data

            if current_kills > baseline_kills:
                bosses_killed_this_week += 1

        result[key] = bosses_killed_this_week

    return result


def estimate_first_week_kills(
    snapshot: Dict[str, Any],
    week_reset_timestamp: int,
) -> Dict[str, int]:
    """
    For users with no baseline snapshot (first sync ever), estimate this week's
    kills using last_kill_timestamp from Blizzard API.

    A boss is counted as killed this week if its last_kill_timestamp >= week_reset_timestamp.
    This may undercount (if killed multiple times) but never overcounts.
    """
    result = {"raid_lfr": 0, "raid_normal": 0, "raid_heroic": 0, "raid_mythic": 0}

    for difficulty in ["lfr", "normal", "heroic", "mythic"]:
        key = f"raid_{difficulty}"
        bosses = snapshot.get(difficulty, {}).get("bosses", {})

        for boss_name, boss_data in bosses.items():
            if not isinstance(boss_data, dict):
                continue
            last_kill_ts = boss_data.get("last_kill_timestamp")
            if last_kill_ts and last_kill_ts >= week_reset_timestamp * 1000:
                # Blizzard timestamps are in milliseconds
                result[key] += 1

    return result


def get_week_reset_timestamp(region: str = "us") -> int:
    """
    Get the Unix timestamp of the most recent weekly reset for the given region.

    US/TW: Tuesday 15:00 UTC
    EU/KR: Wednesday 07:00 UTC
    """
    from datetime import date, timedelta

    today = date.today()
    now = datetime.now(timezone.utc)

    if region in ("eu", "kr"):
        reset_weekday = 2  # Wednesday
        reset_hour = 7
    else:
        reset_weekday = 1  # Tuesday
        reset_hour = 15

    days_since_reset = (today.weekday() - reset_weekday) % 7
    reset_date = today - timedelta(days=days_since_reset)
    reset_dt = datetime(reset_date.year, reset_date.month, reset_date.day,
                        reset_hour, 0, 0, tzinfo=timezone.utc)

    # If we haven't hit reset time yet today, go back a week
    if now < reset_dt:
        reset_dt -= timedelta(weeks=1)

    return int(reset_dt.timestamp())
```

**Step 2: Commit**

```bash
git add services/progress-api/app/services/encounter_parser.py
git commit -m "feat: add encounter parser with snapshot diffing for vault auto-fill"
```

---

## Task 4: Add WarcraftLogs Character Parse Methods

**Files:**
- Modify: `services/progress-api/app/services/warcraftlogs_service.py`

**Step 1: Add character-level GraphQL queries**

Add these methods to the existing `WarcraftLogsService` class after `compare_to_realm()`:

```python
def get_character_parses(
    self, character_name: str, realm_slug: str, region: str = "us"
) -> Optional[Dict[str, Any]]:
    """
    Fetch per-boss parse percentiles for a character from the current raid tier.

    Returns dict keyed by boss name:
    {
        "Boss1": {"best_parse": 95.2, "median_parse": 88.1, "kills": 5, "spec": "Fury"},
        ...
    }
    """
    access_token = self._get_access_token()
    if not access_token:
        return None

    graphql_endpoint = "https://www.warcraftlogs.com/api/v2/client"

    query = """
    query CharacterParses($name: String!, $serverSlug: String!, $serverRegion: String!) {
      characterData {
        character(name: $name, serverSlug: $serverSlug, serverRegion: $serverRegion) {
          encounterRankings
        }
      }
    }
    """

    variables = {
        "name": character_name,
        "serverSlug": realm_slug,
        "serverRegion": region.upper(),
    }

    headers = {"Authorization": f"Bearer {access_token}"}

    try:
        response = requests.post(
            graphql_endpoint,
            json={"query": query, "variables": variables},
            headers=headers,
            timeout=15,
        )
        response.raise_for_status()

        data = response.json()
        if "errors" in data:
            logger.error(f"WCL GraphQL errors: {data['errors']}")
            return None

        character_data = (
            data.get("data", {})
            .get("characterData", {})
            .get("character", {})
        )

        if not character_data:
            logger.warning(f"No WCL data for {character_name}-{realm_slug}")
            return None

        return self._parse_encounter_rankings(character_data.get("encounterRankings"))

    except requests.RequestException as e:
        logger.error(f"Failed to fetch WCL parses: {e}")
        return None

def get_character_kills_in_range(
    self, character_name: str, realm_slug: str, region: str = "us",
    start_time: int = 0, end_time: int = 0,
) -> Optional[List[Dict[str, Any]]]:
    """
    Fetch raid kills for a character within a specific time range (for weekly attribution).

    Args:
        start_time: Unix timestamp (seconds) for range start (weekly reset)
        end_time: Unix timestamp (seconds) for range end (now)

    Returns list of kills:
    [{"boss": "Boss1", "difficulty": "heroic", "timestamp": 1234567890, "parse": 85.2}, ...]
    """
    access_token = self._get_access_token()
    if not access_token:
        return None

    graphql_endpoint = "https://www.warcraftlogs.com/api/v2/client"

    # WCL uses milliseconds for timestamps
    start_ms = start_time * 1000
    end_ms = end_time * 1000

    query = """
    query CharacterKills($name: String!, $serverSlug: String!, $serverRegion: String!, $startTime: Float!, $endTime: Float!) {
      characterData {
        character(name: $name, serverSlug: $serverSlug, serverRegion: $serverRegion) {
          normal: encounterRankings(difficulty: 3, timeRange: { startTime: $startTime, endTime: $endTime })
          heroic: encounterRankings(difficulty: 4, timeRange: { startTime: $startTime, endTime: $endTime })
          mythic: encounterRankings(difficulty: 5, timeRange: { startTime: $startTime, endTime: $endTime })
        }
      }
    }
    """

    variables = {
        "name": character_name,
        "serverSlug": realm_slug,
        "serverRegion": region.upper(),
        "startTime": float(start_ms),
        "endTime": float(end_ms),
    }

    headers = {"Authorization": f"Bearer {access_token}"}

    try:
        response = requests.post(
            graphql_endpoint,
            json={"query": query, "variables": variables},
            headers=headers,
            timeout=15,
        )
        response.raise_for_status()

        data = response.json()
        if "errors" in data:
            logger.error(f"WCL GraphQL errors: {data['errors']}")
            return None

        character_data = (
            data.get("data", {})
            .get("characterData", {})
            .get("character", {})
        )

        if not character_data:
            return []

        kills = []
        diff_map = {"normal": 3, "heroic": 4, "mythic": 5}
        for diff_name in ["normal", "heroic", "mythic"]:
            rankings = character_data.get(diff_name)
            if rankings and isinstance(rankings, list):
                for ranking in rankings:
                    kills.append({
                        "boss": ranking.get("encounter", {}).get("name", "Unknown"),
                        "difficulty": diff_name,
                        "timestamp": ranking.get("startTime", 0) // 1000,
                        "parse": ranking.get("rankPercent", 0),
                    })

        return kills

    except requests.RequestException as e:
        logger.error(f"Failed to fetch WCL kills: {e}")
        return None

def _parse_encounter_rankings(self, rankings_data) -> Optional[Dict[str, Any]]:
    """Parse encounterRankings into a simplified per-boss dict."""
    if not rankings_data:
        return None

    result = {}
    if isinstance(rankings_data, list):
        for ranking in rankings_data:
            boss_name = ranking.get("encounter", {}).get("name", "Unknown")
            result[boss_name] = {
                "best_parse": ranking.get("rankPercent"),
                "kills": ranking.get("totalKills", 0),
                "spec": ranking.get("spec"),
            }
    return result if result else None
```

**Step 2: Commit**

```bash
git add services/progress-api/app/services/warcraftlogs_service.py
git commit -m "feat: add WarcraftLogs character parses and weekly kill queries"
```

---

## Task 5: Create Vault Auto-Fill Orchestrator

**Files:**
- Create: `services/progress-api/app/services/vault_autofill.py`

This is the core logic that ties all three sources together.

**Step 1: Write the orchestrator**

```python
"""Vault auto-fill orchestrator — cross-validates Blizzard, Raider.IO, and WarcraftLogs data."""

import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional

from app.services.blizzard_service import BlizzardService
from app.services.warcraftlogs_service import WarcraftLogsService
from app.services.encounter_parser import (
    parse_encounter_snapshot,
    diff_snapshots,
    estimate_first_week_kills,
    get_week_reset_timestamp,
)

logger = logging.getLogger(__name__)

# Cache TTL for each data source
ENCOUNTERS_CACHE_TTL = timedelta(hours=1)
WARCRAFTLOGS_CACHE_TTL = timedelta(hours=1)


def auto_fill_raid_vault(
    char,
    vault_entry,
    current_week: int,
    region: str,
    db,
) -> Dict[str, int]:
    """
    Auto-fill raid vault slots using multi-source cross-validation.

    1. Blizzard encounters → snapshot/diff for total kills (catches unlogged)
    2. WarcraftLogs → timestamped kills for cross-validation
    3. Take the higher count per difficulty

    Args:
        char: CharacterProgress model instance
        vault_entry: GreatVaultEntry model instance (current week)
        current_week: Current season week number
        region: Character region (us, eu, kr, tw)
        db: Database session

    Returns:
        Dict with raid kill counts: {"raid_lfr": N, "raid_normal": N, ...}
    """
    now = datetime.now(timezone.utc)
    raid_kills = {"raid_lfr": 0, "raid_normal": 0, "raid_heroic": 0, "raid_mythic": 0}

    # --- Source 1: Blizzard API encounters ---
    blizzard_kills = _get_blizzard_raid_kills(char, current_week, region, now, db)
    if blizzard_kills:
        for key, count in blizzard_kills.items():
            raid_kills[key] = max(raid_kills[key], count)

    # --- Source 2: WarcraftLogs kills this week ---
    wcl_kills = _get_wcl_raid_kills(char, region, now)
    if wcl_kills:
        for key, count in wcl_kills.items():
            raid_kills[key] = max(raid_kills[key], count)

    # --- Apply to vault entry ---
    vault_entry.raid_lfr = raid_kills["raid_lfr"]
    vault_entry.raid_normal = raid_kills["raid_normal"]
    vault_entry.raid_heroic = raid_kills["raid_heroic"]
    vault_entry.raid_mythic = raid_kills["raid_mythic"]

    logger.info(
        f"Vault auto-fill for {char.character_name}: "
        f"N={raid_kills['raid_normal']} H={raid_kills['raid_heroic']} "
        f"M={raid_kills['raid_mythic']}"
    )

    return raid_kills


def _get_blizzard_raid_kills(char, current_week, region, now, db):
    """Fetch Blizzard encounters, manage snapshot, diff for this week's kills."""
    # Check cache TTL
    if char.last_encounters_sync and now - char.last_encounters_sync < ENCOUNTERS_CACHE_TTL:
        # Use existing diff if we already have a snapshot for this week
        if char.raid_snapshot_week == current_week and char.raid_snapshot:
            # Re-diff isn't needed since we already applied it
            return None
        return None

    blizz = BlizzardService(region=region)
    encounter_data = blizz.get_character_encounters(char.character_name, char.realm)
    if not encounter_data:
        return None

    current_snapshot = parse_encounter_snapshot(encounter_data)
    char.last_encounters_sync = now

    # Determine this week's kills
    if char.raid_snapshot_week == current_week and char.raid_snapshot:
        # Same week — diff against stored baseline
        kills = diff_snapshots(current_snapshot, char.raid_snapshot)
    elif char.raid_snapshot and char.raid_snapshot_week is not None and char.raid_snapshot_week < current_week:
        # New week — old snapshot becomes baseline, store current as new baseline
        kills = diff_snapshots(current_snapshot, char.raid_snapshot)
        char.raid_snapshot = current_snapshot
        char.raid_snapshot_week = current_week
    else:
        # First sync ever — use last_kill_timestamp to estimate this week's kills
        reset_ts = get_week_reset_timestamp(region)
        kills = estimate_first_week_kills(current_snapshot, reset_ts)
        char.raid_snapshot = current_snapshot
        char.raid_snapshot_week = current_week

    return kills


def _get_wcl_raid_kills(char, region, now):
    """Fetch WarcraftLogs kills for this reset week."""
    # Check cache TTL
    if char.last_warcraftlogs_sync and now - char.last_warcraftlogs_sync < WARCRAFTLOGS_CACHE_TTL:
        return None

    wcl = WarcraftLogsService()
    reset_ts = get_week_reset_timestamp(region)
    now_ts = int(now.timestamp())

    kills_data = wcl.get_character_kills_in_range(
        char.character_name, char.realm, region,
        start_time=reset_ts, end_time=now_ts,
    )

    char.last_warcraftlogs_sync = now

    if not kills_data:
        return None

    # Count unique bosses killed per difficulty
    result = {"raid_lfr": 0, "raid_normal": 0, "raid_heroic": 0, "raid_mythic": 0}
    seen = {"normal": set(), "heroic": set(), "mythic": set()}

    for kill in kills_data:
        diff = kill.get("difficulty", "")
        boss = kill.get("boss", "")
        if diff in seen and boss not in seen[diff]:
            seen[diff].add(boss)
            result[f"raid_{diff}"] += 1

    # Also store parse data for future UI
    wcl_parses = wcl.get_character_parses(char.character_name, char.realm, region)
    if wcl_parses:
        char.warcraftlogs_data = wcl_parses

    return result
```

**Step 2: Commit**

```bash
git add services/progress-api/app/services/vault_autofill.py
git commit -m "feat: add vault auto-fill orchestrator with multi-source cross-validation"
```

---

## Task 6: Integrate Auto-Fill into Sync Endpoint

**Files:**
- Modify: `services/progress-api/app/routes/personal_roster.py`

**Step 1: Add raid auto-fill after M+ vault update**

In `personal_roster.py`, after the existing vault M+ auto-fill block (around line 444 `vault_entry.m_plus_runs = recent_runs`), add:

```python
# Auto-fill raid vault slots from Blizzard + WarcraftLogs
from app.services.vault_autofill import auto_fill_raid_vault

try:
    auto_fill_raid_vault(
        char=char,
        vault_entry=vault_entry,
        current_week=current_week,
        region=region,
        db=db,
    )
except Exception as e:
    logger.warning(f"Raid vault auto-fill failed (non-fatal): {e}")
```

Also ensure the vault entry creation happens even when there are no M+ `recent_runs` — currently it's gated by `if recent_runs:` (line 430). Change the flow so the vault entry is always created/fetched:

Replace the block at lines 429-444:

```python
# Get or create vault entry for current week
current_week = calculate_current_week(region)
vault_entry = db.query(GreatVaultEntry).filter(
    GreatVaultEntry.character_id == char.id,
    GreatVaultEntry.week_number == current_week
).first()

if not vault_entry:
    vault_entry = GreatVaultEntry(
        character_id=char.id,
        week_number=current_week,
    )
    db.add(vault_entry)

# Auto-fill M+ runs from Raider.IO
if recent_runs:
    vault_entry.m_plus_runs = recent_runs

# Auto-fill raid vault slots from Blizzard + WarcraftLogs
try:
    from app.services.vault_autofill import auto_fill_raid_vault
    auto_fill_raid_vault(
        char=char,
        vault_entry=vault_entry,
        current_week=current_week,
        region=region,
        db=db,
    )
except Exception as e:
    logger.warning(f"Raid vault auto-fill failed (non-fatal): {e}")
```

**Step 2: Commit**

```bash
git add services/progress-api/app/routes/personal_roster.py
git commit -m "feat: integrate raid vault auto-fill into sync endpoint"
```

---

## Task 7: Make Vault Raid Fields Read-Only on Frontend

**Files:**
- Modify: `apps/web/app/(platform)/roster/[characterName]/components/vault-and-crests.tsx`

**Step 1: Find and update vault raid input controls**

In the vault UI component, find where `raid_lfr`, `raid_normal`, `raid_heroic`, `raid_mythic` are rendered with manual +/- buttons or input fields. Remove the manual controls and replace with read-only display showing the auto-filled count.

Look for the raid section in the vault component and replace manual inputs with:

```tsx
<span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255, 255, 255, 0.8)' }}>
  {count}
</span>
```

Also add a "Last synced" timestamp at the bottom of the vault section using the character's `last_encounters_sync` or `last_gear_sync` value.

**Step 2: Commit**

```bash
git add apps/web/app/'(platform)'/roster/'[characterName]'/components/vault-and-crests.tsx
git commit -m "fix(web): make vault raid slots read-only (auto-filled on sync)"
```

---

## Task 8: Setup APScheduler

**Files:**
- Create: `services/progress-api/app/services/scheduler.py`
- Modify: `services/progress-api/app/__init__.py`

**Step 1: Install APScheduler**

```bash
cd services/progress-api && pip install apscheduler && pip freeze | grep -i apscheduler >> requirements.txt
```

**Step 2: Create scheduler service**

```python
"""APScheduler setup for periodic background sync of active characters."""

import logging
from datetime import datetime, timezone, timedelta

from apscheduler.schedulers.background import BackgroundScheduler

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()


def init_scheduler(app):
    """Initialize and start the background scheduler."""
    if scheduler.running:
        return

    scheduler.add_job(
        func=sync_active_characters,
        trigger="interval",
        hours=1,
        id="sync_active_characters",
        replace_existing=True,
        kwargs={"app": app},
    )

    scheduler.start()
    logger.info("APScheduler started: sync_active_characters every 1 hour")


def shutdown_scheduler():
    """Gracefully shut down the scheduler."""
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("APScheduler shut down")


def sync_active_characters(app):
    """
    Sync characters that have been viewed/used in the last 24 hours.

    Stagger syncs across the hour to avoid API bursts.
    Skip characters synced less than 30 minutes ago.
    """
    import time
    from app.models import get_db
    from app.models.character_progress import CharacterProgress

    with app.app_context():
        now = datetime.now(timezone.utc)
        cutoff = now - timedelta(hours=24)
        skip_if_synced_after = now - timedelta(minutes=30)

        db = next(get_db())
        try:
            # Get characters with recent activity (last_updated as proxy for user activity)
            characters = (
                db.query(CharacterProgress)
                .filter(CharacterProgress.last_updated >= cutoff)
                .all()
            )

            if not characters:
                logger.debug("No active characters to sync")
                return

            logger.info(f"Background sync: {len(characters)} active characters")

            # Calculate stagger delay
            stagger_seconds = 3600 / max(len(characters), 1)

            for i, char in enumerate(characters):
                # Skip if recently synced
                if char.last_gear_sync and char.last_gear_sync > skip_if_synced_after:
                    continue

                try:
                    _sync_single_character(char, db)
                except Exception as e:
                    logger.error(f"Background sync failed for {char.character_name}: {e}")
                    db.rollback()

                # Stagger between characters
                if i < len(characters) - 1:
                    time.sleep(min(stagger_seconds, 60))

        finally:
            db.close()


def _sync_single_character(char, db):
    """Run a lightweight sync for a single character (Raider.IO + vault auto-fill only)."""
    from app.services.raiderio_service import RaiderIOService, parse_raiderio_profile
    from app.services.vault_autofill import auto_fill_raid_vault
    from app.services.season_service import calculate_current_week
    from app.models.great_vault_entry import GreatVaultEntry

    region = char.region or "us"
    now = datetime.now(timezone.utc)

    # Raider.IO sync
    rio_service = RaiderIOService()
    rio_data = rio_service.get_character_profile(char.character_name, char.realm, region)
    if rio_data:
        mplus, raid, recent_runs = parse_raiderio_profile(rio_data)
        char.mythic_plus_score = mplus
        char.raid_progress = raid
        char.last_raiderio_sync = now

        current_week = calculate_current_week(region)
        vault_entry = db.query(GreatVaultEntry).filter(
            GreatVaultEntry.character_id == char.id,
            GreatVaultEntry.week_number == current_week,
        ).first()

        if not vault_entry:
            vault_entry = GreatVaultEntry(character_id=char.id, week_number=current_week)
            db.add(vault_entry)

        if recent_runs:
            vault_entry.m_plus_runs = recent_runs

        try:
            auto_fill_raid_vault(char, vault_entry, current_week, region, db)
        except Exception as e:
            logger.warning(f"Background vault auto-fill failed: {e}")

        db.commit()
```

**Step 3: Wire into Flask app**

In `services/progress-api/app/__init__.py`, after `app` is fully configured, add:

```python
# Start background scheduler (only in non-testing mode)
if not app.config.get("TESTING"):
    from app.services.scheduler import init_scheduler, shutdown_scheduler
    init_scheduler(app)

    import atexit
    atexit.register(shutdown_scheduler)
```

**Step 4: Commit**

```bash
git add services/progress-api/app/services/scheduler.py services/progress-api/app/__init__.py services/progress-api/requirements.txt
git commit -m "feat: add APScheduler for hourly background character sync"
```

---

## Task 9: Run Migration on Dev Server and Deploy

**Step 1: Push all changes**

```bash
git push origin develop
```

**Step 2: Run migration on dev DB**

```bash
ssh root@46.225.219.187 "docker exec csw088gcgcs8kcoko0wkkowg-104355215392 alembic upgrade head"
```

**Step 3: Redeploy progress-api and web app from Coolify**

Trigger redeploy for progress-api (`csw088gcgcs8kcoko0wkkowg`) and web (`gckwswkocckck08wkgw8o4k4`).

**Step 4: Verify**

- Hit sync on a character
- Check vault page — raid slots should auto-fill
- Check logs for vault auto-fill messages

---

## Task 10: Test End-to-End

**Step 1: Manual testing checklist**

1. Sync a character that has raided this week
2. Verify vault raid slots show correct boss kill counts
3. Verify M+ vault slots still work (no regression)
4. Verify vault UI is read-only for raid fields
5. Wait 1 hour, verify background sync runs (check logs)
6. Add a new character mid-week — verify first-sync estimation works

**Step 2: Check WarcraftLogs integration**

```bash
# In the progress-api container or locally:
python -c "
from app.services.warcraftlogs_service import WarcraftLogsService
wcl = WarcraftLogsService()
# Test with a known character
result = wcl.get_character_parses('CharName', 'realm-slug', 'eu')
print(result)
"
```

---

## Summary

| Task | What | Effort |
|------|------|--------|
| 1 | Model fields + migration | Small |
| 2 | Blizzard encounters endpoint | Small |
| 3 | Encounter parser (snapshot/diff) | Medium |
| 4 | WarcraftLogs character queries | Medium |
| 5 | Vault auto-fill orchestrator | Medium |
| 6 | Integrate into sync endpoint | Small |
| 7 | Frontend: read-only vault raid | Small |
| 8 | APScheduler setup | Medium |
| 9 | Deploy + migrate | Small |
| 10 | End-to-end testing | Small |

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

    1. Blizzard encounters -> snapshot/diff for total kills (catches unlogged)
    2. WarcraftLogs -> timestamped kills for cross-validation
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
        if char.raid_snapshot_week == current_week and char.raid_snapshot:
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

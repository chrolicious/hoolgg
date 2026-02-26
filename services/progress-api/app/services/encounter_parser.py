"""Parse Blizzard raid encounter data and diff against snapshots for weekly vault auto-fill."""

import logging
from typing import Dict, Any, Optional
from datetime import datetime, timezone, date, timedelta

logger = logging.getLogger(__name__)

# Current raid instance name (Midnight Season 1)
# Update this when new raids release
CURRENT_RAID_INSTANCE = "Liberation of Undermine"


def parse_encounter_snapshot(encounter_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Parse Blizzard /encounters/raids response into a snapshot of kill counts.

    Returns a dict keyed by difficulty with boss kill data:
    {
        "normal": {"total": 8, "bosses": {"Boss1": {"kills": 3, "last_kill_timestamp": 123}}},
        "heroic": {"total": 6, "bosses": {...}},
        "mythic": {"total": 2, "bosses": {...}},
        "lfr":    {"total": 0, "bosses": {}},
    }
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

                diff_map = {
                    "normal": "normal",
                    "heroic": "heroic",
                    "mythic": "mythic",
                    "lfr": "lfr",
                }
                diff_key = diff_map.get(difficulty)
                if not diff_key:
                    continue

                encounters = mode.get("progress", {}).get("encounters", [])
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
    Diff current snapshot against a baseline to get this week's unique boss kills.

    Returns: {"raid_normal": N, "raid_heroic": N, "raid_mythic": N, "raid_lfr": N}
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

"""Season service - week calculation, targets, and crest caps.

Handles season-week date mapping, current week calculation based on region,
and weekly ilvl target / crest cap lookups.

Based on Larias' Raider's Guide for Midnight (updated Feb 25).
"""

import logging
from datetime import date, timedelta
from typing import Dict, Any, List, Tuple

from app.services.task_definitions import get_task_definitions

logger = logging.getLogger(__name__)


# Season 1 (Midnight) week start dates
# Guide splits pre-season into Early Access + 2 pre-season weeks,
# then Season 1 starts Week 1 (Heroic Week).
# Each tuple is (week_number, start_date)
SEASON_WEEK_DATES: List[Tuple[int, date]] = [
    (-2, date(2026, 2, 26)),   # Early Access
    (-1, date(2026, 3, 3)),    # Pre-Season Week 1 (M0 at reduced ilvl)
    (0, date(2026, 3, 10)),    # Pre-Season Week 2 (M0 at reduced ilvl)
    (1, date(2026, 3, 17)),    # S1W1 - Heroic Week, no M+
    (2, date(2026, 3, 24)),    # S1W2 - Mythic + M+ opens
    (3, date(2026, 3, 31)),    # S1W3 - Final Raid (March on Quel'danas)
    (4, date(2026, 4, 7)),
    (5, date(2026, 4, 14)),
    (6, date(2026, 4, 21)),
    (7, date(2026, 4, 28)),
    (8, date(2026, 5, 5)),     # Done with heroic crests
    (9, date(2026, 5, 12)),    # Week 9+ open-ended
]


# Weekly ilvl targets by week number
# Based on guide's "Ending item level" per week
# Pre-season targets are rough baseline estimates
WEEKLY_TARGETS: Dict[int, int] = {
    -2: 200,    # Early Access — fresh leveling
    -1: 230,    # Pre-Season W1 — M0 gear (3/6 Veteran 240)
    0: 240,     # Pre-Season W2 — M0 + crafts (246 crafts)
    1: 250,     # S1W1 — M0 full ilvl + crafts + Normal/Heroic
    2: 266,     # S1W2 — 15x 266 (3/6 Hero from +10s)
    3: 273,     # S1W3 — mix of 266/269/282/285
    4: 274,     # S1W4 — mix of 266/269/282/285
    5: 276,     # S1W5 — mix of 269/272h/282/285
    6: 278,     # S1W6 — mix of 269/272h/282/285
    7: 279,     # S1W7 — mix of 272h/279/282/285
    8: 281,     # S1W8 — mix of 276h/279/282/285
    9: 284,     # S1W9+ — push to 282/289
    10: 286,
    11: 287,
    12: 289,
}


# Cumulative crest budget targets per week (from guide)
# Format: {week: {"heroic": cumulative_spent, "mythic": cumulative_spent}}
CREST_BUDGET: Dict[int, Dict[str, int]] = {
    -2: {"heroic": 0, "mythic": 0},
    -1: {"heroic": 0, "mythic": 0},
    0: {"heroic": 0, "mythic": 0},
    1: {"heroic": 0, "mythic": 0},
    2: {"heroic": 220, "mythic": 0},       # 11x 3/6->4/6 upgrades
    3: {"heroic": 320, "mythic": 160},      # +2x 4/6->6/6 Hero, +1x Mythic 6/6
    4: {"heroic": 420, "mythic": 320},      # +2x Hero, +2x Mythic
    5: {"heroic": 520, "mythic": 480},      # +2x Hero, +craft+upgrade
    6: {"heroic": 560, "mythic": 620},      # +1x Hero (done), +Mythic
    7: {"heroic": 560, "mythic": 700},      # Heroic done, Mythic ongoing
    8: {"heroic": 560, "mythic": 780},
    9: {"heroic": 560, "mythic": 860},
}


def calculate_current_week(region: str = "us") -> int:
    """
    Calculate current season week based on today's date and region.

    Early Access (week -2) is a global simultaneous release (no regional offset).
    Weekly resets: US/TW on Tuesday, EU/KR on Wednesday (+1 day offset).

    Args:
        region: Server region ('us', 'eu', 'kr', 'tw')

    Returns:
        Current week number (-2 to 9+)
    """
    today = date.today()

    # EU/KR reset Wednesday = +1 day from Tuesday anchor dates
    # EXCEPT for Early Access which is a global simultaneous release
    regional_offset = timedelta(days=1) if region in ("eu", "kr") else timedelta(0)

    current_week = -2  # default to earliest
    for week_num, start_date in SEASON_WEEK_DATES:
        # Early Access is global - no regional offset
        offset = timedelta(0) if week_num == -2 else regional_offset

        if today >= (start_date + offset):
            current_week = week_num
        else:
            break

    logger.debug(f"Calculated current week: {current_week} for region={region}")
    return current_week


def get_weekly_tasks(week: int) -> Dict[str, Any]:
    """
    Get task definitions for a specific week.

    Delegates to task_definitions module.

    Args:
        week: Week number (-2 to 12)

    Returns:
        Dict with 'name', 'weekly' tasks list, and 'daily' tasks list
    """
    return get_task_definitions(week)


def get_weekly_target(week: int) -> int:
    """
    Get ilvl target for a given week.

    Args:
        week: Week number (-2 to 12)

    Returns:
        Target item level for the week
    """
    return WEEKLY_TARGETS.get(week, 289)


def get_weekly_crest_cap(week: int) -> int:
    """
    Get cumulative crest cap for a given week (100 per week).

    Guide: "The crest cap is raised from 90 to 100"
    Only season weeks (1+) contribute to the crest cap.

    Args:
        week: Week number (-2 to 12)

    Returns:
        Cumulative crest cap (100 * max(week, 0))
    """
    if week < 1:
        return 0
    return 100 * week

"""Service layer for progress-api"""

from app.services.blizzard_service import BlizzardService
from app.services.warcraftlogs_service import WarcraftLogsService
from app.services.permission_service import PermissionService
from app.services.cache_service import CacheService
from app.services.season_service import (
    calculate_current_week,
    get_weekly_tasks,
    get_weekly_target,
    get_weekly_crest_cap,
)
from app.services.gear_parser import (
    parse_equipment_response,
    calculate_avg_ilvl,
    create_empty_gear,
)
from app.services.stats_parser import parse_character_stats
from app.services.vault_calculator import calculate_vault_slots
from app.services.bis_sync_service import sync_bis_with_gear
from app.services.task_definitions import get_task_definitions, get_all_task_ids

__all__ = [
    "BlizzardService",
    "WarcraftLogsService",
    "PermissionService",
    "CacheService",
    "calculate_current_week",
    "get_weekly_tasks",
    "get_weekly_target",
    "get_weekly_crest_cap",
    "parse_equipment_response",
    "calculate_avg_ilvl",
    "create_empty_gear",
    "parse_character_stats",
    "calculate_vault_slots",
    "sync_bis_with_gear",
    "get_task_definitions",
    "get_all_task_ids",
]

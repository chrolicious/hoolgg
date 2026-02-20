"""Reference routes - static game data (no auth required)"""

from flask import Blueprint, jsonify
from app.services.blizzard_service import BlizzardService
from app.services.vault_calculator import (
    RAID_VAULT_ILVL,
    MPLUS_VAULT_ILVL,
    DELVE_VAULT_ILVL,
    RAID_SLOT_THRESHOLDS,
    MPLUS_SLOT_THRESHOLDS,
)
import logging

bp = Blueprint("reference", __name__, url_prefix="/reference")
logger = logging.getLogger(__name__)

# Available professions in WoW
AVAILABLE_PROFESSIONS = [
    {"name": "Alchemy", "type": "crafting"},
    {"name": "Blacksmithing", "type": "crafting"},
    {"name": "Enchanting", "type": "crafting"},
    {"name": "Engineering", "type": "crafting"},
    {"name": "Inscription", "type": "crafting"},
    {"name": "Jewelcrafting", "type": "crafting"},
    {"name": "Leatherworking", "type": "crafting"},
    {"name": "Tailoring", "type": "crafting"},
    {"name": "Herbalism", "type": "gathering"},
    {"name": "Mining", "type": "gathering"},
    {"name": "Skinning", "type": "gathering"},
    {"name": "Cooking", "type": "secondary"},
    {"name": "Fishing", "type": "secondary"},
]

# Gear upgrade tracks and ilvl ranges
GEAR_UPGRADE_GUIDE = {
    "tracks": [
        {
            "name": "Explorer",
            "ilvl_range": [200, 213],
            "upgrades": 8,
            "crest": None,
            "source": "Open World, Normal Dungeons",
        },
        {
            "name": "Adventurer",
            "ilvl_range": [213, 226],
            "upgrades": 8,
            "crest": "Weathered",
            "source": "Heroic Dungeons, World Quests",
        },
        {
            "name": "Veteran",
            "ilvl_range": [226, 239],
            "upgrades": 8,
            "crest": "Carved",
            "source": "Mythic 0, LFR Raid",
        },
        {
            "name": "Champion",
            "ilvl_range": [239, 252],
            "upgrades": 8,
            "crest": "Runed",
            "source": "Normal Raid, M+ (2-5)",
        },
        {
            "name": "Hero",
            "ilvl_range": [252, 265],
            "upgrades": 6,
            "crest": "Gilded",
            "source": "Heroic Raid, M+ (6-9)",
        },
        {
            "name": "Myth",
            "ilvl_range": [272, 289],
            "upgrades": 6,
            "crest": "Gilded",
            "source": "Mythic Raid, M+ (10+), Crafted",
        },
    ],
    "crest_costs": {
        "per_upgrade": {
            "Explorer": 0,
            "Adventurer": 15,
            "Veteran": 15,
            "Champion": 15,
            "Hero": 15,
            "Myth": 10,
        },
    },
}


@bp.route("/gear-guide", methods=["GET"])
def get_gear_guide():
    """
    Get static gear upgrade guide data.

    Returns upgrade tracks, ilvl ranges, crest requirements, and costs.
    """
    return jsonify(GEAR_UPGRADE_GUIDE), 200


@bp.route("/vault-ilvls", methods=["GET"])
def get_vault_ilvls():
    """
    Get Great Vault reward ilvl tables.

    Returns ilvl rewards for raid, M+, and delves, plus slot thresholds.
    """
    return jsonify({
        "raid": {
            "ilvls": RAID_VAULT_ILVL,
            "slot_thresholds": RAID_SLOT_THRESHOLDS,
            "description": "Boss kills needed per difficulty for each vault slot",
        },
        "mythic_plus": {
            "ilvls": {str(k): v for k, v in MPLUS_VAULT_ILVL.items()},
            "slot_thresholds": MPLUS_SLOT_THRESHOLDS,
            "description": "Key level completed determines vault reward ilvl",
        },
        "delves": {
            "ilvls": {str(k): v for k, v in DELVE_VAULT_ILVL.items()},
            "slot_thresholds": [1],
            "description": "Highest delve tier completed determines vault reward ilvl",
        },
    }), 200


@bp.route("/professions", methods=["GET"])
def get_professions():
    """
    Get list of available professions.

    Returns professions with their type (crafting, gathering, secondary).
    """
    return jsonify({
        "professions": AVAILABLE_PROFESSIONS,
    }), 200


@bp.route("/item/<int:item_id>/icon", methods=["GET"])
def get_item_icon(item_id: int):
    """
    Proxy item icon URL from Blizzard API.

    Looks up the icon URL for a Blizzard item ID and returns it.
    This avoids exposing the Blizzard API token to the client.
    """
    blizzard = BlizzardService()

    try:
        icon_url = blizzard.get_item_media(item_id)

        if not icon_url:
            return jsonify({"error": "Item icon not found"}), 404

        return jsonify({
            "item_id": item_id,
            "icon_url": icon_url,
        }), 200

    except Exception as e:
        logger.error(f"Failed to fetch item icon for {item_id}: {e}")
        return jsonify({"error": "Failed to fetch item icon"}), 500

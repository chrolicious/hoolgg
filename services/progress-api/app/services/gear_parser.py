"""Gear parser service - parse Blizzard API equipment responses.

Handles mapping Blizzard API slot names to local slot names,
parsing equipment responses into a structured 16-slot gear format,
calculating average item level, and creating empty gear structures.
"""

import logging
from typing import Dict, Any, Optional, Tuple

logger = logging.getLogger(__name__)


# Map Blizzard API slot type names to local slot names
SLOT_MAP: Dict[str, str] = {
    "HEAD": "head",
    "NECK": "neck",
    "SHOULDER": "shoulder",
    "BACK": "back",
    "CHEST": "chest",
    "WRIST": "wrist",
    "HANDS": "hands",
    "WAIST": "waist",
    "LEGS": "legs",
    "FEET": "feet",
    "FINGER_1": "ring1",
    "FINGER_2": "ring2",
    "TRINKET_1": "trinket1",
    "TRINKET_2": "trinket2",
    "MAIN_HAND": "main_hand",
    "OFF_HAND": "off_hand",
}

# All 16 gear slots
ALL_SLOTS = [
    "head", "neck", "shoulder", "back", "chest", "wrist",
    "hands", "waist", "legs", "feet", "ring1", "ring2",
    "trinket1", "trinket2", "main_hand", "off_hand",
]


def _parse_track(display_string: str) -> Optional[str]:
    """Extract upgrade track name from Blizzard name_description display_string."""
    if not display_string:
        return None
    s = display_string.lower()
    if "myth" in s:
        return "Myth"
    if "hero" in s:
        return "Hero"
    if "champion" in s:
        return "Champion"
    if "veteran" in s:
        return "Veteran"
    if "explorer" in s:
        return "Explorer"
    if "adventurer" in s:
        return "Adventurer"
    return None


def create_empty_gear() -> Dict[str, Dict[str, Any]]:
    """
    Create a default empty 16-slot gear structure.

    Returns:
        Dict mapping slot name to slot data with default values
    """
    return {
        slot: {
            "ilvl": 0,
            "track": None,
            "item_name": "",
            "item_id": 0,
            "quality": "COMMON",
            "sockets": 0,
            "enchanted": False,
            "icon_id": 0,
            "icon_url": "",
        }
        for slot in ALL_SLOTS
    }


def parse_equipment_response(
    api_data: Optional[Dict[str, Any]],
    existing_gear: Dict[str, Dict[str, Any]],
) -> Tuple[Dict[str, Dict[str, Any]], Optional[float]]:
    """
    Parse Blizzard API equipment response into our gear format.

    Updates existing_gear in place, preserving track values.
    Handles two-handed weapons by duplicating ilvl to off_hand slot.

    Args:
        api_data: Raw equipment data from Blizzard API
        existing_gear: Current gear structure to update

    Returns:
        Tuple of (updated gear dict, equipped_avg_ilvl or None)
    """
    if not api_data or "equipped_items" not in api_data:
        logger.warning("No equipped_items found in API response")
        return existing_gear, None

    equipped_avg_ilvl = None

    # Clear off_hand first - will be set by either actual OH item or 2H weapon
    existing_gear["off_hand"]["ilvl"] = 0
    existing_gear["off_hand"]["item_name"] = ""
    existing_gear["off_hand"]["item_id"] = 0

    for item in api_data["equipped_items"]:
        slot_type = item.get("slot", {}).get("type", "")
        local_slot = SLOT_MAP.get(slot_type)

        if not local_slot or local_slot not in existing_gear:
            continue

        # Extract ilvl - Blizzard API returns {"value": 250, "display_string": "..."}
        ilvl_data = item.get("level", 0)

        if isinstance(ilvl_data, dict):
            ilvl = ilvl_data.get("value", 0)
        elif isinstance(ilvl_data, (int, float)):
            ilvl = int(ilvl_data)
        else:
            ilvl = 0

        # Extract item details
        item_id = item.get("item", {}).get("id", 0)
        quality = item.get("quality", {}).get("type", "COMMON")
        sockets = len(item.get("sockets", []))
        enchantments = item.get("enchantments", [])

        # Get media/icon information
        media_obj = item.get("media", {})
        icon_id = media_obj.get("id", 0) if isinstance(media_obj, dict) else 0

        # Preserve icon_url if the item hasn't changed
        old_item_id = existing_gear[local_slot].get("item_id", 0)
        old_icon_url = existing_gear[local_slot].get("icon_url", "")

        # Store media href for potential deferred icon fetching
        media_key = media_obj.get("key", {}) if isinstance(media_obj, dict) else {}
        media_href = media_key.get("href", "") if isinstance(media_key, dict) else ""

        # Parse upgrade track from name_description
        name_desc = item.get("name_description", {})
        if isinstance(name_desc, dict):
            display_string = name_desc.get("display_string", "")
            track = _parse_track(display_string)
        else:
            track = None

        existing_gear[local_slot]["ilvl"] = ilvl
        existing_gear[local_slot]["item_name"] = item.get("name", "")
        existing_gear[local_slot]["item_id"] = item_id
        existing_gear[local_slot]["quality"] = quality
        existing_gear[local_slot]["sockets"] = sockets
        existing_gear[local_slot]["enchanted"] = len(enchantments) > 0
        existing_gear[local_slot]["icon_id"] = icon_id
        existing_gear[local_slot]["media_href"] = media_href

        # Preserve icon_url if same item, otherwise clear it so it gets re-fetched
        existing_gear[local_slot]["icon_url"] = old_icon_url if old_item_id == item_id else ""

        # Set track from name_description if parsed, otherwise clear it
        existing_gear[local_slot]["track"] = track  # None if not found

        # Check if this is a two-handed weapon
        if local_slot == "main_hand":
            inventory_type = item.get("inventory_type", {})

            if isinstance(inventory_type, dict):
                inv_type_name = inventory_type.get("type", "")
            else:
                inv_type_name = str(inventory_type)

            # Handle 2H weapons - they count as both MH and OH for ilvl calculation
            two_hand_types = ("TWOHWEAPON", "TWO_HAND", "TWOHAND", "RANGED")
            if any(t in inv_type_name for t in two_hand_types):
                existing_gear["off_hand"]["ilvl"] = ilvl
                existing_gear["off_hand"]["item_name"] = f"(2H: {item.get('name', '')})"
                existing_gear["off_hand"]["item_id"] = item_id
                existing_gear["off_hand"]["quality"] = quality

    logger.info(
        f"Parsed equipment: {sum(1 for s in existing_gear.values() if s.get('ilvl', 0) > 0)} slots populated"
    )
    return existing_gear, equipped_avg_ilvl


def calculate_avg_ilvl(gear: Dict[str, Dict[str, Any]]) -> float:
    """
    Calculate average item level across all 16 slots.

    Args:
        gear: Gear dict mapping slot names to slot data

    Returns:
        Average item level rounded to 1 decimal place
    """
    total = 0
    for slot_name, slot_data in gear.items():
        if isinstance(slot_data, dict):
            ilvl = slot_data.get("ilvl", 0)
            if isinstance(ilvl, (int, float)):
                total += ilvl

    avg = round(total / 16, 1) if gear else 0.0
    return avg

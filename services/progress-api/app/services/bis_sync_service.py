"""BiS sync service - synchronize Best-in-Slot lists with equipped gear.

After a gear sync from the Blizzard API, this service checks BiS list items
against the character's currently equipped gear. If an item_id matches,
the BiS item is marked as obtained and synced.
"""

import logging
from typing import Set

from sqlalchemy.orm import Session

from app.models.bis_item import BisItem
from app.models.character_progress import CharacterProgress

logger = logging.getLogger(__name__)


def sync_bis_with_gear(character_id: int, db_session: Session) -> int:
    """
    Sync BiS list items against equipped gear for a character.

    After a gear sync, checks each BiS list entry's item_id against
    the character's parsed_gear. If the item_id matches any equipped
    item, the BiS entry is marked as obtained=True and synced=True.

    Args:
        character_id: ID of the CharacterProgress record
        db_session: SQLAlchemy database session

    Returns:
        Number of BiS items marked as obtained
    """
    # Fetch character with gear data
    character = db_session.query(CharacterProgress).get(character_id)
    if not character:
        logger.warning(f"Character {character_id} not found for BiS sync")
        return 0

    parsed_gear = character.parsed_gear
    if not parsed_gear or not isinstance(parsed_gear, dict):
        logger.debug(f"No parsed gear for character {character_id}, skipping BiS sync")
        return 0

    # Collect all equipped item IDs
    equipped_item_ids: Set[int] = set()
    for slot_data in parsed_gear.values():
        if isinstance(slot_data, dict):
            item_id = slot_data.get("item_id")
            if item_id:
                try:
                    equipped_item_ids.add(int(item_id))
                except (ValueError, TypeError):
                    continue

    if not equipped_item_ids:
        logger.debug(f"No equipped item IDs for character {character_id}")
        return 0

    # Fetch BiS items for this character
    bis_items = (
        db_session.query(BisItem)
        .filter(BisItem.character_id == character_id)
        .all()
    )

    if not bis_items:
        logger.debug(f"No BiS items for character {character_id}")
        return 0

    # Check each BiS item against equipped gear
    synced_count = 0
    for bis_item in bis_items:
        if bis_item.item_id and int(bis_item.item_id) in equipped_item_ids:
            if not bis_item.obtained or not bis_item.synced:
                bis_item.obtained = True
                bis_item.synced = True
                synced_count += 1
                logger.debug(
                    f"BiS item '{bis_item.item_name}' (id={bis_item.item_id}) "
                    f"marked as obtained for character {character_id}"
                )

    if synced_count > 0:
        db_session.flush()
        logger.info(
            f"Synced {synced_count} BiS items as obtained for character {character_id}"
        )

    return synced_count

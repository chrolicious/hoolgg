"""CharacterProgress model - tracks character gear and progression"""

from sqlalchemy import Column, String, Integer, DateTime, JSON, Float, ForeignKey, Index
from sqlalchemy.sql import func
from app.models import Base


class CharacterProgress(Base):
    """Character progress tracking table"""

    __tablename__ = "character_progress"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    character_name = Column(String(255), nullable=False, index=True)
    realm = Column(String(255), nullable=False, index=True)
    guild_id = Column(Integer, nullable=True, index=True)

    # Character info
    class_name = Column(String(50), nullable=True)
    spec = Column(String(50), nullable=True)
    role = Column(String(20), nullable=True)  # Tank, Healer, DPS
    level = Column(Integer, nullable=True)
    avatar_url = Column(String(512), nullable=True)

    # Roster tracking
    user_bnet_id = Column(Integer, nullable=True, index=True)
    display_order = Column(Integer, nullable=True, server_default="0")

    # Gear progression
    current_ilvl = Column(Float, nullable=True)
    gear_details = Column(JSON, nullable=True)  # Full gear breakdown from Blizzard API
    parsed_gear = Column(JSON, nullable=True)  # Processed gear data
    character_stats = Column(JSON, nullable=True)  # Character stats
    
    # Raider.IO tracking
    mythic_plus_score = Column(Float, nullable=True)
    raid_progress = Column(JSON, nullable=True)
    last_raiderio_sync = Column(DateTime(timezone=True), nullable=True)

    # Metadata
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_gear_sync = Column(DateTime(timezone=True), nullable=True)

    # Composite index for character lookup
    __table_args__ = (
        Index('idx_character_user', 'character_name', 'realm', 'user_bnet_id'),
    )

    def __repr__(self):
        return f"<CharacterProgress(id={self.id}, character={self.character_name}, ilvl={self.current_ilvl})>"

    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "character_name": self.character_name,
            "realm": self.realm,
            "guild_id": self.guild_id,
            "class_name": self.class_name,
            "spec": self.spec,
            "role": self.role,
            "level": self.level,
            "avatar_url": self.avatar_url,
            "user_bnet_id": self.user_bnet_id,
            "display_order": self.display_order,
            "current_ilvl": self.current_ilvl,
            "gear_details": self.gear_details,
            "parsed_gear": self.parsed_gear,
            "character_stats": self.character_stats,
            "mythic_plus_score": self.mythic_plus_score,
            "raid_progress": self.raid_progress,
            "last_raiderio_sync": self.last_raiderio_sync.isoformat() if self.last_raiderio_sync else None,
            "last_updated": self.last_updated.isoformat() if self.last_updated else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_gear_sync": self.last_gear_sync.isoformat() if self.last_gear_sync else None,
        }

    def get_gear_priorities(self):
        """
        Analyze gear and return priority upgrade slots

        Returns list of slots sorted by lowest iLvl
        """
        if not self.gear_details or not isinstance(self.gear_details, dict):
            return []

        equipped = self.gear_details.get("equipped_items", [])
        if not equipped:
            return []

        # Extract item levels per slot
        slot_levels = []
        for item in equipped:
            slot_name = item.get("slot", {}).get("name", "Unknown")
            item_level = item.get("level", {}).get("value", 0)
            slot_levels.append({
                "slot": slot_name,
                "ilvl": item_level,
                "name": item.get("name", "Unknown Item")
            })

        # Sort by lowest iLvl first
        slot_levels.sort(key=lambda x: x["ilvl"])

        return slot_levels[:5]  # Return top 5 priority slots

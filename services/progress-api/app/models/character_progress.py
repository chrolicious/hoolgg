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
    guild_id = Column(Integer, nullable=False, index=True)

    # Character info
    class_name = Column(String(50), nullable=True)
    spec = Column(String(50), nullable=True)
    role = Column(String(20), nullable=True)  # Tank, Healer, DPS

    # Gear progression
    current_ilvl = Column(Float, nullable=True)
    gear_details = Column(JSON, nullable=True)  # Full gear breakdown from Blizzard API

    # Metadata
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Composite index for character lookup
    __table_args__ = (
        Index('idx_character_guild', 'character_name', 'realm', 'guild_id'),
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
            "current_ilvl": self.current_ilvl,
            "gear_details": self.gear_details,
            "last_updated": self.last_updated.isoformat() if self.last_updated else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
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

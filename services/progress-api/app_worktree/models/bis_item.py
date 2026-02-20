"""BisItem model - tracks Best-in-Slot gear targets per character"""

from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.models import Base


class BisItem(Base):
    """Best-in-Slot item tracking per character"""

    __tablename__ = "bis_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    character_id = Column(Integer, ForeignKey("character_progress.id", ondelete="CASCADE"), nullable=False, index=True)
    slot = Column(String(50), nullable=False)  # e.g., "Head", "Shoulders", "Chest"
    item_name = Column(String(255), nullable=False)
    item_id = Column(Integer, nullable=True)  # Blizzard item ID
    target_ilvl = Column(Integer, nullable=True)
    obtained = Column(Boolean, server_default="false")
    synced = Column(Boolean, server_default="false")  # Whether auto-synced from Blizzard API

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    def __repr__(self):
        return f"<BisItem(character_id={self.character_id}, slot={self.slot}, item={self.item_name}, obtained={self.obtained})>"

    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "character_id": self.character_id,
            "slot": self.slot,
            "item_name": self.item_name,
            "item_id": self.item_id,
            "target_ilvl": self.target_ilvl,
            "obtained": self.obtained,
            "synced": self.synced,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

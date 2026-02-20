"""CrestEntry model - tracks weekly crest collection per character"""

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from app.models import Base


class CrestEntry(Base):
    """Crest collection tracking per character per week"""

    __tablename__ = "crest_entries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    character_id = Column(Integer, ForeignKey("character_progress.id", ondelete="CASCADE"), nullable=False, index=True)
    crest_type = Column(String(50), nullable=False)  # e.g., "Weathered", "Carved", "Runed", "Gilded"
    week_number = Column(Integer, nullable=False)
    collected = Column(Integer, server_default="0")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        UniqueConstraint('character_id', 'crest_type', 'week_number', name='uq_crest_character_type_week'),
    )

    def __repr__(self):
        return f"<CrestEntry(character_id={self.character_id}, type={self.crest_type}, week={self.week_number}, collected={self.collected})>"

    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "character_id": self.character_id,
            "crest_type": self.crest_type,
            "week_number": self.week_number,
            "collected": self.collected,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

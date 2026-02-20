"""ProfessionProgress model - tracks weekly profession task completions"""

from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from app.models import Base


class ProfessionProgress(Base):
    """Weekly profession progress tracking per character"""

    __tablename__ = "profession_progress"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    character_id = Column(Integer, ForeignKey("character_progress.id", ondelete="CASCADE"), nullable=False, index=True)
    profession_name = Column(String(100), nullable=False)
    week_number = Column(Integer, nullable=False)

    # Weekly profession tasks
    weekly_quest = Column(Boolean, server_default="false")
    patron_orders = Column(Boolean, server_default="false")
    treatise = Column(Boolean, server_default="false")
    knowledge_points = Column(Integer, server_default="0")
    concentration = Column(Integer, server_default="0")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        UniqueConstraint('character_id', 'profession_name', 'week_number', name='uq_profession_character_name_week'),
    )

    def __repr__(self):
        return f"<ProfessionProgress(character_id={self.character_id}, profession={self.profession_name}, week={self.week_number})>"

    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "character_id": self.character_id,
            "profession_name": self.profession_name,
            "week_number": self.week_number,
            "weekly_quest": self.weekly_quest,
            "patron_orders": self.patron_orders,
            "treatise": self.treatise,
            "knowledge_points": self.knowledge_points,
            "concentration": self.concentration,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

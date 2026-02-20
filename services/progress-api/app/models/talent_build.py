"""TalentBuild model - stores talent build configurations per character"""

from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.models import Base


class TalentBuild(Base):
    """Talent build configuration per character"""

    __tablename__ = "talent_builds"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    character_id = Column(Integer, ForeignKey("character_progress.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(50), nullable=False)  # e.g., "Raid", "M+", "PvP"
    name = Column(String(255), nullable=False)  # User-defined build name
    talent_string = Column(Text, nullable=False)  # Blizzard talent export string

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    def __repr__(self):
        return f"<TalentBuild(character_id={self.character_id}, category={self.category}, name={self.name})>"

    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "character_id": self.character_id,
            "category": self.category,
            "name": self.name,
            "talent_string": self.talent_string,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

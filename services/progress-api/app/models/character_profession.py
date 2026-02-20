"""CharacterProfession model - tracks which professions a character has"""

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from app.models import Base


class CharacterProfession(Base):
    """Character profession assignment (max 2 per character)"""

    __tablename__ = "character_professions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    character_id = Column(Integer, ForeignKey("character_progress.id", ondelete="CASCADE"), nullable=False, index=True)
    profession_name = Column(String(100), nullable=False)
    slot_index = Column(Integer, server_default="0")  # 0 = primary, 1 = secondary

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint('character_id', 'profession_name', name='uq_character_profession'),
    )

    def __repr__(self):
        return f"<CharacterProfession(character_id={self.character_id}, profession={self.profession_name})>"

    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "character_id": self.character_id,
            "profession_name": self.profession_name,
            "slot_index": self.slot_index,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

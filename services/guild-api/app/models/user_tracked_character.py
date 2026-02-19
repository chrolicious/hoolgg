"""User tracked character model"""

from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base


class UserTrackedCharacter(Base):
    """Characters that users track for guild progress"""

    __tablename__ = 'user_tracked_characters'

    id = Column(Integer, primary_key=True, autoincrement=True)
    guild_id = Column(Integer, ForeignKey('guilds.id', ondelete='CASCADE'), nullable=False)
    bnet_id = Column(Integer, nullable=False)
    character_name = Column(String(50), nullable=False)
    realm = Column(String(100), nullable=False)
    is_main = Column(Boolean, default=False, nullable=False)
    tracked = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    guild = relationship("Guild", back_populates="tracked_characters")

    # Constraints
    __table_args__ = (
        UniqueConstraint('guild_id', 'bnet_id', 'character_name', 'realm', name='uix_guild_user_character'),
    )

    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': str(self.id),
            'guild_id': str(self.guild_id),
            'bnet_id': self.bnet_id,
            'character_name': self.character_name,
            'realm': self.realm,
            'is_main': self.is_main,
            'tracked': self.tracked,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
        }

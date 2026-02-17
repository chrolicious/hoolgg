"""GuildMessage model - stores weekly guidance messages from GMs"""

from sqlalchemy import Column, String, Integer, DateTime, Text
from sqlalchemy.sql import func
from app.models import Base


class GuildMessage(Base):
    """Guild message table - weekly guidance from GM"""

    __tablename__ = "guild_messages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    guild_id = Column(Integer, nullable=False, index=True, unique=True)  # One message per guild
    gm_message = Column(Text, nullable=True)
    created_by = Column(Integer, nullable=True)  # bnet_id of creator

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    def __repr__(self):
        return f"<GuildMessage(guild_id={self.guild_id}, updated={self.updated_at})>"

    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "guild_id": self.guild_id,
            "gm_message": self.gm_message,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

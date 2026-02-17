"""Guild member model - tracks character-to-guild-to-rank associations"""

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models import Base


class GuildMember(Base):
    """Guild member table - character membership and rank tracking"""

    __tablename__ = "guild_members"

    character_name = Column(String(255), primary_key=True, index=True)
    guild_id = Column(Integer, ForeignKey("guilds.id"), nullable=True, index=True)
    bnet_id = Column(Integer, ForeignKey("users.bnet_id"), nullable=False, index=True)
    rank_id = Column(Integer, nullable=False)  # 0=GM, 1=Officer, etc.
    rank_name = Column(String(255), nullable=False)  # "Guild Master", "Officer", etc.
    last_sync = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    guild = relationship("Guild", back_populates="members")

    def __repr__(self):
        return f"<GuildMember(character={self.character_name}, guild_id={self.guild_id}, rank={self.rank_name})>"

    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            "character_name": self.character_name,
            "guild_id": self.guild_id,
            "bnet_id": self.bnet_id,
            "rank_id": self.rank_id,
            "rank_name": self.rank_name,
            "last_sync": self.last_sync.isoformat() if self.last_sync else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

"""Guild permission model - rank-based access control configuration"""

from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models import Base


class GuildPermission(Base):
    """Guild permissions table - configures which ranks can access which tools"""

    __tablename__ = "guild_permissions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    guild_id = Column(Integer, ForeignKey("guilds.id"), nullable=False, index=True)
    tool_name = Column(
        String(100), nullable=False
    )  # "progress", "recruitment", "raid_planning"
    min_rank_id = Column(
        Integer, nullable=False
    )  # Minimum rank required (0=GM, 9=everyone)
    enabled = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    guild = relationship("Guild", back_populates="permissions")

    def __repr__(self):
        return f"<GuildPermission(guild_id={self.guild_id}, tool={self.tool_name}, min_rank={self.min_rank_id}, enabled={self.enabled})>"

    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "guild_id": self.guild_id,
            "tool_name": self.tool_name,
            "min_rank_id": self.min_rank_id,
            "enabled": self.enabled,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

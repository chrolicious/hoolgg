"""Guild model - represents WoW guilds with hool.gg instances"""

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models import Base


class Guild(Base):
    """Guild table - one per guild instance on hool.gg"""

    __tablename__ = "guilds"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False, index=True)
    realm = Column(String(255), nullable=False, index=True)
    gm_bnet_id = Column(Integer, ForeignKey("users.bnet_id"), nullable=False)
    crest_data = Column(JSONB, nullable=True)
    crest_updated_at = Column(DateTime(timezone=True), nullable=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True)  # Soft delete
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    members = relationship("GuildMember", back_populates="guild")
    permissions = relationship("GuildPermission", back_populates="guild")
    tracked_characters = relationship("UserTrackedCharacter", back_populates="guild", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Guild(id={self.id}, name={self.name}, realm={self.realm})>"

    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "name": self.name,
            "realm": self.realm,
            "gm_bnet_id": self.gm_bnet_id,
            "crest_data": self.crest_data,
            "crest_updated_at": self.crest_updated_at.isoformat() if self.crest_updated_at else None,
            "deleted_at": self.deleted_at.isoformat() if self.deleted_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

"""GreatVaultEntry model - tracks Great Vault progress per character per week"""

from sqlalchemy import Column, String, Integer, DateTime, JSON, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from app.models import Base


class GreatVaultEntry(Base):
    """Great Vault weekly progress tracking per character"""

    __tablename__ = "great_vault_entries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    character_id = Column(Integer, ForeignKey("character_progress.id", ondelete="CASCADE"), nullable=False, index=True)
    week_number = Column(Integer, nullable=False)

    # Raid progress (boss kill counts per difficulty)
    raid_lfr = Column(Integer, server_default="0")
    raid_normal = Column(Integer, server_default="0")
    raid_heroic = Column(Integer, server_default="0")
    raid_mythic = Column(Integer, server_default="0")

    # M+ progress
    m_plus_runs = Column(JSON, nullable=True)  # List of completed M+ key levels

    # Delves progress
    highest_delve = Column(Integer, server_default="0")  # Legacy - kept for backward compatibility
    delve_runs = Column(JSON, nullable=True)  # List of completed delve tiers

    # World/PvP vault
    world_vault = Column(JSON, nullable=True)  # Flexible structure for world activities

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        UniqueConstraint('character_id', 'week_number', name='uq_vault_character_week'),
    )

    def __repr__(self):
        return f"<GreatVaultEntry(character_id={self.character_id}, week={self.week_number})>"

    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "character_id": self.character_id,
            "week_number": self.week_number,
            "raid_lfr": self.raid_lfr,
            "raid_normal": self.raid_normal,
            "raid_heroic": self.raid_heroic,
            "raid_mythic": self.raid_mythic,
            "m_plus_runs": self.m_plus_runs,
            "highest_delve": self.highest_delve,  # Legacy field
            "delve_runs": self.delve_runs,
            "world_vault": self.world_vault,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

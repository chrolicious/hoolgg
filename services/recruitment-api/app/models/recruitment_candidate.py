"""RecruitmentCandidate model - stores candidate data per guild"""

from sqlalchemy import Column, String, Integer, DateTime, Float, Text, Index
from sqlalchemy.sql import func
from app.models import Base


class RecruitmentCandidate(Base):
    """Recruitment candidates - guild-scoped candidate tracking"""

    __tablename__ = "recruitment_candidates"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    guild_id = Column(Integer, nullable=False, index=True)

    # Candidate identity
    candidate_name = Column(String(255), nullable=False)
    realm = Column(String(255), nullable=True)
    region = Column(String(10), nullable=True, default="us")

    # Character details
    character_class = Column(String(50), nullable=True)
    role = Column(String(50), nullable=True)  # Tank, Healer, Melee DPS, Ranged DPS
    spec = Column(String(50), nullable=True)
    ilvl = Column(Integer, nullable=True)

    # Progression data
    raid_progress = Column(String(255), nullable=True)  # "8/8 M", "6/8 M", etc.
    mythic_plus_rating = Column(Integer, nullable=True)
    raider_io_score = Column(Integer, nullable=True)

    # Source tracking
    source = Column(String(50), nullable=False, default="manual")  # raider_io, wow_progress, discord, manual
    external_url = Column(String(512), nullable=True)  # Link to external profile

    # Guild-specific tracking
    rating = Column(Integer, nullable=True)  # 1-5 stars
    notes = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="pending")  # pending, interested, rejected, hired, etc.
    category_id = Column(Integer, nullable=True)  # Links to recruitment_categories

    # Contact tracking
    contacted = Column(Integer, nullable=False, default=0)  # Boolean as int
    contacted_date = Column(DateTime(timezone=True), nullable=True)

    # Parse data (from WarcraftLogs)
    avg_parse_percentile = Column(Float, nullable=True)
    best_parse_percentile = Column(Float, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Indexes for performance
    __table_args__ = (
        Index("idx_guild_candidate", "guild_id", "candidate_name", "realm"),
        Index("idx_guild_status", "guild_id", "status"),
        Index("idx_guild_category", "guild_id", "category_id"),
    )

    def __repr__(self):
        return f"<RecruitmentCandidate(id={self.id}, name={self.candidate_name}, guild_id={self.guild_id})>"

    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "guild_id": self.guild_id,
            "candidate_name": self.candidate_name,
            "realm": self.realm,
            "region": self.region,
            "character_class": self.character_class,
            "role": self.role,
            "spec": self.spec,
            "ilvl": self.ilvl,
            "raid_progress": self.raid_progress,
            "mythic_plus_rating": self.mythic_plus_rating,
            "raider_io_score": self.raider_io_score,
            "source": self.source,
            "external_url": self.external_url,
            "rating": self.rating,
            "notes": self.notes,
            "status": self.status,
            "category_id": self.category_id,
            "contacted": bool(self.contacted),
            "contacted_date": self.contacted_date.isoformat() if self.contacted_date else None,
            "avg_parse_percentile": self.avg_parse_percentile,
            "best_parse_percentile": self.best_parse_percentile,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

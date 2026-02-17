"""RecruitmentHistory model - track communication with candidates"""

from sqlalchemy import Column, String, Integer, DateTime, Text, Index
from sqlalchemy.sql import func
from app.models import Base


class RecruitmentHistory(Base):
    """Recruitment history - logs of communication with candidates"""

    __tablename__ = "recruitment_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    guild_id = Column(Integer, nullable=False, index=True)
    candidate_id = Column(Integer, nullable=False, index=True)

    # Contact details
    contacted_date = Column(DateTime(timezone=True), nullable=False)
    method = Column(String(50), nullable=False)  # email, discord, in-game, etc.
    message = Column(Text, nullable=True)
    response_received = Column(Integer, nullable=False, default=0)  # Boolean as int

    # Who logged this
    logged_by_bnet_id = Column(Integer, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Indexes
    __table_args__ = (
        Index("idx_guild_candidate_history", "guild_id", "candidate_id"),
    )

    def __repr__(self):
        return f"<RecruitmentHistory(id={self.id}, candidate_id={self.candidate_id})>"

    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "guild_id": self.guild_id,
            "candidate_id": self.candidate_id,
            "contacted_date": self.contacted_date.isoformat() if self.contacted_date else None,
            "method": self.method,
            "message": self.message,
            "response_received": bool(self.response_received),
            "logged_by_bnet_id": self.logged_by_bnet_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

"""WeeklyTarget model - defines iLvl targets for each expansion week"""

from sqlalchemy import Column, String, Integer, Float, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from app.models import Base


class WeeklyTarget(Base):
    """Weekly iLvl target table - defines progression roadmap"""

    __tablename__ = "weekly_targets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    expansion_id = Column(String(50), nullable=False, index=True)  # e.g., "12.0", "13.0"
    week = Column(Integer, nullable=False)  # Week number (0 = pre-season, 1-12 = season)
    ilvl_target = Column(Float, nullable=False)
    description = Column(String(500), nullable=True)  # Optional milestone description

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Ensure one target per expansion/week combination
    __table_args__ = (
        UniqueConstraint('expansion_id', 'week', name='uq_expansion_week'),
    )

    def __repr__(self):
        return f"<WeeklyTarget(expansion={self.expansion_id}, week={self.week}, target={self.ilvl_target})>"

    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "expansion_id": self.expansion_id,
            "week": self.week,
            "ilvl_target": self.ilvl_target,
            "description": self.description,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

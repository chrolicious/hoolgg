"""SeasonConfig model - stores season/expansion week configuration"""

from sqlalchemy import Column, String, Integer, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from app.models import Base


class SeasonConfig(Base):
    """Season configuration - maps expansion weeks to calendar dates and caps"""

    __tablename__ = "season_config"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    expansion_id = Column(Integer, nullable=False, index=True)
    region = Column(String(10), server_default="us")  # 'us', 'eu', 'kr', 'tw'
    week_number = Column(Integer, nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=False)
    crest_cap_per_week = Column(Integer, server_default="90")

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint('expansion_id', 'region', 'week_number', name='uq_season_expansion_region_week'),
    )

    def __repr__(self):
        return f"<SeasonConfig(expansion={self.expansion_id}, region={self.region}, week={self.week_number})>"

    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "expansion_id": self.expansion_id,
            "region": self.region,
            "week_number": self.week_number,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "crest_cap_per_week": self.crest_cap_per_week,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

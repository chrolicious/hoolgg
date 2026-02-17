"""RecruitmentCategory model - custom and default categories per guild"""

from sqlalchemy import Column, String, Integer, DateTime, Index
from sqlalchemy.sql import func
from app.models import Base


class RecruitmentCategory(Base):
    """Recruitment categories - organize candidates (Pending, Interested, etc.)"""

    __tablename__ = "recruitment_categories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    guild_id = Column(Integer, nullable=False, index=True)
    category_name = Column(String(100), nullable=False)
    custom = Column(Integer, nullable=False, default=0)  # Boolean: 1=custom, 0=default
    display_order = Column(Integer, nullable=False, default=0)  # For sorting

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Indexes
    __table_args__ = (
        Index("idx_guild_category_name", "guild_id", "category_name", unique=True),
    )

    def __repr__(self):
        return f"<RecruitmentCategory(id={self.id}, name={self.category_name}, guild_id={self.guild_id})>"

    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "guild_id": self.guild_id,
            "category_name": self.category_name,
            "custom": bool(self.custom),
            "display_order": self.display_order,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

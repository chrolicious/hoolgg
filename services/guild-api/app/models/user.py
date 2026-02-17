"""User model - represents Blizzard Battle.net accounts"""

from sqlalchemy import Column, String, DateTime, Integer
from sqlalchemy.sql import func
from app.models import Base


class User(Base):
    """User table - one per Bnet account"""

    __tablename__ = "users"

    bnet_id = Column(Integer, primary_key=True, index=True)
    bnet_username = Column(String(255), nullable=False)
    last_login = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    def __repr__(self):
        return f"<User(bnet_id={self.bnet_id}, username={self.bnet_username})>"

    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            "bnet_id": self.bnet_id,
            "bnet_username": self.bnet_username,
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

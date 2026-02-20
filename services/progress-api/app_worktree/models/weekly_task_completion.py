"""WeeklyTaskCompletion model - tracks weekly and daily task completions"""

from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from app.models import Base


class WeeklyTaskCompletion(Base):
    """Weekly/daily task completion tracking per character"""

    __tablename__ = "weekly_task_completions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    character_id = Column(Integer, ForeignKey("character_progress.id", ondelete="CASCADE"), nullable=False, index=True)
    week_number = Column(Integer, nullable=False)
    task_type = Column(String(20), nullable=False)  # 'weekly' or 'daily'
    task_id = Column(String(100), nullable=False)  # Identifier for the specific task
    completed = Column(Boolean, server_default="false")
    completed_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        UniqueConstraint('character_id', 'week_number', 'task_type', 'task_id', name='uq_task_character_week_type_id'),
    )

    def __repr__(self):
        return f"<WeeklyTaskCompletion(character_id={self.character_id}, task={self.task_id}, completed={self.completed})>"

    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "character_id": self.character_id,
            "week_number": self.week_number,
            "task_type": self.task_type,
            "task_id": self.task_id,
            "completed": self.completed,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }

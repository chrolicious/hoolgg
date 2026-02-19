"""Database models for guild-api"""

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import NullPool
import os

# Base class for all models
Base = declarative_base()

# Database engine and session (will be initialized in create_app)
engine = None
SessionLocal = None


def init_db(app):
    """Initialize database connection"""
    global engine, SessionLocal

    database_url = app.config["DATABASE_URL"]
    if not database_url:
        raise ValueError("DATABASE_URL not configured")

    engine = create_engine(
        database_url,
        poolclass=NullPool if app.config.get("TESTING") else None,
        echo=app.config.get("DEBUG", False),
    )

    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    return engine


def get_db():
    """Get database session (for use in routes)"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Import all models so Alembic can detect them
from app.models.user import User
from app.models.guild import Guild
from app.models.guild_member import GuildMember
from app.models.guild_permission import GuildPermission
from app.models.user_tracked_character import UserTrackedCharacter

__all__ = ["Base", "init_db", "get_db", "User", "Guild", "GuildMember", "GuildPermission", "UserTrackedCharacter"]

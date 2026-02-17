"""Database models for recruitment-api"""

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
from app.models.recruitment_candidate import RecruitmentCandidate
from app.models.recruitment_category import RecruitmentCategory
from app.models.recruitment_history import RecruitmentHistory

__all__ = [
    "Base",
    "init_db",
    "get_db",
    "RecruitmentCandidate",
    "RecruitmentCategory",
    "RecruitmentHistory",
]

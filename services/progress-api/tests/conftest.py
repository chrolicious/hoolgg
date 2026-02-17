"""Pytest configuration and fixtures"""

import pytest
from app import create_app
from app.models import Base, engine, SessionLocal
import os


@pytest.fixture(scope="session")
def app():
    """Create application for testing"""
    os.environ["TESTING"] = "1"
    os.environ["DATABASE_URL"] = "postgresql://hool:hool@localhost:5432/hoolgg_test"
    os.environ["GUILD_API_URL"] = "http://localhost:5000"
    os.environ["JWT_SECRET_KEY"] = "test-jwt-secret"

    app = create_app()
    app.config["TESTING"] = True

    # Create test database tables
    Base.metadata.create_all(bind=engine)

    yield app

    # Cleanup
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(app):
    """Create test client"""
    return app.test_client()


@pytest.fixture
def db():
    """Create database session for testing"""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()

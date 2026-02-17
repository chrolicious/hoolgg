"""Pytest configuration and fixtures"""

import pytest
import os
from app import create_app
from app.models import Base, engine, SessionLocal


@pytest.fixture(scope="session")
def app():
    """Create application for testing"""
    os.environ["FLASK_ENV"] = "testing"
    os.environ["DATABASE_URL"] = "postgresql://hool:hool@localhost:5432/hoolgg_test"

    app = create_app()
    app.config["TESTING"] = True

    # Create tables
    Base.metadata.create_all(bind=engine)

    yield app

    # Drop tables after tests
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(app):
    """Create test client"""
    return app.test_client()


@pytest.fixture(scope="function")
def db_session(app):
    """Create database session for testing"""
    connection = engine.connect()
    transaction = connection.begin()
    session = SessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def auth_headers():
    """Create authentication headers for testing"""
    # In a real test, you'd create a valid JWT token
    # For now, return empty dict (you'd need to implement token creation)
    return {}

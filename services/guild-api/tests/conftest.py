"""Test configuration and fixtures"""

import pytest
import os
from app import create_app
from app.models import Base, User, Guild, GuildMember, GuildPermission
from app.services.jwt_service import generate_access_token
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


# Set test database URL before importing app
os.environ["DATABASE_URL"] = "postgresql://hool:hool@localhost:5432/hoolgg_test"


@pytest.fixture(scope="function")
def app():
    """Create test application"""
    app = create_app()
    app.config["TESTING"] = True
    app.config["DEBUG"] = True

    # Get the engine that was created by init_db
    from app.models import engine

    # Create tables
    Base.metadata.create_all(engine)

    yield app

    # Cleanup
    Base.metadata.drop_all(engine)


@pytest.fixture
def client(app):
    """Create test client"""
    return app.test_client()


@pytest.fixture
def db(app):
    """Create database session"""
    from app.models import SessionLocal
    session = SessionLocal()

    yield session

    session.close()


@pytest.fixture
def test_user(db):
    """Create test user"""
    user = User(
        bnet_id=12345,
        bnet_username="TestUser#1234"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_user_token(app, test_user):
    """Generate JWT token for test user"""
    with app.app_context():
        return generate_access_token(test_user.bnet_id)


@pytest.fixture
def test_guild(db, test_user):
    """Create test guild"""
    guild = Guild(
        name="Test Guild",
        realm="test-realm",
        gm_bnet_id=test_user.bnet_id
    )
    db.add(guild)
    db.flush()

    # Add user as guild member
    member = GuildMember(
        guild_id=guild.id,
        bnet_id=test_user.bnet_id,
        character_name="TestChar",
        rank_id=0,
        rank_name="Guild Master"
    )
    db.add(member)

    # Add progress permission
    permission = GuildPermission(
        guild_id=guild.id,
        tool_name="progress",
        min_rank_id=9,
        enabled=True
    )
    db.add(permission)

    db.commit()
    db.refresh(guild)
    return guild

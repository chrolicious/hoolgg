"""Tests for guild crest sync"""

import pytest
from unittest.mock import patch
from datetime import datetime


def test_sync_guild_crest_success(client, test_guild, test_user_token):
    """Test syncing guild crest from Blizzard API"""
    mock_crest_data = {
        'emblem_id': 123,
        'emblem_color': {'r': 255, 'g': 0, 'b': 0, 'a': 255},
        'border_id': 5,
        'border_color': {'r': 0, 'g': 0, 'b': 0, 'a': 255},
        'background_color': {'r': 255, 'g': 255, 'b': 255, 'a': 255},
        'render_url': 'https://render.worldofwarcraft.com/us/guild/crest/emblem/123.png',
    }

    # Set cookie on the client
    client.set_cookie('access_token', test_user_token)

    with patch('app.services.blizzard_service.fetch_guild_crest', return_value=mock_crest_data):
        response = client.post(f'/guilds/{test_guild.id}/sync-crest')

    assert response.status_code == 200
    data = response.get_json()
    assert data['crest_data']['emblem_id'] == 123
    assert 'crest_updated_at' in data


def test_sync_guild_crest_not_found(client, test_guild, test_user_token):
    """Test syncing crest when guild not found in Blizzard API"""
    # Set cookie on the client
    client.set_cookie('access_token', test_user_token)

    with patch('app.services.blizzard_service.fetch_guild_crest', return_value=None):
        response = client.post(f'/guilds/{test_guild.id}/sync-crest')

    assert response.status_code == 404
    data = response.get_json()
    assert 'error' in data


def test_sync_guild_crest_unauthorized(client, test_guild):
    """Test syncing crest without authentication"""
    response = client.post(f'/guilds/{test_guild.id}/sync-crest')

    assert response.status_code == 401
    data = response.get_json()
    assert 'error' in data


def test_sync_guild_crest_not_gm(client, test_guild, test_user_token, db):
    """Test syncing crest as non-GM member"""
    from app.models.guild_member import GuildMember
    from app.models.user import User

    # Create a second user who is an officer (rank 1)
    officer_user = User(
        bnet_id=67890,
        bnet_username="OfficerUser#5678"
    )
    db.add(officer_user)
    db.commit()

    # Add officer as member with rank 1
    from app.services.jwt_service import generate_access_token
    officer_member = GuildMember(
        guild_id=test_guild.id,
        bnet_id=officer_user.bnet_id,
        character_name="OfficerChar",
        rank_id=1,
        rank_name="Officer"
    )
    db.add(officer_member)
    db.commit()

    # Generate token for officer
    with client.application.app_context():
        officer_token = generate_access_token(officer_user.bnet_id)

    # Set cookie for officer
    client.set_cookie('access_token', officer_token)

    # Officer should not be able to sync crest (GM only)
    response = client.post(f'/guilds/{test_guild.id}/sync-crest')

    # Should get 403 because officer is not GM
    assert response.status_code == 403
    data = response.get_json()
    assert 'error' in data


def test_sync_guild_crest_nonexistent_guild(client, test_user_token):
    """Test syncing crest for a guild that doesn't exist"""
    # Set cookie on the client
    client.set_cookie('access_token', test_user_token)

    response = client.post('/guilds/99999/sync-crest')

    assert response.status_code == 404
    data = response.get_json()
    assert 'error' in data

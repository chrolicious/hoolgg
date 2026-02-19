"""Tests for tracked characters endpoints"""

import pytest
from app.models import UserTrackedCharacter


def test_get_tracked_characters_empty(client, test_guild, test_user_token):
    """Test getting tracked characters when none exist"""
    response = client.get(
        f'/guilds/{test_guild.id}/tracked-characters',
        headers={'Authorization': f'Bearer {test_user_token}'}
    )

    assert response.status_code == 200
    data = response.get_json()
    assert data['characters'] == []


def test_add_tracked_character(client, test_guild, test_user_token, test_user):
    """Test adding a tracked character"""
    response = client.patch(
        f'/guilds/{test_guild.id}/tracked-characters',
        headers={'Authorization': f'Bearer {test_user_token}'},
        json={
            'character_name': 'TestChar',
            'realm': 'test-realm',
            'is_main': True,
            'tracked': True,
        }
    )

    assert response.status_code == 200
    data = response.get_json()
    assert data['character_name'] == 'TestChar'
    assert data['is_main'] is True
    assert data['tracked'] is True


def test_set_main_character(client, db, test_guild, test_user_token, test_user):
    """Test setting a character as main"""
    # Create two tracked characters
    char1 = UserTrackedCharacter(
        guild_id=test_guild.id,
        bnet_id=test_user.bnet_id,
        character_name='Char1',
        realm='test-realm',
        is_main=True,
        tracked=True,
    )
    char2 = UserTrackedCharacter(
        guild_id=test_guild.id,
        bnet_id=test_user.bnet_id,
        character_name='Char2',
        realm='test-realm',
        is_main=False,
        tracked=True,
    )
    db.add_all([char1, char2])
    db.commit()

    # Set char2 as main
    response = client.patch(
        f'/guilds/{test_guild.id}/tracked-characters',
        headers={'Authorization': f'Bearer {test_user_token}'},
        json={
            'character_name': 'Char2',
            'realm': 'test-realm',
            'is_main': True,
            'tracked': True,
        }
    )

    assert response.status_code == 200

    # Verify char1 is no longer main
    db.refresh(char1)
    assert char1.is_main is False

    # Verify char2 is now main
    db.refresh(char2)
    assert char2.is_main is True

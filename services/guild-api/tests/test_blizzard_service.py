"""Tests for Blizzard service"""

import pytest
from unittest.mock import patch, MagicMock
from app.services.blizzard_service import fetch_guild_crest, BlizzardAPIError


def test_fetch_guild_crest_success(app):
    """Test successful guild crest fetch"""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        'crest': {
            'emblem': {
                'id': 123,
                'color': {'rgba': {'r': 255, 'g': 0, 'b': 0, 'a': 255}}
            },
            'border': {
                'id': 5,
                'color': {'rgba': {'r': 0, 'g': 0, 'b': 0, 'a': 255}}
            },
            'background': {
                'color': {'rgba': {'r': 255, 'g': 255, 'b': 255, 'a': 255}}
            }
        }
    }

    with app.app_context():
        with patch('requests.get', return_value=mock_response):
            result = fetch_guild_crest('test_token', 'test-guild', 'test-realm')

    assert result['emblem_id'] == 123
    assert result['emblem_color'] == {'r': 255, 'g': 0, 'b': 0, 'a': 255}
    assert result['border_id'] == 5
    assert result['render_url'] == 'https://render.worldofwarcraft.com/us/guild/crest/emblem/123.png'


def test_fetch_guild_crest_not_found(app):
    """Test guild crest fetch when guild not found"""
    import requests

    mock_response = MagicMock()
    mock_response.status_code = 404

    # Create a proper HTTPError
    http_error = requests.HTTPError()
    http_error.response = mock_response
    mock_response.raise_for_status.side_effect = http_error

    with app.app_context():
        with patch('requests.get', return_value=mock_response):
            result = fetch_guild_crest('test_token', 'test-guild', 'test-realm')

    assert result is None


def test_fetch_guild_crest_server_error(app):
    """Test guild crest fetch when API returns 500"""
    import requests

    mock_response = MagicMock()
    mock_response.status_code = 500
    http_error = requests.HTTPError()
    http_error.response = mock_response
    mock_response.raise_for_status.side_effect = http_error

    with app.app_context():
        with patch('requests.get', return_value=mock_response):
            with pytest.raises(BlizzardAPIError):
                fetch_guild_crest('test_token', 'test-guild', 'test-realm')


def test_fetch_guild_crest_no_crest_data(app):
    """Test guild crest fetch when guild has no crest"""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {'name': 'TestGuild'}  # No crest field

    with app.app_context():
        with patch('requests.get', return_value=mock_response):
            result = fetch_guild_crest('test_token', 'test-guild', 'test-realm')

    assert result is None


def test_fetch_guild_crest_network_timeout(app):
    """Test guild crest fetch when network timeout occurs"""
    import requests

    with app.app_context():
        with patch('requests.get', side_effect=requests.Timeout()):
            with pytest.raises(BlizzardAPIError):
                fetch_guild_crest('test_token', 'test-guild', 'test-realm')

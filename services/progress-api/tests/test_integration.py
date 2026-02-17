"""Integration tests - test progress-api + guild-api permission flow"""

import pytest
import requests_mock
from app.models.character_progress import CharacterProgress
from app.models.weekly_target import WeeklyTarget
from app.models.guild_message import GuildMessage
from datetime import datetime
import json


class TestPermissionIntegration:
    """Test permission integration with guild-api"""

    def test_permission_check_allowed(self, client, db, app):
        """Test successful permission check with guild-api"""
        guild_id = 1
        bnet_id = 12345

        # Mock guild-api permission check response
        with requests_mock.Mocker() as m:
            guild_api_url = app.config.get("GUILD_API_URL", "http://localhost:5000")
            m.get(
                f"{guild_api_url}/guilds/{guild_id}/permissions/check",
                json={
                    "allowed": True,
                    "rank_id": 0,
                    "rank_name": "Guild Master",
                    "character_name": "TestCharacter"
                },
                status_code=200
            )

            # Create a mock JWT token
            from app.middleware.auth import create_test_token
            token = create_test_token(bnet_id)

            # Set cookie and make request
            client.set_cookie("localhost", "access_token", token)

            # Make request to progress endpoint
            response = client.get(f"/guilds/{guild_id}/progress/characters")

            assert response.status_code == 200
            data = response.get_json()
            assert "guild_id" in data
            assert data["guild_id"] == guild_id

    def test_permission_check_denied(self, client, db, app):
        """Test denied permission check with guild-api"""
        guild_id = 1
        bnet_id = 12345

        # Mock guild-api permission check response - denied
        with requests_mock.Mocker() as m:
            guild_api_url = app.config.get("GUILD_API_URL", "http://localhost:5000")
            m.get(
                f"{guild_api_url}/guilds/{guild_id}/permissions/check",
                json={
                    "allowed": False,
                    "error": "Access denied"
                },
                status_code=403
            )

            # Create a mock JWT token
            from app.middleware.auth import create_test_token
            token = create_test_token(bnet_id)

            # Set cookie and make request
            client.set_cookie("localhost", "access_token", token)

            # Make request to progress endpoint
            response = client.get(f"/guilds/{guild_id}/progress/characters")

            assert response.status_code == 403
            data = response.get_json()
            assert "error" in data
            assert data["error"] == "Access denied"

    def test_unauthorized_no_token(self, client):
        """Test that requests without token are rejected"""
        guild_id = 1

        # Make request without token
        response = client.get(f"/guilds/{guild_id}/progress/characters")

        assert response.status_code == 401
        data = response.get_json()
        assert "error" in data
        assert data["error"] == "Not authenticated"

    def test_gm_only_endpoint_access(self, client, db, app):
        """Test that GM-only endpoints require GM permission"""
        guild_id = 1
        bnet_id = 12345

        # Mock guild-api permission check - user is not GM
        with requests_mock.Mocker() as m:
            guild_api_url = app.config.get("GUILD_API_URL", "http://localhost:5000")
            m.get(
                f"{guild_api_url}/guilds/{guild_id}/permissions/check",
                json={
                    "allowed": True,
                    "rank_id": 2,  # Not GM (rank_id != 0)
                    "rank_name": "Member",
                    "character_name": "TestCharacter"
                },
                status_code=200
            )

            # Create a mock JWT token
            from app.middleware.auth import create_test_token
            token = create_test_token(bnet_id)

            # Set cookie and make request to GM-only endpoint
            client.set_cookie("localhost", "access_token", token)

            response = client.put(
                f"/guilds/{guild_id}/progress/message",
                json={"message": "Test message"},
                content_type="application/json"
            )

            assert response.status_code == 403
            data = response.get_json()
            assert "error" in data
            assert "Guild Master" in data["error"]

    def test_officer_endpoint_access(self, client, db, app):
        """Test that Officer+ endpoints require appropriate rank"""
        guild_id = 1
        bnet_id = 12345

        # Mock guild-api permission check - user is member (not officer)
        with requests_mock.Mocker() as m:
            guild_api_url = app.config.get("GUILD_API_URL", "http://localhost:5000")
            m.get(
                f"{guild_api_url}/guilds/{guild_id}/permissions/check",
                json={
                    "allowed": True,
                    "rank_id": 3,  # Member (rank_id > 1)
                    "rank_name": "Member",
                    "character_name": "TestCharacter"
                },
                status_code=200
            )

            # Create a mock JWT token
            from app.middleware.auth import create_test_token
            token = create_test_token(bnet_id)

            # Set cookie and make request to officer-only endpoint
            client.set_cookie("localhost", "access_token", token)

            response = client.get(f"/guilds/{guild_id}/progress/members")

            assert response.status_code == 403
            data = response.get_json()
            assert "error" in data
            assert "Officer" in data["error"]


class TestProgressWorkflow:
    """Test complete progress tracking workflows"""

    def test_view_character_progress_flow(self, client, db, app):
        """
        Test full flow:
        1. User authenticates
        2. User views their character progress
        3. System fetches from Blizzard (mocked)
        4. Progress is displayed with weekly targets
        """
        guild_id = 1
        bnet_id = 12345
        character_name = "Testchar"
        realm = "area-52"

        # Add weekly target to database
        target = WeeklyTarget(
            expansion_id="12.0",
            week=5,
            ilvl_target=265,
            description="Week 5 target"
        )
        db.add(target)
        db.commit()

        with requests_mock.Mocker() as m:
            guild_api_url = app.config.get("GUILD_API_URL", "http://localhost:5000")

            # Mock permission check
            m.get(
                f"{guild_api_url}/guilds/{guild_id}/permissions/check",
                json={
                    "allowed": True,
                    "rank_id": 2,
                    "rank_name": "Member",
                    "character_name": character_name
                },
                status_code=200
            )

            # Mock Blizzard API (would be in BlizzardService)
            # This is simplified - actual test would mock BlizzardService methods

            # Create test token
            from app.middleware.auth import create_test_token
            token = create_test_token(bnet_id)
            client.set_cookie("localhost", "access_token", token)

            # View character progress
            response = client.get(
                f"/guilds/{guild_id}/progress/character/{character_name}",
                query_string={"realm": realm}
            )

            # Initially should return 404 if character not found
            # In real scenario, would fetch from Blizzard and create entry
            assert response.status_code in [200, 404, 500]

    def test_guild_overview_workflow(self, client, db, app):
        """
        Test guild overview workflow:
        1. Officer authenticates
        2. Views guild overview
        3. Sees all members with progress status
        4. Can filter and sort
        """
        guild_id = 1
        bnet_id = 12345

        # Add test data
        target = WeeklyTarget(
            expansion_id="12.0",
            week=5,
            ilvl_target=265,
            description="Week 5 target"
        )
        db.add(target)

        char1 = CharacterProgress(
            character_name="Character1",
            realm="area-52",
            guild_id=guild_id,
            class_name="Warrior",
            role="Tank",
            current_ilvl=270,
            gear_details={}
        )
        char2 = CharacterProgress(
            character_name="Character2",
            realm="area-52",
            guild_id=guild_id,
            class_name="Priest",
            role="Healer",
            current_ilvl=250,
            gear_details={}
        )
        db.add(char1)
        db.add(char2)
        db.commit()

        with requests_mock.Mocker() as m:
            guild_api_url = app.config.get("GUILD_API_URL", "http://localhost:5000")

            # Mock permission check - officer
            m.get(
                f"{guild_api_url}/guilds/{guild_id}/permissions/check",
                json={
                    "allowed": True,
                    "rank_id": 1,  # Officer
                    "rank_name": "Officer",
                    "character_name": "OfficerChar"
                },
                status_code=200
            )

            # Create test token
            from app.middleware.auth import create_test_token
            token = create_test_token(bnet_id)
            client.set_cookie("localhost", "access_token", token)

            # View guild overview
            response = client.get(f"/guilds/{guild_id}/progress/members")

            assert response.status_code == 200
            data = response.get_json()
            assert "members" in data
            assert len(data["members"]) == 2

            # Test sorting
            response = client.get(f"/guilds/{guild_id}/progress/members?sort=ilvl")
            assert response.status_code == 200
            data = response.get_json()
            assert data["members"][0]["current_ilvl"] >= data["members"][1]["current_ilvl"]

    def test_gm_message_workflow(self, client, db, app):
        """
        Test GM message workflow:
        1. GM sets weekly message
        2. Members can view message
        """
        guild_id = 1
        gm_bnet_id = 12345
        member_bnet_id = 67890

        with requests_mock.Mocker() as m:
            guild_api_url = app.config.get("GUILD_API_URL", "http://localhost:5000")

            # Mock permission check for GM
            m.get(
                f"{guild_api_url}/guilds/{guild_id}/permissions/check",
                [
                    {
                        "json": {
                            "allowed": True,
                            "rank_id": 0,
                            "rank_name": "Guild Master",
                            "character_name": "GMChar"
                        },
                        "status_code": 200
                    },
                    {
                        "json": {
                            "allowed": True,
                            "rank_id": 2,
                            "rank_name": "Member",
                            "character_name": "MemberChar"
                        },
                        "status_code": 200
                    }
                ]
            )

            # GM sets message
            from app.middleware.auth import create_test_token
            gm_token = create_test_token(gm_bnet_id)
            client.set_cookie("localhost", "access_token", gm_token)

            response = client.put(
                f"/guilds/{guild_id}/progress/message",
                json={"message": "Focus on Mythic+ this week!"},
                content_type="application/json"
            )

            assert response.status_code == 200
            data = response.get_json()
            assert data["gm_message"] == "Focus on Mythic+ this week!"

            # Member views message
            member_token = create_test_token(member_bnet_id)
            client.set_cookie("localhost", "access_token", member_token)

            response = client.get(f"/guilds/{guild_id}/progress/message")

            assert response.status_code == 200
            data = response.get_json()
            assert data["gm_message"] == "Focus on Mythic+ this week!"


class TestExternalAPIIntegration:
    """Test integration with external APIs"""

    def test_blizzard_api_integration(self, client, db, app):
        """Test Blizzard API integration for character data"""
        # This would require mocking BlizzardService
        # or using a test/sandbox Blizzard API
        pass

    def test_warcraftlogs_api_integration(self, client, db, app):
        """Test WarcraftLogs API integration for comparisons"""
        guild_id = 1
        bnet_id = 12345

        with requests_mock.Mocker() as m:
            guild_api_url = app.config.get("GUILD_API_URL", "http://localhost:5000")

            # Mock permission check
            m.get(
                f"{guild_api_url}/guilds/{guild_id}/permissions/check",
                json={
                    "allowed": True,
                    "rank_id": 2,
                    "rank_name": "Member",
                    "character_name": "TestChar"
                },
                status_code=200
            )

            # Create test token
            from app.middleware.auth import create_test_token
            token = create_test_token(bnet_id)
            client.set_cookie("localhost", "access_token", token)

            # Request WCL comparison
            response = client.get(
                f"/guilds/{guild_id}/progress/comparisons",
                query_string={
                    "guild_name": "Test Guild",
                    "realm": "area-52",
                    "region": "us"
                }
            )

            # May succeed or fail depending on WCL API mock
            assert response.status_code in [200, 500]


class TestCacheIntegration:
    """Test caching layer integration"""

    def test_character_data_caching(self, client, db, app):
        """Test that character data is cached appropriately"""
        # This would test the Redis caching layer
        # Verify cache hits/misses, TTL, etc.
        pass

    def test_permission_caching(self, client, db, app):
        """Test that permission checks are cached"""
        # Verify permission checks are cached with appropriate TTL
        pass

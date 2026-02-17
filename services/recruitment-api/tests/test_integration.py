"""Integration tests - test full recruitment workflows"""

import pytest
import jwt
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock
from app.models.recruitment_candidate import RecruitmentCandidate
from app.models.recruitment_category import RecruitmentCategory
from app.models.recruitment_history import RecruitmentHistory


def create_test_token(bnet_id: int, secret_key: str) -> str:
    """Create a test JWT token"""
    payload = {
        "bnet_id": bnet_id,
        "username": f"TestUser{bnet_id}",
        "type": "access",
        "exp": datetime.utcnow() + timedelta(hours=1),
    }
    return jwt.encode(payload, secret_key, algorithm="HS256")


class TestRecruitmentWorkflow:
    """Test complete recruitment workflows"""

    @patch("app.services.permission_service.requests.get")
    def test_full_candidate_lifecycle(self, mock_permission_check, client, db_session, app):
        """
        Test full candidate lifecycle:
        1. Add candidate
        2. Rate candidate
        3. Move to category
        4. Log contact
        5. Update status
        """
        # Mock permission check to allow access
        mock_permission_check.return_value = MagicMock(
            status_code=200,
            json=lambda: {
                "allowed": True,
                "rank_id": 1,
                "rank_name": "Officer",
                "tool_enabled": True,
            },
        )

        # Create JWT token
        token = create_test_token(12345, app.config["JWT_SECRET_KEY"])

        # Step 1: Add a candidate
        candidate_data = {
            "candidate_name": "TestWarrior",
            "character_class": "Warrior",
            "role": "Tank",
            "ilvl": 290,
            "source": "manual",
            "notes": "Strong candidate, raid experience",
        }

        response = client.post(
            "/guilds/1/recruitment/candidates",
            json=candidate_data,
            headers={"Cookie": f"access_token={token}"},
        )

        assert response.status_code in [200, 201]
        candidate_id = response.json.get("id")
        assert candidate_id is not None

        # Step 2: Rate the candidate
        rating_data = {"rating": 5, "notes": "Excellent tank, top tier"}

        response = client.put(
            f"/guilds/1/recruitment/candidates/{candidate_id}",
            json=rating_data,
            headers={"Cookie": f"access_token={token}"},
        )

        assert response.status_code == 200
        assert response.json.get("rating") == 5

        # Step 3: Move to a category
        status_data = {"status": "Interested"}

        response = client.put(
            f"/guilds/1/recruitment/candidates/{candidate_id}/status",
            json=status_data,
            headers={"Cookie": f"access_token={token}"},
        )

        assert response.status_code == 200
        assert response.json.get("status") == "Interested"

        # Step 4: Log contact
        contact_data = {
            "contacted_date": datetime.utcnow().isoformat(),
            "method": "Discord",
            "message": "Reached out to discuss trial raid",
            "response_received": True,
        }

        response = client.post(
            f"/guilds/1/recruitment/candidates/{candidate_id}/contact",
            json=contact_data,
            headers={"Cookie": f"access_token={token}"},
        )

        assert response.status_code in [200, 201]

        # Step 5: Verify full candidate details
        response = client.get(
            f"/guilds/1/recruitment/candidates/{candidate_id}",
            headers={"Cookie": f"access_token={token}"},
        )

        assert response.status_code == 200
        candidate = response.json
        assert candidate["rating"] == 5
        assert candidate["status"] == "Interested"

    @patch("app.services.permission_service.requests.get")
    def test_pipeline_organization(self, mock_permission_check, client, db_session, app):
        """
        Test organizing candidates into pipeline:
        1. Create categories
        2. Add candidates
        3. Move between categories
        4. View pipeline
        """
        # Mock permission check
        mock_permission_check.return_value = MagicMock(
            status_code=200,
            json=lambda: {
                "allowed": True,
                "rank_id": 1,
                "rank_name": "Officer",
                "tool_enabled": True,
            },
        )

        token = create_test_token(12345, app.config["JWT_SECRET_KEY"])

        # Step 1: Create custom category
        category_data = {"name": "Top Picks", "custom": True}

        response = client.post(
            "/guilds/1/recruitment/categories",
            json=category_data,
            headers={"Cookie": f"access_token={token}"},
        )

        assert response.status_code in [200, 201]

        # Step 2: Add multiple candidates
        candidates = [
            {
                "candidate_name": "TankPlayer",
                "character_class": "Paladin",
                "role": "Tank",
                "ilvl": 295,
                "source": "raiderio",
            },
            {
                "candidate_name": "HealPlayer",
                "character_class": "Priest",
                "role": "Healer",
                "ilvl": 288,
                "source": "wowprogress",
            },
            {
                "candidate_name": "DPSPlayer",
                "character_class": "Mage",
                "role": "Ranged DPS",
                "ilvl": 292,
                "source": "raiderio",
            },
        ]

        created_ids = []
        for candidate in candidates:
            response = client.post(
                "/guilds/1/recruitment/candidates",
                json=candidate,
                headers={"Cookie": f"access_token={token}"},
            )
            assert response.status_code in [200, 201]
            created_ids.append(response.json.get("id"))

        # Step 3: Move candidates to different categories
        response = client.put(
            f"/guilds/1/recruitment/candidates/{created_ids[0]}/status",
            json={"status": "Top Picks"},
            headers={"Cookie": f"access_token={token}"},
        )
        assert response.status_code == 200

        # Step 4: View pipeline
        response = client.get(
            "/guilds/1/recruitment/pipeline",
            headers={"Cookie": f"access_token={token}"},
        )

        assert response.status_code == 200
        pipeline = response.json
        assert "categories" in pipeline
        assert len(pipeline["categories"]) > 0

    @patch("app.services.permission_service.requests.get")
    def test_raid_composition_analysis(self, mock_permission_check, client, db_session, app):
        """
        Test raid composition analysis:
        1. Add candidates with different roles
        2. View composition
        3. Identify gaps
        """
        # Mock permission check
        mock_permission_check.return_value = MagicMock(
            status_code=200,
            json=lambda: {
                "allowed": True,
                "rank_id": 1,
                "rank_name": "Officer",
                "tool_enabled": True,
            },
        )

        token = create_test_token(12345, app.config["JWT_SECRET_KEY"])

        # Add candidates with different roles
        role_distribution = [
            {"role": "Tank", "class": "Warrior"},
            {"role": "Tank", "class": "Paladin"},
            {"role": "Healer", "class": "Priest"},
            {"role": "Healer", "class": "Druid"},
            {"role": "Melee DPS", "class": "Rogue"},
            {"role": "Ranged DPS", "class": "Mage"},
        ]

        for i, role_info in enumerate(role_distribution):
            candidate_data = {
                "candidate_name": f"Player{i}",
                "character_class": role_info["class"],
                "role": role_info["role"],
                "ilvl": 290 + i,
                "source": "manual",
            }

            response = client.post(
                "/guilds/1/recruitment/candidates",
                json=candidate_data,
                headers={"Cookie": f"access_token={token}"},
            )
            assert response.status_code in [200, 201]

        # View composition
        response = client.get(
            "/guilds/1/recruitment/composition",
            headers={"Cookie": f"access_token={token}"},
        )

        assert response.status_code == 200
        composition = response.json
        assert "role_distribution" in composition or "roles" in composition


class TestPermissionIntegration:
    """Test permission integration with guild-api"""

    @patch("app.services.permission_service.requests.get")
    def test_permission_check_integration(self, mock_permission_check, client, db_session, app):
        """Test that permission checks integrate with guild-api"""
        # Mock successful permission check
        mock_permission_check.return_value = MagicMock(
            status_code=200,
            json=lambda: {
                "allowed": True,
                "rank_id": 1,
                "rank_name": "Officer",
                "tool_enabled": True,
            },
        )

        token = create_test_token(12345, app.config["JWT_SECRET_KEY"])

        # Make request that requires permission check
        response = client.get(
            "/guilds/1/recruitment/candidates",
            headers={"Cookie": f"access_token={token}"},
        )

        # Verify permission check was called
        assert mock_permission_check.called
        call_args = mock_permission_check.call_args

        # Verify correct parameters were passed
        assert "guilds/1/permissions/check" in call_args[0][0]

    @patch("app.services.permission_service.requests.get")
    def test_permission_denied(self, mock_permission_check, client, app):
        """Test that users without permission are denied access"""
        # Mock permission denied
        mock_permission_check.return_value = MagicMock(
            status_code=200,
            json=lambda: {
                "allowed": False,
                "rank_id": 5,
                "rank_name": "Member",
                "tool_enabled": False,
            },
        )

        token = create_test_token(12345, app.config["JWT_SECRET_KEY"])

        # Attempt to access endpoint
        response = client.get(
            "/guilds/1/recruitment/candidates",
            headers={"Cookie": f"access_token={token}"},
        )

        # Should be denied (403)
        assert response.status_code == 403

    def test_unauthorized_access_denied(self, client):
        """Test that unauthorized users cannot access endpoints"""
        # Attempt to access without auth
        response = client.get("/guilds/1/recruitment/candidates")

        # Should return 401 Unauthorized
        assert response.status_code == 401


class TestExternalAPIIntegration:
    """Test integration with external APIs"""

    @patch("app.services.raider_io_service.requests.get")
    @patch("app.services.permission_service.requests.get")
    def test_raider_io_search(
        self, mock_permission_check, mock_raider_io, client, db_session, app
    ):
        """Test Raider.io search integration"""
        # Mock permission check
        mock_permission_check.return_value = MagicMock(
            status_code=200,
            json=lambda: {
                "allowed": True,
                "rank_id": 1,
                "rank_name": "Officer",
                "tool_enabled": True,
            },
        )

        # Mock Raider.io response
        mock_raider_io.return_value = MagicMock(
            status_code=200,
            json=lambda: {
                "name": "TestPlayer",
                "class": "Warrior",
                "realm": "Area 52",
                "mythic_plus_scores": {"all": 2500},
                "gear": {"item_level_equipped": 295},
            },
        )

        token = create_test_token(12345, app.config["JWT_SECRET_KEY"])

        # Perform search
        search_data = {
            "source": "raiderio",
            "filters": {"role": "Tank", "min_ilvl": 290},
        }

        response = client.post(
            "/guilds/1/recruitment/search",
            json=search_data,
            headers={"Cookie": f"access_token={token}"},
        )

        assert response.status_code == 200

    @patch("app.services.warcraft_logs_service.requests.get")
    @patch("app.services.permission_service.requests.get")
    def test_warcraft_logs_enrichment(
        self, mock_permission_check, mock_wcl, client, db_session, app
    ):
        """Test WarcraftLogs parse data enrichment"""
        # Mock permission check
        mock_permission_check.return_value = MagicMock(
            status_code=200,
            json=lambda: {
                "allowed": True,
                "rank_id": 1,
                "rank_name": "Officer",
                "tool_enabled": True,
            },
        )

        # Mock WarcraftLogs response
        mock_wcl.return_value = MagicMock(
            status_code=200,
            json=lambda: {
                "character": {
                    "name": "TestPlayer",
                    "rankings": [{"percentile": 95, "spec": "Protection"}],
                }
            },
        )

        token = create_test_token(12345, app.config["JWT_SECRET_KEY"])

        # Create candidate first
        candidate_data = {
            "candidate_name": "TestPlayer",
            "character_class": "Warrior",
            "role": "Tank",
            "ilvl": 295,
            "source": "manual",
        }

        response = client.post(
            "/guilds/1/recruitment/candidates",
            json=candidate_data,
            headers={"Cookie": f"access_token={token}"},
        )

        candidate_id = response.json.get("id")

        # Get candidate details (should include WCL data if available)
        response = client.get(
            f"/guilds/1/recruitment/candidates/{candidate_id}",
            headers={"Cookie": f"access_token={token}"},
        )

        assert response.status_code == 200

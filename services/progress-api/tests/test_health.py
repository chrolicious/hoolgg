"""Test health endpoint"""


def test_health_check(client):
    """Test health check endpoint returns 200"""
    response = client.get("/health")

    assert response.status_code == 200

    data = response.get_json()
    assert data["status"] == "healthy"
    assert data["service"] == "progress-api"
    assert "version" in data

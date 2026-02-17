# Progress API - Integration Tests Documentation

This document describes the integration tests for progress-api + guild-api permission flow.

## Overview

Integration tests verify the end-to-end flow between progress-api and guild-api, ensuring:
- Authentication and authorization work correctly
- Permission checks are properly integrated
- API responses match specifications
- Error handling is graceful

## Test Structure

Integration tests are located in `/Users/michel.epe/Development/poc/hoolgg/services/progress-api/tests/test_integration.py`

### Test Classes

1. **TestPermissionIntegration** - Permission flow with guild-api
2. **TestProgressWorkflow** - Complete progress tracking workflows
3. **TestExternalAPIIntegration** - Integration with Blizzard and WarcraftLogs APIs
4. **TestCacheIntegration** - Caching layer integration

## Running Integration Tests

### Prerequisites

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Set up test database
createdb hoolgg_test
export DATABASE_URL=postgresql://hool:hool@localhost:5432/hoolgg_test
alembic upgrade head

# 3. Ensure Redis is running (optional for cache tests)
redis-server
```

### Run Tests

```bash
# Run all integration tests
pytest tests/test_integration.py -v

# Run specific test class
pytest tests/test_integration.py::TestPermissionIntegration -v

# Run specific test
pytest tests/test_integration.py::TestPermissionIntegration::test_permission_check_allowed -v

# Run with coverage
pytest tests/test_integration.py --cov=app --cov-report=html
```

## Test Scenarios

### 1. Permission Integration

#### Test: Permission Check Allowed

**Scenario**: User with valid token and guild membership accesses protected endpoint

**Setup**:
- Mock guild-api permission check to return `allowed: true`
- Create valid JWT token for test user
- Set token as cookie

**Expected**:
- Request to `/guilds/{guild_id}/progress/characters` succeeds
- Response status: 200 OK
- Response contains guild_id, characters, targets

**Code**:
```python
def test_permission_check_allowed(client, db, app):
    guild_id = 1
    bnet_id = 12345

    with requests_mock.Mocker() as m:
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

        token = create_test_token(bnet_id)
        client.set_cookie("localhost", "access_token", token)

        response = client.get(f"/guilds/{guild_id}/progress/characters")

        assert response.status_code == 200
        data = response.get_json()
        assert data["guild_id"] == guild_id
```

#### Test: Permission Check Denied

**Scenario**: User with token but no guild membership is denied access

**Setup**:
- Mock guild-api permission check to return `allowed: false`
- Create valid JWT token
- Set token as cookie

**Expected**:
- Request to `/guilds/{guild_id}/progress/characters` fails
- Response status: 403 Forbidden
- Response contains error message

#### Test: Unauthorized No Token

**Scenario**: User without token attempts to access protected endpoint

**Setup**:
- No token provided

**Expected**:
- Request to `/guilds/{guild_id}/progress/characters` fails
- Response status: 401 Unauthorized
- Response contains error: "Not authenticated"

#### Test: GM-Only Endpoint Access

**Scenario**: Non-GM user attempts to access GM-only endpoint

**Setup**:
- Mock permission check with rank_id != 0 (not GM)
- Create valid JWT token
- Attempt to access `/guilds/{guild_id}/progress/message` (PUT)

**Expected**:
- Response status: 403 Forbidden
- Response contains error: "Guild Master rank required"

#### Test: Officer Endpoint Access

**Scenario**: Member attempts to access Officer+ endpoint

**Setup**:
- Mock permission check with rank_id > 1 (member)
- Create valid JWT token
- Attempt to access `/guilds/{guild_id}/progress/members`

**Expected**:
- Response status: 403 Forbidden
- Response contains error: "Officer rank or higher required"

### 2. Progress Workflow

#### Test: View Character Progress Flow

**Scenario**: Complete flow for viewing character progress

**Setup**:
1. Add weekly target to database
2. Mock guild-api permission check (allowed)
3. Mock Blizzard API (character gear data)
4. Create valid JWT token

**Steps**:
1. User authenticates
2. User views character progress
3. System fetches from Blizzard (mocked)
4. Progress is calculated and displayed

**Expected**:
- Character data fetched
- iLvl calculated from gear
- Progress compared to weekly target
- Response contains all required fields

#### Test: Guild Overview Workflow

**Scenario**: Officer views guild progress overview

**Setup**:
1. Add weekly targets to database
2. Add test characters to database (with different iLvls)
3. Mock permission check (officer rank)
4. Create valid JWT token

**Steps**:
1. Officer authenticates
2. Views guild overview endpoint
3. Sees all members with progress status
4. Can filter and sort

**Expected**:
- All guild members shown
- Status calculated (on_track / behind / ahead)
- Filtering works (class, role, status)
- Sorting works (ilvl)

#### Test: GM Message Workflow

**Scenario**: GM sets message, members view it

**Setup**:
1. Mock permission checks for GM and member
2. Create JWT tokens for both

**Steps**:
1. GM sets weekly message
2. Member views message

**Expected**:
- GM can set message (200 OK)
- Member can view message (200 OK)
- Message content matches
- Timestamp is updated

### 3. External API Integration

#### Test: Blizzard API Integration

**Scenario**: Character data fetched from Blizzard API

**Setup**:
- Mock Blizzard API responses
- Mock guild-api permission check

**Expected**:
- API call to Blizzard is made
- Character data parsed correctly
- iLvl calculated from equipped items
- Data stored in database

**Note**: This test requires mocking BlizzardService methods or using a test/sandbox Blizzard API.

#### Test: WarcraftLogs API Integration

**Scenario**: Guild comparison data fetched from WarcraftLogs

**Setup**:
- Mock WarcraftLogs API responses
- Mock guild-api permission check

**Expected**:
- API call to WarcraftLogs is made
- Comparison data returned
- Only public data accessed

### 4. Cache Integration

#### Test: Character Data Caching

**Scenario**: Character data is cached to reduce API calls

**Setup**:
- Mock Blizzard API
- Request same character twice

**Expected**:
- First request: Fresh data from Blizzard
- Second request: Cached data (faster response)
- Cache TTL respected (1 hour)

#### Test: Permission Caching

**Scenario**: Permission checks are cached

**Setup**:
- Mock guild-api permission check
- Request same endpoint multiple times

**Expected**:
- First request: Permission check to guild-api
- Subsequent requests: Cached permission (5-min TTL)
- Cache invalidation works

## Mocking External Services

### Guild API Permission Check

```python
import requests_mock

with requests_mock.Mocker() as m:
    guild_api_url = app.config.get("GUILD_API_URL")
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

    # Make request
    response = client.get(f"/guilds/{guild_id}/progress/characters")
```

### Blizzard API

```python
# Mock character profile endpoint
m.get(
    "https://us.api.blizzard.com/profile/wow/character/area-52/testchar",
    json={
        "name": "Testchar",
        "realm": {"name": "Area 52"},
        "character_class": {"name": "Warrior"},
        "equipped_item_level": 265,
        "equipment": {
            "equipped_items": [
                {"slot": {"type": "HEAD"}, "level": {"value": 270}},
                {"slot": {"type": "CHEST"}, "level": {"value": 262}},
                # ... more items
            ]
        }
    },
    status_code=200
)
```

### WarcraftLogs API

```python
# Mock rankings endpoint
m.get(
    "https://www.warcraftlogs.com/api/v2/client/rankings",
    json={
        "data": {
            "your_guild": {"percentile": 75},
            "realm_average": {"percentile": 60},
            "top_guild": {"percentile": 95}
        }
    },
    status_code=200
)
```

## Test Fixtures

### Available Fixtures (from conftest.py)

```python
@pytest.fixture
def app():
    """Flask application instance"""
    # Returns configured Flask app for testing

@pytest.fixture
def client(app):
    """Flask test client"""
    # Returns test client for making requests

@pytest.fixture
def db(app):
    """SQLAlchemy database session"""
    # Returns database session, auto-rollback after test
```

### Creating Test Tokens

```python
from app.middleware.auth import create_test_token

# Create JWT token for testing
token = create_test_token(bnet_id=12345)
client.set_cookie("localhost", "access_token", token)
```

## Coverage Requirements

Integration tests should cover:

- **Authentication Flow**: 100%
- **Permission Checks**: 100%
- **API Endpoints**: >= 90%
- **Error Handling**: >= 85%

### Current Coverage

```bash
# Run coverage report
pytest tests/test_integration.py --cov=app --cov-report=term-missing

# Expected output:
# Name                                    Stmts   Miss  Cover   Missing
# ---------------------------------------------------------------------
# app/middleware/auth.py                     45      2    96%   67-69
# app/routes/progress.py                    120      8    93%   ...
# app/services/permission_service.py         35      1    97%   ...
# ---------------------------------------------------------------------
# TOTAL                                     450     25    94%
```

## Continuous Integration

Integration tests run in CI/CD pipeline:

```yaml
# .github/workflows/test.yml
- name: Run Integration Tests
  run: |
    pytest tests/test_integration.py --cov=app --cov-report=xml
    pytest tests/test_integration.py --cov-fail-under=90
```

## Troubleshooting

### Common Issues

**Issue**: Guild API mock not working

**Solution**:
- Ensure mock URL matches exactly (including scheme, host, path)
- Check that mock is within `requests_mock.Mocker()` context
- Verify `GUILD_API_URL` in app config

**Issue**: Database errors in tests

**Solution**:
```bash
# Recreate test database
dropdb hoolgg_test
createdb hoolgg_test
alembic upgrade head
```

**Issue**: Import errors

**Solution**:
```bash
# Install in development mode
pip install -e .

# Or set PYTHONPATH
export PYTHONPATH=/Users/michel.epe/Development/poc/hoolgg/services/progress-api:$PYTHONPATH
```

**Issue**: Tests fail with "fixture not found"

**Solution**:
- Check `conftest.py` for fixture definition
- Ensure fixture is in correct scope (function/module/session)
- Verify fixture name spelling

## Adding New Integration Tests

### Template

```python
class TestNewFeature:
    """Test new feature integration"""

    def test_new_feature_scenario(self, client, db, app):
        """Test scenario description"""
        # Setup
        guild_id = 1
        bnet_id = 12345

        # Mock external services
        with requests_mock.Mocker() as m:
            # Mock guild-api
            m.get(
                f"{app.config['GUILD_API_URL']}/guilds/{guild_id}/permissions/check",
                json={"allowed": True, "rank_id": 0},
                status_code=200
            )

            # Create test token
            token = create_test_token(bnet_id)
            client.set_cookie("localhost", "access_token", token)

            # Make request
            response = client.get(f"/guilds/{guild_id}/new/endpoint")

            # Assert
            assert response.status_code == 200
            data = response.get_json()
            assert "expected_field" in data
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Use database rollback (handled by fixtures)
3. **Mocking**: Always mock external APIs (guild-api, Blizzard, WCL)
4. **Clear Names**: Use descriptive test names that explain the scenario
5. **Documentation**: Add docstrings to complex tests
6. **Assertions**: Use specific assertions, check response structure
7. **Error Cases**: Test both success and failure paths
8. **Performance**: Keep tests fast (mock slow operations)

## Next Steps

After integration tests pass:

1. Run full test suite: `pytest tests/ --cov=app`
2. Review coverage report
3. Deploy to dev environment
4. Run manual testing checklist
5. Deploy to staging for QA

## References

- [pytest documentation](https://docs.pytest.org/)
- [requests-mock documentation](https://requests-mock.readthedocs.io/)
- [Flask testing documentation](https://flask.palletsprojects.com/en/3.0.x/testing/)
- [Manual Testing Checklist](MANUAL_TESTING_CHECKLIST.md)
- [Deployment Guide](../DEPLOYMENT.md)

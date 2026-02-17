# Progress API - Testing Guide

This guide covers running tests for the progress-api service.

## Table of Contents

1. [Setup Test Environment](#setup-test-environment)
2. [Running Tests](#running-tests)
3. [Integration Tests](#integration-tests)
4. [Test Coverage](#test-coverage)
5. [Writing New Tests](#writing-new-tests)

---

## Setup Test Environment

### Prerequisites

- Python 3.11+
- PostgreSQL (for test database)
- Redis (optional, for cache tests)

### Install Dependencies

```bash
cd services/progress-api
pip install -r requirements.txt
```

### Create Test Database

```bash
# Create test database
createdb hoolgg_test

# Or using psql
psql -U postgres -c "CREATE DATABASE hoolgg_test;"

# Run migrations on test database
export DATABASE_URL=postgresql://hool:hool@localhost:5432/hoolgg_test
alembic upgrade head
```

### Environment Variables

For testing, these environment variables are automatically set in `conftest.py`:

```python
TESTING=1
DATABASE_URL=postgresql://hool:hool@localhost:5432/hoolgg_test
GUILD_API_URL=http://localhost:5000
JWT_SECRET_KEY=test-jwt-secret
```

---

## Running Tests

### Run All Tests

```bash
pytest
```

### Run Specific Test File

```bash
pytest tests/test_integration.py
```

### Run Specific Test Class

```bash
pytest tests/test_integration.py::TestPermissionIntegration
```

### Run Specific Test

```bash
pytest tests/test_integration.py::TestPermissionIntegration::test_permission_check_allowed
```

### Run with Verbose Output

```bash
pytest -v
```

### Run with Print Statements

```bash
pytest -s
```

---

## Integration Tests

### Test Structure

Integration tests are in `/Users/michel.epe/Development/poc/hoolgg/services/progress-api/tests/test_integration.py` and cover:

1. **Permission Integration**
   - Permission check with guild-api (allowed)
   - Permission check with guild-api (denied)
   - Unauthorized access (no token)
   - GM-only endpoint access control
   - Officer-only endpoint access control

2. **Progress Workflow**
   - View character progress flow
   - Guild overview workflow
   - GM message workflow

3. **External API Integration**
   - Blizzard API integration (mocked)
   - WarcraftLogs API integration (mocked)

4. **Cache Integration**
   - Character data caching
   - Permission caching

### Running Integration Tests

```bash
# Run all integration tests
pytest tests/test_integration.py

# Run specific integration test class
pytest tests/test_integration.py::TestPermissionIntegration -v

# Run with coverage
pytest tests/test_integration.py --cov=app --cov-report=html
```

### Mocking External Services

Integration tests use `requests-mock` to mock external API calls:

```python
import requests_mock

with requests_mock.Mocker() as m:
    # Mock guild-api permission check
    m.get(
        f"{guild_api_url}/guilds/{guild_id}/permissions/check",
        json={"allowed": True, "rank_id": 0, ...},
        status_code=200
    )

    # Make request
    response = client.get(f"/guilds/{guild_id}/progress/characters")
```

---

## Test Coverage

### Generate Coverage Report

```bash
# Run tests with coverage
pytest --cov=app --cov-report=term-missing

# Generate HTML coverage report
pytest --cov=app --cov-report=html

# Open coverage report
open htmlcov/index.html  # macOS
xdg-open htmlcov/index.html  # Linux
```

### Coverage Targets

- **Overall**: >= 80%
- **Routes**: >= 85%
- **Services**: >= 80%
- **Models**: >= 75%

### View Coverage by File

```bash
pytest --cov=app --cov-report=term-missing
```

Output:
```
Name                                    Stmts   Miss  Cover   Missing
---------------------------------------------------------------------
app/__init__.py                            15      0   100%
app/routes/progress.py                    120     12    90%   45-48, 123-125
app/services/permission_service.py         35      3    91%   67-69
app/services/blizzard_service.py           50     10    80%   ...
...
---------------------------------------------------------------------
TOTAL                                     450     45    90%
```

---

## Writing New Tests

### Test Fixtures

Available fixtures in `conftest.py`:

```python
def test_example(app, client, db):
    """
    Args:
        app: Flask application instance
        client: Flask test client
        db: SQLAlchemy database session
    """
    # Your test code here
```

### Testing Authenticated Endpoints

Use the `create_test_token` helper:

```python
from app.middleware.auth import create_test_token

def test_authenticated_endpoint(client, app):
    bnet_id = 12345
    token = create_test_token(bnet_id)
    client.set_cookie("localhost", "access_token", token)

    response = client.get("/guilds/1/progress/characters")
    assert response.status_code == 200
```

### Mocking External APIs

Use `requests-mock`:

```python
import requests_mock

def test_with_external_api(client, app):
    with requests_mock.Mocker() as m:
        # Mock external API
        m.get("https://us.api.blizzard.com/...", json={...})

        # Make request
        response = client.get("/some/endpoint")
        assert response.status_code == 200
```

### Testing Database Operations

```python
from app.models.character_progress import CharacterProgress

def test_database_operation(db):
    # Create test data
    character = CharacterProgress(
        character_name="TestChar",
        realm="area-52",
        guild_id=1,
        current_ilvl=265
    )
    db.add(character)
    db.commit()

    # Query and assert
    result = db.query(CharacterProgress).filter_by(
        character_name="TestChar"
    ).first()
    assert result is not None
    assert result.current_ilvl == 265
```

### Testing Error Cases

```python
def test_error_case(client, app):
    # Test 404 Not Found
    response = client.get("/guilds/999/progress/characters")
    assert response.status_code == 404

    # Test 401 Unauthorized
    response = client.get("/guilds/1/progress/characters")
    assert response.status_code == 401

    # Test 403 Forbidden
    token = create_test_token(12345)
    client.set_cookie("localhost", "access_token", token)
    # Mock permission denied
    response = client.get("/guilds/1/progress/characters")
    assert response.status_code == 403
```

---

## Continuous Integration

Tests run automatically in GitHub Actions on:

- Every push to feature branches
- Every pull request
- Before deployment to dev/staging/production

### CI Test Command

```bash
# What runs in CI
pytest --cov=app --cov-report=xml --cov-report=term

# Coverage threshold check
pytest --cov=app --cov-fail-under=80
```

---

## Troubleshooting

### Test Database Connection Errors

**Issue**: Tests fail with database connection errors

Solution:
```bash
# Ensure PostgreSQL is running
pg_ctl status

# Create test database
createdb hoolgg_test

# Run migrations
export DATABASE_URL=postgresql://hool:hool@localhost:5432/hoolgg_test
alembic upgrade head
```

### Import Errors

**Issue**: `ModuleNotFoundError: No module named 'app'`

Solution:
```bash
# Install in development mode
pip install -e .

# Or ensure you're in the correct directory
cd services/progress-api
pytest
```

### Mock Not Working

**Issue**: External API calls are being made during tests

Solution:
```python
# Ensure mock is scoped correctly
with requests_mock.Mocker() as m:
    # All mocks must be inside this context
    m.get("...", json={...})

    # Make request inside context
    response = client.get("/endpoint")
```

### Fixtures Not Found

**Issue**: `fixture 'xyz' not found`

Solution:
- Check `conftest.py` for fixture definition
- Ensure fixture is in correct scope
- Check fixture name spelling

---

## Performance Testing

### Benchmark Tests

Add performance benchmarks:

```python
import time

def test_performance(client, app):
    start = time.time()

    # Make request
    response = client.get("/guilds/1/progress/characters")

    duration = time.time() - start

    # Assert performance target
    assert duration < 0.5  # 500ms
```

### Load Testing

Use `locust` for load testing:

```bash
pip install locust

# Run load test
locust -f tests/load_test.py --host=http://localhost:5001
```

---

## Test Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Use fixtures to clean up after tests
3. **Mocking**: Mock external dependencies (APIs, services)
4. **Naming**: Use descriptive test names (`test_permission_check_denied`)
5. **Assertions**: Use specific assertions, not just `assert True`
6. **Coverage**: Aim for high coverage, but prioritize critical paths
7. **Speed**: Keep tests fast (mock slow operations)
8. **Documentation**: Add docstrings to complex tests

---

## Quick Reference

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_integration.py

# Run with verbose output
pytest -v

# Run and show print statements
pytest -s

# Run specific test
pytest tests/test_integration.py::TestPermissionIntegration::test_permission_check_allowed

# Run tests matching pattern
pytest -k "permission"

# Run tests and stop on first failure
pytest -x

# Run tests in parallel (requires pytest-xdist)
pytest -n auto
```

---

## Next Steps

After all tests pass:

1. Deploy to dev environment
2. Run manual testing checklist (see DEPLOYMENT.md)
3. Deploy to staging
4. Run QA testing checklist
5. Deploy to production

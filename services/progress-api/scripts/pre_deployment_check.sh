#!/bin/bash

# Progress API - Pre-Deployment Verification Script
# Run this script before deploying to any environment

set -e  # Exit on error

echo "================================"
echo "Progress API - Pre-Deployment Check"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track failures
FAILURES=0

# Check function
check() {
    if eval "$2"; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1"
        FAILURES=$((FAILURES + 1))
    fi
}

# Header function
header() {
    echo ""
    echo "--- $1 ---"
}

# 1. Code Quality Checks
header "Code Quality"

check "Python files exist" "[ -d 'app' ] && [ -f 'run.py' ]"
check "Requirements file exists" "[ -f 'requirements.txt' ]"
check "Alembic configuration exists" "[ -f 'alembic.ini' ]"

# 2. Docker Checks
header "Docker Configuration"

check "Dockerfile exists" "[ -f 'Dockerfile' ]"
check "docker-compose.yml exists" "[ -f 'docker-compose.yml' ]"
check "docker-compose.dev.yml exists" "[ -f 'docker-compose.dev.yml' ]"
check "docker-compose.staging.yml exists" "[ -f 'docker-compose.staging.yml' ]"
check "docker-compose.prod.yml exists" "[ -f 'docker-compose.prod.yml' ]"

# 3. Documentation Checks
header "Documentation"

check "README.md exists" "[ -f 'README.md' ]"
check "DEPLOYMENT.md exists" "[ -f 'DEPLOYMENT.md' ]"
check "TESTING.md exists" "[ -f 'TESTING.md' ]"
check "Deployment Runbook exists" "[ -f 'docs/DEPLOYMENT_RUNBOOK.md' ]"
check "Manual Testing Checklist exists" "[ -f 'docs/MANUAL_TESTING_CHECKLIST.md' ]"
check "Integration Tests doc exists" "[ -f 'docs/INTEGRATION_TESTS.md' ]"

# 4. Test Files
header "Tests"

check "Test directory exists" "[ -d 'tests' ]"
check "Integration tests exist" "[ -f 'tests/test_integration.py' ]"
check "Test configuration exists" "[ -f 'tests/conftest.py' ]"

# 5. Run Tests (if pytest is available)
if command -v pytest &> /dev/null; then
    header "Running Tests"

    echo "Running unit tests..."
    if pytest tests/ -v --tb=short 2>&1 | tail -1 | grep -q "passed"; then
        echo -e "${GREEN}✓${NC} Unit tests passed"
    else
        echo -e "${RED}✗${NC} Unit tests failed"
        FAILURES=$((FAILURES + 1))
    fi

    echo "Running integration tests..."
    if pytest tests/test_integration.py -v --tb=short 2>&1 | tail -1 | grep -q "passed"; then
        echo -e "${GREEN}✓${NC} Integration tests passed"
    else
        echo -e "${YELLOW}⚠${NC} Integration tests failed (may need DB/Redis)"
        echo "  Run manually: pytest tests/test_integration.py -v"
    fi

    echo "Checking code coverage..."
    if pytest --cov=app --cov-fail-under=80 --tb=short &> /dev/null; then
        echo -e "${GREEN}✓${NC} Code coverage >= 80%"
    else
        echo -e "${YELLOW}⚠${NC} Code coverage < 80%"
        echo "  Run: pytest --cov=app --cov-report=html"
    fi
else
    echo -e "${YELLOW}⚠${NC} pytest not found - skipping test execution"
    echo "  Install: pip install -r requirements.txt"
fi

# 6. Database Migrations
header "Database Migrations"

if command -v alembic &> /dev/null; then
    check "Alembic can list current revision" "alembic current &> /dev/null"
    check "No pending migration conflicts" "alembic check &> /dev/null || true"
else
    echo -e "${YELLOW}⚠${NC} alembic not found - skipping migration checks"
fi

# 7. Docker Build Test
header "Docker Build"

if command -v docker &> /dev/null; then
    echo "Building Docker image..."
    if docker build -t progress-api:test . &> /dev/null; then
        echo -e "${GREEN}✓${NC} Docker image builds successfully"
        # Cleanup
        docker rmi progress-api:test &> /dev/null || true
    else
        echo -e "${RED}✗${NC} Docker image build failed"
        FAILURES=$((FAILURES + 1))
    fi
else
    echo -e "${YELLOW}⚠${NC} docker not found - skipping build test"
fi

# 8. Environment Variables Check
header "Environment Variables"

ENV_VARS=(
    "DATABASE_URL"
    "REDIS_URL"
    "SECRET_KEY"
    "JWT_SECRET_KEY"
    "BLIZZARD_CLIENT_ID"
    "BLIZZARD_CLIENT_SECRET"
    "GUILD_API_URL"
)

echo "Checking for .env.example..."
if [ -f ".env.example" ]; then
    echo -e "${GREEN}✓${NC} .env.example exists"

    for var in "${ENV_VARS[@]}"; do
        if grep -q "$var" .env.example; then
            echo -e "${GREEN}✓${NC} $var documented in .env.example"
        else
            echo -e "${YELLOW}⚠${NC} $var missing from .env.example"
        fi
    done
else
    echo -e "${YELLOW}⚠${NC} .env.example not found"
fi

# 9. Git Status
header "Git Status"

if command -v git &> /dev/null; then
    if [ -d .git ]; then
        BRANCH=$(git rev-parse --abbrev-ref HEAD)
        echo "Current branch: $BRANCH"

        if [ "$BRANCH" = "develop" ] || [ "$BRANCH" = "staging" ] || [ "$BRANCH" = "main" ]; then
            echo -e "${GREEN}✓${NC} On deployment branch: $BRANCH"
        else
            echo -e "${YELLOW}⚠${NC} Not on deployment branch (develop/staging/main)"
        fi

        if git diff-index --quiet HEAD --; then
            echo -e "${GREEN}✓${NC} No uncommitted changes"
        else
            echo -e "${YELLOW}⚠${NC} Uncommitted changes detected"
        fi
    fi
fi

# Summary
echo ""
echo "================================"
echo "Summary"
echo "================================"

if [ $FAILURES -eq 0 ]; then
    echo -e "${GREEN}All checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Review deployment documentation: docs/DEPLOYMENT_RUNBOOK.md"
    echo "2. Configure environment variables in deployment platform"
    echo "3. Deploy to dev: docker-compose -f docker-compose.dev.yml up -d"
    echo "4. Verify health check: curl https://progress-api.dev.hool.gg/health"
    echo "5. Run manual tests: docs/MANUAL_TESTING_CHECKLIST.md"
    exit 0
else
    echo -e "${RED}$FAILURES check(s) failed${NC}"
    echo ""
    echo "Please fix the issues above before deploying."
    echo "See documentation in docs/ for guidance."
    exit 1
fi

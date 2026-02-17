#!/bin/bash
# Test script to verify Alembic migrations are reversible
# This script tests that migrations can be applied and rolled back successfully

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Testing Alembic Migrations${NC}"
echo "=================================="

# Ensure we're in the correct directory
cd "$(dirname "$0")"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}ERROR: DATABASE_URL environment variable is not set${NC}"
    echo "Please set DATABASE_URL to your test database connection string"
    echo "Example: export DATABASE_URL='postgresql://hool:hool@localhost:5432/hoolgg_test'"
    exit 1
fi

echo -e "${GREEN}Using database: $DATABASE_URL${NC}"
echo ""

# Function to run alembic command and check result
run_alembic() {
    local cmd=$1
    local description=$2

    echo -e "${YELLOW}Running: $description${NC}"
    if alembic $cmd; then
        echo -e "${GREEN}✓ Success: $description${NC}"
        echo ""
        return 0
    else
        echo -e "${RED}✗ Failed: $description${NC}"
        exit 1
    fi
}

# Test migration workflow
echo "Step 1: Check current revision"
run_alembic "current" "Check current database revision"

echo "Step 2: Upgrade to latest (head)"
run_alembic "upgrade head" "Apply all migrations"

echo "Step 3: Show current revision after upgrade"
run_alembic "current" "Verify migrations applied"

echo "Step 4: Test downgrade to base (remove all migrations)"
run_alembic "downgrade base" "Rollback all migrations"

echo "Step 5: Verify database is at base"
run_alembic "current" "Verify database is empty"

echo "Step 6: Re-apply migrations"
run_alembic "upgrade head" "Re-apply all migrations"

echo "Step 7: Test individual migration downgrades"
echo -e "${YELLOW}Downgrading one step at a time...${NC}"

# Downgrade migration 4 (guild_permissions)
run_alembic "downgrade 003" "Downgrade to revision 003 (remove guild_permissions)"

# Downgrade migration 3 (guild_members)
run_alembic "downgrade 002" "Downgrade to revision 002 (remove guild_members)"

# Downgrade migration 2 (guilds)
run_alembic "downgrade 001" "Downgrade to revision 001 (remove guilds)"

# Downgrade migration 1 (users)
run_alembic "downgrade base" "Downgrade to base (remove users)"

echo "Step 8: Final upgrade to latest"
run_alembic "upgrade head" "Final upgrade to head"

echo ""
echo -e "${GREEN}=================================="
echo "All migration tests passed! ✓"
echo "=================================${NC}"
echo ""
echo "Migration summary:"
echo "  - 001: users table"
echo "  - 002: guilds table"
echo "  - 003: guild_members table"
echo "  - 004: guild_permissions table"
echo ""
echo "All migrations are reversible and working correctly."

# CI/CD Pipeline Specification

GitHub Actions for linting, building, testing, and deployment. Three environments (dev, staging, prod). Optimized to avoid redundant testing. Semantic versioning with git tags.

## ADDED Requirements

### Requirement: Automated Testing on PR to Develop
All PRs to develop SHALL run full test suite before merging.

#### Scenario: PR to develop triggers GitHub Actions
- **WHEN** developer opens PR against develop branch
- **THEN** GitHub Actions workflow starts automatically:
  1. Checkout code
  2. Install dependencies (pnpm install)
  3. Run linter (eslint, black, isort)
  4. Run typecheck (tsc, mypy)
  5. Build all packages (turbo build)
  6. Run unit tests (jest, pytest)
- **AND** workflow displays status on PR

#### Scenario: Linting failures block merge
- **WHEN** eslint/black finds issues
- **THEN** workflow reports: ❌ "Linting failed"
- **AND** PR shows "Some checks failed"
- **AND** merge button is disabled
- **AND** developer must fix and push again

#### Scenario: Test failures block merge
- **WHEN** jest/pytest finds failing tests
- **THEN** workflow reports: ❌ "Tests failed (2 failures)"
- **AND** developer can click to see details
- **AND** must fix before merge

#### Scenario: All checks pass, green light
- **WHEN** all steps pass (lint, typecheck, build, test)
- **THEN** workflow reports: ✅ "All checks passed"
- **AND** merge button is enabled
- **AND** developer can merge PR

---

### Requirement: Auto-Deploy to Dev on Merge
Merging to develop SHALL automatically deploy to dev.hool.gg.

#### Scenario: PR is merged to develop
- **WHEN** developer merges feature PR
- **THEN** GitHub Actions runs full test suite again (confirmation)
- **AND** if all pass, builds Docker images:
  - Tag: `dev-latest`, `dev-{commit-hash}`
- **AND** pushes images to registry

#### Scenario: Images are deployed to dev environment
- **WHEN** images are pushed
- **THEN** Coolify webhook triggers
- **AND** Coolify pulls images
- **AND** restarts services on dev.hool.gg
- **AND** runs smoke tests (health checks)
- **AND** deployment completes (~2-3 minutes)

#### Scenario: Developers can test immediately
- **WHEN** deployment completes
- **THEN** developers can test at https://dev.hool.gg
- **AND** latest code is live
- **AND** can iterate quickly

---

### Requirement: Optimized Testing on Staging
Staging deployments skip redundant tests; images from staging are re-tagged for prod.

#### Scenario: PR to staging runs full tests
- **WHEN** PR is opened develop → staging
- **THEN** GitHub Actions runs full test suite
- **AND** builds Docker images: tag `staging-latest`
- **AND** if passing, auto-merges and deploys to staging.hool.gg

#### Scenario: Staging images are tested
- **WHEN** images are deployed
- **THEN** smoke tests run on staging.hool.gg
- **AND** system checks:
  - API responds (200 OK)
  - Database is accessible
  - Auth flow works
  - Health check endpoints respond
- **AND** if all pass, deployment considered successful

#### Scenario: Staging database can be seeded with prod-like data
- **WHEN** staging deployment completes
- **THEN** optional: run data seeding script
- **AND** populate with realistic test data
- **AND** team can test realistically

---

### Requirement: Production Deployment (Manual, No Redundant Testing)
Deploying to prod SHALL NOT re-run tests; images are promoted from staging.

#### Scenario: PR to main triggers smoke tests and approval
- **WHEN** PR is opened staging → main
- **THEN** GitHub Actions runs smoke tests only (lint/typecheck/build/unit already passed on staging):
  1. Health check verification
  2. Build confirmation (no new code changes)
  3. If passing, awaits manual approval
- **AND** workflow reports: ⏸️ "Waiting for approval"
- **AND** developer/maintainer gets notification
- **AND** full test suite is available as optional safety net (not required)

#### Scenario: Manual approval is required for production
- **WHEN** workflow is waiting
- **THEN** human must review and approve
- **AND** developer clicks "Approve" button in GitHub Actions
- **AND** workflow continues

#### Scenario: Images are tagged with version
- **WHEN** approval is given
- **THEN** GitHub Actions:
  1. Tags Docker images: `v1.0.0` (from git tag or VERSION file)
  2. Pushes tagged images to registry
- **AND** git tag is created automatically: `v1.0.0`

#### Scenario: No re-testing on production deploy
- **WHEN** images are already tested on staging
- **AND** being promoted to production
- **THEN** GitHub Actions skips: lint, typecheck, build, unit tests
- **AND** goes directly to: deploy images, run smoke tests
- **AND** deployment is ~5 minutes (not 15 like first time)

#### Scenario: Production deployment triggers alerts
- **WHEN** images are deployed to production
- **THEN** GitHub Actions:
  1. Runs smoke tests
  2. Monitors for errors (first 5 min)
  3. Notifies Slack/Discord: "🚀 Deployed v1.0.0"
  4. Includes: version, changes, deployment time
- **AND** team is informed deployment is live

#### Scenario: Post-deployment monitoring
- **WHEN** deployment completes
- **THEN** system monitors:
  - Error rate (should be <1%)
  - Response time (should be <500ms)
  - API health
- **AND** if metrics spike, alerts are sent
- **AND** team can manual rollback if needed

---

### Requirement: Git Flow Branching Structure
Branching strategy SHALL follow Git Flow (main/staging/develop).

#### Scenario: Developer creates feature branch
- **WHEN** starting new work
- **THEN** developer creates branch from develop:
  ```
  git checkout develop
  git pull origin develop
  git checkout -b feature/guild-creation
  ```

#### Scenario: Branch naming follows convention
- **WHEN** branches are created
- **THEN** naming follows pattern:
  - `feature/` — new features
  - `bugfix/` — bug fixes
  - `design/` — design changes
  - `chore/` — refactoring, cleanup
- **AND** example: `feature/guild-creation`, `bugfix/auth-timeout`

#### Scenario: Feature branch is merged to develop
- **WHEN** feature is complete
- **THEN** developer opens PR: feature/guild-creation → develop
- **AND** PR description explains changes
- **AND** tests pass, PR is merged
- **AND** branch is deleted (auto by GitHub)

#### Scenario: Develop branch flows to staging
- **WHEN** develop is ready for wider testing
- **THEN** developer creates PR: develop → staging
- **AND** staging gets deployed
- **AND** team tests on staging.hool.gg

#### Scenario: Staging branch flows to main (production)
- **WHEN** testing on staging is complete
- **THEN** developer creates PR: staging → main
- **AND** review/approval step happens
- **AND** merged to main
- **AND** production is deployed

#### Scenario: Hotfixes branch from main
- **WHEN** critical production bug is found
- **THEN** developer creates branch from main:
  ```
  git checkout main
  git checkout -b hotfix/critical-auth-bug
  ```
- **AND** fix is merged to main (emergency)
- **AND** also merged back to staging/develop

---

### Requirement: Docker Image Building and Registry
All services SHALL be built as Docker images.

#### Scenario: Dockerfile exists for each service
- **WHEN** code is in monorepo
- **THEN** each service has Dockerfile:
  - services/guild-api/Dockerfile
  - services/progress-api/Dockerfile
  - services/recruitment-api/Dockerfile
  - apps/web/Dockerfile
- **AND** images are multi-stage (build → runtime)

#### Scenario: GitHub Actions builds images
- **WHEN** tests pass and deployment is triggered
- **THEN** GitHub Actions builds images:
  ```
  docker build -t registry/guild-api:dev-latest .
  docker push registry/guild-api:dev-latest
  ```
- **AND** images are pushed to registry (Docker Hub, or private)

#### Scenario: Image tags are consistent
- **WHEN** images are built
- **THEN** tags follow pattern:
  - `dev-latest` (latest develop build)
  - `dev-abc123` (commit hash)
  - `staging-latest` (latest staging)
  - `v1.0.0` (production release)

---

### Requirement: Database Migrations with Alembic
Database schema changes SHALL use Alembic for version control.

#### Scenario: Migration is created locally
- **WHEN** developer makes schema change
- **THEN** runs:
  ```
  cd services/guild-api
  alembic revision --autogenerate -m "add_guild_table"
  ```
- **AND** migration file is created
- **AND** developer reviews generated migration

#### Scenario: Migration is tested locally
- **WHEN** migration is created
- **THEN** developer tests:
  ```
  alembic upgrade head    # apply migration
  alembic downgrade -1    # rollback (verify reversible)
  ```
- **AND** migration file is committed

#### Scenario: Migrations run before deployments
- **WHEN** GitHub Actions deploys to any environment
- **THEN** before services restart:
  1. Coolify (or deployment script) runs:
     ```
     alembic upgrade head
     ```
  2. If migration fails, deployment stops
  3. If migration passes, services restart
  4. If migration has errors, automatic rollback:
     ```
     alembic downgrade -1
     ```

#### Scenario: Backward-compatible migrations prevent downtime
- **WHEN** schema must change without downtime
- **THEN** migration follows pattern:
  - Phase 1: Add new column (code ignores it)
  - Phase 2: Code uses new column
  - Phase 3: Drop old column (if needed)

---

### Requirement: Rollback Strategy
If production deployment fails, system SHALL support quick rollback.

#### Scenario: Manual rollback via git revert
- **WHEN** production is broken
- **THEN** developer can:
  ```
  git checkout main
  git revert {bad-commit}
  git push origin main
  ```
- **AND** GitHub Actions redeployments
- **AND** production is restored (~5 min)

#### Scenario: Rollback via Docker tag
- **WHEN** images are bad
- **THEN** developer can manually redeploy previous version:
  ```
  Coolify → Services → Select image tag: v1.0.0-previous
  ```
- **AND** Coolify restarts with old image

#### Scenario: Database rollback (if migration failed)
- **WHEN** migration caused issues
- **THEN** developer can run:
  ```
  alembic downgrade -1
  ```
- **AND** schema is reverted
- **AND** services remain functional

---

### Requirement: Monitoring and Alerting Post-Deployment
Production deployments SHALL be monitored for errors and performance issues.

#### Scenario: Health checks run after deployment
- **WHEN** production deployment completes
- **THEN** GitHub Actions runs smoke tests:
  - HTTP 200 on health endpoints
  - Database connectivity
  - Auth flow test
- **AND** if any fail, sends alert

#### Scenario: Error rate is monitored
- **WHEN** production is live
- **THEN** monitoring tracks error rate (5xx responses)
- **AND** if error rate > 5%, sends Slack alert
- **AND** alert includes: error type, frequency, affected endpoint

#### Scenario: Performance degradation triggers alerts
- **WHEN** API response time increases
- **THEN** monitoring tracks p95 response time
- **AND** if > 1000ms (baseline ~300ms), sends alert
- **AND** developer can manually rollback

#### Scenario: Alerts are sent to appropriate channels
- **WHEN** issues are detected
- **THEN** alerts go to:
  - Slack: #deployments channel
  - Email: developer list (optional)
  - PagerDuty: if critical (optional)

---

### Requirement: Semantic Versioning and Release Notes
Releases SHALL use semantic versioning with automated changelog.

#### Scenario: Version numbers follow SemVer
- **WHEN** releases are tagged
- **THEN** version format is: `vMAJOR.MINOR.PATCH`
- **AND** examples:
  - `v1.0.0` — first release
  - `v1.1.0` — new feature (progress tool)
  - `v1.1.1` — bug fix
  - `v2.0.0` — breaking change (rare)

#### Scenario: Release notes are auto-generated
- **WHEN** PR is merged with conventional commit message
- **THEN** commit format: `feat: add guild creation`, `fix: auth timeout`
- **AND** GitHub Actions parses commits
- **AND** generates release notes:
  ```
  ## v1.0.0
  ### Features
  - Add guild creation flow
  - Add character progress tracking
  ### Fixes
  - Fix auth token refresh timing
  ### Migration Notes
  - Database: run `alembic upgrade head`
  ```

#### Scenario: Release notes are posted
- **WHEN** version is tagged
- **THEN** GitHub creates Release page with:
  - Version number
  - Changelog (auto-generated)
  - Download links
  - Migration instructions
- **AND** developers/users can see what changed

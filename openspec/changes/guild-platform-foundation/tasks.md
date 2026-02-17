# Guild Platform Foundation - Tasks

## Phase 0: Foundation Infrastructure

### Blizzard OAuth & Auth (Capability: blizzard-oauth)

- [ ] 0.1 Create guild-api Flask service scaffold
- [ ] 0.2 Set up guild-api database models (users, guilds, guild_members tables)
- [ ] 0.3 Register hool.gg app with Blizzard OAuth developer portal
- [ ] 0.4 Implement Blizzard OAuth endpoint: GET /auth/login
- [ ] 0.5 Implement Blizzard OAuth callback handler: GET /auth/callback
- [ ] 0.6 Implement JWT access token generation (15-min lifetime)
- [ ] 0.7 Implement JWT refresh token generation (7-day lifetime)
- [ ] 0.8 Configure httpOnly cookies, Secure flag, SameSite=Lax
- [ ] 0.9 Implement token refresh endpoint: POST /auth/refresh
- [ ] 0.10 Implement logout endpoint: POST /auth/logout (token revocation)
- [ ] 0.11 Create character fetching service (query Blizzard API for characters)
- [ ] 0.12 Create guild_members sync on login (store character → guild → rank)
- [ ] 0.13 Implement background job: hourly character rank sync (Alembic ready)
- [ ] 0.14 Add rate limiting and circuit breaker for Blizzard API calls
- [ ] 0.15 Create guild-api health check endpoint: GET /health
- [ ] 0.16 Deploy guild-api to dev.hool.gg

### Guild Management (Capability: guild-management)

- [ ] 0.17 Implement guild creation endpoint: POST /guilds
- [ ] 0.18 Create guild_permissions table (tool_name, min_rank_id, enabled)
- [ ] 0.19 Initialize default permissions (strict: all disabled) on guild creation
- [ ] 0.20 Implement guild settings endpoint: GET /guilds/{guild_id}/settings
- [ ] 0.21 Implement guild settings update endpoint: PUT /guilds/{guild_id}/settings
- [ ] 0.22 Implement guild roster endpoint: GET /guilds/{guild_id}/members
- [ ] 0.23 Implement permission configuration endpoint: PUT /guilds/{guild_id}/permissions
- [ ] 0.24 Create permission check middleware: verify rank on every request
- [ ] 0.25 Implement guild-api permission endpoint: GET /guilds/{guild_id}/permissions/check
- [ ] 0.26 Add Redis caching for permission checks (5-min TTL)
- [ ] 0.27 Implement guild member sync from Blizzard API
- [ ] 0.28 Create soft delete for guilds (deleted_at field)
- [ ] 0.29 Test guild creation → permission defaults → member sync flow

### Core Database & Caching

- [ ] 0.30 Set up PostgreSQL schema migration with Alembic
- [ ] 0.31 Create migration: users table (bnet_id, username)
- [ ] 0.32 Create migration: guilds table (id, name, realm, gm_bnet_id)
- [ ] 0.33 Create migration: guild_members table (character_name, guild_id, bnet_id, rank_id, rank_name, last_sync)
- [ ] 0.34 Create migration: guild_permissions table (guild_id, tool_name, min_rank_id, enabled)
- [ ] 0.35 Set up Redis connection pool and caching layer
- [ ] 0.36 Verify all migrations are reversible (test downgrade)
- [ ] 0.37 Deploy to staging, test migrations

---

## Phase 1: Character Progress Tool

### Progress API Service Setup (Capability: character-progress-tracking)

- [ ] 1.1 Migrate midnight_tracker code into services/progress-api/
- [ ] 1.2 Refactor progress-api to use guild-api for auth/permissions
- [ ] 1.3 Create migration: character_progress table (character_name, guild_id, current_ilvl, gear_details)
- [ ] 1.4 Create migration: weekly_targets table (expansion_id, week, ilvl_target)
- [ ] 1.5 Create migration: guild_messages table (guild_id, gm_message, created_at)
- [ ] 1.6 Implement endpoint: GET /guilds/{guild_id}/progress/characters
- [ ] 1.7 Implement endpoint: GET /guilds/{guild_id}/progress/character/{character_name}
- [ ] 1.8 Implement Blizzard API integration: fetch character gear on request
- [ ] 1.9 Implement iLvl calculation from equipped items
- [ ] 1.10 Implement weekly target comparison logic

### GM Features

- [ ] 1.11 Implement GM endpoint: PUT /guilds/{guild_id}/progress/message (set weekly guidance)
- [ ] 1.12 Implement GM endpoint: GET /guilds/{guild_id}/progress/members (guild overview)
- [ ] 1.13 Implement sorting/filtering in guild overview (by iLvl, class, status)
- [ ] 1.14 Implement WarcraftLogs public API integration (realm comparison)
- [ ] 1.15 Implement endpoint: GET /guilds/{guild_id}/progress/comparisons (WCL data)
- [ ] 1.16 Implement expansion roadmap endpoint: GET /guilds/{guild_id}/progress/roadmap

### UI Components (Progress Tool)

- [ ] 1.17 Create Progress page route: /guilds/[guildId]/progress in Next.js
- [ ] 1.18 Create character progress card component (using design system)
- [ ] 1.19 Create character iLvl tracker with visual progress bar
- [ ] 1.20 Create gear priority list component
- [ ] 1.21 Create guild overview table component (all members)
- [ ] 1.22 Create weekly guidance message display
- [ ] 1.23 Create expansion roadmap visualization
- [ ] 1.24 Create realm comparison view (WCL data display)
- [ ] 1.25 Implement sorting/filtering UI (columns, dropdowns)
- [ ] 1.26 Implement export as PDF (character progress report)
- [ ] 1.27 Test all progress pages with design system consistency

### Testing & Deployment

- [ ] 1.28 Unit tests: progress-api endpoints (80%+ coverage)
- [ ] 1.29 Integration tests: progress-api + guild-api permission flow
- [ ] 1.30 E2E tests: character login → view progress → see GM message
- [ ] 1.31 Deploy progress-api to dev.hool.gg
- [ ] 1.32 Deploy progress UI to dev.hool.gg
- [ ] 1.33 Manual testing on dev (all scenarios from spec)
- [ ] 1.34 Deploy to staging.hool.gg
- [ ] 1.35 QA testing on staging
- [ ] 1.36 Promote to production (v1.0.0)

---

## Phase 2: Recruitment Tool

### Recruitment API Service Setup (Capability: recruitment-tools)

- [ ] 2.1 Migrate discord_rio_recruitment_py code into services/recruitment-api/
- [ ] 2.2 Refactor recruitment-api to use guild-api for auth/permissions
- [ ] 2.3 Create migration: recruitment_candidates table (guild_id, candidate_name, class, role, ilvl, source, notes, rating, status)
- [ ] 2.4 Create migration: recruitment_categories table (guild_id, category_name, custom)
- [ ] 2.5 Create migration: recruitment_history table (guild_id, candidate_name, contacted_date, method, response)
- [ ] 2.6 Implement Raider.io API integration (candidate search, profile fetching)
- [ ] 2.7 Implement WoW Progress API integration (candidate search)
- [ ] 2.8 Implement Discord webhook endpoint (optional, for Discord channel scanning)
- [ ] 2.9 Implement candidate search endpoint: POST /guilds/{guild_id}/recruitment/search

### Candidate Management

- [ ] 2.10 Implement endpoint: GET /guilds/{guild_id}/recruitment/candidates (list)
- [ ] 2.11 Implement endpoint: GET /guilds/{guild_id}/recruitment/candidates/{candidate_id}
- [ ] 2.12 Implement endpoint: POST /guilds/{guild_id}/recruitment/candidates (add manual candidate)
- [ ] 2.13 Implement endpoint: PUT /guilds/{guild_id}/recruitment/candidates/{candidate_id} (update rating, notes)
- [ ] 2.14 Implement endpoint: PUT /guilds/{guild_id}/recruitment/candidates/{candidate_id}/status (move between categories)
- [ ] 2.15 Implement endpoint: POST /guilds/{guild_id}/recruitment/candidates/{candidate_id}/contact (log contact)
- [ ] 2.16 Implement endpoint: GET /guilds/{guild_id}/recruitment/pipeline (Kanban view)
- [ ] 2.17 Implement filtering/sorting: by role, class, iLvl, status, source
- [ ] 2.18 Implement candidate comparison: GET /guilds/{guild_id}/recruitment/compare

### Advanced Features

- [ ] 2.19 Implement raid composition view: GET /guilds/{guild_id}/recruitment/composition
- [ ] 2.20 Implement WarcraftLogs parse data fetching (if available)
- [ ] 2.21 Implement custom category creation: POST /guilds/{guild_id}/recruitment/categories
- [ ] 2.22 Implement communication history tracking
- [ ] 2.23 Add permission checks (Officer+ only by default)

### UI Components (Recruitment Tool)

- [ ] 2.24 Create Recruitment page route: /guilds/[guildId]/recruitment
- [ ] 2.25 Create candidate search form component
- [ ] 2.26 Create candidate card component (design system styling)
- [ ] 2.27 Create candidate details panel (profile, rating, notes)
- [ ] 2.28 Create candidate comparison table
- [ ] 2.29 Create Kanban board for recruitment pipeline
- [ ] 2.30 Create raid composition view (needs visualization)
- [ ] 2.31 Implement sorting/filtering UI (multiple criteria)
- [ ] 2.32 Implement contact logging UI (modal form)
- [ ] 2.33 Test all recruitment pages with design system

### Testing & Deployment

- [ ] 2.34 Unit tests: recruitment-api endpoints (80%+ coverage)
- [ ] 2.35 Integration tests: recruitment-api + guild-api permission flow
- [ ] 2.36 E2E tests: search candidates → rate → organize pipeline
- [ ] 2.37 Deploy recruitment-api to dev.hool.gg
- [ ] 2.38 Deploy recruitment UI to dev.hool.gg
- [ ] 2.39 Manual testing on dev (all scenarios from spec)
- [ ] 2.40 Deploy to staging.hool.gg
- [ ] 2.41 QA testing on staging
- [ ] 2.42 Promote to production (v1.1.0)

---

## Phase 3: Frontend Platform

### Authentication Routes

- [ ] 3.1 Create auth route group: app/auth/
- [ ] 3.2 Implement login page: /auth/login (Blizzard OAuth button)
- [ ] 3.3 Implement OAuth callback handler: /auth/callback (exchange code for token)
- [ ] 3.4 Implement guild selection page: /guilds (list accessible guilds)
- [ ] 3.5 Implement logout handler: /auth/logout
- [ ] 3.6 Implement redirect logic (if authenticated, skip login; if not, redirect to login)

### Guild Dashboard & Navigation

- [ ] 3.7 Create guild route group: app/(platform)/guilds/[guildId]/
- [ ] 3.8 Create shared layout: guilds/[guildId]/layout.tsx (persistent nav)
- [ ] 3.9 Implement top navbar: guild selector, logout, current tool indicator
- [ ] 3.10 Implement sidebar navigation (Progress, Recruitment, Settings for GMs)
- [ ] 3.11 Create dashboard page: /guilds/[guildId] (welcome, quick stats)
- [ ] 3.12 Implement guild context provider (pass guild_id, permissions to children)

### Permissions & Access Control

- [ ] 3.13 Create permission checker hook (usePermissions)
- [ ] 3.14 Implement protected route wrapper (redirect if unauthorized)
- [ ] 3.15 Implement role-based rendering (show/hide buttons, links based on rank)
- [ ] 3.16 Implement API middleware (add JWT token to requests)
- [ ] 3.17 Handle 403 Forbidden errors (redirect to dashboard, show message)

### Design System Integration

- [ ] 3.18 Import @hool/design-system into Next.js app
- [ ] 3.19 Apply design tokens to layout (spacing, colors, typography)
- [ ] 3.20 Verify all buttons use sticker-style Button component
- [ ] 3.21 Verify all inputs use design system Input component
- [ ] 3.22 Verify all cards use glassmorphism styling (backdrop blur)
- [ ] 3.23 Ensure loading states use design system animations
- [ ] 3.24 Verify dark theme is applied globally
- [ ] 3.25 Test responsiveness (mobile, tablet, desktop)

### Progress Tool Integration

- [ ] 3.26 Create route: /guilds/[guildId]/progress (main page)
- [ ] 3.27 Fetch progress-api endpoint on mount (with permission check)
- [ ] 3.28 Display character progress cards (iLvl, target, progress bar)
- [ ] 3.29 Display multi-alt selector (if user has multiple characters in guild)
- [ ] 3.30 Display guild overview table (with sorting/filtering)
- [ ] 3.31 Display weekly guidance message (from GM)
- [ ] 3.32 Create GM-only route: /guilds/[guildId]/progress/settings
- [ ] 3.33 Implement GM message editor
- [ ] 3.34 Implement expansion roadmap editor (GM only)
- [ ] 3.35 Display WarcraftLogs comparison view (public data)
- [ ] 3.36 Implement export as PDF button

### Recruitment Tool Integration

- [ ] 3.37 Create route: /guilds/[guildId]/recruitment (main page)
- [ ] 3.38 Fetch recruitment-api endpoints on mount
- [ ] 3.39 Display candidate search form (role, class, iLvl filters)
- [ ] 3.40 Display candidate list (with sorting/filtering UI)
- [ ] 3.41 Display candidate detail panel (profile, rating, notes)
- [ ] 3.42 Display Kanban board (pipeline visualization)
- [ ] 3.43 Implement candidate comparison UI
- [ ] 3.44 Implement contact logging modal
- [ ] 3.45 Create GM-only route: /guilds/[guildId]/recruitment/settings
- [ ] 3.46 Implement recruitment category management (GM only)

### Guild Settings (GM Only)

- [ ] 3.47 Create route: /guilds/[guildId]/settings (GM only)
- [ ] 3.48 Create settings layout: tabs (General, Tools, Members, Permissions)
- [ ] 3.49 Implement General tab: guild name, realm, description editor
- [ ] 3.50 Implement Tools tab: enable/disable tools, set rank requirements
- [ ] 3.51 Implement Members tab: roster view, role assignments
- [ ] 3.52 Implement Permissions tab: audit log (optional)
- [ ] 3.53 Implement danger zone: deactivate guild instance

### Error Handling & Loading States

- [ ] 3.54 Create Error Boundary component (catch component crashes)
- [ ] 3.55 Implement loading skeletons (progress cards, candidate list, etc.)
- [ ] 3.56 Implement error messages (API failures, auth errors, permission denials)
- [ ] 3.57 Implement offline detection (warn user if no internet)
- [ ] 3.58 Implement retry logic (button to retry failed requests)

### Testing

- [ ] 3.59 E2E tests: login → guild selection → view progress (Playwright/Cypress)
- [ ] 3.60 E2E tests: officer login → enable tool → member sees it
- [ ] 3.61 E2E tests: recruitment search → rate → organize candidates
- [ ] 3.62 Accessibility tests: keyboard nav, screen reader compatibility
- [ ] 3.63 Performance tests: Lighthouse score (90+)
- [ ] 3.64 Responsive tests: mobile, tablet, desktop layouts

### Deployment & Polish

- [ ] 3.65 Deploy frontend to dev.hool.gg
- [ ] 3.66 Manual testing on dev (all user flows)
- [ ] 3.67 Deploy to staging.hool.gg
- [ ] 3.68 QA testing on staging (full integration with both APIs)
- [ ] 3.69 Fix any integration bugs
- [ ] 3.70 Promote to production (v1.0.0, if progress/recruitment ready)

---

## Phase 4: CI/CD & Monitoring

### GitHub Actions & Deployment Pipelines

- [ ] 4.1 Create .github/workflows/test.yml (lint, typecheck, build, test on PR)
- [ ] 4.2 Create .github/workflows/deploy-dev.yml (auto-deploy on merge to develop)
- [ ] 4.3 Create .github/workflows/deploy-staging.yml (auto-deploy on merge to staging)
- [ ] 4.4 Create .github/workflows/deploy-prod.yml (manual approval, tag release on merge to main)
- [ ] 4.5 Set up Docker registry (Docker Hub or private)
- [ ] 4.6 Create Dockerfile for guild-api (multi-stage build)
- [ ] 4.7 Create Dockerfile for progress-api
- [ ] 4.8 Create Dockerfile for recruitment-api
- [ ] 4.9 Create Dockerfile for Next.js frontend
- [ ] 4.10 Test Docker images locally (docker build, run)
- [ ] 4.11 Configure GitHub Actions to build and push images
- [ ] 4.12 Set up Coolify deployment hooks (auto-deploy on image push)

### Database Migrations

- [ ] 4.13 Verify Alembic is configured for guild-api
- [ ] 4.14 Verify Alembic is configured for progress-api
- [ ] 4.15 Verify Alembic is configured for recruitment-api
- [ ] 4.16 Test migration up/down (locally and in staging)
- [ ] 4.17 Create rollback procedure documentation

### Monitoring & Alerting

- [ ] 4.18 Set up health check endpoints for all services
- [ ] 4.19 Configure Coolify health checks (or monitoring tool)
- [ ] 4.20 Set up error rate monitoring (target: <1%)
- [ ] 4.21 Set up response time monitoring (target: <500ms p95)
- [ ] 4.22 Configure Slack/Discord alerts for deployment events
- [ ] 4.23 Configure alerts for errors and performance degradation
- [ ] 4.24 Create runbook: manual rollback procedure
- [ ] 4.25 Create runbook: emergency hotfix procedure

### Documentation

- [ ] 4.26 Document deployment process (Git Flow, branch strategy)
- [ ] 4.27 Document CI/CD pipeline (what runs where, when)
- [ ] 4.28 Document how to deploy manually (if needed)
- [ ] 4.29 Document Alembic migration workflow
- [ ] 4.30 Document troubleshooting (common issues, solutions)
- [ ] 4.31 Update CLAUDE.md with CI/CD and versioning info (already done)

---

## Phase 5: Testing & Launch

### Integration Testing

- [ ] 5.1 E2E test: create guild → set permissions → member joins
- [ ] 5.2 E2E test: login flow (Blizzard OAuth → guild selection)
- [ ] 5.3 E2E test: character rank changes → permission revoked
- [ ] 5.4 E2E test: GM enables tool → members see it
- [ ] 5.5 E2E test: full recruitment flow (search → rate → contact)
- [ ] 5.6 E2E test: full progress flow (login → view character → see GM message)
- [ ] 5.7 Performance testing: load test with mock data (100+ guilds)
- [ ] 5.8 Accessibility audit: WCAG 2.1 AA compliance

### Bug Fixes & Edge Cases

- [ ] 5.9 Test edge case: user with no characters in guilds with hool.gg
- [ ] 5.10 Test edge case: character leaves guild (sync, access revoked)
- [ ] 5.11 Test edge case: character demoted (rank changes, perms revoked)
- [ ] 5.12 Test edge case: Blizzard API slow/down (caching fallback)
- [ ] 5.13 Test edge case: database migration fails (rollback works)
- [ ] 5.14 Test edge case: production deployment fails (rollback works)
- [ ] 5.15 Fix any bugs found during testing
- [ ] 5.16 Performance optimization (if needed)

### Production Readiness

- [ ] 5.17 Verify all secrets are in env vars (no hardcoded keys)
- [ ] 5.18 Verify database backups are working
- [ ] 5.19 Verify monitoring/alerting is active
- [ ] 5.20 Verify runbooks are accessible to team
- [ ] 5.21 Verify SSL/TLS is working (HTTPS only)
- [ ] 5.22 Verify rate limiting is in place
- [ ] 5.23 Create release notes for v1.0.0

### Launch

- [ ] 5.24 Final QA sign-off
- [ ] 5.25 Deploy v1.0.0 to production
- [ ] 5.26 Monitor first 24 hours (watch error rates, performance)
- [ ] 5.27 Notify users / share launch announcement
- [ ] 5.28 Retrospective (what went well, what to improve)

---

## Ongoing / Future

### Optional Enhancements (Post-Launch)

- [ ] 6.1 Raid planning tool (visual planner, callout integration)
- [ ] 6.2 Discord bot integration (commands, webhooks)
- [ ] 6.3 Real-time notifications (WebSockets, notifications)
- [ ] 6.4 Guild analytics dashboard (trends, metrics)
- [ ] 6.5 Cross-guild data comparisons (public leaderboards)
- [ ] 6.6 Mobile app (iOS/Android)
- [ ] 6.7 API rate limit tuning (based on real usage)
- [ ] 6.8 Performance optimization (if bottlenecks appear)

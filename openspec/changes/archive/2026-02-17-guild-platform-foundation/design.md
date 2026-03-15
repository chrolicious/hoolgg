# Guild Platform Foundation - Design

## Context

**Current State:**
- Two standalone Flask applications: discord_rio_recruitment_py and midnight_tracker
- Design system built and polished (Mario Wonder sticker style, all primitives + surfaces complete)
- Next.js 15 skeleton app exists but minimal content ("Coming soon")
- Monorepo structure in place (pnpm workspaces, Turborepo)
- Hetzner VPS + Coolify for hosting

**Constraints:**
- Single developer (initially), but architecture should support team scaling
- Hetzner VPS resource constraints (design for efficiency)
- Blizzard API rate limits (need caching strategy)
- No existing production data (fresh start, but need migration tooling ready)
- Want zero-downtime deployments where possible, 5-minute acceptable downtime

**Stakeholders:**
- Guild officers/GMs (primary users: manage rosters, configure permissions)
- Raiders (secondary: view progress, see recruitment status)
- Guild leaders (tertiary: analytics, trends)

---

## Goals / Non-Goals

**Goals:**
- ✅ Consolidate two existing tools into one unified platform
- ✅ Shared authentication (Blizzard OAuth) across all tools
- ✅ Guild-scoped, multi-tenant architecture (guilds isolated from each other)
- ✅ Rank-based permissions (configurable by GM, not just Officer/GM binary)
- ✅ Alt-spying prevention (need membership + rank for access)
- ✅ Seamless UX (single design system, consistent navigation, no "patched together" feel)
- ✅ Production-ready CI/CD (automated testing, staged rollout, easy rollback)
- ✅ Scalable backend (separate services, independent scaling)

**Non-Goals:**
- ❌ Raid planning / visual planner (future feature)
- ❌ Guild-to-guild private performance comparison (only public WCL data)
- ❌ Discord bot integration (separate tooling)
- ❌ Cross-realm/cross-faction features (single realm at a time per guild)
- ❌ Real-time notifications (WebSockets, async queues) — polling/webhooks sufficient for now

---

## Decisions

### 1. Hybrid Monorepo: Single Frontend + Separate Backend Services

**Decision:** Keep discord_rio_recruitment_py and midnight_tracker as independent Flask services, but unify through a single Next.js frontend app with route groups.

**Rationale:**
- Frontend benefits: single design system, consistent auth, unified navigation, coherent UX
- Backend benefits: independent scaling, each service can evolve separately, easier testing
- Deployment: all frontend code deploys together, backends can deploy independently
- No tight coupling between services

**Alternatives Considered:**
- **Merge everything into one monolithic Flask app**: Simpler initially, but loses ability to scale independently, slower deployments (all or nothing)
- **Micro-frontend architecture (separate React apps)**: More complex, harder to share design system, bundle size bloat

**Implementation:**
```
Frontend: apps/web/ (Next.js 15)
  └─ Route groups per tool:
     ├─ /auth (login, logout, guild selection)
     ├─ /guilds/[guildId]/progress (progress-api calls)
     ├─ /guilds/[guildId]/recruitment (recruitment-api calls)
     └─ /guilds/[guildId]/settings (guild-api calls)

Backend Services:
  ├─ services/guild-api/ (Flask)
  │  └─ Users, guilds, permissions, member roster
  ├─ services/progress-api/ (Flask, migrate midnight_tracker)
  │  └─ Character progression, weekly targets, gear tracking
  └─ services/recruitment-api/ (Flask, migrate discord_rio_recruitment_py)
     └─ Recruitment scanning, candidate ranking

Shared:
  ├─ packages/design-system/ (@hool/design-system)
  └─ PostgreSQL + Redis
```

---

### 2. JWT Tokens in httpOnly Cookies (Auth)

**Decision:** Use Blizzard OAuth → issue JWT access/refresh token pair in httpOnly cookies.

**Rationale:**
- httpOnly prevents JavaScript XSS theft
- Cookies auto-sent to all subdomains (recruiting.hool.gg, progress.hool.gg, etc.)
- Stateless (no server session storage)
- Works across different service domains with SameSite=Lax

**Token Details:**
- Access token: 15-minute lifetime, httpOnly cookie, Secure flag, SameSite=Lax
- Refresh token: 7-day lifetime, httpOnly cookie, Secure flag, SameSite=Lax
- Payload: `{ bnet_id, timestamp, issued_at }`
- Revocation: stored in Redis blacklist (optional, for logout)

**Alternatives Considered:**
- **Session-based auth**: Requires server-side session storage, doesn't scale well
- **JWT in localStorage**: XSS vulnerable (JavaScript can steal)

---

### 3. Guild-API as Central Service

**Decision:** Create guild-api service that handles all guild-scoped data, permissions, and character-guild associations.

**Rationale:**
- Single source of truth for guild data, member lists, ranks, permissions
- Progress-api and recruitment-api query guild-api for permission checks
- Simplifies permission logic (centralized, not scattered across services)
- Character rank sync happens in guild-api (Blizzard API → guild-api → other services)

**Responsibilities:**
- Guild CRUD, member roster management
- Character-rank caching and sync (on login, periodic refresh via background job)
- Permission checking: "Does user's character have rank X in guild Y?"
- Guild settings (which tools enabled, rank-based access config)

**Alternatives Considered:**
- **Distributed permissions**: Each service checks Blizzard API on every request (too slow, API rate limits)
- **Monolithic API**: One API for all; loses independent scaling

---

### 4. Rank-Based Permission Checking on Every Request

**Decision:** On every API request, check: does this user's character have the required rank?

**Rationale:**
- Immediate revocation: character demoted/kicked → next request denied
- No lag or stale caches causing security issues
- Simple, declarative: `@require_rank("raider")` on endpoint

**Implementation:**
```
Middleware flow:
  1. Request comes in with JWT token
  2. Extract bnet_id from token
  3. Query guild-api: "What's this user's rank in guild X?"
  4. Check rank against endpoint requirement
  5. If sufficient → process request
  6. If not → return 403 Forbidden

Cache layer:
  Redis: bnet_id:guild_id:rank (TTL 5 min)
  → Fast permission checks without hitting Blizzard API
  → On logout/character change, invalidate cache
```

**Alternatives Considered:**
- **Check on login only**: Stale data if user demoted after login (bad for security)
- **Check at render time (frontend only)**: Easily bypassable (bad security)

---

### 5. Data Model: Guild-Character-Rank Association

**Decision:** PostgreSQL schema tracks character → guild → rank association.

**Key Tables:**
```
users
  ├─ bnet_id (primary key)
  ├─ bnet_username
  └─ last_login

guilds
  ├─ id (primary key)
  ├─ name
  ├─ realm
  └─ gm_bnet_id (who created it)

guild_members
  ├─ character_name (primary key)
  ├─ guild_id (FK)
  ├─ bnet_id (FK)
  ├─ rank_id (from Blizzard: 0=GM, 1=Officer, etc.)
  ├─ rank_name (string, for UI)
  └─ last_sync (when we fetched rank from Blizzard)

guild_permissions (GM configures these)
  ├─ guild_id
  ├─ tool_name ("recruitment", "progress", etc.)
  ├─ min_rank_id (0 = all members can use, 2 = raider+, etc.)
  └─ enabled (bool)
```

**Alternatives Considered:**
- **Flatten to single table**: Loses flexibility (hard to query by character vs guild)
- **No rank tracking**: Can't do rank-based permissions

---

### 6. Three Environments: Dev, Staging, Production

**Decision:** Separate infra for each (even on same Hetzner VPS, different databases/services).

**Rationale:**
- Staging mirrors prod (same data patterns, same load). Safe testing ground.
- Dev is playground (can break, reset data).
- Prod is locked down (manual deploys, full testing required).

**Setup:**
```
dev.hool.gg
  ├─ Postgres: dev_hoolgg_db
  ├─ Services: deployed from develop branch
  └─ Data: test data only

staging.hool.gg
  ├─ Postgres: staging_hoolgg_db
  ├─ Services: deployed from staging branch
  └─ Data: mirrors prod schema/patterns (can be seeded from prod)

hool.gg (Production)
  ├─ Postgres: hoolgg_db
  ├─ Services: deployed from main branch (git tags)
  └─ Data: real user data
```

**Alternatives Considered:**
- **Single environment**: Can't safely test; prod breaks = fires
- **Two environments (staging + prod)**: No safe playground for experiments

---

### 7. Git Flow + Optimized CI/CD

**Decision:** Git Flow (main/staging/develop) with optimized GitHub Actions (no redundant testing).

**Rationale:**
- Staged rollout: feature → develop → staging → main
- Testing happens on develop/staging; main just promotes docker images
- Reduces deployment time (no re-testing identical code)

**Flow:**
```
PR: feature/* → develop
  ├─ Run: lint, typecheck, build, test
  ├─ If pass: auto-merge, auto-deploy to dev.hool.gg
  └─ If fail: block merge

PR: develop → staging
  ├─ Run: lint, typecheck, build, test
  ├─ If pass: auto-merge, auto-deploy to staging.hool.gg
  └─ Manual testing on staging

PR: staging → main
  ├─ Full test suite runs
  ├─ If pass: tag docker images with version (v1.0.0)
  ├─ Requires manual approval
  └─ Auto-deploy tagged images to hool.gg
```

**Alternatives Considered:**
- **GitHub Flow (all on main)**: No staging concept, risky
- **Full test suite on every step**: Wastes time (code hasn't changed between staging → main)

---

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| **Blizzard API rate limits** | Cache rank data in Redis (5-min TTL). Batch character syncs. Fallback to cached data if API down. |
| **Character leaves guild, still has access until cache expires** | Check rank on EVERY request (not just login). 5-min cache TTL acceptable. |
| **Multi-service coordination complexity** | guild-api is single source of truth. Keep services loosely coupled (REST calls, not direct DB access). |
| **Hetzner VPS runs out of resources** | Monitor CPU/RAM. Auto-scale services (add more workers). Could migrate to managed Postgres if needed. |
| **Database migrations block deployments** | Use Alembic with backward-compatible migrations. Test migrations in staging first. Rollback plan: `alembic downgrade -1`. |
| **Deployment goes wrong, need instant rollback** | Docker images tagged with version. Can redeploy previous image (2 min rollback). Also: `git revert` on main. |
| **Rank data sync gets out of sync with Blizzard** | Background job (every 1 hour) refreshes all guild rosters. On-demand sync when character logs in. |
| **Recruitment/progress tools have different UX** | Use design system components consistently. Shared navbar/sidebar. Clear navigation between tools. |

---

## Migration Plan

**Phase 1: Foundation (Week 1-2)**
1. Set up guild-api service (Django or Flask, PostgreSQL)
2. Implement Blizzard OAuth in guild-api
3. Implement JWT token issuance (access + refresh tokens)
4. Create guild_members schema, rank caching
5. Deploy to dev.hool.gg

**Phase 2: Character Progress Tool (Week 3-4)**
1. Integrate midnight_tracker → progress-api service
2. Update endpoints to accept guild_id + character context
3. Connect progress-api to guild-api for permission checks
4. Update UI with design system components
5. Deploy to staging.hool.gg, test, promote to prod

**Phase 3: Recruitment Tool (Week 5-6)**
1. Integrate discord_rio_recruitment_py → recruitment-api service
2. Update endpoints to accept guild_id + character context
3. Connect recruitment-api to guild-api for permission checks
4. Update UI with design system components
5. Deploy to staging.hool.gg, test, promote to prod

**Phase 4: Frontend Integration (Week 7-8)**
1. Build /auth routes (login, guild selection, logout)
2. Build guild dashboard (shows accessible guilds)
3. Build /guilds/[guildId]/progress and /recruitment route groups
4. Integrate design system throughout
5. Connect to all backend services
6. Full integration testing

**Phase 5: Polish & Launch (Week 9+)**
1. Performance tuning
2. Error handling, edge cases
3. Monitoring setup
4. Documentation
5. Production launch

---

## Open Questions

1. **Subdomain architecture**: Use recruiting.hool.gg + progress.hool.gg (separate subdomains)? Or single domain with route groups?
   - Affects: DNS setup, cookie SameSite configuration
   - Recommendation: Single domain (hool.gg) with route groups is simpler

2. **Rank names vs IDs**: Store Blizzard rank (0=GM, 1=Officer) or also cache rank name ("Officer")?
   - Recommendation: Store both (id + name for UI)

3. **Character data freshness**: How often sync character ranks from Blizzard?
   - Options: on-login only, every 1 hour, every 24 hours
   - Recommendation: on-login + background job every 6 hours

4. **Raid planning tool**: Is this truly future only, or should we design for it now (schema, permission structure)?
   - Recommendation: Design for extensibility (each tool is a "capability"), but don't build raid planner yet

5. **Discord integration**: Should recruitment tool listen to Discord webhooks?
   - Recommendation: Out of scope for foundation. Can add in recruitment-api v1.1+

6. **Analytics**: What metrics matter? (active guilds, users, tool usage)
   - Recommendation: Start with basic: daily active users, guilds created, API response times

---

## Summary

This design creates a **scalable, multi-tenant guild platform** with:
- Unified frontend (single design system, coherent UX)
- Independent backend services (separate scaling, deployments)
- Strong security (Blizzard OAuth, JWT, rank-based permissions)
- Safe deployment (3 environments, Git Flow, automated testing)
- Future-proof (extensible capability model, clear service boundaries)

The hybrid monorepo approach balances **simplicity** (shared frontend) with **flexibility** (independent backends). Rank-based permissions and guild-scoped data prevent security issues (alt-spying, unauthorized access). Three environments and optimized CI/CD enable confident, rapid iteration.

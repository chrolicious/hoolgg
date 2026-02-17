# Guild Platform Foundation - Proposal

## Why

You currently have two WoW-focused tools built separately: a recruitment scanner (discord_rio_recruitment_py) and a character progression tracker (midnight_tracker). These work independently and don't share context. The opportunity is to **consolidate them into a unified guild management platform** where guild officers/GMs can access multiple tools from one place with shared authentication, guild context, and permissions. This transforms hool.gg from a collection of single-use tools into a comprehensive platform for managing guild operations—recruitment, roster tracking, progress guidance, and future raid planning.

## What Changes

- **New guild instance model**: Guilds are created on hool.gg by officers/GMs. Guild members (via their characters) access that specific instance.
- **Bnet account authentication**: Users log in with Blizzard OAuth (one Bnet account, multiple characters). Access to the platform is only granted if **at least one character** meets both: (1) is in a guild with a hool.gg instance, AND (2) has a high enough rank in that guild. This prevents alt-spying and low-rank access in a single gate.
- **Rank-based permissions**: GMs configure access by guild rank: "Officer or higher can use recruitment", "Raider or higher can see progress", etc. Access is checked against Blizzard character rank on every request.
- **Unified authentication**: Single Blizzard OAuth login at hool.gg, with JWT tokens valid across all subdomains/services. Identifies user by Bnet account, tracks which characters/guilds they have access to.
- **Shared guild context**: All tools know which guild you're in (via character), who you are, your rank, and what you can access (recommended defaults pre-configured, configurable by GM per rank).
- **Redesigned frontend**: Single Next.js app with route groups for each tool (e.g., `/guilds/[guildId]/progress`, `/guilds/[guildId]/recruitment`). After login, user sees their accessible guilds (determined by character membership + rank). Uses the WoW-inspired Epic Tier design system (sticker-style components) for visual cohesion.
- **Multi-service architecture**: Keep backend services separate (guild-api, progress-api, recruitment-api) for independent scaling and evolution, but unified through the frontend.
- **Production-ready deployment**: 3-tier environments (dev, staging, prod), Git Flow branching, optimized CI/CD, semantic versioning, zero-downtime deployments where possible.

## Capabilities

### New Capabilities

- `blizzard-oauth`: Authenticate users via Blizzard OAuth (Bnet account). Fetch all characters, their guild memberships, and ranks on login. Gate platform access: only grant if at least one character is in a guild with a hool.gg instance AND has sufficient rank.
- `guild-permissions`: Rank-based access control. GMs configure access per tool by guild rank: "Officer or higher can access recruitment", "Raider or higher can view progress", etc. Recommended defaults are pre-configured (Progress for all members, Recruitment for Officers+), configurable by GM. Dynamic permission checking on every request against Blizzard character rank.
- `guild-management`: Guild creation by officers/GMs. Configure rank-based access per tool. View guild roster and member ranks. Enable/disable tools per guild.
- `character-progress-tracking`: Migrate midnight_tracker functionality. Track character progression, weekly iLvl targets, gear priorities, expansion roadmaps. Guild-scoped (see your guild members' progress). Compare guild performance to public WarcraftLogs data.
- `recruitment-tools`: Migrate discord_rio_recruitment_py functionality. Scan multiple sources (Discord, Raider.io, WoW Progress), filter by role/class, rank candidates. Guild-scoped (post recruits to your guild).
- `frontend-platform`: Single Next.js app with unified navigation, design system components, route groups per tool. After login, displays accessible guilds (based on character membership + rank). Uses WoW-inspired Epic Tier design system (sticker-style components) for cohesive experience.
- `ci-cd-pipeline`: GitHub Actions for linting, building, testing, and deployment. Three environments (dev, staging, prod). Optimized to avoid redundant testing. Semantic versioning with git tags.

### Modified Capabilities

- None yet. This is a greenfield platform.

## Impact

**Code & Services:**
- Frontend: New Next.js 15 app (currently skeleton with "Coming soon"). Displays accessible guilds based on character membership + rank. Uses design system components.
- Backend: Three new/refactored services (guild-api, progress-api, recruitment-api). Guild-api handles rank-based permission checking.
- Design System: Already built; will be imported into all apps for consistency
- Package: Monorepo structure already in place (@hool/design-system, @hool/web)

**Data & Storage:**
- PostgreSQL: New schema for guilds, characters, guild members, rank-based permissions, user profiles. Must track character → guild → rank.
- Blizzard API: OAuth integration, character/roster/rank fetching. Regular sync to detect when characters leave guilds.
- External APIs: Raider.io, WarcraftLogs, WoW Progress for recruitment/progression data (public data only for comparisons)
- Redis: Session management, caching, character-guild association cache for fast permission checks

**Infrastructure:**
- Deployment: Hetzner VPS + Coolify (already chosen)
- Domains: hool.gg main, plus subdomains (recruiting.hool.gg, progress.hool.gg, etc.) or single domain with route groups
- CI/CD: GitHub Actions workflows (new), automated testing and deployment

**Security & Privacy:**
- **Alt-spying prevention**: Platform access requires both guild membership AND sufficient rank. When character leaves guild or is demoted, access is automatically revoked on next login/permission check.
- **Rank-based access**: Dynamic permission checking against Blizzard rank data. GMs configure which ranks can access which tools.
- **Guild isolation**: Strict data segregation. Users only see data for guilds their characters are in (and have permission to access).

**Team/Workflow:**
- Single developer initially, but architecture designed to scale with future team
- Git Flow branching (develop → staging → main)
- Protected branches, automated testing, manual production deployments

## Success Criteria

- ✅ All three services (guild-api, progress-api, recruitment-api) deployed and working
- ✅ Login flow: user authenticates via Blizzard OAuth, platform access gated by character guild membership + rank
- ✅ Rank-based permissions enforced: GMs can set access per tool per rank, checked on every request
- ✅ Alt-spying prevented: characters must have both guild membership AND sufficient rank for access
- ✅ Design system components used throughout frontend and all tools for visual cohesion
- ✅ Both legacy tools (recruitment, progress) integrated and working in guild context
- ✅ CI/CD pipeline automated and working (dev → staging → prod flow)
- ✅ Zero data loss during migration (no existing production data, but tooling in place)

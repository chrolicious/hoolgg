# hool.gg Monorepo

WoW-focused platform: guild recruitment, roster tracking, guild finder, and more.

## Architecture

- **Single Next.js 15 app** (`apps/web/`) serves all pages. Each module is a route group.
- **Recruitment API** (`services/recruitment-api/`) — Flask headless JSON API (from discord_rio_recruitment_py).
- **Design system** (`packages/design-system/`) — shared tokens + Tailwind preset + Framer Motion components.

## Repository Structure

```
hoolgg/
├── packages/design-system/   # @hool/design-system — tokens, components, animations
├── apps/web/                  # Next.js 15 app — THE website
├── services/
│   └── recruitment-api/       # Flask headless API
├── docs/                      # Project documentation (organized by section)
└── .github/workflows/         # CI/CD
```

## Commands

```bash
pnpm dev              # Start Next.js dev server (turbopack)
pnpm build            # Build all packages
pnpm lint             # Lint all packages
pnpm typecheck        # Type-check all packages
pnpm test             # Run unit tests
pnpm storybook        # Design system component preview
docker compose up -d  # Start Postgres + Redis locally
```

## Conventions

- **Commits**: Conventional commits (`feat:`, `fix:`, `style:`, `refactor:`, `test:`, `docs:`, `chore:`)
- **Branches**: `feature/`, `fix/`, `design/`, `chore/` prefixes
- **TypeScript**: Strict mode everywhere
- **Styling**: Tailwind CSS with `@hool/design-system` preset
- **Animations**: Framer Motion — all interactive components should animate
- **Package refs**: `workspace:*` protocol for internal dependencies

## Key Environment Variables

See `.env.example` for the full list. Key ones:
- `DATABASE_URL` — Postgres connection
- `REDIS_URL` — Redis connection
- `BLIZZARD_CLIENT_ID` / `BLIZZARD_CLIENT_SECRET` — Blizzard API
- `NEXTAUTH_SECRET` — Auth encryption

## Services (Local Dev)

### Startup sequence

**Step 1 — Docker Desktop must be running first**, then:

```bash
# From repo root — starts Postgres + Redis
docker compose up -d

# The guild-api runs in its own Docker Compose project (services/guild-api/)
cd services/guild-api
docker compose up -d
# After first start, connect it to the shared DB network (one-time):
docker network connect hoolgg_default guild-api-guild-api-1
```

**Step 2 — Python APIs** (each in its own terminal, run from their directory with venv active):

```bash
# progress-api
cd services/progress-api && python run.py          # → :5001

# recruitment-api (if needed)
cd services/recruitment-api && python run.py       # → :5002
```

**Step 3 — Next.js**

```bash
pnpm dev    # → :3000
```

### Port map

| Service | Host Port | How it runs |
|---------|-----------|-------------|
| Next.js | 3000 | `pnpm dev` (Turbopack) |
| Storybook | 6006 | `pnpm storybook` |
| **guild-api** | **5000** | Docker (`services/guild-api/docker-compose.yml`) |
| progress-api | 5001 | Python (`services/progress-api/run.py`) |
| recruitment-api | 5002 | Python (`services/recruitment-api/run.py`) |
| Postgres | 5432 | Docker (`docker compose up -d` from root) |
| Redis | 6379 | Docker (`docker compose up -d` from root) |

> **Note:** guild-api's own `.env` says `PORT=5010` — that is only used when running it outside Docker.
> Inside Docker it defaults to 5000 (matches docker-compose port mapping). Always use :5000 in other services.

### Network quirk

guild-api runs in a separate Docker Compose project (`guild-api_default` network) from Postgres/Redis (`hoolgg_default`).
After first launch you must run once:
```bash
docker network connect hoolgg_default guild-api-guild-api-1
```
This persists until the container is removed.

## Production

- **Hosting**: Hetzner VPS + Coolify
- **hool.gg** → Next.js app
- **api.hool.gg** → Flask recruitment API
- **analytics.hool.gg** → Umami (self-hosted)
- SSL via Let's Encrypt (auto-managed by Coolify/Traefik)

## Git Workflow (Git Flow)

**Branches:**
- `develop` — integration branch (auto-deploys to dev.hool.gg)
- `staging` — pre-production (auto-deploys to staging.hool.gg)
- `main` — production (manual deploy to hool.gg, tagged releases)
- `feature/*`, `bugfix/*` — branch from develop

**Development Workflow:**

1. Create feature branch from develop
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/my-feature
   ```

2. Work locally, commit, push
   ```bash
   git push origin feature/my-feature
   ```

3. Open PR to develop
   - GitHub Actions runs: lint, typecheck, build, tests
   - If passing, merge to develop
   - Auto-deploys to dev.hool.gg

4. Test on dev environment, iterate as needed

5. When ready, open PR `develop → staging`
   - Full test suite runs
   - If passing, auto-deploys to staging.hool.gg

6. Manual testing on staging
   - Test all user flows
   - Verify with realistic data
   - Run smoke tests

7. When ready for production, open PR `staging → main`
   - Full test suite runs
   - If passing, builds and tags Docker images
   - Requires explicit manual approval
   - Auto-deploys to hool.gg

8. Tag the release
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
   GitHub Actions creates release notes automatically.

**Hotfixes (emergency production fixes):**
```bash
git checkout main
git checkout -b hotfix/critical-bug-name
[fix the bug]
git push origin hotfix/critical-bug-name
# Open PR to main
# Merge, tag, deploy as above
```

## Versioning

Use **Semantic Versioning**: `MAJOR.MINOR.PATCH`
- **MAJOR** — breaking changes (rare, coordinate with users)
- **MINOR** — new features (guilds, new tool, etc.)
- **PATCH** — bug fixes

Examples:
- `v1.0.0` — Initial release (Guild API + Auth + Progress Tool)
- `v1.1.0` — Add Recruitment Tool
- `v1.1.1` — Fix guild permissions bug
- `v2.0.0` — Breaking API change (if ever needed)

Tag format: `v1.0.0` (annotated tags preferred)
Release notes: auto-generated from commit messages (use conventional commits)

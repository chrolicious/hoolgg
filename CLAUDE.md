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

| Service | Port | URL |
|---------|------|-----|
| Next.js | 3000 | http://localhost:3000 |
| Storybook | 6006 | http://localhost:6006 |
| Postgres | 5432 | postgresql://hool:hool@localhost:5432/hoolgg |
| Redis | 6379 | redis://localhost:6379 |

## Production

- **Hosting**: Hetzner VPS + Coolify
- **hool.gg** → Next.js app
- **api.hool.gg** → Flask recruitment API
- **analytics.hool.gg** → Umami (self-hosted)
- SSL via Let's Encrypt (auto-managed by Coolify/Traefik)

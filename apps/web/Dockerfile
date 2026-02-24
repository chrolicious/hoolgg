# Multi-stage build for Next.js web app
FROM node:20-slim AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace files from parent directory
COPY ../../pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY ../../package.json ./package.json
COPY ../../pnpm-lock.yaml ./pnpm-lock.yaml
COPY ../../packages ./packages
COPY . ./apps/web

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the app
WORKDIR /app/apps/web
RUN pnpm build

# Production stage
FROM node:20-slim

# Install pnpm and curl for health checks
RUN corepack enable && corepack prepare pnpm@latest --activate && \
    apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built app and dependencies
COPY --from=base /app/apps/web/.next ./apps/web/.next
COPY --from=base /app/apps/web/public ./apps/web/public
COPY --from=base /app/apps/web/package.json ./apps/web/package.json
COPY --from=base /app/apps/web/next.config.ts ./apps/web/next.config.ts
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/packages ./packages
COPY --from=base /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=base /app/package.json ./package.json

WORKDIR /app/apps/web

# Expose port
EXPOSE 3000

# Health check - uses PORT env var (defaults to 3000)
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:${PORT:-3000}/api/health || exit 1

# Start the app
CMD ["pnpm", "start"]

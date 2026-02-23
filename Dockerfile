# Multi-stage build for Next.js web app
FROM node:20-slim AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json ./
COPY packages ./packages
COPY apps/web ./apps/web

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
COPY --from=base /app/tsconfig.base.json ./tsconfig.base.json

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Start the app from workspace root
CMD ["pnpm", "--filter", "@hool/web", "start"]

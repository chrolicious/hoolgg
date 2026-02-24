#!/bin/sh
# Healthcheck script that uses PORT env var
curl -f http://localhost:${PORT:-3000}/api/health || exit 1

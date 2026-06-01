#!/bin/sh
set -e



echo "Running Prisma migrations..."
cd /app
bunx prisma db push --accept-data-loss --skip-generate

echo "Starting server..."
exec bun run src/index.ts

#!/bin/sh
set -e

if [ ! -f "/app/.env" ]; then
  echo 'DATABASE_URL="file:./dev.db"' > /app/.env
fi

echo "Running Prisma migrations..."
cd /app
bunx prisma db push --accept-data-loss --skip-generate

echo "Starting server..."
exec bun run src/index.ts

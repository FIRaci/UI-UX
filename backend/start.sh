#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="file:/app/prisma/dev.db"
fi

echo "Running Prisma migrations..."
cd /app
bunx prisma db push --accept-data-loss --skip-generate

echo "Starting server..."
exec bun run src/index.ts

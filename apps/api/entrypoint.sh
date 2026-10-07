#!/bin/sh
set -e

echo "⏳ Checking database connection..."
# Generate prisma client if not already generated
npx prisma generate

# Apply migrations / sync schema
echo "🔄 Syncing database schema with Prisma..."
npx prisma db push --skip-generate || true

echo "🚀 Starting Mena Clinic API Server..."
exec node dist/server.js

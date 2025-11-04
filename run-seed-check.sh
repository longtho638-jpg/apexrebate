#!/bin/bash
# Quick wrapper to run seed readiness check with ENV loaded

cd "$(dirname "$0")"

echo "🔧 Loading environment variables from .env..."
if [ ! -f .env ]; then
  echo "❌ .env file not found!"
  exit 1
fi

# Export all ENV vars
set -a
source .env
set +a

# Set SEED_SECRET_KEY if not already set (for local testing)
if [ -z "$SEED_SECRET_KEY" ]; then
  export SEED_SECRET_KEY="local-test-key-change-in-production"
  echo "⚠️  SEED_SECRET_KEY not set - using test value"
fi

echo ""
echo "📊 Running full-stack readiness check..."
echo ""

./scripts/check-seed-readiness.sh

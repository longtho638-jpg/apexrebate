#!/bin/bash

# Test Cron Jobs Script
# Usage: ./scripts/test-cron.sh

echo "🧪 Testing Cron Jobs API..."
echo ""

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Default values
APP_URL=${APP_URL:-"http://localhost:3000"}
CRON_SECRET=${CRON_SECRET:-"your-secure-cron-secret-key"}

echo "📍 APP_URL: $APP_URL"
echo ""

# Test GET endpoint (status check)
echo "1️⃣ Testing GET /api/cron/run-jobs (status check)..."
curl -s "$APP_URL/api/cron/run-jobs" | jq '.'
echo ""
echo ""

# Test POST endpoint (execute jobs)
echo "2️⃣ Testing POST /api/cron/run-jobs (execute jobs)..."
curl -s -X POST "$APP_URL/api/cron/run-jobs" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo ""

echo "✅ Cron test completed!"

#!/bin/bash

# Manual Cron Trigger Script
# Usage: ./scripts/manual-cron-trigger.sh

PROJECT_ID="apexrebate"
SECRET_KEY="your-secret-key-123"

echo "🚀 Manually triggering cron jobs..."

curl -X POST "https://us-central1-${PROJECT_ID}.cloudfunctions.net/triggerCronJobs" \
  -H "Authorization: Bearer ${SECRET_KEY}" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" | jq '.'

echo ""
echo "✅ Done!"

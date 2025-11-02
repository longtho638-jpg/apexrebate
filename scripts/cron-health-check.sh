#!/bin/bash

# Cron Health Check Script
# Checks the health of all cron-related services

PROJECT_ID="apexrebate"
REGION="us-central1"

echo "🏥 ApexRebate Cron Health Check"
echo "================================"
echo ""

# 1. Check Cloud Functions
echo "1️⃣ Cloud Functions Status:"
gcloud functions list \
  --project="$PROJECT_ID" \
  --regions="$REGION" \
  --filter="name:cronJobs" \
  --format="table(name,status,updateTime)" 2>/dev/null || echo "⚠️  No cron functions found"
echo ""

# 2. Check Cloud Scheduler
echo "2️⃣ Cloud Scheduler Jobs:"
gcloud scheduler jobs list \
  --location="$REGION" \
  --project="$PROJECT_ID" \
  --format="table(name,schedule,state,lastAttemptTime)" 2>/dev/null || echo "⚠️  No scheduler jobs found"
echo ""

# 3. Check recent executions
echo "3️⃣ Recent Executions (last 24h):"
YESTERDAY=$(date -u -v-24H '+%Y-%m-%dT%H:%M:%SZ' 2>/dev/null || date -u -d '24 hours ago' '+%Y-%m-%dT%H:%M:%SZ')
gcloud logging read "resource.type=\"cloud_run_revision\" 
  resource.labels.service_name=~\".*cronJobs.*\" 
  timestamp>=\"$YESTERDAY\"" \
  --project="$PROJECT_ID" \
  --limit=10 \
  --format="table(timestamp,severity,textPayload.slice(0:80))" 2>/dev/null || echo "⚠️  No recent logs"
echo ""

# 4. Check for errors
echo "4️⃣ Error Count (last 24h):"
ERROR_COUNT=$(gcloud logging read "resource.type=\"cloud_run_revision\" 
  severity>=ERROR 
  timestamp>=\"$YESTERDAY\"" \
  --project="$PROJECT_ID" \
  --format="value(timestamp)" | wc -l)
echo "Errors: $ERROR_COUNT"
echo ""

# 5. Check monitoring metrics
echo "5️⃣ Monitoring Metrics:"
gcloud logging metrics list \
  --project="$PROJECT_ID" \
  --filter="name:function_errors OR name:cron_failures" \
  --format="table(name,description)" 2>/dev/null || echo "⚠️  No metrics configured"
echo ""

# 6. Health summary
echo "📊 Health Summary:"
if [ "$ERROR_COUNT" -eq 0 ]; then
  echo "✅ All systems healthy - no errors in last 24h"
else
  echo "⚠️  $ERROR_COUNT errors detected - check logs with: ./scripts/view-cron-logs.sh --errors"
fi
echo ""

echo "🔗 Quick links:"
echo "   - Functions: https://console.cloud.google.com/functions/list?project=$PROJECT_ID"
echo "   - Scheduler: https://console.cloud.google.com/cloudscheduler?project=$PROJECT_ID"
echo "   - Logs: https://console.cloud.google.com/logs/query?project=$PROJECT_ID"

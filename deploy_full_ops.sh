#!/bin/bash
set -e

# ============================================
# ApexRebate Google Ops Hub - Full Installer
# ============================================
# Combines: Cron Jobs + Monitoring + Alerts
# One-command setup for complete automation
# ============================================

REGION="us-central1"
SECRET_KEY="${CRON_SECRET:-your-secret-key-123}"            # 🔐 Override: CRON_SECRET=xxx ./deploy_full_ops.sh
ALERT_EMAIL="${ALERT_EMAIL:-ops@apexrebate.com}"            # 📧 Override: ALERT_EMAIL=xxx ./deploy_full_ops.sh
SLACK_WEBHOOK="${SLACK_WEBHOOK:-}"                          # Optional Slack integration
APP_URL="${APP_URL:-https://apexrebate.com}"                # Your production URL

echo "╔════════════════════════════════════════════════════╗"
echo "║  🚀 ApexRebate Google Ops Hub - Full Installer   ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Get Firebase project ID
PROJECT_ID=$(firebase use --json 2>/dev/null | jq -r '.result' || echo "apexrebate")
echo "🧭 Project: $PROJECT_ID"
echo "📍 Region: $REGION"
echo "📧 Alert Email: $ALERT_EMAIL"
echo "🔐 Secret Key: ${SECRET_KEY:0:20}..."
echo ""

# Confirmation
read -p "Continue with this configuration? [Y/n] " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]] && [[ ! -z $REPLY ]]; then
    echo "❌ Aborted"
    exit 1
fi
echo ""

# ============================
# PART 1: INFRASTRUCTURE SETUP
# ============================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 PART 1: Infrastructure & APIs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🧩 Enabling required Google Cloud APIs..."
gcloud services enable \
  cloudfunctions.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  eventarc.googleapis.com \
  pubsub.googleapis.com \
  run.googleapis.com \
  monitoring.googleapis.com \
  logging.googleapis.com \
  cloudscheduler.googleapis.com \
  --project="$PROJECT_ID" --quiet

echo "✅ APIs enabled"
echo ""

# Artifact Registry cleanup
echo "🧹 Setting Artifact Registry cleanup policy..."
gcloud artifacts repositories update gcf-artifacts \
  --project="$PROJECT_ID" \
  --location="$REGION" \
  --cleanup-policy-delete \
  --cleanup-policy-dry-run=false \
  --cleanup-max-age=30d \
  --quiet 2>/dev/null || echo "ℹ️  Cleanup policy already set"
echo ""

# ============================
# PART 2: CRON JOBS SETUP
# ============================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⏰ PART 2: Cron Jobs & Scheduler"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔑 Configuring environment variables..."
cat > /tmp/cron_env.yaml <<EOF
APP_URL: "$APP_URL"
CRON_SECRET: "$SECRET_KEY"
EOF
echo "✅ Environment config ready"
echo ""

echo "⏰ Creating/updating Cloud Scheduler job (runs every hour)..."
if gcloud scheduler jobs describe apexrebate-cron --location="$REGION" --project="$PROJECT_ID" &>/dev/null; then
  echo "📝 Updating existing scheduler job..."
  gcloud scheduler jobs update http apexrebate-cron \
    --project="$PROJECT_ID" \
    --location="$REGION" \
    --schedule="0 * * * *" \
    --uri="https://us-central1-${PROJECT_ID}.cloudfunctions.net/scheduledCronJobs" \
    --http-method=POST \
    --headers="Authorization=Bearer ${SECRET_KEY}" \
    --max-retry-attempts=3 \
    --min-backoff=60s \
    --time-zone="Asia/Ho_Chi_Minh" \
    --quiet
else
  echo "✨ Creating new scheduler job..."
  gcloud scheduler jobs create http apexrebate-cron \
    --project="$PROJECT_ID" \
    --location="$REGION" \
    --schedule="0 * * * *" \
    --uri="https://us-central1-${PROJECT_ID}.cloudfunctions.net/scheduledCronJobs" \
    --http-method=POST \
    --headers="Authorization=Bearer ${SECRET_KEY}" \
    --max-retry-attempts=3 \
    --min-backoff=60s \
    --time-zone="Asia/Ho_Chi_Minh" \
    --quiet
fi
echo "✅ Scheduler configured"
echo ""

# ============================
# PART 3: MONITORING SETUP
# ============================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 PART 3: Monitoring & Metrics"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📊 Creating log-based metrics..."

# Metric 1: Function errors
gcloud logging metrics create function_errors_5xx \
  --project="$PROJECT_ID" \
  --description="Count of 5xx errors from Cloud Functions" \
  --log-filter='resource.type="cloud_run_revision" 
severity>=ERROR 
resource.labels.service_name=~".*cronJobs.*"' \
  --quiet 2>/dev/null || echo "ℹ️  Metric 'function_errors_5xx' exists"

# Metric 2: Cron failures
gcloud logging metrics create cron_failures \
  --project="$PROJECT_ID" \
  --description="Failed cron job executions" \
  --log-filter='resource.type="cloud_run_revision"
textPayload=~".*Cron job execution failed.*"' \
  --quiet 2>/dev/null || echo "ℹ️  Metric 'cron_failures' exists"

# Metric 3: Slow executions
gcloud logging metrics create slow_functions \
  --project="$PROJECT_ID" \
  --description="Functions taking >30 seconds" \
  --log-filter='resource.type="cloud_run_revision"
jsonPayload.executionTime>30000' \
  --quiet 2>/dev/null || echo "ℹ️  Metric 'slow_functions' exists"

echo "✅ Metrics created"
echo ""

# ============================
# PART 4: ALERTING SETUP
# ============================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔔 PART 4: Alerts & Notifications"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📡 Creating notification channels..."

# Email channel
EMAIL_CHANNEL=$(gcloud beta monitoring channels list \
  --project="$PROJECT_ID" \
  --filter="displayName='ApexRebate Ops Email'" \
  --format="value(name)" 2>/dev/null | head -1)

if [ -z "$EMAIL_CHANNEL" ]; then
  EMAIL_CHANNEL=$(gcloud beta monitoring channels create \
    --display-name="ApexRebate Ops Email" \
    --type=email \
    --channel-labels=email_address="$ALERT_EMAIL" \
    --format="value(name)" \
    --project="$PROJECT_ID" 2>/dev/null)
  echo "✅ Email channel created"
else
  echo "ℹ️  Email channel exists"
fi

# Slack channel (optional)
if [ -n "$SLACK_WEBHOOK" ]; then
  SLACK_CHANNEL=$(gcloud beta monitoring channels list \
    --project="$PROJECT_ID" \
    --filter="displayName='ApexRebate Slack'" \
    --format="value(name)" 2>/dev/null | head -1)
  
  if [ -z "$SLACK_CHANNEL" ]; then
    SLACK_CHANNEL=$(gcloud beta monitoring channels create \
      --display-name="ApexRebate Slack" \
      --type=slack \
      --channel-labels=url="$SLACK_WEBHOOK" \
      --format="value(name)" \
      --project="$PROJECT_ID" 2>/dev/null)
    echo "✅ Slack channel created"
  else
    echo "ℹ️  Slack channel exists"
  fi
fi

echo ""

# Create alert policy
echo "🔔 Creating alert policy..."
POLICY_FILE=$(mktemp)
cat > "$POLICY_FILE" <<EOF
{
  "displayName": "ApexRebate - Cron Errors Alert",
  "combiner": "OR",
  "conditions": [{
    "displayName": "Function 5xx errors > 3 in 5min",
    "conditionThreshold": {
      "filter": "resource.type = \"cloud_run_revision\" AND metric.type = \"logging.googleapis.com/user/function_errors_5xx\"",
      "comparison": "COMPARISON_GT",
      "thresholdValue": 3,
      "duration": "300s",
      "aggregations": [{
        "alignmentPeriod": "60s",
        "perSeriesAligner": "ALIGN_RATE"
      }]
    }
  }],
  "notificationChannels": ["$EMAIL_CHANNEL"],
  "alertStrategy": {
    "autoClose": "1800s"
  }
}
EOF

gcloud beta monitoring policies create \
  --policy-from-file="$POLICY_FILE" \
  --project="$PROJECT_ID" \
  --quiet 2>/dev/null || echo "ℹ️  Alert policy already exists"

rm -f "$POLICY_FILE"
echo "✅ Alert policy configured"
echo ""

# ============================
# PART 5: TESTING
# ============================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 PART 5: Testing & Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🧪 Testing trigger endpoint..."
HTTP_CODE=$(curl -s -o /tmp/cron_test_result.txt -w "%{http_code}" \
  -X POST "https://us-central1-${PROJECT_ID}.cloudfunctions.net/triggerCronJobs" \
  -H "Authorization: Bearer ${SECRET_KEY}" \
  -H "Content-Type: application/json" 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Test successful! (HTTP 200)"
  cat /tmp/cron_test_result.txt | jq '.' 2>/dev/null || cat /tmp/cron_test_result.txt
else
  echo "⚠️  Test returned: HTTP $HTTP_CODE"
  if [ "$HTTP_CODE" = "000" ]; then
    echo "ℹ️  Functions may not be deployed yet. Run: firebase deploy --only functions"
  else
    cat /tmp/cron_test_result.txt
  fi
fi
echo ""

# Scheduler status
echo "📊 Scheduler job status:"
gcloud scheduler jobs describe apexrebate-cron \
  --location="$REGION" \
  --project="$PROJECT_ID" \
  --format="table(name,schedule,state,lastAttemptTime)" \
  2>/dev/null || echo "Could not fetch scheduler status"
echo ""

# ============================
# COMPLETION SUMMARY
# ============================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SETUP COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Summary:"
echo "   ✓ Google Cloud APIs enabled"
echo "   ✓ Artifact Registry cleanup configured"
echo "   ✓ Cloud Scheduler job created (runs hourly)"
echo "   ✓ Log-based metrics created (3 metrics)"
echo "   ✓ Alert policy configured"
echo "   ✓ Email notifications: $ALERT_EMAIL"
echo ""
echo "🔗 Quick Links:"
echo "   • Functions:  https://console.cloud.google.com/functions/list?project=$PROJECT_ID"
echo "   • Scheduler:  https://console.cloud.google.com/cloudscheduler?project=$PROJECT_ID"
echo "   • Monitoring: https://console.cloud.google.com/monitoring?project=$PROJECT_ID"
echo "   • Logs:       https://console.cloud.google.com/logs/query?project=$PROJECT_ID"
echo ""
echo "📌 Next Steps:"
echo "   1. Deploy functions: firebase deploy --only functions"
echo "   2. Health check:     ./scripts/cron-health-check.sh"
echo "   3. View logs:        ./scripts/view-cron-logs.sh"
echo "   4. Manual trigger:   ./scripts/manual-cron-trigger.sh"
echo ""
echo "🎉 Your ApexRebate Ops Hub is ready!"

#!/bin/bash
set -e

PROJECT_ID=$(firebase use --json 2>/dev/null | jq -r '.result' || echo "apexrebate")
REGION="us-central1"
SECRET_KEY="your-secret-key-123"

echo "🚀 Deploy Cron Fix for project: $PROJECT_ID ($REGION)"
echo ""

# 1️⃣ Fix cleanup policy for Artifact Registry
echo "🧹 Setting cleanup policy for Artifact Registry..."
gcloud artifacts repositories update gcf-artifacts \
  --project="$PROJECT_ID" \
  --location="$REGION" \
  --cleanup-policy-delete \
  --cleanup-policy-dry-run=false \
  --cleanup-max-age=30d \
  --quiet 2>/dev/null || echo "⚠️  Cleanup policy already set or not needed"
echo ""

# 2️⃣ Configure environment variables for functions
echo "🔑 Setting environment variables..."
cat > /tmp/cron_env.yaml <<EOF
APP_URL: "https://apexrebate.com"
CRON_SECRET: "$SECRET_KEY"
EOF
echo "✅ Environment config ready"
echo ""

# 3️⃣ Create or update Cloud Scheduler job
echo "⏰ Creating/updating Cloud Scheduler job (hourly)..."
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
echo "✅ Scheduler job configured"
echo ""

# 4️⃣ Manual test trigger
echo "🧪 Testing trigger endpoint..."
HTTP_CODE=$(curl -s -o /tmp/cron_test_result.txt -w "%{http_code}" \
  -X POST "https://us-central1-${PROJECT_ID}.cloudfunctions.net/triggerCronJobs" \
  -H "Authorization: Bearer ${SECRET_KEY}" \
  -H "Content-Type: application/json")

echo "Response code: $HTTP_CODE"
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Test successful!"
  cat /tmp/cron_test_result.txt | jq '.' 2>/dev/null || cat /tmp/cron_test_result.txt
else
  echo "⚠️  Test returned non-200 response"
  cat /tmp/cron_test_result.txt
fi
echo ""

# 5️⃣ Show scheduler status
echo "📊 Scheduler job status:"
gcloud scheduler jobs describe apexrebate-cron \
  --location="$REGION" \
  --project="$PROJECT_ID" \
  --format="table(name,schedule,state,lastAttemptTime)" \
  2>/dev/null || echo "Could not fetch scheduler status"
echo ""

echo "✅ Cron setup completed for ${PROJECT_ID}"
echo ""
echo "📌 Next steps:"
echo "   - View logs: firebase functions:log"
echo "   - Manual trigger: https://us-central1-${PROJECT_ID}.cloudfunctions.net/triggerCronJobs"
echo "   - Scheduler console: https://console.cloud.google.com/cloudscheduler?project=${PROJECT_ID}"

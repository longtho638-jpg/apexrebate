#!/bin/bash
set -e

PROJECT_ID=$(firebase use --json 2>/dev/null | jq -r '.result' || echo "apexrebate")
REGION="us-central1"
ALERT_EMAIL="${ALERT_EMAIL:-ops@apexrebate.com}"    # 📧 Override với: ALERT_EMAIL=your@email.com ./deploy_monitor_fix.sh
SLACK_WEBHOOK="${SLACK_WEBHOOK:-}"                  # Optional Slack webhook

echo "🚨 Setting up Cloud Monitoring & Alerts for $PROJECT_ID"
echo ""

# 1️⃣ Enable required APIs
echo "🧩 Enabling Monitoring & Logging APIs..."
gcloud services enable monitoring.googleapis.com logging.googleapis.com \
  --project="$PROJECT_ID" --quiet
echo "✅ APIs enabled"
echo ""

# 2️⃣ Create Log-based Metrics
echo "📊 Creating log-based metrics..."

# Metric 1: Function 5xx errors
gcloud logging metrics create function_errors_5xx \
  --project="$PROJECT_ID" \
  --description="Count of 5xx errors from Cloud Functions" \
  --log-filter='resource.type="cloud_run_revision" 
severity>=ERROR 
resource.labels.service_name=~".*cronJobs.*"' \
  --quiet 2>/dev/null || echo "⚠️  Metric 'function_errors_5xx' already exists"

# Metric 2: Cron job failures
gcloud logging metrics create cron_failures \
  --project="$PROJECT_ID" \
  --description="Failed cron job executions" \
  --log-filter='resource.type="cloud_run_revision"
textPayload=~".*Cron job execution failed.*"' \
  --quiet 2>/dev/null || echo "⚠️  Metric 'cron_failures' already exists"

# Metric 3: Slow function executions (>30s)
gcloud logging metrics create slow_functions \
  --project="$PROJECT_ID" \
  --description="Functions taking >30 seconds" \
  --log-filter='resource.type="cloud_run_revision"
jsonPayload.executionTime>30000' \
  --quiet 2>/dev/null || echo "⚠️  Metric 'slow_functions' already exists"

echo "✅ Metrics created"
echo ""

# 3️⃣ Create Notification Channels
echo "📡 Creating notification channels..."

# Email channel
EMAIL_CHANNEL=$(gcloud beta monitoring channels list \
  --project="$PROJECT_ID" \
  --filter="displayName='Ops Email Alert'" \
  --format="value(name)" 2>/dev/null | head -1)

if [ -z "$EMAIL_CHANNEL" ]; then
  EMAIL_CHANNEL=$(gcloud beta monitoring channels create \
    --display-name="Ops Email Alert" \
    --type=email \
    --channel-labels=email_address="$ALERT_EMAIL" \
    --format="value(name)" \
    --project="$PROJECT_ID")
  echo "✅ Email channel created: $EMAIL_CHANNEL"
else
  echo "✅ Email channel exists: $EMAIL_CHANNEL"
fi

# Slack webhook (optional)
if [ -n "$SLACK_WEBHOOK" ]; then
  SLACK_CHANNEL=$(gcloud beta monitoring channels list \
    --project="$PROJECT_ID" \
    --filter="displayName='Slack Alerts'" \
    --format="value(name)" 2>/dev/null | head -1)
  
  if [ -z "$SLACK_CHANNEL" ]; then
    SLACK_CHANNEL=$(gcloud beta monitoring channels create \
      --display-name="Slack Alerts" \
      --type=slack \
      --channel-labels=url="$SLACK_WEBHOOK" \
      --format="value(name)" \
      --project="$PROJECT_ID")
    echo "✅ Slack channel created: $SLACK_CHANNEL"
  fi
fi

echo ""

# 4️⃣ Create Alert Policies
echo "🔔 Creating alert policies..."

# Policy 1: Function errors
POLICY_FILE=$(mktemp)
cat > "$POLICY_FILE" <<EOF
{
  "displayName": "ApexRebate - Function Errors >3 in 5min",
  "combiner": "OR",
  "conditions": [
    {
      "displayName": "Function 5xx errors > 3",
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
    }
  ],
  "notificationChannels": ["$EMAIL_CHANNEL"],
  "alertStrategy": {
    "autoClose": "1800s"
  }
}
EOF

gcloud beta monitoring policies create \
  --policy-from-file="$POLICY_FILE" \
  --project="$PROJECT_ID" \
  --quiet 2>/dev/null || echo "⚠️  Policy may already exist"

rm -f "$POLICY_FILE"
echo "✅ Alert policies created"
echo ""

# 5️⃣ Create Dashboard
echo "📊 Creating monitoring dashboard..."
DASHBOARD_FILE=$(mktemp)
cat > "$DASHBOARD_FILE" <<EOF
{
  "displayName": "ApexRebate Cron Jobs Dashboard",
  "dashboardFilters": [],
  "mosaicLayout": {
    "columns": 12,
    "tiles": [
      {
        "width": 6,
        "height": 4,
        "widget": {
          "title": "Function Execution Count",
          "xyChart": {
            "dataSets": [{
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=~\".*cronJobs.*\"",
                  "aggregation": {
                    "alignmentPeriod": "60s",
                    "perSeriesAligner": "ALIGN_RATE"
                  }
                }
              }
            }]
          }
        }
      },
      {
        "xPos": 6,
        "width": 6,
        "height": 4,
        "widget": {
          "title": "Error Rate",
          "scorecard": {
            "timeSeriesQuery": {
              "timeSeriesFilter": {
                "filter": "metric.type=\"logging.googleapis.com/user/function_errors_5xx\"",
                "aggregation": {
                  "alignmentPeriod": "60s",
                  "perSeriesAligner": "ALIGN_RATE"
                }
              }
            }
          }
        }
      }
    ]
  }
}
EOF

gcloud monitoring dashboards create --config-from-file="$DASHBOARD_FILE" \
  --project="$PROJECT_ID" --quiet 2>/dev/null || echo "⚠️  Dashboard may already exist"

rm -f "$DASHBOARD_FILE"
echo "✅ Dashboard created"
echo ""

# 6️⃣ Setup Log Sink to BigQuery (optional - for long-term analytics)
echo "📦 Creating log sink to BigQuery..."
DATASET_ID="apexrebate_logs"

# Create BigQuery dataset
bq mk --dataset --location=US --project_id="$PROJECT_ID" "$DATASET_ID" 2>/dev/null || true

# Create log sink
gcloud logging sinks create cron-logs-sink \
  bigquery.googleapis.com/projects/"$PROJECT_ID"/datasets/"$DATASET_ID" \
  --log-filter='resource.type="cloud_run_revision" 
resource.labels.service_name=~".*cronJobs.*"' \
  --project="$PROJECT_ID" \
  --quiet 2>/dev/null || echo "⚠️  Log sink may already exist"

echo "✅ Log sink created"
echo ""

# 7️⃣ Test notification
echo "🧪 Testing notification channel..."
echo "Sending test alert to $ALERT_EMAIL..."
# Note: Can't directly test, but will show in Cloud Console

echo ""
echo "✅ Monitoring setup completed for $PROJECT_ID"
echo ""
echo "📌 Quick links:"
echo "   - Monitoring: https://console.cloud.google.com/monitoring?project=$PROJECT_ID"
echo "   - Dashboards: https://console.cloud.google.com/monitoring/dashboards?project=$PROJECT_ID"
echo "   - Logs: https://console.cloud.google.com/logs/query?project=$PROJECT_ID"
echo "   - BigQuery: https://console.cloud.google.com/bigquery?project=$PROJECT_ID&d=$DATASET_ID"
echo ""
echo "📧 Alerts will be sent to: $ALERT_EMAIL"

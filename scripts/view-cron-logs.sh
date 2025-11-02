#!/bin/bash

# View Cron Job Logs
# Usage: ./scripts/view-cron-logs.sh [--errors] [--last-hour]

PROJECT_ID="apexrebate"
FILTER='resource.type="cloud_run_revision" resource.labels.service_name=~".*cronJobs.*"'
LIMIT=50

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --errors)
      FILTER="$FILTER severity>=ERROR"
      shift
      ;;
    --last-hour)
      FILTER="$FILTER timestamp>=\"$(date -u -v-1H '+%Y-%m-%dT%H:%M:%SZ')\"" 2>/dev/null || \
      FILTER="$FILTER timestamp>=\"$(date -u -d '1 hour ago' '+%Y-%m-%dT%H:%M:%SZ')\""
      shift
      ;;
    --limit)
      LIMIT="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--errors] [--last-hour] [--limit N]"
      exit 1
      ;;
  esac
done

echo "📜 Fetching cron job logs..."
echo "Filter: $FILTER"
echo ""

gcloud logging read "$FILTER" \
  --project="$PROJECT_ID" \
  --limit="$LIMIT" \
  --format="table(timestamp,severity,textPayload)" \
  --freshness=1d

echo ""
echo "✅ Use --errors to see only errors, --last-hour for recent logs"

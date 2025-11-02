# 🚨 ApexRebate Monitoring & Alerting Guide

Complete guide to monitoring and maintaining the cron job infrastructure.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Scripts Overview](#scripts-overview)
- [Monitoring Setup](#monitoring-setup)
- [Health Checks](#health-checks)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Initial Setup

```bash
# 1. Deploy cron jobs and scheduler
./deploy_cron_fix.sh

# 2. Setup monitoring and alerts
./deploy_monitor_fix.sh

# 3. Check health
./scripts/cron-health-check.sh
```

### Daily Operations

```bash
# View recent logs
./scripts/view-cron-logs.sh --last-hour

# Manual trigger
./scripts/manual-cron-trigger.sh

# Health check
./scripts/cron-health-check.sh
```

---

## 📜 Scripts Overview

### `deploy_cron_fix.sh`
Sets up Cloud Functions and Cloud Scheduler.

**Features:**
- Fixes Artifact Registry cleanup policy
- Creates/updates Cloud Scheduler job (runs hourly)
- Tests trigger endpoint
- Shows scheduler status

**Usage:**
```bash
./deploy_cron_fix.sh
```

### `deploy_monitor_fix.sh`
Configures monitoring, metrics, and alerts.

**Features:**
- Creates log-based metrics (5xx errors, cron failures, slow functions)
- Sets up email alerts
- Creates monitoring dashboard
- Configures BigQuery log sink for analytics

**Usage:**
```bash
# Default email
./deploy_monitor_fix.sh

# Custom email
ALERT_EMAIL=your@email.com ./deploy_monitor_fix.sh

# With Slack
ALERT_EMAIL=your@email.com SLACK_WEBHOOK=https://hooks.slack.com/... ./deploy_monitor_fix.sh
```

### `scripts/cron-health-check.sh`
Comprehensive health check of all cron services.

**Checks:**
- Cloud Functions status
- Scheduler job state
- Recent execution logs
- Error counts (last 24h)
- Monitoring metrics

**Usage:**
```bash
./scripts/cron-health-check.sh
```

### `scripts/view-cron-logs.sh`
View cron job logs with filtering.

**Usage:**
```bash
# Recent logs
./scripts/view-cron-logs.sh

# Only errors
./scripts/view-cron-logs.sh --errors

# Last hour
./scripts/view-cron-logs.sh --last-hour

# Custom limit
./scripts/view-cron-logs.sh --limit 100
```

### `scripts/manual-cron-trigger.sh`
Manually trigger cron jobs.

**Usage:**
```bash
./scripts/manual-cron-trigger.sh
```

---

## 📊 Monitoring Setup

### Metrics Created

1. **function_errors_5xx**
   - Tracks 5xx errors from Cloud Functions
   - Alert threshold: >3 errors in 5 minutes

2. **cron_failures**
   - Tracks failed cron job executions
   - Monitors for specific failure messages

3. **slow_functions**
   - Detects functions taking >30 seconds
   - Helps identify performance issues

### Alert Channels

- **Email:** Ops team email address
- **Slack:** (Optional) Webhook integration
- **Dashboard:** Real-time monitoring view

### Dashboards

Access at: `https://console.cloud.google.com/monitoring/dashboards?project=apexrebate`

**Panels:**
- Function execution count
- Error rate
- Execution time
- Success/failure ratio

---

## 🏥 Health Checks

### Automated Checks

Cloud Scheduler automatically:
- Retries failed jobs (max 3 attempts)
- Backs off exponentially (min 60s)
- Logs all execution attempts

### Manual Health Check

```bash
./scripts/cron-health-check.sh
```

**What it checks:**
- ✅ Functions deployed and active
- ✅ Scheduler jobs enabled
- ✅ Recent successful executions
- ✅ No errors in last 24h
- ✅ Monitoring metrics configured

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Scheduler job not running

**Check status:**
```bash
gcloud scheduler jobs describe apexrebate-cron \
  --location=us-central1 \
  --project=apexrebate
```

**Fix:**
```bash
# Re-run setup
./deploy_cron_fix.sh
```

#### 2. Functions returning 5xx errors

**View error logs:**
```bash
./scripts/view-cron-logs.sh --errors
```

**Check function logs:**
```bash
firebase functions:log --only scheduledCronJobs
```

#### 3. No alerts received

**Check notification channels:**
```bash
gcloud beta monitoring channels list --project=apexrebate
```

**Update email:**
```bash
ALERT_EMAIL=new@email.com ./deploy_monitor_fix.sh
```

#### 4. Database connection errors

**Check if table exists:**
```bash
# The cron jobs need the email_notifications table
# Run migrations if needed:
npx prisma migrate deploy
```

---

## 📈 Performance Monitoring

### BigQuery Analytics

Logs are automatically exported to BigQuery dataset: `apexrebate_logs`

**Query examples:**

```sql
-- Error rate by hour
SELECT 
  TIMESTAMP_TRUNC(timestamp, HOUR) as hour,
  COUNT(*) as error_count
FROM `apexrebate.apexrebate_logs.*`
WHERE severity = 'ERROR'
GROUP BY hour
ORDER BY hour DESC;

-- Execution time distribution
SELECT 
  APPROX_QUANTILES(CAST(JSON_VALUE(jsonPayload, '$.executionTime') AS INT64), 100)[OFFSET(50)] as median_ms,
  APPROX_QUANTILES(CAST(JSON_VALUE(jsonPayload, '$.executionTime') AS INT64), 100)[OFFSET(95)] as p95_ms,
  APPROX_QUANTILES(CAST(JSON_VALUE(jsonPayload, '$.executionTime') AS INT64), 100)[OFFSET(99)] as p99_ms
FROM `apexrebate.apexrebate_logs.*`
WHERE JSON_VALUE(jsonPayload, '$.executionTime') IS NOT NULL;
```

---

## 🔗 Quick Links

- **Cloud Console:** https://console.cloud.google.com/home/dashboard?project=apexrebate
- **Functions:** https://console.cloud.google.com/functions/list?project=apexrebate
- **Scheduler:** https://console.cloud.google.com/cloudscheduler?project=apexrebate
- **Monitoring:** https://console.cloud.google.com/monitoring?project=apexrebate
- **Logs:** https://console.cloud.google.com/logs/query?project=apexrebate
- **BigQuery:** https://console.cloud.google.com/bigquery?project=apexrebate

---

## 📞 Support

For issues or questions:
1. Check health: `./scripts/cron-health-check.sh`
2. View logs: `./scripts/view-cron-logs.sh --errors`
3. Check [Troubleshooting](#troubleshooting) section
4. Contact: ops@apexrebate.com

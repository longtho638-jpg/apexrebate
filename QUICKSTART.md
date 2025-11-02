# 🚀 ApexRebate Ops Hub - Quick Start

One-command setup for complete automation infrastructure.

## ⚡ Quick Start (5 minutes)

### Prerequisites

```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login to Firebase & Google Cloud
firebase login
gcloud auth login

# 3. Select your project
firebase use apexrebate
```

### One-Command Setup

```bash
# Run the all-in-one installer
./deploy_full_ops.sh
```

**What it does:**
- ✅ Enables all required Google Cloud APIs
- ✅ Configures Artifact Registry cleanup
- ✅ Creates Cloud Scheduler (runs hourly)
- ✅ Sets up monitoring metrics
- ✅ Configures email alerts
- ✅ Tests all endpoints

---

## 🎯 Custom Configuration

### Change Alert Email

```bash
ALERT_EMAIL=your@email.com ./deploy_full_ops.sh
```

### Add Slack Notifications

```bash
ALERT_EMAIL=your@email.com \
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK \
./deploy_full_ops.sh
```

### Change Secret Key

```bash
CRON_SECRET=my-super-secret-key-123 ./deploy_full_ops.sh
```

### All Together

```bash
ALERT_EMAIL=ops@company.com \
CRON_SECRET=production-key-xyz \
SLACK_WEBHOOK=https://hooks.slack.com/... \
APP_URL=https://apexrebate.com \
./deploy_full_ops.sh
```

---

## 📝 Daily Operations

### Manual Trigger

```bash
./scripts/manual-cron-trigger.sh
```

### View Logs

```bash
# All logs
./scripts/view-cron-logs.sh

# Only errors
./scripts/view-cron-logs.sh --errors

# Last hour
./scripts/view-cron-logs.sh --last-hour
```

### Health Check

```bash
./scripts/cron-health-check.sh
```

---

## 🔄 Update & Redeploy

### Update Functions Code

```bash
# Make changes to functions/index.js
# Then deploy
firebase deploy --only functions
```

### Update Scheduler

```bash
# Re-run full setup
./deploy_full_ops.sh
```

### Update Monitoring

```bash
# Run monitoring setup only
./deploy_monitor_fix.sh
```

---

## 🐛 Troubleshooting

### Functions not deployed

```bash
firebase deploy --only functions
```

### Scheduler not running

```bash
# Check status
gcloud scheduler jobs describe apexrebate-cron \
  --location=us-central1 \
  --project=apexrebate

# Manual run
gcloud scheduler jobs run apexrebate-cron \
  --location=us-central1 \
  --project=apexrebate
```

### No alerts received

```bash
# Check notification channels
gcloud beta monitoring channels list --project=apexrebate

# Update email
ALERT_EMAIL=new@email.com ./deploy_full_ops.sh
```

### Check logs for errors

```bash
./scripts/view-cron-logs.sh --errors
```

---

## 📊 Monitoring Dashboard

Access your monitoring dashboard:

```
https://console.cloud.google.com/monitoring/dashboards?project=apexrebate
```

View metrics:
- Function execution count
- Error rate (5xx)
- Execution time
- Success/failure ratio

---

## 🎓 Learn More

- [Full Monitoring Guide](README_MONITORING.md)
- [Firebase Functions Docs](https://firebase.google.com/docs/functions)
- [Cloud Scheduler Docs](https://cloud.google.com/scheduler/docs)
- [Cloud Monitoring Docs](https://cloud.google.com/monitoring/docs)

---

## 📞 Support

**Quick checks:**
1. Run health check: `./scripts/cron-health-check.sh`
2. View error logs: `./scripts/view-cron-logs.sh --errors`
3. Check [README_MONITORING.md](README_MONITORING.md)

**Contact:** ops@apexrebate.com

---

## 🎉 Success!

Your ApexRebate automation infrastructure is now:
- ⏰ Running hourly cron jobs automatically
- 📊 Monitoring all executions
- 🔔 Alerting on errors
- 📧 Sending notifications
- 🧹 Auto-cleaning old artifacts

**Sit back and let it run! 🚀**

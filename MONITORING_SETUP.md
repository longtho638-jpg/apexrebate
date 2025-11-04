# 🔍 Production Monitoring Setup Guide

## Quick Start

### Run Health Check Once
```bash
source .env && ./scripts/monitor-production.sh once
```

### Run Continuous Monitoring (Loop Mode)
```bash
source .env && CHECK_INTERVAL=300 ./scripts/monitor-production.sh loop
```

## Configuration

### Environment Variables

```bash
# In .env file:
NEXT_PUBLIC_APP_URL="https://apexrebate.com"
CHECK_INTERVAL=300           # 5 minutes
MAX_RESPONSE_TIME=3000       # 3 seconds alert threshold
ALERT_WEBHOOK="https://discord.com/api/webhooks/YOUR_WEBHOOK"
LOG_FILE="./logs/monitor.log"
```

## Setup Discord Alerts

### 1. Create Discord Webhook
1. Vào Discord server → Server Settings → Integrations
2. Click "Create Webhook" hoặc "View Webhooks"
3. Click "New Webhook"
4. Đặt tên: "ApexRebate Monitor"
5. Chọn channel để nhận alerts
6. Click "Copy Webhook URL"

### 2. Add Webhook to .env
```bash
echo 'ALERT_WEBHOOK="https://discord.com/api/webhooks/123456789/abcdef..."' >> .env
```

### 3. Test Alert
```bash
source .env && ./scripts/monitor-production.sh once
```

## Setup Slack Alerts

### 1. Create Slack Incoming Webhook
1. Vào https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. Đặt tên app: "ApexRebate Monitor"
4. Chọn workspace
5. Click "Incoming Webhooks" → Enable
6. Click "Add New Webhook to Workspace"
7. Chọn channel → Click "Allow"
8. Copy "Webhook URL"

### 2. Add to .env
```bash
echo 'ALERT_WEBHOOK="https://hooks.slack.com/services/T00000000/B00000000/XXXX..."' >> .env
```

## Setup as Cron Job (Auto-run)

### Every 5 Minutes
```bash
# Edit crontab
crontab -e

# Add this line:
*/5 * * * * cd /Users/macbookprom1/apexrebate-1 && bash -c 'set -a && source .env && set +a && ./scripts/monitor-production.sh once' >> /tmp/apexrebate-monitor.log 2>&1
```

### Every 10 Minutes
```bash
*/10 * * * * cd /Users/macbookprom1/apexrebate-1 && bash -c 'set -a && source .env && set +a && ./scripts/monitor-production.sh once' >> /tmp/apexrebate-monitor.log 2>&1
```

## Run as Background Service (macOS)

### Create LaunchAgent
```bash
cat > ~/Library/LaunchAgents/com.apexrebate.monitor.plist << 'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.apexrebate.monitor</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>-c</string>
        <string>cd /Users/macbookprom1/apexrebate-1 && set -a && source .env && set +a && ./scripts/monitor-production.sh loop</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/apexrebate-monitor.out</string>
    <key>StandardErrorPath</key>
    <string>/tmp/apexrebate-monitor.err</string>
</dict>
</plist>
PLIST

# Load service
launchctl load ~/Library/LaunchAgents/com.apexrebate.monitor.plist

# Check status
launchctl list | grep apexrebate
```

### Stop Service
```bash
launchctl unload ~/Library/LaunchAgents/com.apexrebate.monitor.plist
```

## What's Monitored

### ✅ Checks Performed
1. **Main Site** (`https://apexrebate.com`)
   - HTTP status (200/307/308 = OK)
   - Response time (< 3s)

2. **/vi Redirect** (`https://apexrebate.com/vi`)
   - HTTP status (200 = OK)

3. **Dashboard** (`https://apexrebate.com/vi/dashboard`)
   - HTTP status (200 = OK)
   - Response time (< 3s)

4. **Seed Status API** (`https://apexrebate.com/api/seed-production`)
   - User count
   - Tool count

### 🚨 Alert Conditions
- Site returns non-200/307/308 status
- Response time > 3000ms
- Dashboard not accessible
- Seed API not responding

## Logs

### View Real-time Logs
```bash
tail -f logs/monitor.log
```

### View Last 50 Lines
```bash
tail -50 logs/monitor.log
```

### Search for Errors
```bash
grep ERROR logs/monitor.log
```

### Search for Warnings
```bash
grep WARN logs/monitor.log
```

## Troubleshooting

### Script Not Running
```bash
# Check if executable
ls -la scripts/monitor-production.sh

# Make executable
chmod +x scripts/monitor-production.sh
```

### Webhook Not Sending
```bash
# Test webhook manually
curl -X POST "https://discord.com/api/webhooks/YOUR_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test message from ApexRebate Monitor"}'
```

### High Response Times
- Check Vercel deployment status
- Check Neon database performance
- Verify CDN cache configuration

## Advanced Configuration

### Custom Check Interval
```bash
# Check every 1 minute (60 seconds)
CHECK_INTERVAL=60 ./scripts/monitor-production.sh loop

# Check every 30 minutes (1800 seconds)
CHECK_INTERVAL=1800 ./scripts/monitor-production.sh loop
```

### Custom Response Time Threshold
```bash
# Alert if response > 5 seconds (5000ms)
MAX_RESPONSE_TIME=5000 ./scripts/monitor-production.sh once
```

### Multiple Webhooks
Create a wrapper script for multiple alerts:
```bash
#!/bin/bash
# Send to Discord
ALERT_WEBHOOK="$DISCORD_WEBHOOK" ./scripts/monitor-production.sh once

# Send to Slack
ALERT_WEBHOOK="$SLACK_WEBHOOK" ./scripts/monitor-production.sh once
```

## Example Output

### Successful Check
```
[2025-11-04 15:40:38] 🔍 Starting health check...
[2025-11-04 15:40:38] Checking main site: https://apexrebate.com
✅ Main site: HTTP 200, 541ms
[2025-11-04 15:40:39] Checking /vi redirect
✅ /vi redirect: HTTP 200
[2025-11-04 15:40:40] Checking dashboard page
✅ Dashboard: HTTP 200, 852ms
[2025-11-04 15:40:41] Checking seed status API
✅ Seed API: 23 users, 13 tools
[2025-11-04 15:40:44] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ All checks passed ✓
```

### Failed Check with Alert
```
[2025-11-04 15:42:10] 🔍 Starting health check...
[2025-11-04 15:42:10] Checking main site: https://apexrebate.com
❌ Main site down: HTTP 503
[2025-11-04 15:42:11] Checking dashboard page
❌ Dashboard error: HTTP 503
[2025-11-04 15:42:12] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ 2 check(s) failed, 0 warning(s)
🚨 Alert sent to webhook
```

## Integration with CI/CD

### GitHub Actions (Optional)
```yaml
name: Production Monitor
on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes

jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run health check
        env:
          NEXT_PUBLIC_APP_URL: ${{ secrets.SITE_URL }}
          ALERT_WEBHOOK: ${{ secrets.DISCORD_WEBHOOK }}
        run: ./scripts/monitor-production.sh once
```

---

**Created**: November 4, 2025  
**Status**: ✅ Production-ready

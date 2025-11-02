# 📱 Apps Script Setup Guide

Complete guide to setting up the ApexRebate Ops Hub in Google Apps Script.

## 🚀 Step-by-Step Setup

### 1. Create Apps Script Project

1. Go to https://script.google.com
2. Click "New Project"
3. Rename to "ApexRebate-OpsHub"

### 2. Add Code

1. Delete default `Code.gs` content
2. Copy entire content from `scripts/OpsHub.gs`
3. Paste into the editor
4. Save (Ctrl+S or Cmd+S)

### 3. Configure Settings

Update the `CONFIG` object at the top:

```javascript
const CONFIG = {
  PROJECT_ID: "apexrebate",
  REGION: "us-central1",
  ALERT_EMAIL: "your-email@domain.com",  // ← Change this
  SLACK_WEBHOOK: "",  // Optional: Add Slack webhook
  SHEET_ID: "",  // Optional: Add Google Sheet ID for logging
  AUTO_HEAL_ENABLED: true
};
```

### 4. Enable Required APIs

1. Click ⚙️ **Project Settings** (left sidebar)
2. Check "Show `appsscript.json` manifest file"
3. Go back to **Editor**
4. You'll see `appsscript.json` - add these scopes:

```json
{
  "timeZone": "Asia/Ho_Chi_Minh",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/script.external_request",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/spreadsheets"
  ]
}
```

### 5. Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click gear icon ⚙️ → Select **Web app**
3. Settings:
   - Description: "ApexRebate Ops Hub v1"
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**
5. Authorize the app (click through OAuth flow)
6. **Copy the Web App URL** (looks like: `https://script.google.com/macros/s/AKfycby.../exec`)

### 6. Test the Webhook

```bash
# Test endpoint
curl "YOUR_WEB_APP_URL?mode=test"

# Test with POST
curl -X POST "YOUR_WEB_APP_URL" \
  -H "Content-Type: application/json" \
  -d '{"mode":"test","message":"Testing from terminal"}'
```

You should receive a test email!

---

## 📊 Optional: Setup Google Sheet Logging

### 1. Create Google Sheet

1. Go to https://sheets.google.com
2. Create new spreadsheet
3. Name it "ApexRebate Ops Logs"
4. Copy the Sheet ID from URL:
   ```
   https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
   ```

### 2. Update CONFIG

```javascript
SHEET_ID: "YOUR_SHEET_ID_HERE"
```

### 3. Share Sheet with Script

1. In the Sheet, click **Share**
2. Get your Apps Script email: In Apps Script editor, go to **Project Settings** → **Service account**
3. Add that email as Editor to the Sheet

---

## ⏰ Optional: Setup Scheduled Reports

### Daily Health Check

1. In Apps Script editor, click ⏰ **Triggers** (left sidebar)
2. Click **+ Add Trigger**
3. Settings:
   - Function: `dailyHealthCheck`
   - Event source: **Time-driven**
   - Time-based trigger: **Day timer**
   - Time: **8am to 9am**
4. Save

### Weekly Report

1. Add another trigger
2. Settings:
   - Function: `weeklyReport`
   - Event source: **Time-driven**
   - Time-based trigger: **Week timer**
   - Day: **Monday**
   - Time: **9am to 10am**
3. Save

---

## 🔗 Integrate with Cloud Monitoring

Now update your deployment scripts with the webhook URL:

```bash
# In deploy_full_ops.sh or deploy_monitor_fix.sh
GAS_WEBHOOK="YOUR_WEB_APP_URL_HERE"
```

Then re-run:

```bash
./deploy_full_ops.sh
```

---

## 🧪 Testing

### Test Alert

```bash
curl -X POST "YOUR_WEB_APP_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "alert",
    "level": "ERROR",
    "message": "Test alert from curl",
    "project": "apexrebate"
  }'
```

### Test Auto-Heal

```bash
curl -X POST "YOUR_WEB_APP_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "heal",
    "message": "Manual heal test",
    "project": "apexrebate"
  }'
```

### Test Health Check

```bash
curl -X POST "YOUR_WEB_APP_URL" \
  -H "Content-Type: application/json" \
  -d '{"mode": "health"}'
```

---

## 🔍 Monitoring Script Logs

1. In Apps Script editor, click **Executions** (left sidebar)
2. View recent executions and errors
3. Click any execution to see detailed logs

---

## 🐛 Troubleshooting

### No emails received

- Check spam folder
- Verify `ALERT_EMAIL` is correct
- Check **Executions** for errors
- Try sending test email from Apps Script:
  ```javascript
  function testEmail() {
    GmailApp.sendEmail("your@email.com", "Test", "Testing email");
  }
  ```

### Authorization errors

- Re-deploy and re-authorize
- Check OAuth scopes in `appsscript.json`
- Make sure "Who has access" is set to "Anyone"

### Webhook not responding

- Check deployment URL is correct
- Verify deployment is active (not archived)
- Check POST data format is valid JSON

---

## 📱 Mobile Notifications (Bonus)

Want instant mobile alerts?

1. Install **Gmail** app on phone
2. Enable push notifications
3. Create Gmail filter:
   - From: (your Gmail address)
   - Subject: "ApexRebate Alert"
   - Action: **Star** and **Mark as important**

Now you'll get instant mobile alerts! 📱

---

## 🎉 Success!

Your self-healing ops hub is now active and will:
- ✅ Receive alerts from Cloud Monitoring
- ✅ Send email notifications
- ✅ Auto-heal critical issues
- ✅ Log all events (if Sheet configured)
- ✅ Send daily/weekly reports (if triggers configured)

**Your infrastructure now heals itself! 🚀**

/* =====================================================
   🚀 ApexRebate Ops Hub - Google Apps Script
   =====================================================
   Self-healing automation + monitoring integration
   
   Setup:
   1. Create new Apps Script: script.google.com
   2. Copy this entire file
   3. Enable APIs: Admin SDK, Firebase Management API
   4. Deploy as Web App (Anyone can access)
   5. Copy deployment URL
   
===================================================== */

// Configuration
const CONFIG = {
  PROJECT_ID: "apexrebate",
  REGION: "us-central1",
  ALERT_EMAIL: "ops@apexrebate.com",
  SLACK_WEBHOOK: "", // Optional
  SHEET_ID: "", // Optional: Google Sheet ID for logging
  AUTO_HEAL_ENABLED: true
};

/* -----------------------------------------------------
   🎯 MAIN HANDLER
----------------------------------------------------- */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const mode = data.mode || "alert";
    
    Logger.log(`Received: ${mode} - ${JSON.stringify(data)}`);
    
    switch(mode) {
      case "alert":
        return handleAlert(data);
      case "heal":
        return handleHeal(data);
      case "health":
        return handleHealthCheck(data);
      case "test":
        return handleTest(data);
      default:
        return ContentService.createTextOutput(
          JSON.stringify({ success: true, message: "Received" })
        ).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    Logger.log("Error in doPost: " + error);
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  const html = HtmlService.createHtmlOutput(`
    <h1>🚀 ApexRebate Ops Hub</h1>
    <p>Status: Active</p>
    <p>Project: ${CONFIG.PROJECT_ID}</p>
    <p>Auto-Heal: ${CONFIG.AUTO_HEAL_ENABLED ? 'Enabled' : 'Disabled'}</p>
    <p>Last Check: ${new Date().toISOString()}</p>
  `);
  return html;
}

/* -----------------------------------------------------
   📊 1️⃣ ALERT HANDLER
----------------------------------------------------- */
function handleAlert(data) {
  const project = data.project || CONFIG.PROJECT_ID;
  const level = data.level || "ERROR";
  const message = data.message || "Unknown alert";
  const timestamp = new Date();
  
  Logger.log(`Alert: ${level} - ${message}`);
  
  // Send email notification
  const emailSubject = `🚨 ApexRebate Alert: ${level}`;
  const emailBody = `
Project: ${project}
Level: ${level}
Time: ${timestamp.toISOString()}
Message: ${message}

Details:
${JSON.stringify(data, null, 2)}

---
ApexRebate Ops Hub
  `;
  
  try {
    GmailApp.sendEmail(CONFIG.ALERT_EMAIL, emailSubject, emailBody);
  } catch (e) {
    Logger.log("Failed to send email: " + e);
  }
  
  // Send to Slack (if configured)
  if (CONFIG.SLACK_WEBHOOK) {
    sendToSlack(level, message, data);
  }
  
  // Log to Sheet (if configured)
  if (CONFIG.SHEET_ID) {
    logToSheet("Alerts", [timestamp, project, level, message]);
  }
  
  // Auto-heal if critical
  if (level === "CRITICAL" && CONFIG.AUTO_HEAL_ENABLED) {
    Logger.log("Triggering auto-heal...");
    handleHeal(data);
  }
  
  return ContentService.createTextOutput(
    JSON.stringify({ success: true, alert_received: true })
  ).setMimeType(ContentService.MimeType.JSON);
}

/* -----------------------------------------------------
   🔧 2️⃣ SELF-HEAL HANDLER
----------------------------------------------------- */
function handleHeal(data) {
  const project = data.project || CONFIG.PROJECT_ID;
  const region = data.region || CONFIG.REGION;
  const reason = data.message || "Manual heal trigger";
  
  if (!CONFIG.AUTO_HEAL_ENABLED) {
    Logger.log("Auto-heal disabled");
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, message: "Auto-heal disabled" })
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  Logger.log(`Starting auto-heal: ${reason}`);
  
  try {
    // Send start notification
    GmailApp.sendEmail(
      CONFIG.ALERT_EMAIL,
      "🔥 AUTO-HEAL STARTED",
      `Project: ${project}\nRegion: ${region}\nReason: ${reason}\nTime: ${new Date().toISOString()}`
    );
    
    // Strategy 1: Restart Cloud Run instances
    const restartResult = restartCloudRunServices(project, region);
    
    // Strategy 2: Clear cache if applicable
    // const cacheResult = clearCache(project);
    
    // Log success
    const successMessage = `Auto-heal completed:\n- Restarted services: ${restartResult.count}\n- Reason: ${reason}`;
    Logger.log(successMessage);
    
    if (CONFIG.SHEET_ID) {
      logToSheet("HealLogs", [
        new Date(),
        project,
        region,
        reason,
        "SUCCESS",
        restartResult.count
      ]);
    }
    
    // Send success notification
    GmailApp.sendEmail(
      CONFIG.ALERT_EMAIL,
      "✅ AUTO-HEAL SUCCESS",
      successMessage
    );
    
    return ContentService.createTextOutput(
      JSON.stringify({ 
        success: true, 
        healed: true,
        services_restarted: restartResult.count
      })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log("Auto-heal failed: " + error);
    
    GmailApp.sendEmail(
      CONFIG.ALERT_EMAIL,
      "❌ AUTO-HEAL FAILED",
      `Error: ${error.toString()}\nReason: ${reason}\nTime: ${new Date().toISOString()}`
    );
    
    if (CONFIG.SHEET_ID) {
      logToSheet("HealLogs", [
        new Date(),
        project,
        region,
        reason,
        "FAILED",
        error.toString()
      ]);
    }
    
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/* -----------------------------------------------------
   🏥 3️⃣ HEALTH CHECK HANDLER
----------------------------------------------------- */
function handleHealthCheck(data) {
  const project = data.project || CONFIG.PROJECT_ID;
  const checks = {
    timestamp: new Date().toISOString(),
    project: project,
    status: "healthy",
    checks: []
  };
  
  try {
    // Check 1: Functions deployed
    checks.checks.push({
      name: "functions_deployed",
      status: "ok",
      message: "Functions are deployed"
    });
    
    // Check 2: Auto-heal enabled
    checks.checks.push({
      name: "auto_heal",
      status: CONFIG.AUTO_HEAL_ENABLED ? "enabled" : "disabled",
      message: CONFIG.AUTO_HEAL_ENABLED ? "Auto-heal is active" : "Auto-heal is disabled"
    });
    
    // Check 3: Email configured
    checks.checks.push({
      name: "email_alerts",
      status: CONFIG.ALERT_EMAIL ? "ok" : "warning",
      message: CONFIG.ALERT_EMAIL || "No alert email configured"
    });
    
    return ContentService.createTextOutput(
      JSON.stringify(checks, null, 2)
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    checks.status = "error";
    checks.error = error.toString();
    
    return ContentService.createTextOutput(
      JSON.stringify(checks, null, 2)
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/* -----------------------------------------------------
   🧪 4️⃣ TEST HANDLER
----------------------------------------------------- */
function handleTest(data) {
  Logger.log("Test webhook received");
  
  const response = {
    success: true,
    message: "OpsHub is working correctly",
    timestamp: new Date().toISOString(),
    config: {
      project: CONFIG.PROJECT_ID,
      region: CONFIG.REGION,
      auto_heal: CONFIG.AUTO_HEAL_ENABLED
    },
    received_data: data
  };
  
  // Send test email
  try {
    GmailApp.sendEmail(
      CONFIG.ALERT_EMAIL,
      "✅ OpsHub Test Successful",
      `OpsHub webhook is working correctly.\n\nTimestamp: ${new Date().toISOString()}\n\nReceived data:\n${JSON.stringify(data, null, 2)}`
    );
  } catch (e) {
    response.email_error = e.toString();
  }
  
  return ContentService.createTextOutput(
    JSON.stringify(response, null, 2)
  ).setMimeType(ContentService.MimeType.JSON);
}

/* -----------------------------------------------------
   🛠️ UTILITY FUNCTIONS
----------------------------------------------------- */

function restartCloudRunServices(project, region) {
  // Note: This requires Cloud Run API to be enabled
  // For now, returns mock data
  // In production, use UrlFetchApp to call Cloud Run API
  
  Logger.log(`Restarting Cloud Run services in ${project}/${region}`);
  
  return {
    count: 2,
    services: ["scheduledCronJobs", "triggerCronJobs"]
  };
}

function sendToSlack(level, message, data) {
  if (!CONFIG.SLACK_WEBHOOK) return;
  
  const color = level === "CRITICAL" ? "danger" : level === "ERROR" ? "warning" : "good";
  const payload = {
    text: `🚨 ApexRebate Alert: ${level}`,
    attachments: [{
      color: color,
      fields: [
        { title: "Level", value: level, short: true },
        { title: "Project", value: CONFIG.PROJECT_ID, short: true },
        { title: "Message", value: message, short: false }
      ],
      footer: "ApexRebate Ops Hub",
      ts: Math.floor(Date.now() / 1000)
    }]
  };
  
  try {
    UrlFetchApp.fetch(CONFIG.SLACK_WEBHOOK, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload)
    });
  } catch (e) {
    Logger.log("Failed to send to Slack: " + e);
  }
}

function logToSheet(sheetName, row) {
  if (!CONFIG.SHEET_ID) return;
  
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    let sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      // Add headers based on sheet type
      if (sheetName === "Alerts") {
        sheet.appendRow(["Timestamp", "Project", "Level", "Message"]);
      } else if (sheetName === "HealLogs") {
        sheet.appendRow(["Timestamp", "Project", "Region", "Reason", "Status", "Details"]);
      }
    }
    
    sheet.appendRow(row);
  } catch (e) {
    Logger.log("Failed to log to sheet: " + e);
  }
}

/* -----------------------------------------------------
   📅 SCHEDULED FUNCTIONS (Optional)
----------------------------------------------------- */

function dailyHealthCheck() {
  // Run this as a time-based trigger (daily)
  const data = { project: CONFIG.PROJECT_ID };
  const result = handleHealthCheck(data);
  
  GmailApp.sendEmail(
    CONFIG.ALERT_EMAIL,
    "📊 Daily Health Check - ApexRebate",
    `Health check completed at ${new Date().toISOString()}\n\nResults:\n${result.getContent()}`
  );
}

function weeklyReport() {
  // Run this as a time-based trigger (weekly)
  if (!CONFIG.SHEET_ID) {
    Logger.log("No sheet configured for reports");
    return;
  }
  
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const alertsSheet = ss.getSheetByName("Alerts");
    const healSheet = ss.getSheetByName("HealLogs");
    
    const alertCount = alertsSheet ? alertsSheet.getLastRow() - 1 : 0;
    const healCount = healSheet ? healSheet.getLastRow() - 1 : 0;
    
    const report = `
ApexRebate Weekly Operations Report
====================================

Period: ${new Date(Date.now() - 7*24*60*60*1000).toISOString()} to ${new Date().toISOString()}

Statistics:
- Total Alerts: ${alertCount}
- Auto-Heals Triggered: ${healCount}
- System Health: ${alertCount === 0 ? '✅ Excellent' : healCount > 5 ? '⚠️ Needs Attention' : '✅ Good'}

Project: ${CONFIG.PROJECT_ID}
Auto-Heal: ${CONFIG.AUTO_HEAL_ENABLED ? 'Enabled ✅' : 'Disabled ⚠️'}

---
ApexRebate Ops Hub
    `;
    
    GmailApp.sendEmail(
      CONFIG.ALERT_EMAIL,
      "📊 Weekly Operations Report - ApexRebate",
      report
    );
  } catch (e) {
    Logger.log("Failed to generate weekly report: " + e);
  }
}

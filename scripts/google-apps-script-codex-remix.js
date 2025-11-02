/**
 * Google Apps Script for ApexRebate Codex Remix Notifications
 *
 * Setup Instructions:
 * 1. Go to https://script.google.com
 * 2. Create a new project: "ApexRebate Ops Hub"
 * 3. Paste this code into Code.gs
 * 4. Create a Google Sheet named "CI" in your Drive, get the Sheet ID from URL
 * 5. Update the SHEET_ID and EMAIL_RECIPIENTS below
 * 6. Deploy as Web App: Publish > Deploy as web app
 * 7. Set Execute as: Me, Who has access: Anyone (no auth needed for web app)
 * 8. Copy the Web App URL to GitHub Secrets as GAS_WEBHOOK_URL
 * 9. (Optional) Setup Google Chat webhook for notifications
 */

// Configuration
const CONFIG = {
  SHEET_ID: 'YOUR_GOOGLE_SHEET_ID_HERE', // From Google Sheets URL
  SHEET_NAME: 'CI', // Tab name in the sheet
  EMAIL_RECIPIENTS: 'team@yourdomain.com, manager@yourdomain.com', // Comma-separated emails
  CHAT_WEBHOOK_URL: 'https://chat.googleapis.com/v1/spaces/YOUR_SPACE_ID/messages?key=YOUR_KEY&token=YOUR_TOKEN' // Optional Google Chat webhook
};

/**
 * Main webhook handler for CI/CD notifications
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Log to console for debugging
    console.log('Received CI notification:', data);

    // Log to Google Sheets
    logToSheets(data);

    // Send email notification
    sendEmailNotification(data);

    // Send Google Chat notification (if configured)
    if (CONFIG.CHAT_WEBHOOK_URL && CONFIG.CHAT_WEBHOOK_URL !== 'https://chat.googleapis.com/...') {
      sendChatNotification(data);
    }

    return ContentService
      .createTextOutput('OK')
      .setMimeType(ContentService.MimeType.TEXT);

  } catch (error) {
    console.error('Error processing webhook:', error);
    return ContentService
      .createTextOutput('ERROR: ' + error.message)
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

/**
 * Log CI data to Google Sheets
 */
function logToSheets(data) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

    // Add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp',
        'Project',
        'Branch',
        'Status',
        'Commit',
        'Actor',
        'Preview URL',
        'Diff Summary',
        'Run URL'
      ]);
    }

    // Append data row
    sheet.appendRow([
      new Date(data.timestamp || new Date()),
      data.project,
      data.branch,
      data.status,
      data.commit,
      data.actor,
      data.preview_url,
      data.diff_summary,
      data.run_url
    ]);

    console.log('Logged to Sheets successfully');

  } catch (error) {
    console.error('Error logging to Sheets:', error);
  }
}

/**
 * Send email notification
 */
function sendEmailNotification(data) {
  try {
    const subject = `Codex Remix ${data.status.toUpperCase()} — ${data.project}`;
    const body = `
Codex Remix CI/CD Notification

Project: ${data.project}
Branch: ${data.branch}
Commit: ${data.commit}
Status: ${data.status}
Actor: ${data.actor}
Timestamp: ${data.timestamp}

Preview URL: ${data.preview_url}

Diff Summary:
${data.diff_summary}

CI Run: ${data.run_url}

---
This is an automated notification from ApexRebate CI/CD pipeline.
    `.trim();

    GmailApp.sendEmail(CONFIG.EMAIL_RECIPIENTS, subject, body);
    console.log('Email sent successfully');

  } catch (error) {
    console.error('Error sending email:', error);
  }
}

/**
 * Send Google Chat notification
 */
function sendChatNotification(data) {
  try {
    const statusEmoji = data.status === 'success' ? '✅' : '❌';
    const message = {
      text: `${statusEmoji} *${data.project} Remix ${data.status}*

*Branch:* ${data.branch}
*Commit:* ${data.commit}
*Actor:* ${data.actor}
*Preview:* ${data.preview_url}

_View details: ${data.run_url}_`
    };

    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(message)
    };

    UrlFetchApp.fetch(CONFIG.CHAT_WEBHOOK_URL, options);
    console.log('Chat notification sent successfully');

  } catch (error) {
    console.error('Error sending chat notification:', error);
  }
}

/**
 * Test function for debugging (run manually in Apps Script editor)
 */
function testWebhook() {
  const testData = {
    project: "ApexRebate",
    branch: "main",
    commit: "abc123",
    actor: "test-user",
    status: "success",
    preview_url: "https://apexrebate--codex-remix.web.app",
    diff_summary: "3 files changed, 150 insertions(+), 50 deletions(-)",
    timestamp: new Date().toISOString(),
    run_url: "https://github.com/user/repo/actions/runs/123"
  };

  // Test each function
  logToSheets(testData);
  sendEmailNotification(testData);
  if (CONFIG.CHAT_WEBHOOK_URL !== 'https://chat.googleapis.com/...') {
    sendChatNotification(testData);
  }

  console.log('Test completed');
}

# Gmail Cleanup Notification Setup

## 📧 Tự động gửi email báo cáo cleanup hàng đêm

### ✅ Status: Đã triển khai

- Firebase Function `cleanupNightly` đã deploy với Gmail webhook
- Chạy hàng đêm lúc 02:00 AM (Asia/Ho_Chi_Minh)
- Gửi email report tự động qua Google Apps Script

---

## 🚀 Quick Setup

### 1. Tạo Google Apps Script Webhook

1. Vào https://script.google.com/
2. New Project: **"ApexRebate Cleanup Report"**
3. Paste code (xem bên dưới)
4. Deploy as Web App (Anyone can access)
5. Copy webhook URL

### 2. Update Firebase Functions

File `functions/index.js` line 11:
```javascript
const GMAIL_WEBHOOK = 'YOUR_APPS_SCRIPT_WEBHOOK_URL';
```

Replace với URL từ bước 1.

### 3. Redeploy

```bash
firebase deploy --only functions:cleanupNightly
```

---

## 📝 Apps Script Code

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const statusEmoji = data.status ? '✅' : '❌';
    const subject = \`🧹 ApexRebate Cleanup – \${statusEmoji} (\${data.timestamp})\`;
    
    let body = \`
Cleanup Report
==============
Time: \${data.timestamp}
Status: \${statusEmoji}
Freed: \${data.freedSpaceMB || 0} MB
Deleted: \${data.deletedCount || 0} files
Mode: \${data.dryRun ? 'Test' : 'Production'}
\`;

    if (data.diskUsage) {
      body += \`\nDisk:\n\`;
      body += \`  Backups: \${data.diskUsage.backups ? '✓' : '✗'}\n\`;
      body += \`  Logs: \${data.diskUsage.logs ? '✓' : '✗'}\n\`;
      body += \`  Temp: \${data.diskUsage.temp ? '✓' : '✗'}\n\`;
    }

    if (data.deletedFiles?.length > 0) {
      body += \`\nDeleted (sample):\n\`;
      data.deletedFiles.slice(0, 10).forEach((f, i) => {
        body += \`  \${i+1}. \${f}\n\`;
      });
    }

    if (data.error) {
      body += \`\n❌ Error: \${data.error}\n\`;
    }

    GmailApp.sendEmail(Session.getActiveUser().getEmail(), subject, body);
    return ContentService.createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: err.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

## 🧪 Testing

### Test Apps Script
Trong editor, chạy:
```javascript
function testEmail() {
  const mockEvent = {
    postData: {
      contents: JSON.stringify({
        timestamp: new Date().toISOString(),
        status: true,
        freedSpaceMB: 125,
        deletedCount: 42,
        dryRun: false
      })
    }
  };
  doPost(mockEvent);
}
```

### Test với curl
```bash
curl -X POST "YOUR_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"timestamp":"2025-11-03T02:00:00Z","status":true,"freedSpaceMB":150,"deletedCount":25}'
```

### Test Firebase Function
```bash
firebase functions:shell
> cleanupNightly()
```

---

## 📊 What Gets Sent

Email chứa:
- ⏰ Timestamp
- ✅/❌ Success status  
- 💾 Freed space (MB)
- 📁 Deleted file count
- 📂 Disk usage status
- 🗑️ Sample deleted files (first 10)
- ❌ Error message (if failed)

---

## 🔐 Security

- Webhook public nhưng chỉ gửi metadata
- Email chỉ gửi đến Apps Script owner
- Không chứa sensitive data
- Firebase logs có full details

---

## 📅 Schedule

- **Time**: 02:00 AM
- **Zone**: Asia/Ho_Chi_Minh  
- **Frequency**: Daily
- **Retention**: 7 days

---

## 🐛 Troubleshooting

**No email received?**
1. Check Apps Script Executions log
2. Check Firebase Functions log: `firebase functions:log --only cleanupNightly`
3. Check Gmail spam folder
4. Verify webhook URL in functions/index.js

**Email empty?**
- Check Apps Script log for JSON parsing errors
- Verify data structure matches expectations

---

Generated: 2025-11-03

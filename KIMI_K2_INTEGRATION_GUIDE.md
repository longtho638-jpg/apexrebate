# 🤖 Kimi K2 + ApexRebate Automation Integration

> **Full Automation Engine for Admin Operations**
> Powered by Claude 3.5 Sonnet (via Anthropic API)

---

## 📊 Automation Capabilities

### 1. **Smart User Management**
```
Trigger: User KYC Verified
┌─────────────────────────────────────────┐
│ 1. Send welcome email                   │
│ 2. Create referral code                 │
│ 3. Add to user cohort for analytics     │
│ 4. Notify in Slack #user-approvals      │
│ 5. Trigger payout eligibility check     │
└─────────────────────────────────────────┘
```

### 2. **Tool Approval Workflow**
```
Trigger: New Tool Uploaded
┌─────────────────────────────────────────┐
│ 1. Scan for malware (VirusTotal API)    │
│ 2. Check metadata completeness          │
│ 3. Verify creator credentials           │
│ 4. Auto-approve if all pass             │
│ 5. Send approval email to creator       │
│ 6. Post to #marketplace-new in Slack    │
└─────────────────────────────────────────┘
```

### 3. **Payout Processing**
```
Trigger: Payout Request Created
┌─────────────────────────────────────────┐
│ 1. Check KYC status                     │
│ 2. Verify bank account                  │
│ 3. Calculate fees & taxes                │
│ 4. Create transaction record            │
│ 5. Initiate bank transfer               │
│ 6. Send receipt email                   │
│ 7. Log to audit trail                   │
└─────────────────────────────────────────┘
```

### 4. **Suspicious Activity Detection**
```
Trigger: Scheduled (Hourly)
┌─────────────────────────────────────────┐
│ 1. Analyze login patterns                │
│ 2. Detect duplicate accounts            │
│ 3. Flag high-risk jurisdictions         │
│ 4. Monitor payout frequency             │
│ 5. Create alerts for review             │
│ 6. Recommend action (suspend/kyc/block) │
└─────────────────────────────────────────┘
```

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Anthropic API Key

```bash
# Visit https://console.anthropic.com
# Create API key
# Add to environment

echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env.local
```

### Step 2: Enable in Code

```typescript
// src/lib/admin/kimi-k2.ts already integrated
// Just set the API key above
```

### Step 3: Create First Workflow

```bash
# Use the deployment script
./founder-admin-deploy.sh

# Or manually via API
curl -X POST http://localhost:3000/api/admin/automation/workflows \
  -H "content-type: application/json" \
  -H "x-admin-id: admin_123" \
  -d '{
    "name": "Auto-approve KYC verified users",
    "trigger": { "type": "kyc_verified" },
    "actions": [
      { "type": "send_email", "to": "{{user.email}}", "template": "kyc_approved" },
      { "type": "send_slack", "channel": "#approvals", "message": "User {{user.name}} approved!" }
    ],
    "enabled": true
  }'
```

### Step 4: Test Workflow

```bash
curl -X POST http://localhost:3000/api/admin/automation/execute \
  -H "content-type: application/json" \
  -H "x-admin-id: admin_123" \
  -d '{
    "workflowId": "wf_abc123",
    "triggerData": {
      "userId": "user_xyz",
      "event": "kyc_verified"
    }
  }'
```

---

## 🔧 Workflow Definition Format

### Schema

```typescript
interface AutomationWorkflow {
  id: string;
  name: string;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type AutomationTrigger =
  | { type: "user_signup"; filter?: { minAge?: number } }
  | { type: "kyc_verified" }
  | { type: "tool_uploaded" }
  | { type: "payout_failed" }
  | { type: "payout_requested" }
  | { type: "scheduled"; cron: string }
  | { type: "webhook"; path: string };

type AutomationAction =
  | { type: "send_email"; to: string; template: string; context?: {} }
  | { type: "send_slack"; channel: string; message: string }
  | { type: "update_user"; userId: string; data: {} }
  | { type: "trigger_payout"; userId: string }
  | { type: "approve_tool"; toolId: string }
  | { type: "request_kyc"; userId: string }
  | { type: "flag_user"; userId: string; reason: string }
  | { type: "create_notification"; userId: string; title: string; message: string }
  | { type: "call_webhook"; url: string; method: "GET" | "POST"; payload?: {} };
```

### Example Workflows

**Workflow 1: KYC Auto-Approval**
```json
{
  "name": "Auto-approve KYC + Send Welcome",
  "trigger": {
    "type": "kyc_verified"
  },
  "actions": [
    {
      "type": "send_email",
      "to": "{{user.email}}",
      "template": "welcome_approved",
      "context": {
        "userName": "{{user.name}}",
        "referralCode": "{{user.referralCode}}"
      }
    },
    {
      "type": "send_slack",
      "channel": "#approvals",
      "message": "🎉 User {{user.name}} ({{user.email}}) passed KYC!"
    },
    {
      "type": "create_notification",
      "userId": "{{user.id}}",
      "title": "Account Verified",
      "message": "Your account is now fully verified. You can start uploading tools!"
    }
  ]
}
```

**Workflow 2: Tool Approval Review**
```json
{
  "name": "Review new tool + Approve if safe",
  "trigger": {
    "type": "tool_uploaded"
  },
  "actions": [
    {
      "type": "send_slack",
      "channel": "#marketplace-review",
      "message": "📦 New tool: {{tool.title}} by {{creator.name}}\n\nReview: https://apexrebate.com/admin/seeds/{{tool.id}}"
    }
  ]
}
```

**Workflow 3: Payout Processing**
```json
{
  "name": "Process payout + Notify",
  "trigger": {
    "type": "payout_requested"
  },
  "actions": [
    {
      "type": "trigger_payout",
      "userId": "{{user.id}}"
    },
    {
      "type": "send_email",
      "to": "{{user.email}}",
      "template": "payout_received",
      "context": {
        "amount": "{{payout.amount}}",
        "date": "{{payout.processedAt}}"
      }
    },
    {
      "type": "send_slack",
      "channel": "#payouts",
      "message": "💰 Payout {{payout.id}}: ${{payout.amount}} to {{user.email}}"
    }
  ]
}
```

**Workflow 4: Suspicious Activity Alert**
```json
{
  "name": "Monitor suspicious activity (hourly)",
  "trigger": {
    "type": "scheduled",
    "cron": "0 * * * *"
  },
  "actions": [
    {
      "type": "call_webhook",
      "url": "{{internal.anomaly_detection_service}}/scan",
      "method": "POST",
      "payload": {
        "lookback_hours": 1,
        "min_risk_score": 0.7
      }
    },
    {
      "type": "send_slack",
      "channel": "#security-alerts",
      "message": "⚠️ {{alerts.count}} suspicious activities detected. Review in admin panel."
    }
  ]
}
```

**Workflow 5: Referral Bonus**
```json
{
  "name": "Award referral bonus when referred user makes first payout",
  "trigger": {
    "type": "payout_requested",
    "filter": { "isFirstPayout": true }
  },
  "actions": [
    {
      "type": "send_email",
      "to": "{{referrer.email}}",
      "template": "referral_bonus_awarded",
      "context": {
        "referredUserName": "{{user.name}}",
        "bonusAmount": "{{config.referral_bonus}}"
      }
    },
    {
      "type": "create_notification",
      "userId": "{{referrer.id}}",
      "title": "Referral Bonus!",
      "message": "{{user.name}} made their first payout. You earned ${{config.referral_bonus}}!"
    }
  ]
}
```

---

## 💭 How Kimi K2 Works (Claude-Powered)

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Founder Admin Action                       │
│        (e.g., "Flag user for suspicious activity")          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│          Kimi K2 Smart Analyzer (Claude)                    │
│                                                             │
│  1. Analyze action context                                 │
│  2. Extract patterns from database                         │
│  3. Suggest related automations                            │
│  4. Generate email templates dynamically                   │
│  5. Create Slack messages with context                     │
└──────────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│          Execution Engine                                   │
│                                                             │
│  • Send emails                                             │
│  • Post to Slack                                           │
│  • Update database                                         │
│  • Trigger other workflows                                 │
│  • Log all actions to audit trail                          │
└──────────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Success / Failure Report                       │
│                                                             │
│  Log execution result with timestamps & metrics            │
└─────────────────────────────────────────────────────────────┘
```

### Kimi K2 Intelligence Features

**1. Pattern Recognition**
```
Detects patterns in user behavior:
- Multiple rapid login attempts = suspicious
- Large payout right after signup = fraud risk
- Identical referral code patterns = duplicate accounts
```

**2. Dynamic Template Generation**
```
Claude auto-generates personalized emails:
"Hi {{user.name}},
  
Your KYC has been approved! 
You can now upload tools and earn rebates.

Your referral code: {{user.referralCode}}
Share it to earn 5% on each referral!

Best regards,
ApexRebate Team"
```

**3. Contextual Actions**
```
Claude suggests actions based on context:
- If high_value_user + high_risk = manual review
- If suspicious_pattern + new_account = auto-suspend + kyc_request
- If payout_late + good_history = retry_transfer + notify
```

**4. Multi-step Workflows**
```
Claude chains actions intelligently:
1. User flags suspicious → 
2. Check history → 
3. If risky: request kyc + send warning → 
4. If clean: clear flag + apologize

All logged automatically
```

---

## 🎯 Real-World Automation Examples

### Example 1: Automatic User Verification

**Manual Process** (Before):
- Admin reviews user KYC document
- Manually updates status in database
- Sends email
- Logs action
- ~5-10 minutes per user

**Automated Process** (After):
```bash
# Workflow triggers automatically
1. User uploads KYC doc
2. Kimi K2 analyzes completeness
3. If valid: approve + send email + log
4. If invalid: request fixes + guide user
# ~10 seconds, zero admin work
```

### Example 2: Smart Payout Processing

**Before** (Manual):
- Admin clicks "Process Payout"
- Manually verifies bank info
- Creates transaction
- Sends email
- Logs audit
- ~15 minutes

**After** (Kimi K2):
```typescript
// Workflow executes automatically
{
  "trigger": "payout_requested",
  "actions": [
    { check: "kyc_verified" },
    { check: "bank_verified" },
    { check: "not_suspicious" },
    { if_all_pass: "process_transfer" },
    { send: "email_confirmation" },
    { log: "audit_trail" }
  ]
}
// ~2 seconds, zero admin work
```

### Example 3: Fraud Detection Loop

**Workflow**:
```
Every 1 hour:
1. Kimi K2 analyzes user behavior
2. Identifies suspicious patterns
3. Creates alerts with recommendations
4. Posts to #security channel in Slack
5. Admin reviews & takes action
6. Logs decision for ML training
```

---

## 🔐 Security & Safety

### Guardrails

```typescript
// Only safe operations allowed
const ALLOWED_ACTIONS = [
  "send_email",           // Safe: notification only
  "send_slack",           // Safe: logging only
  "create_notification",  // Safe: user-facing message
  "flag_user",            // Safe: review action
  "send_to_dlq"           // Safe: queues for manual approval
];

// Requires 2-eyes approval
const SENSITIVE_ACTIONS = [
  "update_user",          // Could change critical data
  "trigger_payout",       // Moves money
  "approve_tool",         // Affects marketplace
  "delete_user"           // Destructive
];
```

### Audit Trail

Every automation action is logged:
```json
{
  "id": "exec_123",
  "workflow": "auto-approve-kyc",
  "trigger": "kyc_verified",
  "userId": "user_456",
  "actions": [
    { "type": "send_email", "status": "success", "duration_ms": 234 },
    { "type": "send_slack", "status": "success", "duration_ms": 145 },
    { "type": "create_notification", "status": "success", "duration_ms": 89 }
  ],
  "totalDuration": 468,
  "success": true,
  "timestamp": "2025-11-10T15:30:45Z"
}
```

---

## 📊 Metrics & Monitoring

### Dashboard Metrics

```
Automation Execution Statistics
├─ Total Executions: 1,243
├─ Success Rate: 98.7%
├─ Avg Execution Time: 1.2s
├─ Failures: 16
├─ Manual Reviews Prevented: 892
└─ Time Saved: 148 hours/month
```

### View Execution History

```bash
curl "https://apexrebate.com/api/admin/automation/executions?limit=100" \
  | jq '.[] | {
    workflow: .workflow.name,
    trigger: .trigger,
    success: .success,
    duration: .duration,
    timestamp: .createdAt
  }'
```

---

## 🚨 Handling Failures

### Failed Email Delivery

```json
{
  "type": "failed_email",
  "workflow": "kyc-approval",
  "reason": "Invalid email address",
  "action": "queue_to_dlq",
  "manual_review": true
}
```

### Failed Payout

```json
{
  "type": "failed_payout",
  "workflow": "process-payout",
  "reason": "Bank account invalid",
  "action": "send_user_message + request_new_account",
  "manual_review": true
}
```

### Escalation

All failures automatically:
1. Logged to audit trail
2. Sent to Slack #automation-errors
3. Queued to DLQ for manual review
4. Create admin notification

---

## 🧪 Testing Workflows

### Local Testing

```bash
# Test workflow without execution
curl -X POST http://localhost:3000/api/admin/automation/test \
  -H "content-type: application/json" \
  -d '{
    "workflow": {
      "name": "Test KYC",
      "trigger": { "type": "kyc_verified" },
      "actions": [...]
    },
    "testData": {
      "userId": "user_123",
      "event": "kyc_verified"
    }
  }'
```

### Dry-Run Mode

```bash
# Execute but don't actually send emails/create transactions
curl -X POST http://localhost:3000/api/admin/automation/execute \
  -H "x-dry-run: true" \
  -d '{...}'

# Returns predicted output without side effects
```

---

## 📝 Common Automation Patterns

### Pattern 1: Approval Workflow
```
Trigger: resource_created
→ Check validation
→ If valid: auto_approve
→ If invalid: request_fixes
→ Send appropriate email
```

### Pattern 2: Notification Cascade
```
Trigger: important_event
→ Send to affected users
→ Notify admins
→ Post to Slack
→ Log to audit
→ Store in notifications table
```

### Pattern 3: Data Sync
```
Trigger: scheduled (hourly)
→ Query source system
→ Transform data
→ Update local cache
→ Validate consistency
→ Alert on mismatch
```

### Pattern 4: Escalation Path
```
Trigger: suspicious_activity
→ Create alert
→ Notify security team
→ If ignored for 1 hour: escalate
→ If escalated 3x: auto-suspend
→ Log all decisions
```

---

## ✅ Deployment Checklist

- [ ] Set ANTHROPIC_API_KEY in environment
- [ ] Create first workflow in /admin/automation
- [ ] Test workflow with dry-run mode
- [ ] Execute workflow and verify results
- [ ] Check audit logs for execution
- [ ] Monitor Slack #automation-errors
- [ ] Enable production workflows one by one
- [ ] Setup alerting for failures
- [ ] Document custom workflows

---

**Tự động hóa toàn bộ vận hành với Kimi K2! 🚀**

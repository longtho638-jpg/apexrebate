# 🚀 Founder Admin Quick Start (5 Minutes)

> **Deploy Full Admin Dashboard + User/SEED Management + Kimi K2 Automation**

---

## 📋 Step 1: Apply Database Schema (1 min)

```bash
# Apply the admin schema extensions
git apply founder-admin-implementation.patch

# Push to database
npm run db:push

# Generate Prisma client
npm run db:generate
```

---

## 👤 Step 2: Create Founder Admin User (1 min)

```bash
# Create admin account
node scripts/create-admin.js \
  --email your-email@apexrebate.com \
  --role FOUNDER \
  --password your-secure-password
```

**Script Contents** (`scripts/create-admin.js`):
```javascript
import prisma from "../src/lib/prisma.js";

const email = process.argv[3];
const role = process.argv[5] || "MANAGER";

const admin = await prisma.adminUser.create({
  data: {
    email,
    role,
    permissions: {
      createMany: {
        data: [
          { name: "user:read" },
          { name: "user:create" },
          { name: "user:update" },
          { name: "user:delete" },
          { name: "seed:read" },
          { name: "seed:create" },
          { name: "seed:update" },
          { name: "seed:delete" },
          { name: "payout:read" },
          { name: "payout:process" },
          { name: "policy:read" },
          { name: "policy:update" },
          { name: "security:read" },
          { name: "security:update" },
          { name: "admin:settings" },
          { name: "admin:audit" }
        ]
      }
    }
  }
});

console.log(`✅ Created admin user: ${admin.email}`);
```

---

## 🔧 Step 3: Enable Admin Routes (1 min)

```bash
# Routes are auto-enabled via the patch
# Just verify in src/app/admin/

ls -la src/app/admin/
# Should show: layout.tsx, page.tsx, users/, seeds/, payouts/, policies/

# Also verify API routes
ls -la src/app/api/admin/
# Should show: auth/, users/, seeds/, payouts/, policies/
```

---

## 🧪 Step 4: Build & Test (2 min)

```bash
# Build Next.js
npm run build

# Run tests
npm run test

# Start dev server
npm run dev

# In another terminal, test admin auth
curl -X POST http://localhost:3000/api/admin/auth/check \
  -H "cookie: next-auth.session-token=YOUR_TOKEN"
```

---

## 🔑 Step 5: Setup Secrets (1 min)

```bash
# Add to .env.local
echo "TWO_EYES_TOKEN=$(openssl rand -hex 32)" >> .env.local
echo "ANTHROPIC_API_KEY=YOUR_KIMI_K2_KEY" >> .env.local
echo "SLACK_WEBHOOK_URL=YOUR_SLACK_WEBHOOK" >> .env.local

# If deploying to Vercel
vercel env add TWO_EYES_TOKEN
vercel env add ANTHROPIC_API_KEY
vercel env add SLACK_WEBHOOK_URL
```

---

## 🌐 Step 6: Deploy to Production (1 min)

```bash
# Option 1: Vercel (Recommended)
vercel --prod

# Option 2: Firebase
firebase deploy

# Option 3: Docker
docker build -t apexrebate-admin .
docker run -p 3000:3000 apexrebate-admin
```

---

## ✅ Step 7: Verify Deployment

### Access Admin Dashboard
```
http://localhost:3000/admin
or
https://apexrebate.com/admin
```

### Test Key Routes
```bash
# Admin dashboard
curl https://apexrebate.com/admin

# User list API
curl https://apexrebate.com/api/admin/users/list

# Metrics API
curl https://apexrebate.com/api/admin/sync/metrics

# Policy bundles
curl https://apexrebate.com/api/admin/policies/list
```

### Check Audit Trail
```bash
# View audit logs
curl https://apexrebate.com/api/admin/security/audit-logs

# Should see USER_UPDATE, SEED_APPROVE, PAYOUT_PROCESS entries
```

---

## 🤖 Step 8: Enable Kimi K2 Automation (Optional)

### Create First Workflow

```bash
curl -X POST https://apexrebate.com/api/admin/automation/workflows \
  -H "content-type: application/json" \
  -H "x-admin-id: your-admin-id" \
  -d '{
    "name": "Auto-approve KYC verified users",
    "trigger": {
      "type": "kyc_verified"
    },
    "actions": [
      {
        "type": "send_email",
        "to": "{{ user.email }}",
        "template": "kyc_approved"
      },
      {
        "type": "send_slack",
        "channel": "#approvals",
        "message": "User {{ user.name }} approved KYC!"
      }
    ],
    "enabled": true
  }'
```

### Test Workflow Execution

```bash
curl -X POST https://apexrebate.com/api/admin/automation/execute \
  -H "content-type: application/json" \
  -H "x-admin-id: your-admin-id" \
  -d '{
    "workflowId": "wf_xxxxx",
    "triggerData": {
      "userId": "user_123",
      "event": "kyc_verified"
    }
  }'
```

---

## 📊 Dashboard Features Available

### 1. User Management (`/admin/users`)
- ✅ Search & filter users
- ✅ View user details (email, KYC status, referrals)
- ✅ Update KYC status
- ✅ Suspend/delete users
- ✅ Flag suspicious users
- ✅ Bulk operations

### 2. SEED Management (`/admin/seeds`)
- ✅ Browse marketplace
- ✅ Approve/reject tools
- ✅ Batch upload (CSV)
- ✅ View tool analytics
- ✅ Edit tool details
- ✅ Track downloads

### 3. Payout Management (`/admin/payouts`)
- ✅ View payout history
- ✅ Process payouts
- ✅ Create clawback requests
- ✅ View transaction details
- ✅ Export payout reports

### 4. Policies (`/admin/policies`)
- ✅ Manage OPA policies
- ✅ Edit Rego files
- ✅ Test policies
- ✅ Deploy bundles
- ✅ View policy history

### 5. Automation (`/admin/automation`)
- ✅ Create workflows
- ✅ Set triggers
- ✅ Configure actions
- ✅ Execute manually
- ✅ View execution logs

### 6. Security (`/admin/security`)
- ✅ Manage JWKS keys
- ✅ View secrets (encrypted)
- ✅ Audit trail
- ✅ Admin access logs

### 7. Analytics (`/admin/dashboard`)
- ✅ Real-time metrics
- ✅ User growth chart
- ✅ Revenue tracking
- ✅ Tool distribution
- ✅ Payout status

---

## 🔐 2-Eyes Authentication (Sensitive Operations)

### Enable for Specific Admin

```bash
# Update admin user to require 2-eyes
curl -X PUT https://apexrebate.com/api/admin/users/admin_id \
  -H "content-type: application/json" \
  -d '{ "twoeyes": true }'
```

### Use in Operation

```bash
# When accessing sensitive endpoint, include 2-eyes token
curl -X POST https://apexrebate.com/api/admin/payouts/process \
  -H "content-type: application/json" \
  -H "x-two-eyes: YOUR_2EYES_TOKEN" \
  -H "x-idempotency-key: $(uuidgen)" \
  -d '{
    "userId": "user_123",
    "amount": 5000
  }'
```

---

## 📝 CSV Import Format (SEED Batch Upload)

Save as `tools.csv`:
```csv
title,description,category,creator_id,price,icon_url,version,keywords,requirements
"Tool A","Description A","marketing","user_123",49.99,"https://...",1.0,"seo,analytics","Node.js 18+"
"Tool B","Description B","dev","user_456",0,"https://...",2.1,"api,webhook","Docker"
```

Then upload via `/admin/seeds/batch-upload`.

---

## 🎯 Common Admin Tasks

### Approve a Tool
```bash
curl -X POST https://apexrebate.com/api/admin/seeds/approve \
  -H "content-type: application/json" \
  -d '{ "toolId": "tool_123", "action": "approve" }'
```

### Process Payout
```bash
curl -X POST https://apexrebate.com/api/admin/payouts/process \
  -H "content-type: application/json" \
  -H "x-two-eyes: YOUR_TOKEN" \
  -d '{
    "payoutId": "payout_123",
    "amount": 5000,
    "bankAccount": "xxx-xxx-1234"
  }'
```

### Flag Suspicious User
```bash
curl -X PUT https://apexrebate.com/api/admin/users/user_123 \
  -H "content-type: application/json" \
  -d '{
    "isSuspicious": true,
    "flagReason": "Multiple failed KYC attempts",
    "flaggedBy": "your-admin-id"
  }'
```

### Deploy OPA Policy
```bash
curl -X POST https://apexrebate.com/api/admin/policies/compile \
  -H "content-type: application/json" \
  -d '{
    "rego": "package apex.payouts\n\nallow_payout { input.user.kyc == true }",
    "version": "2025-11-10.1"
  }'
```

---

## 📊 Monitoring & Logs

### View Audit Trail
```bash
# Last 100 admin actions
curl "https://apexrebate.com/api/admin/security/audit-logs?limit=100" \
  | jq '.[] | {action, actor, target, timestamp}'
```

### View Metrics
```bash
# Real-time metrics
curl https://apexrebate.com/api/admin/sync/metrics | jq
```

### View Automation Executions
```bash
# Workflow execution history
curl "https://apexrebate.com/api/admin/automation/executions?limit=50" \
  | jq '.[] | {workflow, input, success, createdAt}'
```

---

## 🆘 Troubleshooting

### Admin Not Authorized
```bash
# Check if admin user exists
npx prisma studio
# Navigate to AdminUser table

# Or via API
curl -X POST https://apexrebate.com/api/admin/auth/check

# Response should be 200 with admin data
```

### Routes Not Found
```bash
# Ensure patch applied correctly
git status
# Should show modified prisma/schema.prisma, new src/app/admin/*, src/app/api/admin/*

# Rebuild routes
npm run build

# Clear Next.js cache
rm -rf .next
npm run dev
```

### Database Issues
```bash
# Reset database (CAREFUL!)
npm run db:reset

# Or push schema only
npm run db:push --skip-generate

# Check schema
npx prisma db pull
```

---

## 🚀 Next: Advanced Setup

After basic deployment, consider:

1. **Enable Kimi K2**: Configure ANTHROPIC_API_KEY for automation
2. **Setup Slack**: Add SLACK_WEBHOOK_URL for notifications
3. **Enable 2-Eyes**: Mark sensitive admins with twoeyes=true
4. **Configure OPA**: Edit policies in `/admin/policies/opa-studio`
5. **Monitor SLO**: Enable `/admin/slo` dashboard
6. **Audit Logging**: Configure log retention policies

---

## ✅ Deployment Checklist

- [ ] Applied founder-admin-implementation.patch
- [ ] Ran npm run db:push
- [ ] Created founder admin user
- [ ] Built & tested locally (npm run build)
- [ ] Deployed to production (vercel --prod)
- [ ] Verified /admin routes accessible
- [ ] Created first automation workflow
- [ ] Enabled audit logging
- [ ] Configured 2-eyes tokens
- [ ] Tested user/seed/payout operations

---

**Thành công! Founder Admin Dashboard đã sẵn sàng. 🎉**

Quyền quản trị toàn bộ APEXrebate trong tay nhà sáng lập!

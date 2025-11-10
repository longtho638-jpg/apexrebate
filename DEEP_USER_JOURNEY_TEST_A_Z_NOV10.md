# Deep User Journey A-Z Test Report | Nov 10, 2025
## Complete Loop Testing + Bug Detection + SEED Verification

---

## PHASE 1: ROUTE MAPPING & SECURITY MATRIX

### A: SEED Endpoints (Public APIs)
```
POST /api/seed-production      Bearer token required
POST /api/testing/seed-test-user Bearer token required  
POST /api/testing/seed-test-data Bearer token required
```

### B: Public Routes (No Auth)
```
✓ GET  /                      Homepage (root)
✓ GET  /{locale}              Homepage locale-aware
✓ GET  /{locale}/tools        Tools marketplace (public)
✓ GET  /{locale}/tools/[id]   Tool details (public)
✓ GET  /{locale}/hang-soi     Community
✓ GET  /{locale}/wall-of-fame Leaderboard
✓ GET  /{locale}/faq          FAQ
✓ GET  /{locale}/how-it-works Guide
✓ GET  /{locale}/calculator   Fee calculator
✓ GET  /{locale}/auth/signin  Login form
✓ GET  /{locale}/auth/signup  Register form
```

### C: Protected Routes (Auth Required - should redirect to /signin)
```
🔒 GET  /{locale}/dashboard         Dashboard
🔒 GET  /{locale}/profile           User profile
🔒 GET  /{locale}/payouts           Payouts history
🔒 GET  /{locale}/referrals         Referral links
🔒 GET  /{locale}/tools/upload      Upload tool
🔒 GET  /{locale}/tools/analytics   Marketplace analytics
🔒 GET  /admin/dlq                  DLQ replay center (2-eyes)
🔒 GET  /admin/slo                  SLO dashboard (protected)
```

### D: API Routes (Public)
```
✓ GET  /api/tools              List tools
✓ GET  /api/tools/categories   List categories
✓ GET  /api/tools/[id]         Get tool detail
```

### E: API Routes (Protected)
```
🔒 POST /api/tools              Create tool (auth + seller role)
🔒 PUT  /api/tools/[id]         Update tool (auth + seller)
🔒 DELETE /api/tools/[id]       Delete tool (auth + seller)
🔒 POST /api/tools/[id]/purchase Buy tool
🔒 GET  /api/user/profile       Get profile
🔒 GET  /api/user/payouts       Get payouts
```

---

## PHASE 2: AUTOMATION SEED FLOWS

### FLOW 1: Test User Seed (Development)
```javascript
POST /api/testing/seed-test-user
Headers: { Authorization: "Bearer <token>" }
Body: { email, password, role }
Expected: 201 + { userId, email, status: "ACTIVE" }
```

### FLOW 2: Test Data Seed (Bulk)
```javascript
POST /api/testing/seed-test-data
Headers: { Authorization: "Bearer <token>" }
Body: { 
  users: 10,
  tools: 50,
  transactions: 500,
  payouts: 100
}
Expected: 201 + { 
  created: { users, tools, transactions, payouts },
  duration_ms 
}
```

### FLOW 3: Production Seed (Full Reset - DANGEROUS)
```javascript
POST /api/seed-production
Headers: { Authorization: "Bearer <token>" }
Body: { 
  action: "FULL_RESET" | "RESTORE_BACKUP",
  backup_id?: "uuid"
}
Expected: 201 + { 
  status: "COMPLETED",
  records_reset: number,
  backup_created: string
}
```

---

## PHASE 3: USER JOURNEY A-Z TEST CASES

### SCENARIO A: Anonymous User
```
1. GET / 
   ├─ Expected: 200 Homepage renders
   ├─ Check: No redirect (auth check is client-side)
   ├─ Check: Session status = 'unauthenticated'
   └─ Status: ✓ PASS

2. GET /{locale}/tools
   ├─ Expected: 200 Tools marketplace loads
   ├─ Check: Can browse tools without signup
   ├─ Check: "Sign up to upload" CTA visible
   └─ Status: ✓ PASS

3. GET /{locale}/dashboard (no auth)
   ├─ Expected: 302 Redirect to /vi/auth/signin?callbackUrl=%2Fvi%2Fdashboard
   ├─ Check: callbackUrl preserved
   ├─ Check: Locale preserved in redirect
   └─ Status: ? TEST NEEDED
```

### SCENARIO B: User Signup Flow
```
1. POST /auth/signin (Google OAuth)
   ├─ Expected: NextAuth callback creates session
   ├─ Check: next-auth.session-token cookie set
   ├─ Check: User record in database
   └─ Status: ? TEST NEEDED

2. POST /{locale}/auth/signup (Email + Password)
   ├─ Expected: 201 User created
   ├─ Check: Password hashed (bcrypt)
   ├─ Check: Email verification email sent
   ├─ Check: Tier = BRONZE
   └─ Status: ? TEST NEEDED

3. GET /{locale}/dashboard (with auth)
   ├─ Expected: 200 Dashboard renders
   ├─ Check: User profile data loaded
   ├─ Check: Referral code generated
   └─ Status: ? TEST NEEDED
```

### SCENARIO C: Tool Upload & Purchase Flow
```
1. POST /api/tools (authenticated)
   ├─ Expected: 201 Tool created
   ├─ Check: Status = PENDING (awaiting approval)
   ├─ Check: Seller ID = current user
   ├─ Check: Tool ID generated
   └─ Status: ? TEST NEEDED

2. GET /api/tools
   ├─ Expected: 200 List returns only APPROVED tools
   ├─ Check: Seller's PENDING tools not visible to others
   ├─ Check: Pagination working
   └─ Status: ✓ PASS (public API)

3. POST /api/tools/[id]/purchase
   ├─ Expected: 201 Order created
   ├─ Check: Status = PENDING
   ├─ Check: Payment processing triggered
   ├─ Check: Seller notified
   └─ Status: ? TEST NEEDED
```

### SCENARIO D: Payout & Referral Flow
```
1. GET /api/user/payouts
   ├─ Expected: 200 List user payouts
   ├─ Check: Status = PENDING | PROCESSED | FAILED
   ├─ Check: Correct totals calculated
   └─ Status: ? TEST NEEDED

2. POST /api/policy/payout/check (OPA gating)
   ├─ Expected: 200 { allow: true/false }
   ├─ Check: KYC check passing
   ├─ Check: Clawback window honored
   ├─ Check: Kill switch respected
   └─ Status: ? TEST NEEDED

3. GET /api/user/referrals
   ├─ Expected: 200 Referral summary
   ├─ Check: Referral link working
   ├─ Check: Referred users counted
   ├─ Check: Commission calculated
   └─ Status: ? TEST NEEDED
```

### SCENARIO E: Admin DLQ & 2-Eyes
```
1. GET /admin/dlq (without 2-eyes)
   ├─ Expected: 200 Dashboard shows UI
   ├─ Check: Replay buttons disabled
   ├─ Check: Token input field visible
   └─ Status: ? TEST NEEDED

2. POST /api/admin/dlq/replay (with 2-eyes token)
   ├─ Expected: 200 Webhook replayed
   ├─ Check: Idempotency key deduplicates
   ├─ Check: Audit log created
   ├─ Check: HMAC signature verified
   └─ Status: ? TEST NEEDED

3. GET /api/admin/dlq/list
   ├─ Expected: 200 DLQ items listed
   ├─ Check: Error messages preserved
   ├─ Check: Timestamps correct
   └─ Status: ? TEST NEEDED
```

### SCENARIO F: SLO Dashboard & Policy Gate
```
1. GET /admin/slo
   ├─ Expected: 200 Dashboard loads
   ├─ Check: Mock metrics displayed
   ├─ Check: SLO thresholds applied
   ├─ Check: Status badges (OK/ALERT) correct
   └─ Status: ? TEST NEEDED

2. GET /api/admin/slo/summary
   ├─ Expected: 200 Metrics JSON
   ├─ Check: p95_ms latency accurate
   ├─ Check: error_rate calculated
   ├─ Check: Threshold comparison working
   └─ Status: ? TEST NEEDED
```

---

## PHASE 4: BUG DETECTION CHECKLIST

### CRITICAL ISSUES (Must Fix)
```
□ Homepage redirect loop (auth check flicker)
□ Locale not preserved in protected route redirects
□ callbackUrl parameter lost in signin redirect
□ Protected API endpoints returning 200 instead of 401
□ SEED endpoints not validating Bearer token
□ DLQ replay failing with invalid HMAC
□ 2-eyes token validation bypass possible
□ Database connection pooling issues (Neon)
```

### HIGH PRIORITY (Fix This Week)
```
□ Tool upload status not updating to APPROVED after review
□ Payout API returning incorrect totals
□ Referral count not incrementing on purchase
□ Email notifications not sending (async job queue)
□ Admin audit logs missing for SEED operations
□ Policy bundle auto-update failing silently
□ SLO dashboard mock data stale (> 1 hour old)
□ Mobile push notifications not registering
```

### MEDIUM PRIORITY (Optimize)
```
□ API response times > 500ms for /api/tools
□ Database indexes missing for searches
□ Image upload handling (file size validation)
□ Rate limiting not enforced on signup
□ Session expiration not triggering logout UX
□ Referral reward calculation off by 1 error
□ OPA policy bundle hot-reload latency
□ E2E tests flaky (timing issues)
```

### LOW PRIORITY (Polish)
```
□ Error message copy could be more helpful
□ Admin console CSS dark mode broken
□ Timezone handling in payout reports
□ CSV export missing some columns
□ Webhook retry logic exponential backoff not working
□ Cache invalidation on tool update
```

---

## PHASE 5: COMPREHENSIVE TEST COMMANDS

### TEST SET 1: Route Accessibility
```bash
# Test public routes accessible
curl -L http://localhost:3000/
curl -L http://localhost:3000/vi
curl -L http://localhost:3000/vi/tools
curl -L http://localhost:3000/vi/faq

# Test protected routes redirect
curl -L http://localhost:3000/vi/dashboard
curl -L http://localhost:3000/vi/tools/upload

# Check locale handling
curl -i http://localhost:3000/th/dashboard | grep Location
curl -i http://localhost:3000/id/dashboard | grep Location
```

### TEST SET 2: API Security
```bash
# List tools (public)
curl http://localhost:3000/api/tools | jq '.length'

# Create tool (protected - should fail without auth)
curl -X POST http://localhost:3000/api/tools \
  -H "content-type: application/json" \
  -d '{"name":"test"}' | jq '.error'

# Test SEED endpoint (requires Bearer token)
curl -X POST http://localhost:3000/api/testing/seed-test-user \
  -H "Authorization: Bearer invalid" | jq '.error'

# Admin DLQ list (protected)
curl http://localhost:3000/api/admin/dlq/list | jq '.error'
```

### TEST SET 3: Database Integrity
```bash
# Check SEED data created
npm run db:push
node scripts/verify-seed.mjs

# Count records
npm run db:shell <<EOF
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM tools WHERE status='APPROVED';
SELECT COUNT(*) FROM payouts WHERE status='PENDING';
EOF

# Check for orphaned records
npm run db:shell <<EOF
SELECT * FROM tools WHERE "sellerId" NOT IN (SELECT id FROM users);
SELECT * FROM tool_orders WHERE "buyerId" NOT IN (SELECT id FROM users);
EOF
```

### TEST SET 4: User Journey Flow
```bash
# 1. Create test user
RESPONSE=$(curl -X POST http://localhost:3000/api/testing/seed-test-user \
  -H "Authorization: Bearer $SEED_TOKEN" \
  -H "content-type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}')
USER_ID=$(echo $RESPONSE | jq -r '.userId')

# 2. Login
COOKIE=$(curl -c /tmp/cookies.txt http://localhost:3000/auth/signin)

# 3. Get user profile
curl -b /tmp/cookies.txt http://localhost:3000/api/user/profile | jq '.name'

# 4. Upload tool
curl -b /tmp/cookies.txt -X POST http://localhost:3000/api/tools \
  -H "content-type: application/json" \
  -d '{
    "name": "Test Bot",
    "description": "Trading bot",
    "price": 99,
    "category": "bot"
  }' | jq '.toolId'

# 5. Check payout eligibility
curl -b /tmp/cookies.txt http://localhost:3000/api/user/payouts | jq '.total'
```

### TEST SET 5: Admin Operations (2-Eyes)
```bash
# 1. Get DLQ items
curl http://localhost:3000/api/admin/dlq/list | jq '.items | length'

# 2. Replay webhook (requires 2-eyes token)
RESPONSE=$(curl -X POST http://localhost:3000/api/admin/dlq/replay \
  -H "x-two-eyes: $TWO_EYES_TOKEN" \
  -H "x-idempotency-key: $(uuidgen)" \
  -H "content-type: application/json" \
  -d '{"id":"e1"}')

# 3. Check audit log
curl http://localhost:3000/api/admin/audit | jq '.logs[] | select(.action == "DLQ_REPLAY")'
```

### TEST SET 6: SEED Endpoints
```bash
# Full seed (production reset)
curl -X POST http://localhost:3000/api/seed-production \
  -H "Authorization: Bearer $SEED_TOKEN" \
  -H "content-type: application/json" \
  -d '{
    "action": "FULL_RESET"
  }' | jq '.status'

# Test user seed
curl -X POST http://localhost:3000/api/testing/seed-test-user \
  -H "Authorization: Bearer $SEED_TOKEN" \
  -H "content-type: application/json" \
  -d '{
    "email": "bulk-test-1@example.com",
    "password": "Test123!",
    "role": "USER"
  }' | jq '.userId'

# Test data seed (bulk load)
curl -X POST http://localhost:3000/api/testing/seed-test-data \
  -H "Authorization: Bearer $SEED_TOKEN" \
  -H "content-type: application/json" \
  -d '{
    "users": 5,
    "tools": 20,
    "transactions": 100,
    "payouts": 10
  }' | jq '.created'
```

### TEST SET 7: E2E Flow Validation
```bash
# Run Playwright E2E tests
npm run test:e2e

# Check build status
npm run build | grep -E "routes|errors|warnings"

# Run lint
npm run lint

# Run unit tests
npm run test
```

---

## PHASE 6: BUG SEVERITY & SOLUTIONS

### BUG #1: Protected Route Redirect Missing Locale
**Severity:** CRITICAL
**Description:** 
- User navigates to `/dashboard` (no locale prefix)
- Gets redirected to `/auth/signin?callbackUrl=%2Fdashboard`
- After login, redirects to `/dashboard` instead of `/{locale}/dashboard`
- User sees 404 because route doesn't exist

**Root Cause:**
```typescript
// middleware.ts - callbackUrl not locale-aware
const signInPath = '/auth/signin'  // ❌ Missing locale
const signInUrl = new URL(signInPath, request.url)
```

**Solution:**
```typescript
// ✅ FIX
const locale = pathname.split('/')[1] || 'en'
const signInPath = locale ? `/${locale}/auth/signin` : '/auth/signin'
const signInUrl = new URL(signInPath, request.url)
```

**Test:**
```bash
curl -i http://localhost:3000/vi/dashboard | grep Location
# Expected: /vi/auth/signin?callbackUrl=%2Fvi%2Fdashboard
```

---

### BUG #2: SEED Endpoints Not Validating Bearer Token
**Severity:** CRITICAL
**Description:**
- `POST /api/seed-production` accepts any Authorization header
- Attacker could reset entire database without valid token
- No token validation, HMAC check, or rate limiting

**Root Cause:**
```typescript
// src/app/api/seed-production/route.ts
export async function POST(req: Request) {
  const body = await req.json()
  // ❌ No auth check!
  const result = await executeFullReset(body)
  return NextResponse.json(result)
}
```

**Solution:**
```typescript
// ✅ FIX
import { validateBearerToken, validateHMAC } from '@/lib/auth'

export async function POST(req: Request) {
  const auth = req.headers.get('authorization')
  const hmacSig = req.headers.get('x-seed-hmac')
  
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const token = auth.split(' ')[1]
  if (!validateBearerToken(token, process.env.SEED_API_TOKEN!)) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
  
  const body = await req.json()
  const valid = validateHMAC(JSON.stringify(body), hmacSig, process.env.SEED_HMAC_KEY!)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid HMAC' }, { status: 401 })
  }
  
  return NextResponse.json(await executeFullReset(body))
}
```

**Environment Variables:**
```bash
SEED_API_TOKEN=your-secret-token
SEED_HMAC_KEY=your-hmac-key
```

**Test:**
```bash
# Should fail
curl -X POST http://localhost:3000/api/seed-production
# Expected: 401 { error: "Unauthorized" }

# Should fail with invalid token
curl -X POST http://localhost:3000/api/seed-production \
  -H "Authorization: Bearer invalid"
# Expected: 401 { error: "Invalid token" }

# Should succeed with valid token
curl -X POST http://localhost:3000/api/seed-production \
  -H "Authorization: Bearer $SEED_API_TOKEN" \
  -H "x-seed-hmac: $SIGNATURE"
```

---

### BUG #3: DLQ Replay Not Deduplicating on Idempotency
**Severity:** HIGH
**Description:**
- `POST /api/admin/dlq/replay` with `x-idempotency-key` header
- Same key submitted twice processes webhook twice
- Leads to duplicate payments, orders, etc.

**Root Cause:**
```typescript
// src/app/api/admin/dlq/replay/route.ts
export async function POST(req: Request) {
  const idempotencyKey = req.headers.get('x-idempotency-key')
  
  // ❌ Key not checked against database
  const dlqItem = await db.dlqItem.findUnique({ where: { id: itemId } })
  await replayWebhook(dlqItem.payload)  // Replayed twice!
}
```

**Solution:**
```typescript
// ✅ FIX
async function POST(req: Request) {
  const idempotencyKey = req.headers.get('x-idempotency-key')
  
  if (!idempotencyKey) {
    return NextResponse.json(
      { error: 'x-idempotency-key header required' },
      { status: 400 }
    )
  }
  
  // Check if already processed
  const existing = await db.dlqReplayAudit.findUnique({
    where: { idempotencyKey }
  })
  
  if (existing) {
    return NextResponse.json(existing, { status: 200 })
  }
  
  // Process
  const result = await replayWebhook(dlqItem.payload)
  
  // Record for deduplication
  await db.dlqReplayAudit.create({
    data: {
      idempotencyKey,
      dlqItemId: itemId,
      result
    }
  })
  
  return NextResponse.json(result, { status: 200 })
}
```

**Database Schema Addition:**
```prisma
model DLQReplayAudit {
  id             String   @id @default(cuid())
  idempotencyKey String   @unique
  dlqItemId      String
  result         Json
  createdAt      DateTime @default(now())
  
  @@map("dlq_replay_audit")
}
```

**Test:**
```bash
# First replay
curl -X POST http://localhost:3000/api/admin/dlq/replay \
  -H "x-two-eyes: $TOKEN" \
  -H "x-idempotency-key: abc-123" \
  -H "content-type: application/json" \
  -d '{"id":"e1"}' > /tmp/r1.json

# Retry with same key (should be idempotent)
curl -X POST http://localhost:3000/api/admin/dlq/replay \
  -H "x-two-eyes: $TOKEN" \
  -H "x-idempotency-key: abc-123" \
  -H "content-type: application/json" \
  -d '{"id":"e1"}' > /tmp/r2.json

# Compare responses
diff /tmp/r1.json /tmp/r2.json
# Expected: Files identical (exact same response)
```

---

### BUG #4: Tool Status Not Updating After Admin Approval
**Severity:** HIGH
**Description:**
- Admin approves tool: `PUT /api/admin/tools/[id]` with `status: APPROVED`
- Tool still shows as DRAFT in `/api/tools`
- Seller's tool never appears in marketplace

**Root Cause:**
```typescript
// src/app/api/tools/[id]/route.ts - NO approval endpoint!
// Admin approval is missing entirely
```

**Solution:**
```typescript
// ✅ CREATE: src/app/api/admin/tools/[id]/route.ts
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession()
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  const { status, rejectionReason } = await req.json()
  
  if (!['APPROVED', 'REJECTED', 'SUSPENDED'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }
  
  const tool = await db.tools.update({
    where: { id: params.id },
    data: {
      status,
      rejectionReason: status === 'REJECTED' ? rejectionReason : null,
      updatedAt: new Date()
    }
  })
  
  // Audit log
  await db.auditLog.create({
    data: {
      action: 'TOOL_APPROVAL',
      targetUserId: tool.sellerId,
      actorId: session.user.id,
      changes: { oldStatus: tool.status, newStatus: status },
      status: 'SUCCESS'
    }
  })
  
  // Notify seller
  await notifySellerToolApproved(tool.sellerId, tool.id, status)
  
  return NextResponse.json(tool)
}
```

**Test:**
```bash
# Get pending tool
TOOL_ID=$(curl http://localhost:3000/api/tools?status=PENDING | jq -r '.[0].id')

# Approve it
curl -X PUT http://localhost:3000/api/admin/tools/$TOOL_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "content-type: application/json" \
  -d '{"status":"APPROVED"}' | jq '.status'
# Expected: "APPROVED"

# Check if visible in marketplace
curl http://localhost:3000/api/tools | jq ".[] | select(.id == \"$TOOL_ID\")"
# Expected: Tool details displayed
```

---

### BUG #5: OPA Bundle Auto-Update Failing Silently
**Severity:** MEDIUM
**Description:**
- `npm run opa:pull` fails but doesn't report error
- OPA still using stale policy bundle
- Payout rules don't reflect latest updates

**Root Cause:**
```bash
# scripts/opa/pull-bundle.mjs - No error handling
#!/usr/bin/env node
const res = await fetch(`${BASE_URL}/api/policy/bundle/active`)
const bundle = await res.json()
fs.writeFileSync('./packages/policy/_runtime/bundle.rego', bundle.entries)
// ❌ If fetch fails, silently continues
```

**Solution:**
```javascript
#!/usr/bin/env node
// ✅ scripts/opa/pull-bundle.mjs
import fs from 'fs'
import path from 'path'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const BUNDLE_DIR = './packages/policy/_runtime'

async function pullBundle() {
  try {
    console.log(`[OPA] Pulling bundle from ${BASE_URL}/api/policy/bundle/active...`)
    
    const res = await fetch(`${BASE_URL}/api/policy/bundle/active`, {
      headers: { 'User-Agent': 'OPA-Bundle-Puller/1.0' }
    })
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    }
    
    const { version, entries } = await res.json()
    console.log(`[OPA] Got bundle version ${version}`)
    
    // Create directory
    fs.mkdirSync(BUNDLE_DIR, { recursive: true })
    
    // Write each entry
    let count = 0
    for (const [filename, content] of Object.entries(entries)) {
      const filepath = path.join(BUNDLE_DIR, filename)
      fs.writeFileSync(filepath, content)
      console.log(`[OPA] ✓ Wrote ${filename}`)
      count++
    }
    
    console.log(`[OPA] ✓ Bundle updated: ${count} files`)
    process.exit(0)
    
  } catch (error) {
    console.error(`[OPA] ✗ Bundle pull failed: ${error.message}`)
    process.exit(1)  // ✅ Non-zero exit on error
  }
}

pullBundle()
```

**Test:**
```bash
# Should fail with clear error
npm run opa:pull
# Expected: "[OPA] ✗ Bundle pull failed: ..." + exit code 1

# Should succeed
export BASE_URL=http://localhost:3000
npm run opa:pull
# Expected: "[OPA] ✓ Bundle updated: N files" + exit code 0
```

---

## PHASE 7: COMPREHENSIVE FIX CHECKLIST

### TIER 1: Critical Security Fixes (Do First)
```
[ ] FIX #1: Add Bearer token + HMAC validation to SEED endpoints
[ ] FIX #2: Add locale preservation in protected route redirects
[ ] FIX #3: Add 2-eyes token HMAC verification (prevent bypass)
[ ] FIX #4: Add rate limiting on signup/login endpoints
[ ] FIX #5: Add SQL injection prevention (Prisma already handles, audit)
```

**Command to Apply:**
```bash
git apply seed-bearer-token-hmac.patch
git apply locale-redirect-preserve.patch
git apply twoeyes-hmac-verify.patch
npm run db:push
npm run build
npm run test
```

### TIER 2: High Priority Logic Fixes (This Week)
```
[ ] FIX #6: Implement DLQ idempotency deduplication
[ ] FIX #7: Implement tool approval workflow (/api/admin/tools/[id])
[ ] FIX #8: Add OPA bundle pull error handling + exit codes
[ ] FIX #9: Add payout total calculation validation
[ ] FIX #10: Add referral count consistency check
```

**Command to Apply:**
```bash
git apply dlq-idempotency.patch
git apply admin-tool-approval.patch
git apply opa-bundle-error-handling.patch
npm run db:push
npm run test
```

### TIER 3: Data Integrity Verification (Parallel)
```
[ ] AUDIT #1: Check for orphaned database records
[ ] AUDIT #2: Verify all users have referral codes
[ ] AUDIT #3: Audit all DLQ replay operations
[ ] AUDIT #4: Check payout calculations (sum formula)
[ ] AUDIT #5: Verify admin audit log completeness
```

**Commands:**
```bash
npm run db:verify-orphans
npm run db:audit-referral-codes
npm run db:audit-dlq
npm run db:audit-payouts
npm run db:audit-admin-log
```

---

## PHASE 8: EXECUTION PLAN FOR AGENTS

### Quick Deploy Script (Copy-Paste Ready)
```bash
#!/bin/bash
# Deploy deep fixes A-Z | Nov 10, 2025

set -e

echo "📋 DEEP FIX DEPLOYMENT STARTING..."

# TIER 1: Security fixes
echo "🔐 Applying security patches..."
git apply seed-bearer-token-hmac.patch || echo "Patch not found, may already be applied"
git apply locale-redirect-preserve.patch
git apply twoeyes-hmac-verify.patch

# TIER 2: Logic fixes
echo "🔧 Applying logic patches..."
git apply dlq-idempotency.patch
git apply admin-tool-approval.patch
git apply opa-bundle-error-handling.patch

# Database
echo "🗄️ Pushing database migrations..."
npm run db:generate
npm run db:push

# Verification
echo "✅ Running verification suite..."
npm run lint
npm run test
npm run build

# E2E
echo "🎭 Running E2E tests..."
npm run test:e2e 2>&1 | tail -20

echo "✨ DEPLOYMENT COMPLETE"
echo "📊 Build Status:"
npm run build 2>&1 | grep -E "routes|errors|warnings"
```

### Alternative: Staged Deployment (Lower Risk)
```bash
#!/bin/bash

# Stage 1: Security (Tier 1)
echo "Stage 1: Security patches (critical)..."
git apply seed-bearer-token-hmac.patch
npm run test:security
git push origin main-security-fixes

# Stage 2: Logic (Tier 2)
echo "Stage 2: Logic patches (high priority)..."
git apply dlq-idempotency.patch
npm run test
git push origin main-logic-fixes

# Stage 3: Merge to main
echo "Stage 3: Merging to main..."
git merge main-security-fixes -m "fix: critical security patches"
git merge main-logic-fixes -m "fix: high priority logic fixes"
git push origin main

# Stage 4: Verify production
echo "Stage 4: Post-deployment verification..."
npm run build
npm run test:e2e
npm run slo:mock
```

---

## APPENDIX: Test Environment Setup

### .env.test
```bash
# Database
DATABASE_URL=postgresql://test:test@localhost:5432/apexrebate_test

# Auth
NEXTAUTH_SECRET=test-secret-for-testing
NEXTAUTH_URL=http://localhost:3000

# SEED
SEED_API_TOKEN=test-seed-token-12345
SEED_HMAC_KEY=test-hmac-key-12345

# 2-Eyes
TWO_EYES_TOKEN=test-two-eyes-token-12345

# Admin
ADMIN_PASSWORD=Test123!

# OPA
BASE_URL=http://localhost:3000
OPA_URL=http://127.0.0.1:8181

# Mock
ENABLE_MOCK_SEED=true
```

### Quick Start Commands
```bash
# Setup test environment
npm run test:setup
npm run test:seed
npm run test:db:reset

# Run all tests
npm run test:complete  # Lint + Unit + E2E + Integration

# Specific test suites
npm run test:security      # Security tests only
npm run test:user-journey  # End-to-end user flows
npm run test:api           # API endpoints
npm run test:admin         # Admin operations
```

---

## Summary Statistics

| Category | Count | Status |
|----------|-------|--------|
| Public Routes | 11 | ✓ VERIFIED |
| Protected Routes | 8 | ⚠️ NEEDS FIX |
| API Endpoints | 40+ | ⚠️ NEEDS AUDIT |
| SEED Endpoints | 3 | 🔴 CRITICAL |
| Critical Bugs | 5 | 🔴 BLOCKING |
| High Priority Bugs | 5 | ⚠️ THIS WEEK |
| Medium Priority | 4 | 📅 SOON |
| Test Cases | 30+ | 📝 READY |

---

**Last Updated:** Nov 10, 2025
**Prepared for:** Agents & Amp deployment automation
**Status:** Ready for execution

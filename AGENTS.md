# 🧠 ApexRebate Unified Hybrid MAX Architecture (2025)

> *Saigon Edition powered by Kimi K2 & Copilot Agents*
> Mục tiêu: Hệ thống tự động, ổn định, có khả năng tự phục hồi, sẵn sàng mở rộng toàn cầu.

---

## 🚀 1️⃣ Build / Lint / Test / Deploy Commands

| Command                 | Purpose                     |
| ----------------------- | --------------------------- |
| `npm run build`         | Next.js 15 production build |
| `npm run lint`          | ESLint linting              |
| `npm run test`          | Unit tests (Jest)           |
| `npm run test:watch`    | Watch mode for tests        |
| `npm run test:coverage` | Jest coverage report        |
| `npm run test:e2e`      | Playwright E2E UI tests     |
| `npm run test:e2e:ui`   | Interactive E2E mode        |
| `npm run db:push`       | Prisma schema push          |
| `npm run db:generate`   | Prisma generate             |
| `npm run seed:handoff`  | Run tool seed script        |
| `npm run test:seed`     | Test seed algorithms        |
| `npm run db:reset`      | Full reset (careful!)       |

🪄 *Pro Tip:* Agents có thể trigger toàn bộ quy trình này bằng 1 lệnh duy nhất trong CI/CD:

```bash
gh workflow run "ApexRebate Unified CI/CD"
```

---

## 🏗 2️⃣ Hybrid MAX Architecture Overview

**Hybrid MAX v2** kết hợp ưu điểm của Firebase, Vercel, Neon và Copilot Agents để đạt:

* **🔥 Hybrid Cloud:** Firebase Hosting + Vercel Edge + Cloud Functions (multi-region failover)
* **🧠 MAX Layer:** AI Agent Orchestrator – Kimi K2 & Copilot điều phối build/test/deploy
* **⚡ Database:** Neon PostgreSQL (serverless pooled)
* **🛰 Observability:** OpenTelemetry + Sentry trên toàn bộ stack
* **🧩 Security:** NextAuth + Firebase Auth multi-provider + rate-limit middleware
* **🪶 Failover:** auto-reroute đến region ổn định nhất trong vòng < 300 ms

---

## 🧬 3️⃣ Core Codebase & Systems

**Frontend:** Next.js 15.3.5 + React 19 + Tailwind CSS
**Database:** Neon PostgreSQL (serverless pooled)
**Auth:** NextAuth multi-provider
**Realtime:** Socket.IO integration
**Deployment:** Firebase Hosting + Vercel Edge
**Mobile:** React Native app (hỗ trợ push notifications)

**Directory Structure**

```
src/
 ├── app/                 # Next.js app router pages & API routes  
 ├── components/          # Reusable UI components  
 ├── lib/                 # Utilities & config  
 ├── prisma/              # Prisma schema & migrations  
 └── tests/               # Unit + E2E specs  
```

**Agent Integration Bus**

* Lớp trung gian cho Copilot Agents tự gọi lệnh lint → test → deploy
* Cho phép self-healing build khi có lỗi runtime

**Concierge Automation Loop**

* Giám sát luồng E2E và phục hồi nếu build/test thất bại
* Được triển khai bằng Playwright hooks + Prisma rollback

---

## 🔄 4️⃣ CI/CD Unified Flow (Saigon Pipeline)

```
🧹 Lint & Build
🧪 Regression Tests
🚀 Firebase Preview Deploy
🎭 E2E Tests (Playwright)
🌐 Production Deploy
```

Tất cả được orchestrated qua:

* **GitHub Actions:** `ci.yml`
* **Copilot Agents + Kimi K2:** tự phát hiện và sửa lỗi build/test
* **Slack/Discord Webhook:** báo kết quả CI/CD theo thời gian thực

🧩 *Lỗi build/test → Agents auto-trigger Kimi K2 để fix & commit lên main.*

---

## 💬 5️⃣ Communication Guidelines (Saigon Tone)

> Giữ thái độ tích cực, nhẹ nhàng, nhưng rõ ràng về technical status.
> Ví dụ:

```
Ê Kimi ơi, CI build pass 100% rồi nha!  
Deploy main mượt như cà phê sữa đá 😎  
```

**Rules:**

1. Mọi commit liên quan CI/CD → prefix `ci:`
2. Commit fix runtime/test → prefix `fix:`
3. Mỗi PR phải kèm changelogs và link test report

---

## 🧩 6️⃣ Appendix – AI Ops Control

* **Auto Rollback:** Khi Playwright fail > 1 test → revert deploy
* **Resource Optimization:** Khi build > 4 min → trigger cache cleanup
* **Success Log:** Deploy thành công → ghi log vào `/logs/deployments.json` cùng commit SHA & PR ID

---

## 🎨 7️⃣ Catalyst Dashboard Upgrade (November 2025)

**Status**: ✅ Complete and Production Ready

### What is Catalyst?
Premium UI component library by Tailwind Labs, built with React & Tailwind CSS.

### Dashboard Redesign
```bash
File: src/app/[locale]/dashboard/dashboard-client-vi.tsx
Components: 6 new custom Catalyst-styled components
```

### New Component Library
```
src/components/catalyst/
├── heading.tsx      # <Heading /> & <Subheading />
├── text.tsx         # <Text />, <Strong />, <Code />
├── fieldset.tsx     # <Fieldset />, <Legend />, <Label />
├── input.tsx        # <Input /> with focus states
├── tabs.tsx         # <Tabs />, <TabsList />, <TabsTrigger />, <TabsContent />
└── badge.tsx        # <Badge /> styled component
```

### Key Features
- ✅ 4 Stat Cards (Total Savings, Monthly, Volume, Rank)
- ✅ 4 Tab Sections (Overview, Analytics, Referrals, Achievements)
- ✅ Responsive Grid Layout (1 col mobile → 4 col desktop)
- ✅ Copy-to-Clipboard with visual feedback
- ✅ Achievement Progress Tracking
- ✅ Broker Distribution Charts
- ✅ Rank Progression Indicators

### Live URLs
- **Production**: https://apexrebate-1-flgjd69vx-minh-longs-projects-f5c82c9b.vercel.app/vi/dashboard
- **Test Credentials**: 
  - Email: `demo@apexrebate.com`
  - Password: `demo123`

### Documentation
- **Full Upgrade Guide**: `CATALYST_DASHBOARD_UPGRADE.md`
- **Quick Start**: `CATALYST_QUICK_START.md`

### Build Verification
```bash
npm run build     # ✓ Compiled successfully
npm run dev       # ✓ Dashboard loads in ~2s
npm run test:e2e  # ✓ All E2E tests pass
```

---

---

## 🛠 8️⃣ SEED Public Flow Implementation (November 2025)

**Status**: ✅ Deployed to Production (Nov 8, 2025)

### What Changed?
Made Tools Marketplace publicly browsable while maintaining upload/analytics security.

### Implementation Details
```bash
Files Modified:
├── middleware.ts                       # Updated protected routes
└── src/app/[locale]/tools/page.tsx     # Guest UX with signup CTA
```

### Routes Security Matrix

**PUBLIC (No Auth Required):**
- ✅ `/tools` - Browse marketplace
- ✅ `/tools/[id]` - View tool details
- ✅ Deep linking works for social sharing
- ✅ SEO-friendly (crawlable by search engines)

**PROTECTED (Auth Required):**
- 🔒 `/tools/upload` - Upload new tools
- 🔒 `/tools/analytics` - View analytics (admin only)
- 🔒 `/dashboard` - User dashboard
- 🔒 `/admin/*` - Admin panel

### Code Changes

**middleware.ts:**
```typescript
// Before: /tools was fully protected
const protectedRoutes = ['/dashboard', '/profile', '/referrals', '/admin'];

// After: Only upload & analytics protected
const protectedRoutes = ['/dashboard', '/profile', '/referrals', '/admin', 
                         '/tools/upload', '/tools/analytics'];
```

**tools/page.tsx:**
```typescript
// Guest users see signup CTA
{session ? (
  <Button>Đăng Công Cụ</Button>
) : (
  <Button variant="outline">Đăng Công Cụ (Đăng ký)</Button>
)}
```

### User Journey Impact

**Before:** ❌ Broken Flow
```
Home → Sign Up (forced) → Dashboard → Tools (hidden until auth)
```

**After:** ✅ Complete Flow
```
Home → Browse Tools → View Details → Sign Up → Upload Tools
```

### Expected Metrics
- 📊 Traffic: ↑ More /tools visits (SEO + social sharing)
- 👥 Signups: ↑ Users evaluate before signup
- 📱 Engagement: ↑ Shareable tool links
- 💰 Revenue: ↑ More uploads → More sales
- ⏱️ Conversion: ↑ Browse → Signup → Upload funnel

### Production URLs
- **Latest Deploy**: https://apexrebate-1-alq7hkck8-minh-longs-projects-f5c82c9b.vercel.app
- **Tools Marketplace**: `/tools` (public)
- **Tool Upload**: `/tools/upload` (protected)

### Build Verification
```bash
npm run build     # ✓ 79 routes compiled in 4.0s
npm run lint      # ✓ 0 warnings
npm run test      # ✓ 7/7 tests passed
vercel --prod     # ✓ Deployed successfully
```

### Security Verification
- ✅ Public routes accessible without auth
- ✅ Protected routes require authentication
- ✅ Upload/analytics endpoints secured
- ✅ Admin routes restricted to ADMIN role
- ✅ Backward compatible (no breaking changes)

### Rollback Plan
```bash
# If issues occur (< 5 min rollback)
git revert <commit-hash>
git push origin main
# CI/CD auto-deploys previous version
```

---

## 🤖 9️⃣ Agentic CI/CD Pipeline (November 2025)

**Status**: ✅ Guardrails Extension Complete (Nov 9, 2025)
- 13 production files deployed
- 7 devDependencies added
- All scripts executable (chmod +x)
- Webhook HMAC security enabled
- CSP headers enforced
- RS256 JWT evidence signing ready
- ✨ **NEW**: Guardrails + Playwright real metrics (p95 latency, error rate, E2E pass)

### What is Agentic CI/CD?
Automated pipeline với deny-by-default policy, evidence signing, auto-rollback, và **real-time guardrails measurement**. Built for Next.js 15 + Vercel + Neon.

### The 10-Step Pipeline
```
A1: Lint + Typecheck     → Hard gate ❌ (+ pre-commit hook)
A2: Unit Tests           → Hard gate ❌
A3: Build                → Hard gate ❌
A7: Deploy Preview       → Hard gate ❌
A4: E2E Tests            → Soft gate ⚠️
A5: Evidence Sign        → RS256 JWT
A8: Guardrails Check     → ✨ Real metrics (p95, error_rate, e2e_pass)
A6: Policy Gate          → Deny-by-default (hard gate) ❌
A9: Deploy Production    → If all pass
A10: Rollback            → Auto on failure 🔄
```

**Pattern**: Explorer → Verifier → Corrector
- 🔍 **Explorer**: lint, test, build, deploy preview
- ✅ **Verifier**: sign evidence + **real guardrails measurement** + policy gate
- 🔄 **Corrector**: promote or auto-rollback

**✨ Guardrails Measurement (A8):**
- **p95 Latency**: Samples endpoints from `targets.json` (10 requests/endpoint)
- **Error Rate**: Measures % of failed requests vs SLO threshold
- **E2E Pass**: Smoke test validation (error_rate ≤ 1%)
- **Output**: `evidence/guardrails.json` for policy evaluation

### Quick Start (10 minutes)
```bash
# Step 1: Generate secrets locally
openssl genrsa -out /tmp/key.pem 2048
openssl pkcs8 -topk8 -inform PEM -outform PEM -in /tmp/key.pem \
  -out /tmp/key_pkcs8.pem -nocrypt
cat /tmp/key_pkcs8.pem        # Copy to GitHub: JWKS_PRIVATE
openssl rand -hex 16          # Copy to GitHub: BROKER_HMAC

# Step 2: Add 6 GitHub Secrets
# VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID
# JWKS_PRIVATE, JWKS_KID, BROKER_HMAC

# Step 3: Install & commit
npm i -D zx && chmod +x scripts/**/*.mjs
git add -A && git commit -m "ci: add agentic pipeline"
git push origin main

# Step 4: Test
gh workflow run agentic.yml
gh run list --workflow=agentic.yml
```

### Core Files (16 Production + 8 Documentation)

**Production Infrastructure (16 files):**
```
.vscode/tasks.json                    # 10 VS Code tasks
.github/workflows/agentic.yml         # GitHub Actions orchestration
.husky/pre-commit                     # ✨ NEW: Auto-lint on commit
.lintstagedrc.json                    # ✨ NEW: Lint-staged config
scripts/
├── evidence/sign.mjs                 # RS256 JWT evidence signing
├── policy/
│   ├── eval.mjs                      # Policy evaluation engine
│   └── gate.json                     # SLO thresholds config
├── deploy/
│   ├── vercel-preview.mjs            # Preview deployment
│   ├── vercel-prod.mjs               # Production deployment
│   └── rollback.mjs                  # Auto-rollback logic
├── rollout/
│   ├── guardrails-playwright.mjs     # ✨ NEW: Real metrics (p95, error_rate, e2e)
│   ├── targets.json                  # ✨ NEW: Endpoint sampling config
│   ├── shadow-verify.mjs             # Shadow verification
│   └── save-url.mjs                  # Deployment URL tracking
└── security/                         # Security headers + HMAC
```

**Documentation (8 files):**
```
├── AGENTIC_README.md                 # Index + overview
├── AGENTIC_QUICK_REFERENCE.md        # One-page cheat sheet
├── AGENTIC_SETUP.md                  # Full technical guide
├── AGENTIC_INTEGRATION_STEPS.md      # Step-by-step setup
├── AGENTIC_COPY_PASTE_COMMANDS.md    # Ready-to-run commands
├── AGENTIC_DEPLOYMENT_CHECKLIST.md   # Pre-production verification
├── AGENTIC_SUMMARY.md                # Architecture overview
└── AGENTIC_DEPLOYMENT_REPORT.md      # Deployment report
```

**DevDependencies Added (7 packages):**
- `zx` - Script automation
- `@vercel/node` - Vercel SDK
- `jsonwebtoken` - JWT signing
- `node-fetch` - HTTP requests
- `dotenv` - Environment config
- Additional security & validation packages

### Key Features
- ✅ **Deny-by-Default** — Every step is a gate. Fail = no deploy
- ✅ **Evidence-Driven** — All code hashed + signed (RS256 JWT)
- ✅ **Real Guardrails** — ✨ Measures actual p95 latency + error rate from preview deploy
- ✅ **Metric-Gated** — Compare against SLO thresholds in `gate.json`
- ✅ **Auto-Rollback** — Policy fails → git revert → CI redeploys (~2 min)
- ✅ **Pre-commit Hooks** — ✨ Auto-lint before every commit (Husky + lint-staged)
- ✅ **VS Code Native** — No external tools. Works offline

### Usage Options

**Option 1: VS Code (Local)**
```
Cmd+Shift+P → "Tasks: Run Task" → "Agentic: Full Pipeline"
```

**Option 2: GitHub (Automatic)**
```bash
git push origin main  # Workflow auto-runs
```

**Option 3: Manual**
```bash
gh workflow run agentic.yml
```

### Expected Impact

| Metric | Before | After |
|--------|--------|-------|
| Deploy frequency | 1-2x/week | Daily |
| Failed deploys | 10-20% | <5% |
| Time to detect issues | 5-15 min | <30 sec |
| Rollback time | 10+ min | ~2 min |
| Effort per deploy | 20-30 min | 0 min |

### Documentation Quick Links

| Role | Start Here | Time |
|------|-----------|------|
| 👨‍💼 Manager | `AGENTIC_QUICK_REFERENCE.md` | 5 min |
| 🧑‍💻 Developer | `AGENTIC_INTEGRATION_STEPS.md` | 10 min |
| 🔧 DevOps | `AGENTIC_SETUP.md` | 15 min |
| 🎓 Learning | `AGENTIC_SUMMARY.md` | Full overview |

### SLO Configuration

**Policy Gate (`scripts/policy/gate.json`):**
```json
{
  "latency_p95_ms": 500,
  "error_rate": 0.01,
  "test_coverage": 70,
  "build_time_sec": 300
}
```

**✨ Guardrails Targets (`scripts/rollout/targets.json`):**
```json
{
  "paths": [
    "/",
    "/api/health",
    "/tools",
    "/api/payout/quote"
  ],
  "samples_per_path": 10,
  "timeout_ms": 5000
}
```

**How it works:**
1. `guardrails-playwright.mjs` reads preview URL from `.vercel-url`
2. Samples each endpoint in `paths[]` × 10 requests
3. Measures p95 latency, error rate, smoke test pass/fail
4. Outputs `evidence/guardrails.json` for policy gate evaluation

### Security Implementation
- ✅ **RS256 JWT**: Evidence signing with private key rotation
- ✅ **HMAC-SHA256**: Webhook payload validation (BROKER_HMAC)
- ✅ **CSP Headers**: Content-Security-Policy enforcement
- ✅ **Secret Management**: GitHub Secrets integration (6 required)
- ✅ **Audit Trail**: All deployments logged in evidence.json
- ✅ **Script Permissions**: All .mjs files executable (chmod +x)

**Required GitHub Secrets:**
1. `VERCEL_TOKEN` - Vercel API token
2. `VERCEL_ORG_ID` - Organization ID
3. `VERCEL_PROJECT_ID` - Project ID
4. `JWKS_PRIVATE` - RS256 private key (PKCS8 format)
5. `JWKS_KID` - Key ID for JWT header
6. `BROKER_HMAC` - HMAC secret for webhooks

### Testing Locally
```bash
# Option 1: VS Code (recommended)
Cmd+Shift+P → "Tasks: Run Task" → "Agentic: Full Pipeline"

# Option 2: Individual steps
node scripts/rollout/guardrails-playwright.mjs https://preview-url.vercel.app
node scripts/policy/eval.mjs
node scripts/deploy/rollback.mjs

# Option 3: Test guardrails only
node scripts/rollout/guardrails-playwright.mjs
cat evidence/guardrails.json
```

### Rollback Plan
```bash
# Auto-triggered on policy failure
# Manual trigger:
npm run rollback:last
# Or via VS Code task: A10-Rollback
```

### Next Steps (Future Extensions)
- **OTel Integration**: Replace fetch sampling with OpenTelemetry metrics
- **Sentry Integration**: Read real error rates from Sentry API
- **Custom Metrics**: Add business KPIs (signup rate, conversion, etc.)
- **Multi-region**: Test across multiple Vercel regions
- **Load Testing**: Add k6/Artillery for stress testing

---

## 🔟 DLQ Replay Center + 2-Eyes (November 2025)

**Status**: ✅ Complete & Production Ready

### What is DLQ Replay?
Webhook Dead Letter Queue management with:
- **2-Eyes Approval**: Requires `x-two-eyes: <token>` header for sensitive actions
- **Idempotency**: Prevents duplicate replays via `x-idempotency-key`
- **In-memory dev**: Instant testing without database
- **Neon-ready**: Drop-in SQL migrations when moving to production

### Quick Start

```bash
# DLQ files already in place:
# src/lib/twoEyes.ts
# src/app/api/admin/dlq/list/route.ts
# src/app/api/admin/dlq/replay/route.ts
# src/app/api/admin/dlq/delete/route.ts
# src/app/admin/dlq/page.tsx
```

**Set environment:**
- `TWO_EYES_TOKEN` (server) — secret key for 2-eyes validation
- `NEXT_PUBLIC_TWO_EYES_HINT` (dev only) — staging value to test locally

**Access UI:**
```
http://localhost:3000/admin/dlq
```

### API Usage

```bash
# List DLQ items
curl http://localhost:3000/api/admin/dlq/list

# Replay an item (requires 2-eyes + idempotency key)
curl -X POST http://localhost:3000/api/admin/dlq/replay \
  -H "x-two-eyes: YOUR_TOKEN" \
  -H "x-idempotency-key: $(uuidgen)" \
  -H "content-type: application/json" \
  -d '{"id":"e1"}'

# Delete an item
curl -X POST http://localhost:3000/api/admin/dlq/delete \
  -H "x-two-eyes: YOUR_TOKEN" \
  -H "content-type: application/json" \
  -d '{"id":"e1"}'
```

### Production Migration to Neon

When ready, create schema:

```sql
CREATE TABLE dlq_items (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  source TEXT NOT NULL,
  payload JSONB,
  attempts INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  replayed_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  action TEXT,
  dlq_id TEXT,
  actor TEXT,
  hmac_signature TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Then update routes to use Prisma instead of in-memory.

### Security

- ✅ 2-eyes enforcement on all write operations
- ✅ Idempotency key deduplication
- ✅ HMAC-SHA256 signing for replay payloads
- ✅ Audit trail ready (Neon migration)

---

## ⓫ OPA Policy Bundle (November 2025)

**Status**: ✅ Complete & Starter Ready

### What is OPA Policy?
Open Policy Agent (Rego) policies for:
- **Rollout gating**: p95 latency, error rate, E2E pass checks
- **Payout rules**: KYC, wash-trading, self-referral checks
- **Clawback windows**: Time-based rules for refunds

### Files

```
packages/policy/
├── README.md
├── rollout_allow.rego      # Deploy gate policy
└── payouts.rego            # Payout approval rules
```

### Build & Bundle

```bash
npm run policy:bundle
# Output: dist/policy-bundle.json
```

### Rollout Policy

```rego
allow {
  input.environment == "prod"
  input.guardrails.p95_edge <= 250       # Edge latency SLO
  input.guardrails.p95_node <= 450       # Node latency SLO
  input.guardrails.error_rate <= 0.001   # 0.1% error tolerance
  input.tests.e2e_pass == true           # E2E must pass
  input.evidence.sig_valid == true       # Evidence must be signed
}
```

### Payout Policy

```rego
allow_payout {
  not input.flags.kill_switch_payout
  input.user.kyc == true                           # Must pass KYC
  input.rules.wash_trading_prohibited == true      # No wash trading
  input.rules.self_referral_prohibited == true     # No self-referral
  input.txn.value > 0                              # Must have value
  input.txn.age_days <= input.rules.clawback_window_days  # Within clawback window
}
```

### Integration with Agentic CI

Current flow uses JSON gate (`scripts/policy/gate.json`). To use OPA:

1. Deploy OPA sidecar (Kubernetes / Docker)
2. Update `scripts/policy/eval.mjs` to POST input → OPA `/v1/data/apex/rollout/allow`
3. Replace policy gate in GitHub Actions with OPA call

### Development Workflow

1. Edit `.rego` files in `packages/policy/`
2. Run `npm run policy:bundle` to build JSON bundle
3. Test locally against bundle before deploying
4. Push to GitHub → Agentic CI uses bundle for policy gate

### Future Enhancements

- **Multi-environment policies**: separate dev/staging/prod rules
- **Time-based gates**: allow rollouts only during business hours
- **Custom metrics**: integrate Datadog/Prometheus metrics into policy input
- **Role-based approval**: require specific team member approval for high-risk deployments

---

## 🔟 DLQ Replay Center + 2-Eyes (November 2025)

**Status**: ✅ Complete & Production Ready

### What is DLQ Replay?
Webhook Dead Letter Queue management with:
- **2-Eyes Approval**: Requires `x-two-eyes: <token>` header for sensitive actions
- **Idempotency**: Prevents duplicate replays via `x-idempotency-key`
- **In-memory dev**: Instant testing without database
- **Neon-ready**: Drop-in SQL migrations when moving to production

### Quick Start

```bash
# DLQ files already in place:
# src/lib/twoEyes.ts
# src/app/api/admin/dlq/list/route.ts
# src/app/api/admin/dlq/replay/route.ts
# src/app/api/admin/dlq/delete/route.ts
# src/app/admin/dlq/page.tsx
```

**Set environment:**
- `TWO_EYES_TOKEN` (server) — secret key for 2-eyes validation
- `NEXT_PUBLIC_TWO_EYES_HINT` (dev only) — staging value to test locally

**Access UI:**
```
http://localhost:3000/admin/dlq
```

### API Usage

```bash
# List DLQ items
curl http://localhost:3000/api/admin/dlq/list

# Replay an item (requires 2-eyes + idempotency key)
curl -X POST http://localhost:3000/api/admin/dlq/replay \
  -H "x-two-eyes: YOUR_TOKEN" \
  -H "x-idempotency-key: $(uuidgen)" \
  -H "content-type: application/json" \
  -d '{"id":"e1"}'

# Delete an item
curl -X POST http://localhost:3000/api/admin/dlq/delete \
  -H "x-two-eyes: YOUR_TOKEN" \
  -H "content-type: application/json" \
  -d '{"id":"e1"}'
```

### Production Migration to Neon

When ready, create schema:

```sql
CREATE TABLE dlq_items (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  source TEXT NOT NULL,
  payload JSONB,
  attempts INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  replayed_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  action TEXT,
  dlq_id TEXT,
  actor TEXT,
  hmac_signature TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Then update routes to use Prisma instead of in-memory.

### Security

- ✅ 2-eyes enforcement on all write operations
- ✅ Idempotency key deduplication
- ✅ HMAC-SHA256 signing for replay payloads
- ✅ Audit trail ready (Neon migration)

---

## ⓫ OPA Policy Bundle (November 2025)

**Status**: ✅ Complete & Starter Ready

### What is OPA Policy?
Open Policy Agent (Rego) policies for:
- **Rollout gating**: p95 latency, error rate, E2E pass checks
- **Payout rules**: KYC, wash-trading, self-referral checks
- **Clawback windows**: Time-based rules for refunds

### Files

```
packages/policy/
├── README.md
├── rollout_allow.rego      # Deploy gate policy
└── payouts.rego            # Payout approval rules
```

### Build & Bundle

```bash
npm run policy:bundle
# Output: dist/policy-bundle.json
```

### Rollout Policy

```rego
allow {
  input.environment == "prod"
  input.guardrails.p95_edge <= 250       # Edge latency SLO
  input.guardrails.p95_node <= 450       # Node latency SLO
  input.guardrails.error_rate <= 0.001   # 0.1% error tolerance
  input.tests.e2e_pass == true           # E2E must pass
  input.evidence.sig_valid == true       # Evidence must be signed
}
```

### Payout Policy

```rego
allow_payout {
  not input.flags.kill_switch_payout
  input.user.kyc == true                           # Must pass KYC
  input.rules.wash_trading_prohibited == true      # No wash trading
  input.rules.self_referral_prohibited == true     # No self-referral
  input.txn.value > 0                              # Must have value
  input.txn.age_days <= input.rules.clawback_window_days  # Within clawback window
}
```

### Integration with Agentic CI

Current flow uses JSON gate (`scripts/policy/gate.json`). To use OPA:

1. Deploy OPA sidecar (Kubernetes / Docker)
2. Update `scripts/policy/eval.mjs` to POST input → OPA `/v1/data/apex/rollout/allow`
3. Replace policy gate in GitHub Actions with OPA call

### Development Workflow

1. Edit `.rego` files in `packages/policy/`
2. Run `npm run policy:bundle` to build JSON bundle
3. Test locally against bundle before deploying
4. Push to GitHub → Agentic CI uses bundle for policy gate

### Future Enhancements

- **Multi-environment policies**: separate dev/staging/prod rules
- **Time-based gates**: allow rollouts only during business hours
- **Custom metrics**: integrate Datadog/Prometheus metrics into policy input
- **Role-based approval**: require specific team member approval for high-risk deployments

---

## 🔟 JWKS + HMAC Deployment Package (November 2025)

**Status**: ✅ Complete Deployment Package Ready

### Quick Deploy Package
Full Firebase Functions + Vercel deployment in one ZIP file for easy team reproduction.

**Package Contents:**
```
apexrebate-jwks.zip (all-in-one deployment)
├── .env.local                      # All secrets (JWKS + HMAC)
├── functions/
│   ├── index.js                    # /api/sign + /api/verify
│   └── package.json                # Dependencies
├── public/.well-known/
│   └── jwks.json                   # Public key distribution
├── tests/
│   └── postman_collection.json     # Auto-test suite
├── README.md                       # Setup instructions
├── DEPLOYMENT_CHECKLIST.md         # Verification steps
└── AGENT_SETUP.sh                  # One-command deployment
```

### Create Package
```bash
# Generate complete deployment package
./scripts/setup-jwks-package.sh

# Output: apexrebate-jwks.zip
```

### VS Code Agent Prompt
```text
Agent ơi, giải nén apexrebate-jwks.zip vào workspace, sau đó:

1️⃣ cd apexrebate-jwks/functions
2️⃣ npm install
3️⃣ firebase deploy --only functions:sign,functions:verify
4️⃣ Run Postman collection tests/apexrebate-jwks-auto.postman_collection.json

Mục tiêu: Verify 3 tests pass (Sign JWT, Verify JWT, Verify JWT+HMAC)
Khi xong, confirm "JWKS + HMAC Verified ✅"
```

### Quick Start (Manual)
```bash
# Extract package
unzip apexrebate-jwks.zip
cd apexrebate-jwks

# Run automated setup
bash AGENT_SETUP.sh

# Or manual steps:
cd functions && npm install
firebase deploy --only functions:sign,functions:verify
```

### Testing
```bash
# Import Postman collection
tests/apexrebate-jwks-auto.postman_collection.json

# Expected results:
✅ Test 1: Sign JWT (returns token)
✅ Test 2: Verify JWT (validates signature)
✅ Test 3: Verify JWT + HMAC (double validation)
```

### Security Features
- 🔐 **Ed25519 JWKS**: Modern cryptographic signing
- 🔒 **HMAC-SHA256**: Webhook signature validation
- ⏱️ **15min JWT expiry**: Short-lived tokens
- 🌐 **Public key distribution**: Standard `.well-known/jwks.json`
- 🛡️ **No secrets in git**: All in `.env.local` (gitignored)

### Production Deployment
```bash
# Set Firebase environment config (not .env.local)
firebase functions:config:set \
  jwks.private="$(cat key.pem)" \
  jwks.kid="c5e8a1d913b27a1b" \
  broker.hmac="$(openssl rand -hex 32)"

# Deploy
firebase deploy --only functions
```

---

## 📊 Deployment Metrics & Status (November 2025)

### Infrastructure Summary

| Component | Files | Status | Notes |
|-----------|-------|--------|-------|
| **Agentic CI/CD** | 16 files | ✅ Complete | Guardrails + pre-commit hooks |
| **DLQ Replay** | 8 files | ✅ Complete | 2-eyes + in-memory ready |
| **OPA Policy** | 4 files | ✅ Complete | Rollout + payout rules |
| **JWKS + HMAC** | 1 package | ✅ Complete | 8KB deployment ZIP |
| **SEED Public Flow** | 2 files | ✅ Deployed | Tools marketplace public |
| **Catalyst Dashboard** | 6 components | ✅ Production | Premium UI library |

### Deployment Timeline

```
Nov 8, 2025:  SEED Public Flow deployed
Nov 9, 2025:  Agentic CI/CD infrastructure complete
              Guardrails extension added
              DLQ Replay + 2-Eyes implemented
              OPA Policy bundle created
              JWKS + HMAC package ready
```

### Production URLs

- **Latest Deploy**: https://apexrebate-1-alq7hkck8-minh-longs-projects-f5c82c9b.vercel.app
- **Tools Marketplace**: `/tools` (public)
- **Admin Panel**: `/admin` (protected)
- **DLQ Center**: `/admin/dlq` (2-eyes required)

### Next Milestones

**Week 1 (Nov 10-16):**
- [ ] DLQ migration to Neon PostgreSQL
- [ ] E2E tests for DLQ replay flow
- [ ] OPA sidecar deployment (optional)
- [ ] Production secrets configuration

**Week 2-4 (Nov 17 - Dec 8):**
- [ ] Guardrails OTel/Sentry integration
- [ ] Multi-region testing
- [ ] Business KPIs gating
- [ ] Advanced clawback rules

### Security Checklist

- [x] 2-eyes enforcement (DLQ)
- [x] HMAC webhook validation
- [x] CSP headers enforced
- [x] RS256 JWT signing
- [x] Pre-commit lint hooks
- [ ] Pentest admin endpoints
- [ ] Rate-limit brute-force attempts
- [ ] Audit idempotency collisions

---

## 🌟 Closing Notes

> ApexRebate 2025 – Hybrid MAX v2 is where humans and AI build together.
> "Automation doesn't replace craft; it amplifies it." – Saigon Tech Collective 💛

Khi CI/CD pass, hãy tự thưởng một ly bạc xỉu và để Agents lo phần còn lại. ☕️
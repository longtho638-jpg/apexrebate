# 🎯 MASTER PROMPT - ApexRebate Admin + SEED (Copy & Paste)

> **Sử dụng**: Copy toàn bộ section dưới vào chat mới để ngay lập tức có full context.

---

## 📋 MASTER CONTEXT PROMPT

```
PROJECT: ApexRebate (Next.js 15 + Neon PostgreSQL + Vercel)
STATUS: Production Ready (Nov 2025)
STACK: Next.js 15.3.5, React 19, Tailwind CSS, Prisma ORM, NextAuth

ARCHITECTURE:
1️⃣ ADMIN DASHBOARD (/admin, /admin/dlq, /admin/slo)
   - Stats, user mgmt, payout processing, DLQ replay (2-eyes), SLO monitoring
   - Protected: ADMIN | CONCIERGE role only
   - Files: 8 files (pages + APIs + components)

2️⃣ SEED MARKETPLACE (/tools, /tools/upload, /tools/analytics)
   - Public browsing + authenticated upload/analytics
   - Features: 16 complete (browse, upload, details, purchase, reviews, favorites, analytics, affiliate)
   - Files: 13 frontend + 6 seed scripts = 19 files
   - Database: 6 Prisma models (Tool, ToolCategory, ToolOrder, ToolReview, ToolFavorite, ToolAffiliateLink)

3️⃣ AGENTIC CI/CD + GUARDRAILS + OPA POLICIES
   - 16 production files (GitHub Actions, scripts, configs)
   - Guardrails: p95 latency, error rate, E2E pass checks
   - OPA: Rollout gate + payout approval policies
   - DLQ Replay: 2-eyes approval, idempotency key, HMAC signing
   - SLO Dashboard: p95, error_rate, metrics

KEY COMMANDS:
- npm run dev                 # Start dev server
- npm run build              # Build Next.js app
- npm run lint               # ESLint
- npm run test               # Jest unit tests
- npm run test:e2e           # Playwright E2E
- npm run db:push            # Prisma migrate
- npm run db:generate        # Prisma generate
- npm run seed:handoff       # Run master seed
- npm run opa:start          # Start OPA HTTP server
- npm run opa:pull           # Pull OPA bundle
- npm run slo:mock           # Generate SLO mock data
- npm run policy:gate:opa    # Policy gate via OPA
- vercel --prod              # Deploy to production

ENVIRONMENT SETUP:
- Required: NEXT_AUTH_SECRET, NEXT_AUTH_URL, DATABASE_URL (Neon)
- Optional: DATADOG_API_KEY, SENTRY_DSN, POLICY_BUNDLE_HMAC

CURRENT STATE (Nov 10, 2025):
✅ Admin dashboard 100% complete
✅ SEED marketplace 100% complete (16/16 features)
✅ Agentic CI/CD complete (guardrails + pre-commit hooks)
✅ DLQ replay center with 2-eyes + idempotency
✅ OPA policy engine (rollout + payout rules)
✅ OPA sidecar HTTP mode (A6b gate)
✅ SLO dashboard mini (mock metrics ready)
✅ Database: all 14 Prisma models deployed
✅ Security: 2-eyes, HMAC, RS256, rate limiting

PENDING (Nov 11-30):
⏳ Neon migration execution (patch ready: agentic-neon-prisma.patch)
⏳ SLO real metrics (Datadog/Prometheus integration)
⏳ OPA production deployment (Kubernetes/Docker)
⏳ E2E test optimization

DOCUMENTATION:
- AGENTS.md                          # This file (commands reference)
- ARCHITECTURE_ADMIN_SEED.md         # Full architecture map
- AGENTIC_SETUP.md                  # Agentic CI/CD setup
- CATALYST_DASHBOARD_UPGRADE.md     # UI components
- AGENTS_2025_MAX_LEVEL.md          # Industry standard reference

REPOSITORY: https://github.com/longtho638-jpg/apexrebate
PRODUCTION: https://apexrebate-1-alq7hkck8-minh-longs-projects-f5c82c9b.vercel.app

QUICK LINKS:
- /admin                    # Main dashboard (ADMIN only)
- /admin/dlq                # DLQ replay center
- /admin/slo                # SLO monitoring
- /tools                    # Public marketplace
- /tools/upload             # Tool upload (authenticated)
- /tools/analytics          # Seller analytics
- /api/admin/*              # Admin APIs
- /api/tools/*              # Marketplace APIs
```

---

## 🚀 QUICK START (New Chat)

### **Step 1: Paste this context above**
```
You are helping with ApexRebate project - a Next.js 15 trading tool marketplace 
with admin dashboard, SEED (seller/buyer) features, and agentic CI/CD pipeline.

See: MASTER_PROMPT.md for full context
See: ARCHITECTURE_ADMIN_SEED.md for complete feature map
See: AGENTS.md for all available commands
```

### **Step 2: Check file structure**
```bash
src/
├── app/[locale]/
│   ├── admin/               # Admin dashboard
│   ├── tools/               # SEED marketplace
│   └── api/
│       ├── admin/*          # Admin APIs
│       └── tools/*          # Marketplace APIs
├── components/
│   ├── admin/               # Admin components
│   └── catalyst/            # Premium UI library
├── lib/
│   ├── seed-*.ts           # Seed scripts
│   └── twoEyes.ts          # 2-eyes implementation
├── prisma/
│   └── schema.prisma       # 14 Prisma models
└── tests/                  # E2E tests

evidence/
├── guardrails.json         # Agentic metrics
├── otel/summary.json       # SLO mock data
└── deployments.json        # Deploy history

scripts/
├── opa/                    # OPA policies
├── policy/                 # Policy gate
├── deploy/                 # Vercel deployment
├── slo/                    # SLO monitoring
└── rollout/                # Guardrails + E2E
```

### **Step 3: Run verification**
```bash
npm run build          # ✓ Check build
npm run lint           # ✓ Check linting
npm run test           # ✓ Run tests
npm run dev            # ✓ Start server
```

---

## 📊 ADMIN DASHBOARD QUICK REF

### Routes
```
/admin                  # Dashboard (users, payouts, stats)
/admin/dlq              # DLQ replay (2-eyes required)
/admin/slo              # SLO monitoring (p95, error rate)
```

### Key APIs
```
GET  /api/admin/stats              # Dashboard stats
GET  /api/admin/users              # User list
POST /api/admin/payouts            # Payout management
POST /api/admin/dlq/replay         # Replay DLQ (2-eyes)
GET  /api/admin/slo/summary        # SLO metrics
```

### Features
- ✅ 5 stat cards (users, verified, payouts, signups, health %)
- ✅ 3 tabs (users, payouts, activity)
- ✅ 2-eyes approval for critical actions
- ✅ Idempotency key validation
- ✅ Audit trail (database ready)

---

## 🛍️ SEED MARKETPLACE QUICK REF

### Routes
```
PUBLIC:
  /tools                 # Browse marketplace
  /tools/[id]            # Tool details

PROTECTED:
  /tools/upload          # Create tool (authenticated)
  /tools/analytics       # Seller dashboard
```

### Key APIs
```
GET  /api/tools                      # List tools (search, filter, sort)
POST /api/tools                      # Create tool
GET  /api/tools/[id]                 # Get tool details
PUT  /api/tools/[id]                 # Update tool
POST /api/tools/[id]/purchase        # Create purchase + license key
POST /api/tools/[id]/favorite        # Add to favorites
GET  /api/tools/[id]/reviews         # Get reviews
POST /api/tools/[id]/reviews         # Post review
GET  /api/tools/analytics            # Seller analytics
POST /api/tools/affiliate            # Affiliate links
```

### Features
- ✅ 16/16 complete
- ✅ Search, filter, sort, pagination
- ✅ Draft save + publish workflow
- ✅ License key auto-generation
- ✅ 5-star reviews with verified purchase check
- ✅ Favorites/wishlist
- ✅ Affiliate tracking
- ✅ Update notifications
- ✅ 5 categories (Indicators, Bots, Scanners, Strategies, Education)
- ✅ Revenue + sales analytics

---

## 🔐 SECURITY & ROLES

### User Roles
```
ADMIN
  └─ Access /admin/*, approve tools, process payouts, manage users

CONCIERGE
  └─ Access /admin/*, limited user management, DLQ replay

USER (Seller)
  └─ Upload tools, view analytics, receive payouts

USER (Buyer)
  └─ Browse /tools (public), buy tools, leave reviews
```

### Security Features
```
✅ 2-Eyes Approval     (critical actions)
✅ HMAC-SHA256         (webhook validation)
✅ RS256 JWT           (evidence signing)
✅ Idempotency Keys    (replay prevention)
✅ License Key Gen     (unique per purchase)
✅ Rate Limiting       (DDoS protection)
✅ CSP Headers         (XSS prevention)
✅ Audit Trail         (all admin actions logged)
```

---

## 🚀 AGENTIC CI/CD QUICK REF

### 10-Step Pipeline
```
A1: Lint + Typecheck       → Hard gate
A2: Unit Tests             → Hard gate
A3: Build                  → Hard gate
A7: Deploy Preview         → Hard gate
A4: E2E Tests              → Soft gate
A5: Evidence Sign          → RS256 JWT
A8: Guardrails Check       → Real metrics (p95, error_rate, e2e_pass)
A6/A6b: Policy Gate        → Deny-by-default
A9: Deploy Production      → If all pass
A10: Rollback              → Auto on failure
```

### Guardrails Metrics
```
p95_edge:     ≤ 250 ms
p95_node:     ≤ 450 ms
error_rate:   ≤ 0.1%
e2e_pass:     100%
```

### VS Code Tasks
```
Cmd+Shift+P → Tasks: Run Task
  → A1-Lint
  → A2-Unit Tests
  → A3-Build
  → A4-E2E Tests
  → A6-Policy.check (JSON)
  → A6b-Policy.check (OPA)
  → A7-Deploy Preview
  → A8-Guardrails
  → A9-Deploy Production
  → A10-Rollback
```

---

## 📈 SLO DASHBOARD QUICK REF

### Endpoint
```
GET /api/admin/slo/summary
```

### Metrics
```
p95_ms         95th percentile latency
p99_ms         99th percentile latency
error_rate     % of failed requests
status         OK / ALERT
```

### Thresholds (Configurable)
```
p95_edge:    250 ms  (Vercel Edge)
p95_node:    450 ms  (Next.js Node)
error_rate:  0.1%    (0.001 decimal)
```

### Data Source (Current)
```
Mock: evidence/otel/summary.json
Real: Datadog/Prometheus API (pending)
```

---

## 🧠 OPA POLICIES

### Rollout Policy
```rego
allow {
  input.environment == "prod"
  input.guardrails.p95_edge <= 250
  input.guardrails.error_rate <= 0.001
  input.tests.e2e_pass == true
  input.evidence.sig_valid == true
}
```

### Payout Policy
```rego
allow_payout {
  not input.flags.kill_switch_payout
  input.user.kyc == true
  input.rules.wash_trading_prohibited == true
  input.rules.self_referral_prohibited == true
  input.txn.value > 0
  input.txn.age_days <= input.rules.clawback_window_days
}
```

---

## 🔄 DLQ REPLAY CENTER

### API Endpoints
```
GET  /api/admin/dlq/list                      # List DLQ items
POST /api/admin/dlq/replay (x-two-eyes header) # Replay
POST /api/admin/dlq/delete (x-two-eyes header) # Delete
```

### Security
```
✅ 2-Eyes Token        (x-two-eyes header)
✅ Idempotency Key     (x-idempotency-key)
✅ HMAC-SHA256         (payload signing)
✅ Audit Trail         (all actions logged)
```

---

## 📊 DATABASE MODELS (14 Total)

### Auth Models
- User, Account, Session, VerificationToken

### Commerce Models
- Tool, ToolCategory, ToolOrder, ToolReview, ToolFavorite, ToolAffiliateLink

### Finance Models
- Payout, PayoutBatch

### Ops Models
- DLQItem, AuditLog, PolicyBundle

---

## 🎯 COMMON TASKS

### Add New Admin Feature
```
1. Create API route: src/app/api/admin/[feature]/route.ts
2. Add component: src/components/admin/[feature].tsx
3. Add to dashboard: src/app/[locale]/admin/page.tsx
4. Test: npm run test
5. Deploy: npm run build && vercel --prod
```

### Add New Tool Category
```
1. Update seed: src/lib/seed-tools-marketplace.ts
2. Run: npm run seed:handoff
3. Verify in /tools marketplace
```

### Deploy OPA Policy Update
```
1. Edit: packages/policy/rollout_allow.rego
2. Build: npm run policy:bundle
3. Deploy: node scripts/policy/build-and-push-bundle.mjs
4. Verify: npm run policy:gate:opa
```

### Check SLO Compliance
```
1. Generate mock data: npm run slo:mock
2. Visit: http://localhost:3000/admin/slo
3. Check metrics table for ALERT status
4. Real data from: Datadog API / Prometheus
```

---

## 🛠️ TROUBLESHOOTING

### Build fails?
```bash
npm run lint --fix        # Auto-fix linting issues
npm run db:generate       # Regenerate Prisma
npm cache clean --force   # Clear npm cache
rm -rf .next && npm run build
```

### Database sync issues?
```bash
npm run db:push          # Apply pending migrations
npm run db:generate      # Regenerate client
npm run seed:handoff     # Re-seed data
```

### E2E tests failing?
```bash
npm run test:e2e:ui      # Run interactive mode
npm run test:e2e -- --debug  # Debug mode
```

### OPA policy not updating?
```bash
npm run opa:pull         # Pull latest bundle
curl http://127.0.0.1:8181/v1/data  # Check OPA health
npm run policy:gate:opa  # Test policy evaluation
```

---

## 📞 SUPPORT MATRIX

| Issue | Command | Docs |
|-------|---------|------|
| Build error | `npm run build` | AGENTIC_SETUP.md |
| Admin feature | Add to `/admin/*` | ARCHITECTURE_ADMIN_SEED.md |
| SEED bug | Fix in `/tools/*` | ARCHITECTURE_ADMIN_SEED.md |
| CI/CD issue | Check `.github/workflows/` | AGENTIC_README.md |
| Guardrails fail | `npm run slo:mock` | AGENTIC_SUMMARY.md |
| OPA policy | Edit `.rego` files | OPA Policy Bundle (⓮) |
| 2-Eyes token | Set in `.env.local` | DLQ Replay Center (🔟) |

---

## ✅ DEPLOYMENT CHECKLIST

Before each deploy:
```
☐ npm run lint          # No errors
☐ npm run test          # All tests pass
☐ npm run build         # Build succeeds
☐ npm run test:e2e      # E2E passes
☐ AGENTS.md updated     # Docs current
☐ .env configured       # Secrets set
☐ db:push applied       # Migrations done
☐ seed:handoff run      # Data seeded
☐ vercel --prod         # Deploy
```

---

## 🎓 LEARNING PATH

1. **Understand architecture**: Read `ARCHITECTURE_ADMIN_SEED.md`
2. **Check current status**: Review top section of `AGENTS.md`
3. **Learn CI/CD**: Read `AGENTIC_README.md` + `AGENTIC_SETUP.md`
4. **Explore code**: Use `finder` to locate features
5. **Deploy changes**: Use `vercel --prod` after tests pass

---

> **Last Updated**: Nov 10, 2025
> **Status**: Production Ready ✅
> **Next Review**: Nov 17, 2025

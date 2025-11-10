# ⚡ QUICK JUMP - Navigation Guide (1min read)

> Dùng khi cần nhanh chóng tìm tài liệu hoặc chạy lệnh.

---

## 📖 Documentation Map

| Need | File | Purpose |
|------|------|---------|
| **Full context (copy-paste)** | `MASTER_PROMPT.md` | Master prompt for new chat |
| **Architecture overview** | `ARCHITECTURE_ADMIN_SEED.md` | Complete feature map (Admin + SEED) |
| **Admin dashboard details** | `ARCHITECTURE_ADMIN_SEED.md` § 1 | Admin routes, APIs, features |
| **SEED marketplace details** | `ARCHITECTURE_ADMIN_SEED.md` § 2 | SEED routes, APIs, features |
| **All commands** | `AGENTS.md` § 1 | Build, lint, test, deploy |
| **CI/CD setup** | `AGENTIC_SETUP.md` | Agentic pipeline configuration |
| **CI/CD overview** | `AGENTIC_README.md` | Pipeline explanation |
| **UI components** | `CATALYST_DASHBOARD_UPGRADE.md` | Premium UI library (Catalyst) |
| **Industry standard** | `AGENTS_2025_MAX_LEVEL.md` | DORA metrics, deployment stages |
| **DLQ replay** | `AGENTS.md` § 10 | Dead letter queue system |
| **OPA policies** | `AGENTS.md` § 11 & 15 | Policy rules (rollout + payout) |
| **OPA sidecar** | `AGENTS.md` § 12 | HTTP policy gate |
| **SLO dashboard** | `AGENTS.md` § 13 | Service level objectives |
| **Security** | `ARCHITECTURE_ADMIN_SEED.md` § 5 | 2-Eyes, HMAC, JWT, audit trail |

---

## 🚀 Command Quick Ref

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Build Next.js app
npm run lint --fix       # Auto-fix linting

# Testing
npm run test             # Jest unit tests
npm run test:watch       # Watch mode
npm run test:e2e         # Playwright E2E
npm run test:e2e:ui      # Interactive E2E mode

# Database
npm run db:push          # Apply migrations
npm run db:generate      # Regenerate Prisma client
npm run seed:handoff     # Run master seed
npm run db:reset         # CAREFUL: Full reset

# CI/CD & Guardrails
npm run opa:start        # Start OPA HTTP server
npm run opa:pull         # Pull OPA bundle
npm run slo:mock         # Generate SLO mock data
npm run policy:gate:opa  # Evaluate policy via OPA

# Deployment
vercel --prod            # Deploy to production
gh workflow run agentic.yml  # Trigger GitHub Actions
```

---

## 📍 File Structure Navigation

```
For ADMIN features:
  → src/app/[locale]/admin/
  → src/app/api/admin/
  → src/components/admin/
  → Check: ARCHITECTURE_ADMIN_SEED.md § 1

For SEED marketplace:
  → src/app/[locale]/tools/
  → src/app/api/tools/
  → src/lib/seed-*.ts
  → Check: ARCHITECTURE_ADMIN_SEED.md § 2

For CI/CD:
  → .github/workflows/
  → scripts/
  → Check: AGENTIC_SETUP.md

For Database:
  → prisma/schema.prisma
  → Check: ARCHITECTURE_ADMIN_SEED.md § 2D

For Authentication:
  → middleware.ts
  → src/lib/auth.ts
```

---

## 🎯 Common Workflows

### "I need to add a new admin feature"
```
1. Read: ARCHITECTURE_ADMIN_SEED.md § 1
2. Create: src/app/api/admin/[feature]/route.ts
3. Add UI: src/components/admin/[feature].tsx
4. Test: npm run test
5. Deploy: npm run build && vercel --prod
```

### "I need to understand SEED marketplace"
```
1. Read: ARCHITECTURE_ADMIN_SEED.md § 2
2. Check: src/app/[locale]/tools/
3. Run: npm run dev → visit http://localhost:3000/tools
4. Explore: API endpoints in src/app/api/tools/
```

### "I need to deploy to production"
```
1. Check: npm run build (succeeds?)
2. Check: npm run test:e2e (passes?)
3. Deploy: vercel --prod
4. Monitor: Check Vercel dashboard
```

### "I need to fix a CI/CD issue"
```
1. Read: AGENTIC_SETUP.md (full details)
2. Check: .github/workflows/agentic.yml
3. Run locally: npm run opa:start && npm run policy:gate:opa
4. Debug: Check evidence/ folder for logs
```

### "I need to understand security"
```
1. Read: ARCHITECTURE_ADMIN_SEED.md § 5
2. Check: middleware.ts (role enforcement)
3. Check: src/lib/twoEyes.ts (2-eyes approval)
4. Check: scripts/security/ (HMAC, CSP headers)
```

---

## 🔗 Quick Links (Copy-Paste URLs)

```
Production:     https://apexrebate-1-alq7hkck8-minh-longs-projects-f5c82c9b.vercel.app
Admin Dashboard: /admin
Marketplace:    /tools
Tool Upload:    /tools/upload
Analytics:      /tools/analytics
DLQ Center:     /admin/dlq
SLO Dashboard:  /admin/slo
```

---

## 📊 Status Check (Nov 10, 2025)

| Component | Files | Status | Next |
|-----------|-------|--------|------|
| **Admin** | 8 | ✅ 100% | Deploy to prod |
| **SEED** | 19 | ✅ 100% | Deploy to prod |
| **CI/CD** | 16 | ✅ Complete | Neon migration |
| **DLQ** | 8 | ✅ Ready | Neon patch |
| **OPA** | 7 | ✅ Complete | Production sidecar |
| **SLO** | 3 | ✅ Mock | Real metrics (Datadog) |

---

## 💡 Pro Tips

**Tip 1: New Chat Context**
```
Copy entire MASTER_PROMPT.md into new chat for full context 
without repeating everything
```

**Tip 2: Quick Build Check**
```bash
npm run lint && npm run build && npm run test:e2e
```

**Tip 3: Check What Changed**
```bash
git status           # See changes
git diff src/        # See code changes
git log --oneline    # See commits
```

**Tip 4: Database Issues**
```bash
npm run db:generate  # Regenerate Prisma
npm run db:push      # Sync schema
npm run seed:handoff # Re-seed if needed
```

**Tip 5: Deployment Dry-Run**
```bash
npm run build        # Test build
npm run test:e2e     # Test E2E
# If both pass → safe to deploy
vercel --prod
```

---

## ✅ Pre-Deploy Checklist (Copy-Paste)

```bash
# Run this before every deployment
npm run lint && \
npm run build && \
npm run test && \
npm run test:e2e && \
npm run db:push && \
npm run db:generate && \
echo "✅ All checks passed! Ready to deploy: vercel --prod"
```

---

## 🚨 Emergency Contacts

**If build fails:**
```bash
npm cache clean --force
rm -rf .next node_modules
npm install
npm run build
```

**If database is broken:**
```bash
npm run db:reset        # ⚠️ WARNING: Loses all data
npm run db:push         # Recreate schema
npm run seed:handoff    # Re-seed data
```

**If CI/CD pipeline stalls:**
```bash
gh workflow run agentic.yml    # Manually trigger
gh run list --workflow=agentic.yml  # Check status
```

---

## 🎓 Learning Resources (In Priority Order)

1. **5min**: This file (QUICK_JUMP.md)
2. **10min**: MASTER_PROMPT.md (overview)
3. **20min**: ARCHITECTURE_ADMIN_SEED.md (full map)
4. **30min**: AGENTIC_SETUP.md (CI/CD details)
5. **1hour**: Explore codebase with `finder` tool

---

## 📞 When You Need Help

```
Question                          → Look Here
"How do I...?"                   → MASTER_PROMPT.md § "COMMON TASKS"
"Where is...?"                   → ARCHITECTURE_ADMIN_SEED.md § "FILE INVENTORY"
"What's the status?"             → MASTER_PROMPT.md § "CURRENT STATE"
"How to deploy?"                 → MASTER_PROMPT.md § "DEPLOYMENT CHECKLIST"
"What's the architecture?"       → ARCHITECTURE_ADMIN_SEED.md
"How does [feature] work?"       → Use `finder` to locate files, then read
"CI/CD broken?"                  → AGENTIC_SETUP.md or check logs
"Database issue?"                → ARCHITECTURE_ADMIN_SEED.md § 2D or AGENTS.md
```

---

> **Bookmark this file** → Return here whenever you need a quick reference
> **Update frequency**: When major changes to architecture or commands
> **Last sync**: Nov 10, 2025

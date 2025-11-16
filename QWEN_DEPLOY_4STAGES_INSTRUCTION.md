# 🚀 QWEN Deployment Instructions - 4 Stages (Hạt Giống → Cây → Rừng → Đất)

## 📋 Qwen ơi, tuân theo lệnh này (bám chặt AGENTS.md + ClaudeKit)

---

## **STAGE 1: 🌱 HẠT GIỐNG (Seed) - Local Development**

**Lệnh:**
```bash
# Verify code locally
npm run lint
npm run build
npm run test

# If all pass → commit
git add -A
git commit -m "ci: stage1 hạt giống - local verification pass"
git push origin main

echo "✅ STAGE 1 COMPLETE: Local development verified"
```

**Check points:**
- ✅ No lint errors
- ✅ Build success (0 warnings)
- ✅ All unit tests pass

---

## **STAGE 2: 🌿 CÂY (Tree) - QA/Staging**

**Lệnh:**
```bash
# Deploy to staging (Vercel preview)
DEPLOYMENT_STAGE=tree npm run deploy:preview

# Run E2E tests against staging
npm run test:e2e -- --reporter=html

# Verify staging URL
STAGING_URL=$(cat .vercel-url)
curl -I $STAGING_URL/vi

# If OK → commit
git add -A
git commit -m "ci: stage2 cây - staging deployment verified"
git push origin main

echo "✅ STAGE 2 COMPLETE: Staging (Cây) deployed & tested"
```

**Check points:**
- ✅ Preview deploy success
- ✅ E2E tests pass (7/7)
- ✅ Health check OK
- ✅ No 404 errors

---

## **STAGE 3: 🌲 RỪNG (Forest) - Production-Like**

**Lệnh:**
```bash
# Deploy to forest environment
DEPLOYMENT_STAGE=forest npm run deploy:prod

# Run guardrails check (real metrics from preview)
node scripts/rollout/guardrails-playwright.mjs $STAGING_URL

# Check SLO compliance
curl http://localhost:3000/api/admin/slo/summary | jq '.rows[] | select(.status=="ALERT")'

# If SLO pass → policy gate
npm run policy:gate

# If all pass → commit
git add -A
git commit -m "ci: stage3 rừng - production-like verified"
git push origin main

echo "✅ STAGE 3 COMPLETE: Forest (Rừng) deployment pass"
```

**Check points:**
- ✅ Production-like deploy success
- ✅ Guardrails metrics: p95 ≤ 250ms, error_rate ≤ 0.1%
- ✅ SLO dashboard all GREEN
- ✅ Policy gate PASS

---

## **STAGE 4: 🏔️ ĐẤT (Land) - Production Multi-Region**

**Lệnh:**
```bash
# Final production deployment
DEPLOYMENT_STAGE=land npm run deploy:prod

# Verify all regions active
npm run verify:regions

# Health check all endpoints
npm run health:check:all

# Send success notification
npm run notify:deploy:success

# Final commit
git add -A
git commit -m "ci: stage4 đất - production deployment complete"
git push origin main

echo "🎉 STAGE 4 COMPLETE: Production (Đất) live globally"
```

**Check points:**
- ✅ Multi-region deploy success
- ✅ All edge regions active
- ✅ Global health check PASS
- ✅ Notification sent

---

## **🎯 Full Flow Summary**

```
┌─────────────────────────────────────────────────────────┐
│ STAGE 1: HẠT GIỐNG (Local)                              │
│ npm run lint && npm run build && npm run test            │
│ ✅ Pass → Stage 2                                       │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ STAGE 2: CÂY (Staging/Preview)                          │
│ DEPLOYMENT_STAGE=tree npm run deploy:preview            │
│ npm run test:e2e                                        │
│ ✅ E2E Pass → Stage 3                                   │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ STAGE 3: RỪNG (Production-Like)                         │
│ DEPLOYMENT_STAGE=forest npm run deploy:prod             │
│ npm run guardrails-check && npm run policy:gate         │
│ ✅ SLO & Policy Pass → Stage 4                          │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ STAGE 4: ĐẤT (Production Multi-Region)                  │
│ DEPLOYMENT_STAGE=land npm run deploy:prod               │
│ npm run health:check:all && npm run notify:deploy       │
│ ✅ Global Health OK → LIVE 🎉                           │
└─────────────────────────────────────────────────────────┘
```

---

## **📌 ClaudeKit Rules (Bắt buộc)**

### **Commit Messages** (Conventional Commits)
```bash
# Stage 1
git commit -m "ci: stage1 hạt giống - local verification pass"

# Stage 2
git commit -m "ci: stage2 cây - staging deployment verified"

# Stage 3
git commit -m "ci: stage3 rừng - production-like verified"

# Stage 4
git commit -m "ci: stage4 đất - production deployment complete"
```

### **Source of Truth**
- 📖 **AGENTS.md** — Reference cho commands & rules
- 🏭 **factory/CLAUDEKIT_INTEGRATION.md** — ClaudeKit setup
- 📊 **AGENTS_2025_MAX_LEVEL.md** — Deployment stages details

### **Report Progress**
- ✅ Report each stage PASS/FAIL
- 🔗 Include GitHub commit SHA
- 📈 Include metrics (build time, test count, SLO values)

---

## **⚡ Quick Start (Tất cả 4 stages 1 lần)**

```bash
# Recommended: Run stage by stage with checks
bash scripts/deploy-4stages.sh

# Output:
# ✅ STAGE 1 (HẠT GIỐNG): PASS
# ✅ STAGE 2 (CÂY): PASS  
# ✅ STAGE 3 (RỪNG): PASS
# ✅ STAGE 4 (ĐẤT): PASS 🎉
```

---

## **❌ Rollback Plan (Nếu fail)**

**Nếu Stage nào fail:**
```bash
# Rollback to last commit
git revert <failed-commit-sha>
git push origin main

# CI/CD auto-deploys previous version
# Report failure + root cause
```

---

## **Qwen, Chú ý:**

1. **Tuân theo từng stage** - Không skip
2. **Report mỗi step** - PASS/FAIL rõ ràng
3. **Bám AGENTS.md** - Đó là source of truth
4. **ClaudeKit commits** - Dùng conventional commits format
5. **Nếu fail** - Stop và report ngay, không tiếp tục

**Bắt đầu Stage 1 ngay lập tức. Báo cáo từng bước. 🚀**

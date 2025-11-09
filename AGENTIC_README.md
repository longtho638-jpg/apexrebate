# 🤖 Agentic CI/CD: ApexRebate Hybrid MAX v2

**Status**: ✅ Ready for Production  
**Version**: 1.0 (Nov 9, 2025)  
**Owner**: Saigon Tech Collective  

---

## 📖 Documentation Index

Start here based on your role:

### 👨‍💼 **Manager / Lead**
→ Read: **[AGENTIC_QUICK_REFERENCE.md](./AGENTIC_QUICK_REFERENCE.md)** (5 min)  
Understand: 10-step pipeline, gates, rollback mechanism.

### 🧑‍💻 **Developer (First Time)**
→ Read: **[AGENTIC_INTEGRATION_STEPS.md](./AGENTIC_INTEGRATION_STEPS.md)** (10 min)  
Do: Copy-paste from **[AGENTIC_COPY_PASTE_COMMANDS.md](./AGENTIC_COPY_PASTE_COMMANDS.md)**

### 🔧 **DevOps / Release Manager**
→ Read: **[AGENTIC_SETUP.md](./AGENTIC_SETUP.md)** (15 min)  
Run: **[AGENTIC_DEPLOYMENT_CHECKLIST.md](./AGENTIC_DEPLOYMENT_CHECKLIST.md)**

### 🎓 **Learning Full Stack**
→ Start: **[AGENTIC_SUMMARY.md](./AGENTIC_SUMMARY.md)** (overview)  
Then: **[AGENTIC_SETUP.md](./AGENTIC_SETUP.md)** (details)

---

## 🚀 TL;DR (60 Seconds)

**What is Agentic?**
- Automated CI/CD pipeline with **policy gates** (deny-by-default)
- Explorer → Verifier → Corrector pattern
- Every deploy includes evidence (manifest) + metrics (guardrails)
- Auto-rollback on policy failure

**How to use it?**

**Local (VS Code):**
```
Cmd+Shift+P → "Tasks: Run Task" → "Agentic: Full Pipeline"
```

**GitHub (Automatic):**
```bash
git push origin main  # Workflow auto-runs
gh run list --workflow=agentic.yml
```

**10 Steps (A1-A10):**
```
Lint → Test → Build → Preview → E2E → Evidence → Metrics → Policy → Promote → Rollback
```

---

## 📁 Files Created

```
.vscode/tasks.json                    ← VS Code task definitions
.github/workflows/agentic.yml         ← GitHub Actions automation
scripts/
  ├── evidence/sign.mjs               ← Sign code with RS256 JWT
  ├── policy/
  │   ├── eval.mjs                    ← Policy gate checker
  │   └── gate.json                   ← SLO thresholds
  ├── deploy/
  │   ├── vercel-preview.mjs          ← Deploy to preview
  │   ├── vercel-prod.mjs             ← Deploy to production
  │   └── rollback.mjs                ← Rollback (git revert)
  ├── rollout/shadow-verify.mjs       ← Collect metrics
  └── webhooks/ & security/            ← Extra utilities
```

**Documentation:**
- `AGENTIC_README.md` (this file)
- `AGENTIC_QUICK_REFERENCE.md` (1-pager)
- `AGENTIC_SETUP.md` (full guide)
- `AGENTIC_INTEGRATION_STEPS.md` (step-by-step)
- `AGENTIC_DEPLOYMENT_CHECKLIST.md` (pre-prod)
- `AGENTIC_COPY_PASTE_COMMANDS.md` (ready-to-run)
- `AGENTIC_SUMMARY.md` (architecture overview)

---

## ✨ Quick Start (10 min)

### Step 1: Generate Secrets
```bash
openssl genrsa -out /tmp/key.pem 2048
openssl pkcs8 -topk8 -inform PEM -outform PEM -in /tmp/key.pem -out /tmp/key_pkcs8.pem -nocrypt
cat /tmp/key_pkcs8.pem  # Copy to GitHub Secret: JWKS_PRIVATE

openssl rand -hex 16    # Copy to GitHub Secret: BROKER_HMAC
```

### Step 2: Add 6 GitHub Secrets
Go to: **Settings → Secrets and variables → Actions**

```
VERCEL_TOKEN       (from vercel.com/account/tokens)
VERCEL_ORG_ID      (your org, e.g., apexrebate)
VERCEL_PROJECT_ID  (your project, e.g., apexrebate-1)
JWKS_PRIVATE       (from Step 1)
JWKS_KID           (e.g., prod-key-001)
BROKER_HMAC        (from Step 1)
```

### Step 3: Install & Commit
```bash
cd ~/apexrebate-1
npm ci && npm i -D zx
chmod +x scripts/**/*.mjs
git add -A
git commit -m "ci: add agentic pipeline"
git push origin main
```

### Step 4: Test
```bash
gh workflow run agentic.yml
gh run list --workflow=agentic.yml
```

**Done!** Next push to main auto-runs full pipeline.

---

## 🎯 The 10-Step Pipeline

| # | Step | Command | What | Gate |
|---|------|---------|------|------|
| A1 | Lint + Typecheck | `npm run lint && tsc` | Code quality | Hard ❌ |
| A2 | Unit Tests | `npm run test --coverage` | Functionality | Hard ❌ |
| A3 | Build | `npm run build` | Compilation | Hard ❌ |
| A7 | Deploy Preview | `vercel deploy` | Staging | Hard ❌ |
| A4 | E2E Tests | `npm run test:e2e` | Integration | Soft ⚠️ |
| A5 | Evidence Sign | `sign.mjs` | Audit trail | Auto |
| A8 | Shadow Verify | Collect p95/errors | Metrics | Auto |
| A6 | Policy Gate | Check vs SLOs | Approval | Hard ❌ |
| A9 | Deploy Prod | `vercel --prod` | Release | Hard ❌ |
| A10 | Rollback | `git revert` | Recovery | Auto 🔄 |

**Hard ❌** = Fail → stop, no deploy  
**Soft ⚠️** = Fail → log, continue  
**Auto** = Always runs  
**Auto 🔄** = Only on failure

---

## 🔑 Key Features

### ✅ Deny-by-Default
Every gate must pass. No exceptions. No overrides.

### ✅ Evidence-Driven
All code hashed + signed with RS256 JWT. Audit trail in `logs/deployments.json`.

### ✅ Metric-Gated
Collect p95 latency + error rate. Compare vs `scripts/policy/gate.json` SLOs.

### ✅ Easy Rollback
1 command: `node scripts/deploy/rollback.mjs`  
Or auto-triggered on policy failure. Uses git revert (safe & idempotent).

### ✅ VS Code Native
No external tools. Just `Cmd+Shift+P → "Tasks: Run Task"`.

---

## 🧠 Architecture: Explorer → Verifier → Corrector

### 🔍 **Explorer** (A1-A4, A7)
Lint, test, build, deploy preview.

### ✅ **Verifier** (A5-A6, A8)
- Hash + sign all artefacts (manifest)
- Collect metrics (p95 latency, error rate)
- Policy gate: compare vs SLOs
- **Deny if threshold breached**

### 🔄 **Corrector** (A9-A10)
- Pass all gates → promote to production
- Fail any gate → auto-rollback (git revert)

---

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| "VERCEL_TOKEN not set" | Add to GitHub Secrets (check expiration) |
| "Preview URL not found" | A7 failed; check GitHub Actions logs |
| "Policy check failed" | Check `evidence/guardrails.json` vs `scripts/policy/gate.json` |
| "Task not found in VS Code" | Reload VS Code window |
| "git revert failed" | May indicate branch conflict; pull + resolve locally |

More help: See **[AGENTIC_SETUP.md](./AGENTIC_SETUP.md#troubleshooting)**.

---

## 📊 SLO Configuration

Edit `scripts/policy/gate.json`:

```json
{
  "p95_edge": 250,    ← Vercel Edge max latency (ms)
  "p95_node": 450,    ← Node.js max latency (ms)
  "error_rate": 0.001 ← Max error rate (0.1%)
}
```

Adjust for your service's SLOs. Higher = more lenient.

---

## 🚨 Emergency Rollback

```bash
# Auto-triggered if policy fails
node scripts/deploy/rollback.mjs

# Or manual
git revert HEAD
git push origin main

# Result: CI auto-redeploys previous version in ~2 min
```

---

## 🎓 Learning Path

1. **5 min**: Read [AGENTIC_QUICK_REFERENCE.md](./AGENTIC_QUICK_REFERENCE.md)
2. **10 min**: Read [AGENTIC_INTEGRATION_STEPS.md](./AGENTIC_INTEGRATION_STEPS.md)
3. **15 min**: Copy-paste from [AGENTIC_COPY_PASTE_COMMANDS.md](./AGENTIC_COPY_PASTE_COMMANDS.md)
4. **10 min**: Test locally & in GitHub
5. **5 min**: Read [AGENTIC_DEPLOYMENT_CHECKLIST.md](./AGENTIC_DEPLOYMENT_CHECKLIST.md)
6. **Done!**

---

## 📞 Support

- **Setup issues?** → [AGENTIC_INTEGRATION_STEPS.md](./AGENTIC_INTEGRATION_STEPS.md)
- **Command reference?** → [AGENTIC_QUICK_REFERENCE.md](./AGENTIC_QUICK_REFERENCE.md)
- **Copy-paste ready?** → [AGENTIC_COPY_PASTE_COMMANDS.md](./AGENTIC_COPY_PASTE_COMMANDS.md)
- **Full details?** → [AGENTIC_SETUP.md](./AGENTIC_SETUP.md)
- **Pre-prod check?** → [AGENTIC_DEPLOYMENT_CHECKLIST.md](./AGENTIC_DEPLOYMENT_CHECKLIST.md)

---

## 🎉 Next Steps

### Today
- [ ] Read this file (you're here!)
- [ ] Read [AGENTIC_INTEGRATION_STEPS.md](./AGENTIC_INTEGRATION_STEPS.md)
- [ ] Copy-paste commands from [AGENTIC_COPY_PASTE_COMMANDS.md](./AGENTIC_COPY_PASTE_COMMANDS.md)
- [ ] Test locally + GitHub

### This Week
- [ ] Run [AGENTIC_DEPLOYMENT_CHECKLIST.md](./AGENTIC_DEPLOYMENT_CHECKLIST.md)
- [ ] Adjust SLO thresholds
- [ ] Train team

### This Month
- [ ] Enable auto-promote (A9 without manual gate)
- [ ] Add Sentry/OTel metrics
- [ ] Add Slack notifications

---

## 📈 Expected Metrics (Post-Deploy)

```
Before Agentic:
- Deploy frequency: 1-2x per week
- Failed deploys: 10-20%
- Time to detect issues: 5-15 min
- Rollback time: 10+ min (manual)

After Agentic:
- Deploy frequency: Daily (if desired)
- Failed deploys: <5% (auto-gated)
- Time to detect issues: <30 sec (policy gate)
- Rollback time: ~2 min (auto)
```

---

## 🏆 Philosophy

> **Automation ≠ Autonomy**  
> Agents handle routine steps. Humans retain control via gates.

> **Trust + Verify**  
> Every deploy includes evidence (manifest) + metrics (guardrails).  
> Gates make both visible and auditable.

> **Deny by Default**  
> New code = no deploy until proven safe.  
> Fail fast, rollback easy.

---

## 📜 License & Attribution

**ApexRebate Hybrid MAX v2 — Saigon Edition**  
Built by: Saigon Tech Collective  
Date: November 2025  
License: Internal Use  

---

## 🚀 Ready?

**Start here**: [AGENTIC_COPY_PASTE_COMMANDS.md](./AGENTIC_COPY_PASTE_COMMANDS.md)

**Questions?** Ask in Slack or refer to docs above.

**Celebrate deployment success**: `curl https://httpbin.org/status/200` ✅

---

**Automation that respects human judgment.**  
*Saigon Edition. ☕️*

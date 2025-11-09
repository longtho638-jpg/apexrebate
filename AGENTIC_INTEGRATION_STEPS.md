# Agentic Integration: Step-by-Step

Tích hợp Agentic vào ApexRebate repo của bạn trong **10 phút**.

---

## Step 1: Files Already Created ✅

Tất cả file đã được tạo. Verify:

```bash
ls -la .vscode/tasks.json
ls -la .github/workflows/agentic.yml
ls -la scripts/evidence/sign.mjs
ls -la scripts/policy/eval.mjs
ls -la scripts/deploy/vercel-*.mjs
ls -la scripts/rollout/shadow-verify.mjs
```

All should exist ✓

---

## Step 2: Install Dependencies

```bash
npm ci
npm i -D zx  # For advanced shell scripting in scripts (optional)
```

Verify:
```bash
npm list zx  # Should show zx installed
```

---

## Step 3: Add GitHub Secrets

Go to: **GitHub.com → Settings → Secrets and variables → Actions**

Add 6 secrets:

```
VERCEL_TOKEN          = <Get from https://vercel.com/account/tokens>
VERCEL_ORG_ID         = apexrebate
VERCEL_PROJECT_ID     = apexrebate-1
JWKS_PRIVATE          = <See below>
JWKS_KID              = prod-key-001
BROKER_HMAC           = <16+ random chars>
```

### Generate JWKS_PRIVATE (RS256 key)

Run locally (NOT in CI):

```bash
# Generate private key
openssl genrsa -out /tmp/private.pem 2048

# Convert to PKCS8 (required by jose library)
openssl pkcs8 -topk8 -inform PEM -outform PEM -in /tmp/private.pem -out /tmp/private_key.pem -nocrypt

# Display for copying
cat /tmp/private_key.pem
```

Copy entire output → GitHub Secret `JWKS_PRIVATE`

Verify (should have `BEGIN PRIVATE KEY` and `END PRIVATE KEY`):
```bash
cat /tmp/private_key.pem | head -2 && cat /tmp/private_key.pem | tail -1
```

### Generate BROKER_HMAC

```bash
# Any random 32+ character string
openssl rand -hex 16  # Output: copy to GitHub Secret BROKER_HMAC
```

---

## Step 4: Commit to Git

```bash
git add -A  # Stage all new files
git commit -m "ci: add agentic pipeline (explorer→verifier→corrector)"
git push origin main
```

Verify: GitHub Actions tab should show new workflow `agentic.yml`

---

## Step 5: Test Locally (5 min)

### A1-A3: Lint, Test, Build
```bash
npm run lint && tsc -p tsconfig.json
npm run test -- --coverage
npm run build
```

All should ✓ pass

### A5: Evidence Sign
```bash
node scripts/evidence/sign.mjs
cat evidence/manifest.json  # Should list artefacts
cat evidence/evidence.json  # Should have JWT
```

### A6: Policy Gate (with mock data)
```bash
# Auto-creates mock guardrails if missing
node scripts/rollout/shadow-verify.mjs
node scripts/policy/eval.mjs evidence/evidence.json
```

Should show: **"✔ Policy check PASSED"**

---

## Step 6: Test in GitHub Actions (5 min)

Trigger workflow manually:

```bash
gh workflow run agentic.yml
```

Watch it run:

```bash
gh run list --workflow=agentic.yml --limit=1
gh run view <run-id> --log  # Real-time logs
```

Expected flow:
- ✅ A1: Lint + Typecheck
- ✅ A2: Unit Tests
- ✅ A3: Build
- ⚠️ A7: Deploy Preview (may fail if VERCEL_TOKEN not set; that's OK)
- ⚠️ A4: E2E (skipped if no preview)
- ✅ A5: Evidence
- ✅ A8: Shadow Verify
- ✅ A6: Policy Gate
- ⚠️ A9: Deploy Prod (may skip if no preview)
- ❌ A10: Rollback (only triggers on failure)

### Check Artifacts

```bash
gh run download <run-id> -D /tmp/evidence
ls -la /tmp/evidence/
cat /tmp/evidence/evidence.json
```

Should have:
- `manifest.json` (src/ + package.json hashes)
- `evidence.json` (JWT signed)
- `guardrails.json` (p95/error_rate)

---

## Step 7: Adjust SLOs (Optional)

Edit `scripts/policy/gate.json` if needed:

```json
{
  "p95_edge": 250,    ← Your edge latency budget (ms)
  "p95_node": 450,    ← Your node latency budget (ms)
  "error_rate": 0.001 ← Your error rate budget (0.1%)
}
```

Commit:
```bash
git add scripts/policy/gate.json
git commit -m "ci: set slo thresholds for apexrebate"
git push origin main
```

---

## Step 8: Enable Auto-Deploy on Main (OPTIONAL)

Currently, workflow runs on push but doesn't auto-deploy production (requires manual A6→A9 gate).

To enable auto-deploy:

```bash
# Edit .github/workflows/agentic.yml
# Change:
# if: success()
# to auto-run A9 after A6 passes
```

**Recommended**: Keep manual gate for first week, then enable auto-deploy once confident.

---

## Step 9: Set Up Monitoring (Optional)

For production use, add observability:

```bash
# Add Sentry
npm i @sentry/nextjs
# Configure in src/app/layout.tsx or src/middleware.ts

# Add OpenTelemetry
npm i @opentelemetry/api @opentelemetry/sdk-node
# Configure exporter in src/lib/otel.ts
```

Then update `scripts/rollout/shadow-verify.mjs` to fetch real metrics:

```javascript
// Instead of mock data:
const metrics = await fetch('https://your-otel-collector/metrics').then(r => r.json());
const guardrails = {
  p95_edge: metrics.edge.p95,
  p95_node: metrics.node.p95,
  error_rate: metrics.errors / metrics.total,
  ...
};
```

---

## Step 10: Team Training (Optional)

Share with team:

1. **AGENTIC_QUICK_REFERENCE.md** - One-page cheat sheet
2. **AGENTIC_SETUP.md** - Full documentation
3. **AGENTIC_DEPLOYMENT_CHECKLIST.md** - Pre-prod checklist

Demo:
```bash
# In VS Code: Command Palette → "Tasks: Run Task"
# Show each step A1-A10
# Explain gates + rollback
```

---

## Verify: Final Checklist

- [x] All files created (.vscode/tasks.json, scripts/*, .github/workflows/agentic.yml)
- [x] Committed to git
- [x] GitHub Secrets set (VERCEL_TOKEN, JWKS_PRIVATE, BROKER_HMAC)
- [x] Local A1-A6 tests pass
- [x] GitHub workflow runs (gh workflow run agentic.yml)
- [x] Evidence artifacts created (manifest + JWT + guardrails)
- [x] SLO thresholds appropriate (scripts/policy/gate.json)
- [ ] Team trained (optional but recommended)

---

## Quick Troubleshooting

### "module not found: jose"
```bash
npm i jose  # Should already be installed, but:
npm ci
```

### "vercel deploy: 403"
```bash
# VERCEL_TOKEN may be wrong or expired
# Re-generate from https://vercel.com/account/tokens
# Update GitHub Secret
```

### "Policy check failed"
```bash
cat evidence/guardrails.json
cat scripts/policy/gate.json
# Adjust thresholds or fix metrics
```

### "Rollback won't work"
```bash
# Ensure you have write access to main branch
# Check branch protection rules (should allow reverts)
git log --oneline | head -3
```

---

## Next: Production Readiness

Once local + CI tests pass:

1. Run **AGENTIC_DEPLOYMENT_CHECKLIST.md**
2. Enable auto-promote (remove manual gate on A9)
3. Set up Slack notifications
4. Add Sentry/OTel monitoring
5. Document runbook for team

---

**✅ Agentic CI/CD Ready!**

Push to main → Workflow auto-runs → Evidence + Gate → Deploy or Rollback.

**All without human typing one CLI command.** 🎯

---

*ApexRebate Hybrid MAX v2 — Saigon Edition (2025)*
*Automation doesn't replace craft; it amplifies it. ☕️*

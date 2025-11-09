# Agentic Deployment Checklist

Complete this before enabling Agentic CI/CD in production.

---

## ✅ Pre-Deployment (15 min)

### Secrets Setup
- [ ] `VERCEL_TOKEN` added to GitHub → Settings → Secrets
- [ ] `VERCEL_ORG_ID` added (e.g., `apexrebate`)
- [ ] `VERCEL_PROJECT_ID` added (e.g., `apexrebate-1`)
- [ ] `JWKS_PRIVATE` (RS256 key in PEM format)
- [ ] `JWKS_KID` (e.g., `prod-key-001`)
- [ ] `BROKER_HMAC` (shared secret for webhooks, min 32 chars)

**How to generate JWKS:**
```bash
# On your local machine (not in repo)
openssl genrsa -out private.pem 2048
openssl pkcs8 -topk8 -inform PEM -outform PEM -in private.pem -out private_key.pem -nocrypt

# Display value to copy to GitHub Secret
cat private_key.pem
```

### Code Changes
- [ ] `.vscode/tasks.json` created ✓
- [ ] `scripts/evidence/sign.mjs` created ✓
- [ ] `scripts/policy/eval.mjs` created ✓
- [ ] `scripts/deploy/vercel-*.mjs` created ✓
- [ ] `.github/workflows/agentic.yml` created ✓
- [ ] All scripts marked executable: `chmod +x scripts/**/*.mjs`

### Package Dependencies
- [ ] Run `npm ci` (fresh install)
- [ ] `npm i -D zx` (if not already installed)
- [ ] `npm run build` succeeds locally
- [ ] `npm run test` passes with coverage

### Git Setup
- [ ] `.github/workflows/agentic.yml` committed
- [ ] All `scripts/` committed
- [ ] `.vscode/tasks.json` committed
- [ ] No uncommitted changes

---

## 🧪 Local Testing (10 min)

### Run Individual Tasks
```bash
# From VS Code Command Palette: Tasks → Run Task
# Or from terminal:
npm run lint && tsc -p tsconfig.json     # A1
npm run test -- --coverage               # A2
npm run build                             # A3
node scripts/evidence/sign.mjs           # A5
node scripts/policy/eval.mjs evidence/evidence.json  # A6
```

- [ ] A1: Lint + Typecheck passes
- [ ] A2: Unit tests + coverage passes
- [ ] A3: Build succeeds
- [ ] A5: Evidence signed (evidence/evidence.json exists)

### Test Preview Deploy (requires VERCEL_TOKEN)
```bash
export VERCEL_TOKEN=<your-token>
node scripts/deploy/vercel-preview.mjs
```

- [ ] Preview URL generated successfully
- [ ] `.vercel-preview-url` file created

### Test Shadow Verify
```bash
node scripts/rollout/shadow-verify.mjs
```

- [ ] `evidence/guardrails.json` created with p95/error_rate

### Test Policy Gate
```bash
node scripts/policy/eval.mjs evidence/evidence.json
```

- [ ] Policy check passes (or shows why it failed)
- [ ] Thresholds in `scripts/policy/gate.json` are appropriate for your SLOs

---

## 🚀 GitHub Workflow Test (5 min)

### Trigger manually
```bash
gh workflow run agentic.yml
gh run list --workflow=agentic.yml --limit=1
gh run view <run-id> --log  # Watch logs in real-time
```

- [ ] Workflow starts (no auth errors)
- [ ] A1-A3 pass (lint, test, build)
- [ ] A7 creates preview (requires VERCEL_TOKEN secret)
- [ ] A5-A6 pass (evidence & policy)
- [ ] A9 attempts production deploy (may fail if policy not met — that's OK for first run)

### Check artifacts
```bash
gh run download <run-id> -D /tmp/evidence
ls -la /tmp/evidence/
```

- [ ] `evidence/manifest.json` exists
- [ ] `evidence/evidence.json` exists (with JWT)
- [ ] `evidence/guardrails.json` exists

---

## 🔐 Security Verification

- [ ] Webhook signature verification works
  - Test with: `node scripts/webhooks/broker-handler.ts` (manual curl)
  - Verify HMAC validation rejects bad signatures
- [ ] Policy gate blocks deployment if thresholds exceeded
  - Manually edit `evidence/guardrails.json` with high p95
  - Run `node scripts/policy/eval.mjs evidence/evidence.json`
  - Should fail
- [ ] Rollback works
  - Trigger failure in a test: `npm run test` → fail on purpose
  - Should trigger A10 (rollback) if failure detected
  - Check git history: `git log --oneline | head -5`

---

## 📊 Adjust SLO Gates

Edit `scripts/policy/gate.json` based on your SLOs:

```json
{
  "p95_edge": 250,    // Your typical p95 for Edge functions (ms)
  "p95_node": 450,    // Your typical p95 for Node.js (ms)
  "error_rate": 0.001 // Your error rate threshold (0-1)
}
```

- [ ] p95_edge threshold realistic for your service
- [ ] p95_node threshold realistic for your service
- [ ] error_rate threshold matches your SLA

---

## ✅ Production Readiness

### Before enabling auto-deploy on main
- [ ] All local tests pass (A1-A6)
- [ ] Manual workflow run succeeds (A1-A9)
- [ ] Rollback tested (A10 works)
- [ ] Team trained on workflow
- [ ] Runbook written (if needed)

### Monitoring
- [ ] Sentry configured (for error tracking)
- [ ] OpenTelemetry exporter configured (for p95 metrics)
- [ ] Slack webhook added to workflow (notifications)
- [ ] Logs directory set up: `mkdir -p logs`

### Documentation
- [ ] [AGENTIC_SETUP.md](./AGENTIC_SETUP.md) reviewed
- [ ] Team aware of deny-by-default gates
- [ ] Fallback process if CI fails (manual deploy)

---

## 🎯 Enable Auto-Deploy

Once all checks pass:

1. Verify main branch has latest code
   ```bash
   git pull origin main
   ```

2. Push a test commit
   ```bash
   git commit --allow-empty -m "ci: enable agentic pipeline"
   git push origin main
   ```

3. Watch GitHub Actions (should run automatically)
   ```bash
   gh run list --workflow=agentic.yml
   ```

4. If all pass → Production deployment successful ✔

---

## 🐛 Rollback If Needed

```bash
# If production deploy causes issues:
node scripts/deploy/rollback.mjs

# Or manual:
git revert HEAD
git push origin main
```

---

## 📝 Post-Deployment

- [ ] Confirm logs/deployments.json has latest entry
- [ ] Monitor error rates for 5 min
- [ ] Test critical user flows
- [ ] Announce deployment to team

---

**Status**: Ready for production ✅
**Last Updated**: Nov 9, 2025
**Owner**: Saigon Tech Collective

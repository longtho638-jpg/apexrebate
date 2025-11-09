# Agentic CI/CD Setup (ApexRebate Hybrid MAX v2)

Hệ thống tự động với kiểm soát từng bước: **lint → test → build → preview → verify → promote → rollback**.

---

## 🚀 Quick Start (5 min)

### 1) Set GitHub Secrets

Go to **Settings → Secrets and variables → Actions**, add:

```
VERCEL_TOKEN          (from vercel.com/account/tokens)
VERCEL_ORG_ID         (org slug)
VERCEL_PROJECT_ID     (project slug)
JWKS_PRIVATE          (RS256 private key - PEM format)
JWKS_KID              (key identifier, e.g., "prod-key")
BROKER_HMAC           (shared secret for webhooks)
```

**Generate JWKS_PRIVATE** (optional, but recommended):

```bash
openssl genrsa -out private.pem 2048
openssl pkcs8 -topk8 -inform PEM -outform PEM -in private.pem -out private_key.pem -nocrypt
cat private_key.pem | base64 | xargs echo  # Copy to GitHub secret
```

### 2) Install npm deps

```bash
npm ci
npm i -D zx
npx husky init
echo 'npm run lint && npm run test' > .husky/pre-commit
```

### 3) Make scripts executable

```bash
chmod +x scripts/**/*.mjs
```

### 4) Run full pipeline locally

```bash
npm run build && \
node scripts/evidence/sign.mjs && \
node scripts/deploy/vercel-preview.mjs && \
npm run test:e2e && \
node scripts/rollout/shadow-verify.mjs && \
node scripts/policy/eval.mjs evidence/evidence.json
```

Or from VS Code Command Palette:
- **Tasks: Run Task** → **"Agentic: Full Pipeline"**

---

## 🧠 Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Agentic CI/CD (GitHub Actions + VS Code Tasks)        │
├─────────────────────────────────────────────────────────┤
│  A1: Lint + Typecheck                                   │
│  A2: Unit Tests (Jest)                                  │
│  A3: Build (Next.js)                                    │
│  A7: Deploy Preview (Vercel)                            │
│  A4: E2E Tests (Playwright)                             │
│  A5: Evidence Sign (JWKS RS256)                         │
│  A8: Shadow Verify (collect p95/errors)                │
│  A6: Policy Gate (deny-by-default)                      │
│  A9: Deploy Production (if all pass)                    │
│  A10: Rollback (git revert + push)                      │
└─────────────────────────────────────────────────────────┘
```

**Key Principles:**
- ✅ **Deny-by-default**: Bất kỳ bước nào fail → dừng, không promote
- ✅ **Evidence-driven**: Mỗi promote đều kèm manifest + JWT ký số
- ✅ **Rollback 1st-class**: Revert = push tới main, CI tự deploy lại version cũ

---

## 📝 Files Created

```
.vscode/tasks.json                  # VS Code task definitions (A1-A10)
scripts/
├── evidence/
│   └── sign.mjs                    # Hash artefacts + sign JWT
├── policy/
│   ├── eval.mjs                    # Policy gate checker
│   └── gate.json                   # SLO thresholds
├── deploy/
│   ├── vercel-preview.mjs          # Deploy preview
│   ├── vercel-prod.mjs             # Deploy production (gated)
│   └── rollback.mjs                # Rollback via git revert
├── rollout/
│   ├── shadow-verify.mjs           # Collect guardrails (p95/errors)
│   └── save-url.mjs                # Save deployment URL
├── security/
│   └── headers.ts                  # Security headers for Next.js
└── webhooks/
    └── broker-handler.ts           # Webhook signature verification
.github/workflows/
└── agentic.yml                     # GitHub Actions workflow
```

---

## 🎯 Usage

### Local (VS Code)

1. Open **Command Palette** (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. Type **"Tasks: Run Task"**
3. Select any task:
   - **A1-A10**: Run individual steps
   - **"Agentic: Full Pipeline"**: Run all steps in sequence

### GitHub (Automatic on push to main)

```bash
git commit -m "ci: add new feature"
git push origin main
# CI automatically runs A1 → A9
# Check GitHub Actions tab for progress
```

### Manual trigger

```bash
gh workflow run agentic.yml
```

### View logs

```bash
gh run list --workflow=agentic.yml --limit=5
gh run view <run-id> --log
```

---

## 🔍 What Each Step Does

### A1: Lint + Typecheck
- Runs ESLint + TypeScript compiler
- Fails if type errors or linting issues found
- **Gate**: No deploy if this fails

### A2: Unit Tests
- Jest coverage report
- **Gate**: No deploy if tests fail

### A3: Build
- Next.js production build
- **Gate**: No deploy if build fails

### A7: Deploy Preview
- Deploys to Vercel preview URL
- Saves URL for E2E testing
- **Gate**: E2E tests run against this

### A4: E2E Tests (Playwright)
- Tests against preview URL
- If fails, continues (soft gate)
- **Gate**: Recorded in guardrails for policy eval

### A5: Evidence Sign
- Hashes all artefacts (package.json, src/*, etc)
- Creates manifest.json
- Signs JWT with RS256 (JWKS_PRIVATE)
- **Purpose**: Audit trail of what was deployed

### A8: Shadow Verify
- Simulates production traffic patterns
- Collects p95 latency, error rates
- Writes guardrails.json
- **In production**: Would hit real metrics APIs (OpenTelemetry, Sentry)

### A6: Policy Gate
- Reads guardrails.json + gate.json
- Checks: p95_edge ≤ 250ms, p95_node ≤ 450ms, error_rate ≤ 0.1%
- **Gate**: Blocks production deploy if policy fails
- **Philosophy**: "Trust, but verify with evidence"

### A9: Deploy Production
- Only runs if all gates pass (A1-A8 success)
- Promotes preview → production (Vercel)
- Logs deploy to logs/deployments.json
- **Rollback-aware**: Saves commit SHA

### A10: Rollback
- Triggered on A1-A8 failure
- Runs `git revert HEAD` + `git push origin main`
- CI automatically redeploys previous version
- **Idempotent**: Safe to run multiple times

---

## 🔐 Security

### Webhook Verification (HMAC)

```typescript
// Validate incoming webhooks
const sig = request.headers['x-signature'];
const ts = request.headers['x-timestamp'];
const body = await request.text();

const mac = HMAC-SHA256(body, BROKER_HMAC);
if (mac !== sig || age(ts) > 5min) return 401;
```

### Evidence Signing (RS256)

```
Artefacts (src/*, package.json, etc)
    ↓
[Hash each file → manifest.json]
    ↓
[Sign manifest + commit SHA with RS256]
    ↓
evidence.json (JWT expires in 15 min)
```

### Headers (CSP, X-Frame-Options, etc)

Automatically set by middleware. See `scripts/security/headers.ts`.

---

## 📊 SLO Gates (scripts/policy/gate.json)

```json
{
  "p95_edge": 250,    // Vercel Edge: 250ms max
  "p95_node": 450,    // Node.js: 450ms max
  "error_rate": 0.001 // 0.1% max error rate
}
```

Adjust based on your SLOs. Higher thresholds = more lenient gates.

---

## 🔄 Typical Flow

```
1. Developer pushes to main
   ↓
2. GitHub Actions triggers agentic.yml
   ↓
3. A1-A3: Lint/test/build locally
   ├─ If any fails → stop, no deploy
   ↓
4. A7: Deploy preview URL
   ↓
5. A4: E2E tests on preview
   ├─ If fails → logged but continue (soft gate)
   ↓
6. A5: Sign evidence (JWT + manifest)
   ↓
7. A8: Collect metrics (p95 / error rates)
   ↓
8. A6: Policy check (gates enabled)
   ├─ If policy fails → stop, no production deploy
   ├─ Trigger A10 (rollback)
   ↓
9. A9: If all pass → promote preview → production
   ↓
10. Done! Commit SHA logged in logs/deployments.json
```

---

## 🐛 Troubleshooting

### "VERCEL_TOKEN not set"
→ Add to GitHub Secrets (Settings → Secrets and variables → Actions)

### "Preview URL not found"
→ A7 failed. Check GitHub Actions logs for vercel deploy error

### "Policy check failed"
→ One of: p95 too high, error rate too high, or e2e_pass=false
→ Check `evidence/guardrails.json` vs `scripts/policy/gate.json`

### "git revert failed"
→ Rollback is failing (A10). May indicate merge conflict on main
→ Manual fix: Pull main locally, resolve, push

### Local task not found
→ Run `npm i -D zx` (if using zx for shell commands)

---

## 🚀 Next Steps (Roadmap)

- [ ] **OTel Integration**: Replace shadow-verify mock with real OpenTelemetry metrics
- [ ] **DLQ Replay UI**: Admin dashboard to replay failed broker events
- [ ] **Canary Routing**: mSPRT-based canary % rollout (instead of hard 0→100%)
- [ ] **JWKS Rotation**: Auto-rotate kid weekly, serve public JWKS at `/.well-known/jwks.json`
- [ ] **Real Guardrails**: Fetch from Sentry API instead of simulated p95
- [ ] **Slack Notifications**: Post deploy status + metrics to Slack

---

## 📚 Related Docs

- [AGENTS.md](./AGENTS.md) - Architecture overview
- [CATALYST_DASHBOARD_UPGRADE.md](./CATALYST_DASHBOARD_UPGRADE.md) - UI component library
- [SEED_PUBLIC_IMPLEMENTATION_COMPLETE.md](./SEED_PUBLIC_IMPLEMENTATION_COMPLETE.md) - Public tools marketplace

---

**Built for ApexRebate by Saigon Tech Collective. Saigon Edition. ☕️**

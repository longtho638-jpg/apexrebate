# Agentic: Copy-Paste Ready Commands

**Everything you need, copy-paste ready.** No thinking required.

---

## Step 1: Generate Secrets (Run Locally, NOT in CI)

```bash
# Generate JWKS_PRIVATE (RS256 key)
openssl genrsa -out /tmp/private.pem 2048
openssl pkcs8 -topk8 -inform PEM -outform PEM -in /tmp/private.pem -out /tmp/private_key.pem -nocrypt
echo "=== COPY BELOW TO GitHub Secret 'JWKS_PRIVATE' ==="
cat /tmp/private_key.pem
echo ""

# Generate BROKER_HMAC
echo "=== GitHub Secret 'BROKER_HMAC' ==="
openssl rand -hex 16

# Clean up
rm /tmp/private.pem /tmp/private_key.pem
```

**Output**: 2 values to add to GitHub Secrets (see Step 2)

---

## Step 2: Add GitHub Secrets

Go to: **https://github.com/longtho638-jpg/apexrebate/settings/secrets/actions**

Add these 6 secrets:

| Secret | Value |
|--------|-------|
| `VERCEL_TOKEN` | Get from https://vercel.com/account/tokens |
| `VERCEL_ORG_ID` | `apexrebate` |
| `VERCEL_PROJECT_ID` | `apexrebate-1` |
| `JWKS_PRIVATE` | Output from Step 1 (the PEM key) |
| `JWKS_KID` | `prod-key-001` |
| `BROKER_HMAC` | Output from Step 1 (16 hex chars) |

**Don't have VERCEL_TOKEN?** Get it:
1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Name it: `apexrebate-ci`
4. Expiration: 90 days (renew later)
5. Copy the token → paste to GitHub Secret

---

## Step 3: Install & Commit

```bash
# Go to repo
cd ~/apexrebate-1

# Install deps
npm ci
npm i -D zx

# Make scripts executable
chmod +x scripts/**/*.mjs

# Commit everything
git add -A
git commit -m "ci: add agentic pipeline (explorer→verifier→corrector)"
git push origin main
```

---

## Step 4: Test Locally (Optional but Recommended)

```bash
# A1: Lint + Typecheck
npm run lint && tsc -p tsconfig.json

# A2: Unit Tests
npm run test -- --coverage

# A3: Build
npm run build

# A5: Evidence Sign
node scripts/evidence/sign.mjs
cat evidence/evidence.json

# A8: Shadow Verify
node scripts/rollout/shadow-verify.mjs
cat evidence/guardrails.json

# A6: Policy Gate
node scripts/policy/eval.mjs evidence/evidence.json
```

Expected: All ✅ green

---

## Step 5: Test in GitHub

```bash
# Trigger workflow
gh workflow run agentic.yml

# Watch it run
gh run list --workflow=agentic.yml --limit=1

# Get run ID from output, then:
gh run view <RUN_ID> --log

# Download artifacts
gh run download <RUN_ID> -D /tmp/agentic-artifacts
ls /tmp/agentic-artifacts/evidence/
```

Expected outputs in `evidence/`:
- `manifest.json` (file hashes)
- `evidence.json` (signed JWT)
- `guardrails.json` (metrics: p95/error_rate)

---

## Step 6: Verify (One-Command Check)

```bash
# Everything OK?
test -f .vscode/tasks.json && \
test -f .github/workflows/agentic.yml && \
test -f scripts/evidence/sign.mjs && \
test -f scripts/policy/gate.json && \
echo "✅ Agentic setup complete!" || \
echo "❌ Something missing"
```

---

## Step 7: Use It!

### From VS Code

```
Cmd+Shift+P (or Ctrl+Shift+P on Linux/Windows)
Type: Tasks: Run Task
Select: Agentic: Full Pipeline
```

### From Terminal

```bash
# Trigger full pipeline in GitHub
gh workflow run agentic.yml

# Watch progress
gh run list --workflow=agentic.yml --limit=1
gh run view <RUN_ID> --log
```

### Adjust SLO Thresholds (if needed)

```bash
# Edit thresholds
nano scripts/policy/gate.json

# Example for high-traffic service:
# p95_edge: 500 (allow slower edge)
# p95_node: 800 (allow slower node)
# error_rate: 0.005 (allow 0.5% errors)

git add scripts/policy/gate.json
git commit -m "ci: adjust slo thresholds"
git push origin main
```

---

## Emergency: Rollback

```bash
# Auto rollback (if policy gate fails)
node scripts/deploy/rollback.mjs

# Or manual
git revert HEAD
git push origin main

# Result: CI auto-redeploys previous version in ~2 min
```

---

## Troubleshooting: Quick Fixes

### "VERCEL_TOKEN not set"
```bash
# Re-add to GitHub Secrets (might be expired)
# Get new token: https://vercel.com/account/tokens
# Update GitHub Secret: VERCEL_TOKEN
```

### "node: scripts/evidence/sign.mjs: No such file"
```bash
# Make sure you're in repo root
cd ~/apexrebate-1

# Make scripts executable
chmod +x scripts/**/*.mjs

# Try again
node scripts/evidence/sign.mjs
```

### "Policy check failed"
```bash
# Check what's wrong
cat evidence/guardrails.json
cat scripts/policy/gate.json

# Either:
# 1. Fix the metrics (re-run shadow-verify if mocked)
# 2. Adjust thresholds (edit gate.json)

# Then retry:
node scripts/policy/eval.mjs evidence/evidence.json
```

### "gh workflow run: error"
```bash
# Make sure you have gh CLI installed
which gh

# If not:
brew install gh  # macOS
choco install gh  # Windows (with choco)
# Or download: https://github.com/cli/cli

# Authenticate
gh auth login

# Then retry
gh workflow run agentic.yml
```

---

## One-Liner: Full Setup (Copy-Paste All)

```bash
cd ~/apexrebate-1 && \
npm ci && npm i -D zx && \
chmod +x scripts/**/*.mjs && \
echo "✅ Dependencies installed" && \
npm run lint && echo "✅ Lint passed" && \
npm run test && echo "✅ Tests passed" && \
npm run build && echo "✅ Build passed" && \
node scripts/evidence/sign.mjs && echo "✅ Evidence signed" && \
node scripts/rollout/shadow-verify.mjs && echo "✅ Guardrails collected" && \
node scripts/policy/eval.mjs evidence/evidence.json && echo "✅ Policy gate passed" && \
echo "" && \
echo "🎉 Agentic ready! Next: git push origin main"
```

---

## Verification Checklist (After Setup)

```bash
# Copy-paste this into terminal to verify everything
echo "🔍 Agentic Verification"
test -f .vscode/tasks.json && echo "✅ VS Code tasks" || echo "❌ VS Code tasks"
test -f .github/workflows/agentic.yml && echo "✅ GitHub workflow" || echo "❌ GitHub workflow"
test -f scripts/evidence/sign.mjs && echo "✅ Evidence script" || echo "❌ Evidence script"
test -f scripts/policy/eval.mjs && echo "✅ Policy script" || echo "❌ Policy script"
test -f scripts/policy/gate.json && echo "✅ Gate config" || echo "❌ Gate config"
ls scripts/deploy/*.mjs > /dev/null 2>&1 && echo "✅ Deploy scripts" || echo "❌ Deploy scripts"
echo "Done!"
```

---

## Get GitHub Secrets Right (Detailed)

### VERCEL_TOKEN
1. Go to https://vercel.com/account/tokens
2. Click **"Create Token"**
3. Name: `apexrebate-ci`
4. Scope: Full Account
5. Expiration: 90 days
6. Copy the token (shown once)
7. Go to GitHub → Settings → Secrets → **New secret**
8. Name: `VERCEL_TOKEN`
9. Value: [paste token]
10. Click **"Add secret"**

### JWKS_PRIVATE (RS256 Key)
1. Run locally:
   ```bash
   openssl genrsa -out /tmp/key.pem 2048
   openssl pkcs8 -topk8 -inform PEM -outform PEM -in /tmp/key.pem -out /tmp/key_pkcs8.pem -nocrypt
   cat /tmp/key_pkcs8.pem
   ```
2. Copy full output (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)
3. GitHub Secret:
   - Name: `JWKS_PRIVATE`
   - Value: [paste entire key]

### BROKER_HMAC
1. Run locally:
   ```bash
   openssl rand -hex 16
   ```
2. Copy 32-char hex string
3. GitHub Secret:
   - Name: `BROKER_HMAC`
   - Value: [paste hex string]

### JWKS_KID
1. GitHub Secret:
   - Name: `JWKS_KID`
   - Value: `prod-key-001` (any identifier)

### VERCEL_ORG_ID
1. Go to https://vercel.com/settings
2. Find your organization name (slug)
3. GitHub Secret:
   - Name: `VERCEL_ORG_ID`
   - Value: [your org name, e.g., `apexrebate`]

### VERCEL_PROJECT_ID
1. Go to https://vercel.com/[org-name]/[project-name]/settings
2. Copy Project ID from settings page
3. GitHub Secret:
   - Name: `VERCEL_PROJECT_ID`
   - Value: [project ID, e.g., `apexrebate-1`]

---

**Ready? Start with Step 1 above.** 🚀

All copy-paste. All production-ready.

*Saigon Edition. ☕️*

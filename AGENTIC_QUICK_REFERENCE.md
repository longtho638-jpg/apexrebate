# Agentic Quick Reference Card

**Ctrl+Shift+P → "Tasks: Run Task"** or **`gh workflow run agentic.yml`**

---

## 10-Step Pipeline at a Glance

| Step | Task | Command | Purpose | Gate |
|------|------|---------|---------|------|
| A1 | Lint + Typecheck | `npm run lint && tsc` | Code quality | Hard ❌ |
| A2 | Unit Tests | `npm run test --coverage` | Functionality | Hard ❌ |
| A3 | Build | `npm run build` | Compilation | Hard ❌ |
| A7 | Deploy Preview | `vercel deploy --prebuilt` | Staging | Hard ❌ |
| A4 | E2E Tests | `npm run test:e2e` | Integration | Soft ⚠️ |
| A5 | Evidence Sign | `sign.mjs` (JWT + manifest) | Audit trail | Hard ❌ |
| A8 | Shadow Verify | Collect p95/errors | Metrics | Hard ❌ |
| A6 | Policy Gate | Check vs SLOs | Approval | Hard ❌ |
| A9 | Deploy Prod | `vercel --prod` | Release | Hard ❌ |
| A10 | Rollback | `git revert + push` | Recovery | Auto 🔄 |

**Hard ❌** = Any fail → stop, no further steps  
**Soft ⚠️** = Fail → logged, continue (for observability)  
**Auto 🔄** = Triggered if A1-A8 fails

---

## Local Usage (VS Code)

```
Command Palette (Cmd+Shift+P / Ctrl+Shift+P)
  ↓
Type: "Tasks: Run Task"
  ↓
Select: "Agentic: Full Pipeline"  (or any A1-A10)
  ↓
Watch output in Terminal panel
```

## CI/CD Usage (GitHub)

```bash
# Auto-trigger on push to main
git commit -m "feat: new stuff"
git push origin main

# Or manually trigger
gh workflow run agentic.yml

# Watch progress
gh run list --workflow=agentic.yml --limit=5
gh run view <run-id> --log
```

---

## Key Files & What They Do

```
.vscode/tasks.json          → Task definitions for VS Code (A1-A10)
scripts/evidence/sign.mjs   → Hash code + sign with RS256
scripts/policy/eval.mjs     → Compare metrics vs SLOs
scripts/deploy/*.mjs        → Deploy to Vercel (preview & prod)
scripts/rollout/*.mjs       → Collect metrics (guardrails)
.github/workflows/agentic.yml → GitHub Actions orchestration
```

---

## Evidence Artifacts (After Each Run)

```
evidence/
├── manifest.json          # SHA256 hashes of src/, package.json, etc
├── evidence.json          # JWT (signed manifest + commit SHA)
├── guardrails.json        # Metrics: p95_edge, p95_node, error_rate
└── preview-url.json       # Preview deployment URL
```

---

## SLO Thresholds (scripts/policy/gate.json)

```json
{
  "p95_edge": 250,      ← Vercel Edge max latency (ms)
  "p95_node": 450,      ← Node.js max latency (ms)
  "error_rate": 0.001   ← Max error rate (0.1%)
}
```

**Adjust based on your SLOs** → Higher = more lenient.

---

## Emergency: Rollback

```bash
# Automatic (if policy gate fails)
node scripts/deploy/rollback.mjs

# Manual
git revert HEAD
git push origin main
```

Result: Previous version auto-deployed by CI in ~2 min.

---

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| "VERCEL_TOKEN not set" | Missing GitHub Secret | Add to Settings → Secrets |
| "Preview URL not found" | A7 failed | Check GitHub Actions logs |
| "Policy check failed" | p95 high or error_rate high | Review evidence/guardrails.json |
| "Local task not found" | tasks.json not recognized | Reload VS Code window |

---

## Philosophy

> **Deny by Default**  
> Every deploy requires evidence (manifest + JWT) + policy approval.  
> Fail fast, rollback easy.

> **Agentic, Not Autonomous**  
> Automation handles routine steps.  
> Humans retain final control via gates.

> **Trust, But Verify**  
> Metrics > Hunches.  
> Every decision logged (evidence/) + auditable.

---

**Deploy with confidence. Rollback with ease. 🎯**

*ApexRebate Hybrid MAX v2 — Saigon Edition (2025)*

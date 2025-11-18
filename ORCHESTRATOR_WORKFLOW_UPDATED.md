# Amp Orchestrator Workflow: UI V5 Fix (UPDATED Nov 18, 2025)

## Status Summary

| Stage | Status | Completion |
|-------|--------|-----------|
| **Stage 1: Plans Created** | ✅ Complete | 100% |
| **Stage 2: Gemini Execution** | 🟡 Ready | 0% |
| **Stage 3: Verification** | ⏳ Pending | 0% |

---

## Stage 1: COMPLETE ✅

**What Happened:**
- Amp analyzed 8 target files
- Created 3 detailed execution plans
- Placed in `/plans/` directory
- Added master README for coordination

**Files Created:**
```
plans/
├── README.md                      # Master guide
├── ui-v5-phase-03-plan.md        # Restore pages (execute FIRST)
├── ui-v5-phase-01-plan.md        # Fix atoms
└── ui-v5-phase-02-plan.md        # NavBar i18n
```

**Total Size:** 30KB documentation, 3 detailed plans

---

## Stage 2: Ready for Gemini CLI

### Execution Order (CRITICAL)

Execute plans in this exact order:

```bash
# 1️⃣ FIRST - Restore pages (5 min)
cd /Users/macbookprom1/apexrebate-1
cat plans/ui-v5-phase-03-plan.md | head -20  # Read to understand
# Then load into Gemini with the full content

# 2️⃣ SECOND - Fix atoms (30 min)
cat plans/ui-v5-phase-01-plan.md | head -20  # Read to understand
# Then load into Gemini with the full content

# 3️⃣ THIRD - NavBar i18n (15 min)
cat plans/ui-v5-phase-02-plan.md | head -20  # Read to understand
# Then load into Gemini with the full content
```

### How to Run in Gemini CLI

**Method 1: Copy-paste plan content**
1. Open `plans/ui-v5-phase-03-plan.md` in editor
2. Copy entire content
3. Paste into Gemini CLI with: `gemini --prompt-interactive`
4. Paste plan content
5. Gemini executes and makes changes
6. After phase 03 completes, repeat for Phase 01
7. After phase 01 completes, repeat for Phase 02

**Method 2: Using stdin (if Gemini supports)**
```bash
gemini --prompt-interactive < plans/ui-v5-phase-03-plan.md
```

---

## What Each Phase Does

### Phase 03: Restore Pages
- Verify 4 page files exist
- Check routes compile
- Test in browser
- Ensure build succeeds (0 errors)

**Files Touched:** 
- `src/app/[locale]/v5/home/page.tsx`
- `src/app/[locale]/v5/dashboard/page.tsx`
- `src/app/[locale]/v5/calculator/page.tsx`
- `src/app/[locale]/v5/settings/page.tsx`

**Expected Duration:** 5 min

---

### Phase 01: Fix Atoms
- Add dark mode to Button.tsx
- Update Card.tsx for dark theme
- Fix Input.tsx styling
- Add disabled states to all

**Files Modified:**
- `src/uiux-v5/atoms/Button.tsx` (~40 lines changed)
- `src/uiux-v5/atoms/Card.tsx` (~15 lines changed)
- `src/uiux-v5/atoms/Input.tsx` (~30 lines changed)

**Expected Duration:** 30 min

---

### Phase 02: NavBar i18n
- Add `useTranslations` hook
- Create message files (4 locales)
- Translate navigation labels
- Translate auth buttons
- Update templates with locale prop

**Files Modified:**
- `src/uiux-v5/molecules/NavBar.tsx` (add i18n)
- `src/messages/en.json` (create)
- `src/messages/vi.json` (create)
- `src/messages/th.json` (create)
- `src/messages/id.json` (create)
- Templates: Homepage, Dashboard, Calculator, Settings

**Expected Duration:** 15 min

---

## Testing After Each Phase

### After Phase 03 ✅
```bash
npm run build
# Expected: ✅ 0 errors, all routes compile
```

### After Phase 01 ✅
```bash
npm run lint src/uiux-v5/atoms/
npm run build
# Expected: ✅ 0 errors, 0 warnings
```

### After Phase 02 ✅
```bash
npm run build
npm run dev &
# Test routes in all 4 locales:
curl http://localhost:3000/en/v5/home
curl http://localhost:3000/vi/v5/home
curl http://localhost:3000/th/v5/home
curl http://localhost:3000/id/v5/home
pkill -f "next dev"
```

---

## Stage 3: Verification & Commit

After Gemini completes all 3 phases:

### Pre-Commit Checks
```bash
npm run lint
npm run build          # Must be 0 errors
npm run test           # Run unit tests
npm run test:e2e       # Run E2E tests
```

### Browser Testing (Manual)
```bash
npm run dev &

# Test each route in 4 locales
# Desktop (1920x1080):
# - http://localhost:3000/en/v5/home
# - http://localhost:3000/vi/v5/home
# - http://localhost:3000/th/v5/home
# - http://localhost:3000/id/v5/home

# Check:
# ✅ Pages load without errors
# ✅ i18n labels in correct language
# ✅ Dark mode toggle works
# ✅ Buttons and inputs interactive
# ✅ Responsive on mobile/tablet

pkill -f "next dev"
```

### Commit & Push
```bash
git add src/uiux-v5/ src/messages/ src/app/

git commit -m "fix(ui-v5): dark mode atoms + i18n navbar

- Add dark mode support to Button, Card, Input atoms
- Fix focus states and disabled states
- Integrate i18n into NavBar with 4 locales (en, vi, th, id)
- Create translation message files
- Update templates to pass locale prop to NavBar
- All 4 page routes functional in all locales
- Build: 0 errors, 0 warnings
"

git push origin fix/ui-v5-core
```

### Create PR (Optional)
```bash
gh pr create --base main --head fix/ui-v5-core \
  --title "Fix: UI V5 Dark Mode Atoms + i18n NavBar" \
  --body "Complete UI V5 component fixes with dark mode support and internationalization"
```

---

## Summary of Changes

| Component | Change | Lines |
|-----------|--------|-------|
| Button.tsx | Add dark mode + disabled | ~40 |
| Card.tsx | Add dark mode + shadows | ~15 |
| Input.tsx | Add dark mode + focus | ~30 |
| NavBar.tsx | Add useTranslations | ~20 |
| 4x Templates | Add locale prop | ~5 each |
| 4x Messages | Create translations | ~15 each |

**Total:** ~7 files modified/created, ~175 lines changed

---

## Key Points

✅ **Order Matters:** Phase 03 → Phase 01 → Phase 02 (MUST BE THIS ORDER)

✅ **Why:** Pages must exist before atoms are used; atoms must be fixed before i18n

✅ **Testing:** After each phase, run `npm run build` to verify no errors

✅ **Rollback:** If something breaks, `git reset --hard HEAD~1`

✅ **All Plans Ready:** Just need to execute via Gemini CLI

---

## Next Action

**For Gemini CLI:**
1. Read `plans/ui-v5-phase-03-plan.md`
2. Copy entire content
3. Execute in Gemini interactive mode
4. After completion, read and execute Phase 01
5. After completion, read and execute Phase 02
6. Report completion to Amp

**For Amp (Human):**
1. Monitor each phase in Gemini CLI
2. After each phase, verify: `npm run build`
3. If errors, report to Gemini with specific error
4. After all 3 phases, run Stage 3 verification
5. Commit and push to branch

---

**Last Updated:** Nov 18, 2025 22:40 UTC
**Status:** Ready for Stage 2 Execution
**Expected Completion:** ~1 hour total (5 + 30 + 15 + 10 min)

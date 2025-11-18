# UI V5 Fix Plans - Master Index

**Date Created:** Nov 18, 2025
**Status:** 🟢 Ready for Stage 2 Execution
**Total Plans:** 3 phases

---

## Overview

Three detailed execution plans for fixing UI V5 components:
- Phase 03: Restore & verify all 4 page routes
- Phase 01: Fix atom components (Button, Card, Input)
- Phase 02: Integrate i18n into NavBar

---

## Execution Order (CRITICAL)

### ✅ Phase 03: Restore Pages (5 min)
**File:** `plans/ui-v5-phase-03-plan.md`

**Tasks:**
- Verify all 4 pages exist and compile
- Test routes in all 4 locales
- Ensure build succeeds (0 errors)

**Execute:** FIRST (before Phase 01)

```bash
# Read and understand the plan:
cat plans/ui-v5-phase-03-plan.md

# Then execute in Gemini CLI:
gemini --prompt-interactive < plans/ui-v5-phase-03-plan.md
```

---

### ✅ Phase 01: Fix Atoms (30 min)
**File:** `plans/ui-v5-phase-01-plan.md`

**Tasks:**
- Add dark mode to Button.tsx
- Update Card.tsx for both themes
- Fix Input.tsx styling and focus states
- Verify all disabled states work

**Execute:** AFTER Phase 03

```bash
cat plans/ui-v5-phase-01-plan.md
gemini --prompt-interactive < plans/ui-v5-phase-01-plan.md
```

---

### ✅ Phase 02: NavBar i18n (15 min)
**File:** `plans/ui-v5-phase-02-plan.md`

**Tasks:**
- Add `useTranslations` to NavBar
- Create message files (en, vi, th, id)
- Translate all navigation labels
- Translate auth buttons
- Update templates to pass locale prop

**Execute:** AFTER Phase 01

```bash
cat plans/ui-v5-phase-02-plan.md
gemini --prompt-interactive < plans/ui-v5-phase-02-plan.md
```

---

## Quick Reference

### Files Modified (7 Total)

**Atoms:**
- `src/uiux-v5/atoms/Button.tsx` - Dark mode + disabled states
- `src/uiux-v5/atoms/Card.tsx` - Dark mode + shadows
- `src/uiux-v5/atoms/Input.tsx` - Dark mode + focus states

**Molecules:**
- `src/uiux-v5/molecules/NavBar.tsx` - Add useTranslations

**Templates:**
- `src/uiux-v5/templates/HomepageTemplate.tsx` - Pass locale
- `src/uiux-v5/templates/DashboardTemplate.tsx` - Pass locale
- `src/uiux-v5/templates/CalculatorTemplate.tsx` - Pass locale
- `src/uiux-v5/templates/SettingsTemplate.tsx` - Pass locale

**New Message Files:**
- `src/messages/en.json` - Create
- `src/messages/vi.json` - Create
- `src/messages/th.json` - Create
- `src/messages/id.json` - Create

---

## Testing After Each Phase

### Phase 03: Build Test
```bash
npm run build
# Expected: 0 errors, all routes compile
```

### Phase 01: Lint + Build
```bash
npm run lint src/uiux-v5/atoms/
npm run build
# Expected: 0 errors, 0 warnings
```

### Phase 02: Full Build + Dev Test
```bash
npm run build
npm run dev &
# Test routes:
# - http://localhost:3000/en/v5/home
# - http://localhost:3000/vi/v5/home
# - http://localhost:3000/th/v5/home
# - http://localhost:3000/id/v5/home
pkill -f "next dev"
```

---

## Final Verification (Stage 3)

After all 3 phases complete:

```bash
# Build check
npm run lint
npm run build
npm run test

# Browser test
npm run dev &

# Test all routes and locales
for locale in en vi th id; do
  for route in home dashboard calculator settings; do
    echo "Testing /$locale/v5/$route..."
    curl -s -I http://localhost:3000/$locale/v5/$route | head -1
  done
done

pkill -f "next dev"

# Commit
git add src/uiux-v5/ src/messages/ src/app/
git commit -m "fix(ui-v5): dark mode atoms + i18n navbar

- Add dark mode support to Button, Card, Input atoms
- Fix focus states and disabled states
- Integrate i18n into NavBar with 4 locales (en, vi, th, id)
- Create message files for all translations
- Update templates to pass locale prop
- All 4 page routes working in all locales
- Build: 0 errors, 0 warnings
"

git push origin fix/ui-v5-core
```

---

## Common Commands

| Command | Purpose |
|---------|---------|
| `npm run build` | Full build check |
| `npm run lint` | Lint check |
| `npm run dev` | Start dev server |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run E2E tests |

---

## Directory Structure

```
plans/
├── README.md                    # This file
├── ui-v5-phase-03-plan.md       # Restore pages
├── ui-v5-phase-01-plan.md       # Fix atoms
└── ui-v5-phase-02-plan.md       # NavBar i18n
```

---

## Notes

- **Order is Critical:** Must execute Phase 03 → Phase 01 → Phase 02
- **Why:** Pages must exist before atoms are used; atoms must be fixed before i18n
- **Testing:** After each phase, run `npm run build` to verify
- **Rollback:** If needed, `git reset --hard HEAD~1`

---

## Support

If any phase fails:
1. Check the specific error in the plan
2. Review the "Troubleshooting" section in that plan
3. Report exact error message with file path + line number
4. Gemini will fix and commit

---

**Ready to execute! Start with Phase 03 → Phase 01 → Phase 02**

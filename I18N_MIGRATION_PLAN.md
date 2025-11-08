# i18n Migration Plan - Page Consolidation

## Completed ✅

1. **Desktop Language Switcher** - Added to navbar.tsx
   - Now visible on both mobile AND desktop
   - Shows "🇻🇳 Việt Nam" and "🇺🇸 English" with flags
   
2. **Translation Files Expanded** - messages/en.json & messages/vi.json
   - Added 10 new sections (tools, dashboard, calculator, etc.)
   - All core SEED features covered

---

## Remaining Tasks

### Phase 1: Critical Pages (Must Move to /[locale]/)

```
Priority 1 - SEED Marketplace & Core:
├── /tools → /[locale]/tools ✅ (already localized)
├── /tools/[id] → /[locale]/tools/[id] ✅ (already localized)
├── /hang-soi → /[locale]/hang-soi ✅ (already localized)
│   └── Note: Remove /hang-soi root duplicate
└── /admin → /[locale]/admin ✅ (already localized)
    └── Note: Remove /admin root duplicate

Priority 2 - User Pages:
├── /profile → /[locale]/profile ✅ (already localized)
├── /payouts → /[locale]/payouts ✅ (already localized)
├── /referrals → /[locale]/referrals ✅ (already localized)
└── /faq → /[locale]/faq ✅ (already localized)

Priority 3 - Public Info Pages:
├── /calculator → /[locale]/calculator
├── /wall-of-fame → /[locale]/wall-of-fame
├── /how-it-works → /[locale]/how-it-works
├── /apex-pro → /[locale]/apex-pro ✅ (already localized)
└── /hang-soi (duplicate root) → /[locale]/hang-soi (consolidate)

Priority 4 - Dev/Support Pages (Can Stay Public or Deprecate):
├── /health → /[locale]/health (optional)
├── /monitoring → /[locale]/monitoring (optional)
├── /cicd → /[locale]/cicd (optional)
├── /analytics → /[locale]/analytics (optional)
├── /testing → /[locale]/testing (optional)
├── /gamification → /[locale]/gamification (optional)
└── /seed-dashboard → /[locale]/seed-dashboard (optional)
```

---

## Current State Analysis

### Already Localized ✅
```bash
ls -la src/app/\[locale\]/
├── page.tsx (redirects to dashboard)
├── dashboard/
├── admin/
├── profile/
├── referrals/
├── payouts/
├── tools/
├── faq/
├── hang-soi/
├── apex-pro/
└── concierge/
```

### Root Pages (Not Localized) ❌
```bash
src/app/
├── page.tsx (home - Vietnamese hardcoded)
├── calculator/page.tsx (no i18n)
├── wall-of-fame/page.tsx (no i18n)
├── how-it-works/page.tsx (no i18n)
├── hang-soi/page.tsx (DUPLICATE - should remove)
├── analytics/page.tsx (no i18n)
├── health/page.tsx (no i18n)
└── ... other dev pages
```

---

## Migration Strategy

### Option A: Create Localized Versions + Keep Root (300 Redirects)
- ✅ Better for SEO (uses 301 redirects)
- ✅ Backward compatible
- ❌ More file duplication
- **Effort**: 3-4 hours

### Option B: Move Files + Use Middleware Redirect (Simple)
- ✅ Cleaner codebase
- ✅ Faster implementation
- ❌ May affect existing links
- **Effort**: 1-2 hours

### Recommended: Hybrid Approach
1. Move critical pages to /[locale]/ (Option B)
2. Keep root pages as redirects (middleware)
3. Phase out dev pages over time

---

## Implementation Checklist

### Step 1: Move Pages (Automated)
```bash
# Create localized versions of root pages
mkdir -p src/app/\[locale\]/calculator
mkdir -p src/app/\[locale\]/wall-of-fame
mkdir -p src/app/\[locale\]/how-it-works

# Copy files (keep originals for now)
cp src/app/calculator/page.tsx src/app/\[locale\]/calculator/page.tsx
cp src/app/wall-of-fame/page.tsx src/app/\[locale\]/wall-of-fame/page.tsx
cp src/app/how-it-works/page.tsx src/app/\[locale\]/how-it-works/page.tsx
```

### Step 2: Update Metadata (Per Page)
- Add locale-aware SEO metadata
- Translate page titles
- Translate descriptions

### Step 3: Update Links
All links must use locale prefix:
```typescript
// OLD: href="/calculator"
// NEW: href={`/${locale}/calculator`}

// OLD: Link href="/dashboard"
// NEW: Link href={`/${locale}/dashboard`}
```

### Step 4: Update Navbar Links
- ✅ Already uses locale in navbar.tsx
- Verify all Link components use locale prefix

### Step 5: Remove Duplicates
```bash
# After all links updated:
rm src/app/hang-soi/page.tsx
rm src/app/admin/page.tsx
# But keep root /page.tsx as guest landing or redirect
```

### Step 6: Test
```bash
npm run build
npm run test:e2e
npm run lint
```

---

## Files to Modify (Next Steps)

### High Priority (SEED Critical)
1. [ ] src/app/[locale]/page.tsx - Create proper home page (not redirect)
2. [ ] src/app/page.tsx - Make guest landing or redirect to /vi/
3. [ ] src/app/[locale]/calculator/page.tsx - Create + update metadata
4. [ ] src/app/[locale]/wall-of-fame/page.tsx - Create + update metadata
5. [ ] src/app/[locale]/how-it-works/page.tsx - Create + update metadata
6. [ ] middleware.ts - Add 301 redirects for old paths (optional)

### Medium Priority
7. [ ] Update all navbar links to use locale prefix
8. [ ] Update all homepage links to use locale prefix
9. [ ] Remove duplicate pages (/hang-soi, /admin)

### Low Priority (Optional)
10. [ ] Migrate dev pages (/health, /monitoring, /cicd, etc.)
11. [ ] Add locale-aware sitemap.xml
12. [ ] Add locale-aware robots.txt

---

## Success Criteria

```
✓ All pages accessible from both /vi/ and /en/
✓ Desktop language switcher visible & working
✓ Mobile language switcher still working
✓ All text translated (UI + metadata)
✓ Old URLs redirect or show 404
✓ SEO metadata proper for each locale
✓ Build passes without errors
✓ E2E tests pass
✓ Linting passes
✓ SEED marketplace fully localized
```

---

## Time Estimate

- **Immediate (Done)**: Desktop language switcher + translations ✅
- **Today**: Move critical pages (2-3 hours)
- **This sprint**: Update all links (2-3 hours)
- **This sprint**: Testing & cleanup (1-2 hours)

**Total**: ~8-10 hours

---

## Next Actions

1. ✅ [DONE] Add desktop language switcher to navbar
2. ✅ [DONE] Expand translation files for all features
3. [TODO] Create /[locale]/calculator page
4. [TODO] Create /[locale]/wall-of-fame page
5. [TODO] Create /[locale]/how-it-works page
6. [TODO] Update src/app/[locale]/page.tsx (home page)
7. [TODO] Update all internal links to use locale prefix
8. [TODO] Test on both mobile and desktop
9. [TODO] Remove duplicate root pages
10. [TODO] Run full build & E2E tests

---

**Status**: Phase 1 Complete, Ready for Phase 2
**Author**: Amp (AI Agent)
**Date**: Nov 8, 2025

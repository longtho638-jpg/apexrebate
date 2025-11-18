# UI V5 Phase 03: Restore & Verify All Pages

**Execution Order: EXECUTE THIS FIRST (before Phase 01 & 02)**

---

## Overview

Restore and verify 4 page files for UI V5 routes:
- `src/app/[locale]/v5/home/page.tsx`
- `src/app/[locale]/v5/dashboard/page.tsx`
- `src/app/[locale]/v5/calculator/page.tsx`
- `src/app/[locale]/v5/settings/page.tsx`

All pages are already present and correct. Task is to verify they load properly and build succeeds.

---

## Current State (As Found)

### home/page.tsx ✅
```typescript
import HomepageTemplate from "@/uiux-v5/templates/HomepageTemplate";

export default async function HomeV5({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <HomepageTemplate locale={locale} />;
}
```
- ✅ Async function with params.locale
- ✅ Passes locale to template
- ✅ Status: READY

### dashboard/page.tsx ✅
```typescript
import DashboardTemplate from "@/uiux-v5/templates/DashboardTemplate";

export default async function DashboardV5({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const stats = { ... };
  const charts = { ... };
  return <DashboardTemplate locale={locale} stats={stats} charts={charts} />;
}
```
- ✅ Async function with params.locale
- ✅ Props passed correctly
- ✅ Status: READY

### calculator/page.tsx ✅
```typescript
import CalculatorTemplate from "@/uiux-v5/templates/CalculatorTemplate";

export default async function CalculatorV5({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <CalculatorTemplate locale={locale} />;
}
```
- ✅ Async function with params.locale
- ✅ Status: READY

### settings/page.tsx ✅
```typescript
import SettingsTemplate from "@/uiux-v5/templates/SettingsTemplate";

export default async function SettingsV5({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = { ... };
  return <SettingsTemplate locale={locale} user={user} />;
}
```
- ✅ Async function with params.locale
- ✅ Status: READY

---

## What Needs to Happen

### Step 1: Verify Build
```bash
npm run build
```

**Expected:** 0 errors, all routes compile

### Step 2: Check Routes in Dev Mode
```bash
npm run dev
```

**Expected:** Server starts on port 3000

### Step 3: Test Each Route
```bash
# In browser or curl:
curl -s http://localhost:3000/vi/v5/home | head -20
curl -s http://localhost:3000/vi/v5/dashboard | head -20
curl -s http://localhost:3000/vi/v5/calculator | head -20
curl -s http://localhost:3000/vi/v5/settings | head -20
```

**Expected:** All routes return HTML (no 404s or 500s)

---

## Success Criteria

- ✅ `npm run build` returns 0 errors, 0 warnings
- ✅ All 4 pages compile without issues
- ✅ Routes load in browser (vi, en, th, id locales)
- ✅ No missing template imports
- ✅ No TypeScript errors

---

## Implementation Steps (For AI to Execute)

### Step 1: Verify Files Exist
```bash
ls -la src/app/[locale]/v5/*/page.tsx
# Should show:
# - src/app/[locale]/v5/home/page.tsx
# - src/app/[locale]/v5/dashboard/page.tsx
# - src/app/[locale]/v5/calculator/page.tsx
# - src/app/[locale]/v5/settings/page.tsx
```

### Step 2: Check Templates Exist
```bash
ls -la src/uiux-v5/templates/
# Should show:
# - HomepageTemplate.tsx (with locale prop)
# - DashboardTemplate.tsx (with locale prop)
# - CalculatorTemplate.tsx (with locale prop)
# - SettingsTemplate.tsx (with locale prop)
```

### Step 3: Run Build
```bash
npm run build 2>&1 | tee phase-03-build.log
```

**If build fails:**
- Check error.log for specific errors
- Report line numbers and error messages
- Fix templates or page files as needed

### Step 4: Start Dev Server
```bash
npm run dev &
sleep 3  # Wait for server to start
```

### Step 5: Test Routes (curl)
```bash
for route in home dashboard calculator settings; do
  echo "Testing /vi/v5/$route..."
  curl -s -I http://localhost:3000/vi/v5/$route | head -1
done
```

**Expected:** All return `HTTP/2 200` or `HTTP/1.1 200`

### Step 6: Kill Dev Server
```bash
pkill -f "next dev"
```

---

## Troubleshooting

### If Build Fails
**Error:** `Module not found: Can't resolve '@/uiux-v5/templates/...'`
- **Fix:** Create missing template file or update import path
- **Template Location:** `src/uiux-v5/templates/[Name]Template.tsx`

### If Route Returns 404
**Error:** `http://localhost:3000/vi/v5/home → 404`
- **Fix:** Check Next.js routing configuration
- **Check:** `src/app/[locale]/v5/*/page.tsx` files exist

### If Type Errors
**Error:** `Type 'Promise<T>' is not assignable to type 'T'`
- **Fix:** Ensure page functions are `async` and `await params`
- **Pattern:** 
  ```typescript
  export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    return <Template locale={locale} />;
  }
  ```

---

## Test Commands

```bash
# Full test suite
npm run lint
npm run build
npm run dev &
sleep 2
curl -s http://localhost:3000/vi/v5/home | head -5
curl -s http://localhost:3000/vi/v5/dashboard | head -5
curl -s http://localhost:3000/vi/v5/calculator | head -5
curl -s http://localhost:3000/vi/v5/settings | head -5
pkill -f "next dev"
```

---

## After Phase 03 Complete

✅ Pages restore verified
✅ Routes working in all locales
✅ Build succeeds

**Next:** Execute `plans/ui-v5-phase-01-plan.md` (Fix Atoms)

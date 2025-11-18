# UI V5 Phase 01: Fix Atom Components

**Execution Order: EXECUTE AFTER Phase 03**

---

## Overview

Fix 3 core atom components:
1. `Button.tsx` - Dark mode, focus states, hover effects
2. `Card.tsx` - Spacing, shadows, border colors
3. `Input.tsx` - Border styles, focus states, placeholder colors

---

## Current Issues Analysis

### Button.tsx ⚠️

**Current Code:**
```typescript
const baseClasses = "font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

const variantClasses = clsx({
  "bg-teal text-midnight hover:bg-teal/90 focus:ring-teal": variant === "primary",
  "bg-gray-200 text-midnight hover:bg-gray-300 focus:ring-gray-300": variant === "secondary",
  "bg-transparent border border-teal text-teal hover:bg-teal hover:text-midnight focus:ring-teal": variant === "outline",
  "bg-transparent text-offWhite hover:bg-white/10 focus:ring-white/10": variant === "ghost",
});
```

**Issues Found:**
1. ❌ No dark mode support (hard-coded light colors)
2. ❌ Secondary variant uses `gray-200` (light) - needs dark mode
3. ❌ Ghost variant text color issues in dark mode
4. ❌ Focus ring offset may not be visible in dark theme
5. ❌ Missing disabled state styling
6. ❌ Hover states don't adapt to light/dark

**Required Fixes:**
- Add dark mode detection (via Tailwind dark: prefix)
- Update secondary variant for dark backgrounds
- Fix ghost variant to work in both themes
- Add disabled state
- Ensure focus rings are visible

**Fix Implementation:**
```typescript
const baseClasses = "font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-midnight dark:focus:ring-offset-offWhite disabled:opacity-50 disabled:cursor-not-allowed";

const variantClasses = clsx({
  "bg-teal dark:bg-teal/80 text-midnight dark:text-offWhite hover:bg-teal/90 dark:hover:bg-teal/70 focus:ring-teal": variant === "primary",
  
  "bg-gray-200 dark:bg-gray-700 text-midnight dark:text-offWhite hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-gray-400 dark:focus:ring-gray-500": variant === "secondary",
  
  "bg-transparent border border-teal dark:border-teal/60 text-teal dark:text-teal/80 hover:bg-teal/10 dark:hover:bg-teal/20 focus:ring-teal": variant === "outline",
  
  "bg-transparent text-offWhite hover:bg-white/10 dark:hover:bg-white/5 focus:ring-white/20": variant === "ghost",
});
```

---

### Card.tsx ⚠️

**Current Code:**
```typescript
return (
  <div className={clsx("bg-offWhite rounded-xl p-6 shadow-sm border border-white/10", className)}>
    {children}
  </div>
);
```

**Issues Found:**
1. ❌ `bg-offWhite` is always light (no dark mode)
2. ❌ `border-white/10` won't show in dark backgrounds
3. ❌ `shadow-sm` might be too subtle
4. ❌ No dark mode variant

**Required Fixes:**
- Add dark mode background (dark slate/gray)
- Fix border color for dark mode
- Adjust shadow for dark theme
- Support dark: prefix

**Fix Implementation:**
```typescript
return (
  <div className={clsx(
    "bg-offWhite dark:bg-slate-800 rounded-xl p-6 shadow-md dark:shadow-lg",
    "border border-gray-200 dark:border-gray-700",
    className
  )}>
    {children}
  </div>
);
```

---

### Input.tsx ⚠️

**Current Code:**
```typescript
className={clsx(
  "w-full px-4 py-3 bg-offWhite border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent text-midnight placeholder:text-textSecondary",
  className
)}
```

**Issues Found:**
1. ❌ `bg-offWhite` - no dark mode
2. ❌ `border-white/20` - won't show on light backgrounds
3. ❌ `text-midnight` - no dark mode
4. ❌ `placeholder:text-textSecondary` - undefined color
5. ❌ `focus:border-transparent` - removes border on focus (bad UX)

**Required Fixes:**
- Add dark mode background
- Fix border colors for both themes
- Fix text colors for both themes
- Add proper placeholder colors
- Keep border on focus (don't make transparent)
- Add disabled state styling

**Fix Implementation:**
```typescript
className={clsx(
  "w-full px-4 py-3",
  "bg-offWhite dark:bg-slate-900",
  "border border-gray-300 dark:border-gray-600",
  "rounded-lg transition-colors",
  "text-midnight dark:text-offWhite",
  "placeholder:text-gray-400 dark:placeholder:text-gray-500",
  "focus:outline-none focus:ring-2 focus:ring-teal focus:border-teal",
  "dark:focus:border-teal/60",
  "disabled:bg-gray-100 dark:disabled:bg-gray-800",
  "disabled:text-gray-400 dark:disabled:text-gray-600",
  "disabled:cursor-not-allowed",
  className
)}
```

---

## Success Criteria

After implementing fixes:
- ✅ Button looks correct in light theme
- ✅ Button looks correct in dark theme
- ✅ All 4 button variants work
- ✅ Disabled state is visible
- ✅ Focus states are clear
- ✅ Card background changes with theme
- ✅ Card border visible in both themes
- ✅ Input fields work in both themes
- ✅ Placeholders readable
- ✅ Focus rings visible
- ✅ `npm run build` passes

---

## Implementation Steps (For AI to Execute)

### Step 1: Update Button.tsx

Find the `variantClasses` and `baseClasses` sections. Replace with:

```typescript
// Add these lines to baseClasses:
const baseClasses = "font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-midnight dark:focus:ring-offset-offWhite disabled:opacity-50 disabled:cursor-not-allowed";

// Update variantClasses completely:
const variantClasses = clsx({
  "bg-teal dark:bg-teal/80 text-midnight dark:text-offWhite hover:bg-teal/90 dark:hover:bg-teal/70 focus:ring-teal": variant === "primary",
  "bg-gray-200 dark:bg-gray-700 text-midnight dark:text-offWhite hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-gray-400 dark:focus:ring-gray-500": variant === "secondary",
  "bg-transparent border border-teal dark:border-teal/60 text-teal dark:text-teal/80 hover:bg-teal/10 dark:hover:bg-teal/20 focus:ring-teal": variant === "outline",
  "bg-transparent text-offWhite hover:bg-white/10 dark:hover:bg-white/5 focus:ring-white/20": variant === "ghost",
});
```

### Step 2: Update Card.tsx

Replace the className with:

```typescript
return (
  <div className={clsx(
    "bg-offWhite dark:bg-slate-800 rounded-xl p-6 shadow-md dark:shadow-lg",
    "border border-gray-200 dark:border-gray-700",
    className
  )}>
    {children}
  </div>
);
```

### Step 3: Update Input.tsx

Replace the className in Input field with:

```typescript
className={clsx(
  "w-full px-4 py-3",
  "bg-offWhite dark:bg-slate-900",
  "border border-gray-300 dark:border-gray-600",
  "rounded-lg transition-colors",
  "text-midnight dark:text-offWhite",
  "placeholder:text-gray-400 dark:placeholder:text-gray-500",
  "focus:outline-none focus:ring-2 focus:ring-teal focus:border-teal",
  "dark:focus:border-teal/60",
  "disabled:bg-gray-100 dark:disabled:bg-gray-800",
  "disabled:text-gray-400 dark:disabled:text-gray-600",
  "disabled:cursor-not-allowed",
  className
)}
```

### Step 4: Verify Build

```bash
npm run build
```

**Expected:** 0 errors, 0 warnings

### Step 5: Test in Browser

```bash
npm run dev &
```

Then test:
- `http://localhost:3000/vi/v5/home` - Check button styling
- Toggle dark mode - Check all variants
- Test input fields - Check focus states
- Test card appearance - Check shadows and borders

```bash
pkill -f "next dev"
```

---

## Test Commands

```bash
# Check syntax
npm run lint src/uiux-v5/atoms/

# Build with specific target
npm run build

# Run type check
npm run type-check

# Run in dev and test
npm run dev &
sleep 2
# Manual testing in browser
pkill -f "next dev"
```

---

## Common Issues & Solutions

### Issue 1: Dark mode not working
**Symptom:** Dark mode classes don't apply
**Check:** Ensure `tailwind.config.ts` has `darkMode: 'class'` enabled
**Fix:** May need to add dark: prefix to all variant definitions

### Issue 2: Focus ring not visible
**Symptom:** Can't see focus state when tabbing
**Check:** Ring color might be same as background
**Fix:** Use contrasting color: `focus:ring-teal` for primary

### Issue 3: Disabled state not obvious
**Symptom:** Disabled buttons look the same as enabled
**Fix:** Add `disabled:opacity-50` or `disabled:bg-gray-300`

### Issue 4: Build fails with unknown utility
**Symptom:** `Unknown utility 'dark:...'`
**Fix:** Check Tailwind CSS version supports dark mode

---

## Files to Modify

1. `src/uiux-v5/atoms/Button.tsx` - ~40 lines
2. `src/uiux-v5/atoms/Card.tsx` - ~15 lines
3. `src/uiux-v5/atoms/Input.tsx` - ~30 lines

---

## After Phase 01 Complete

✅ All atoms have dark mode support
✅ Focus states are visible
✅ Disabled states are styled
✅ Build passes with 0 errors

**Next:** Execute `plans/ui-v5-phase-02-plan.md` (NavBar i18n)

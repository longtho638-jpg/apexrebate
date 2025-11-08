# 🌐 I18N Deep Fix Report - Tiếng Anh/Tiếng Việt Lộn Xộn

**Status**: 🔍 **DEEP SCAN COMPLETE - ISSUES IDENTIFIED**  
**Date**: Nov 8, 2025  
**Severity**: 🔴 HIGH (UX breaking bug)

---

## 📊 Issues Found

### 1. **CRITICAL: Hardcoded English Text in Navbar**

**File**: `src/components/navbar.tsx`

| Line | Hardcoded Text | Should Use |
|------|----------------|-----------|
| 178  | `Dashboard` | `t('navigation.dashboard')` |
| 215  | `Profile` | `t('navigation.profile')` |
| 221  | `Payouts` | Should add to messages |
| 227  | `Referrals` | `t('navigation.referrals')` |
| 236  | `Admin Panel` | `t('navigation.admin')` |
| 244  | `Log out` | Should be `t('navigation.signOut')` |

**Impact**: Users switching to Vietnamese see mixed English/Vietnamese text in the navbar.

---

### 2. **CRITICAL: Duplicate Message Files**

**Issue**: Two separate message file locations causing conflicts:
- `/messages/en.json` & `/messages/vi.json` (root level)
- `/src/messages/en.json` & `/src/messages/vi.json` (src level)

**Problem**: next-intl is loading from one location, but pages might reference the other.

**Solution**: Keep only `/src/messages/` (next-intl convention), delete root `/messages/`

---

### 3. **CRITICAL: Language Switching Logic Bug**

**File**: `src/components/ui/language-switcher.tsx` (lines 24-31)

```typescript
const pathWithoutLocale = currentPath.replace(/^\/(vi|en)/, '')
const newPath = newLocale === 'vi' ? pathWithoutLocale || '/' : `/en${pathWithoutLocale || '/'}`
```

**Problem**: 
- Uses `window.location.pathname` (client-side) instead of `usePathname()`
- Regex doesn't handle root path `/` correctly
- Doesn't preserve query parameters

**Expected**: 
- `/en/dashboard` → switch to VI → `/dashboard`
- `/en/dashboard?tab=overview` → switch to VI → `/dashboard?tab=overview`
- `/dashboard` → switch to EN → `/en/dashboard`

---

### 4. **CRITICAL: Navbar Language Switcher Conflicts**

**Files**: Two different language switchers with different logic:

1. **Desktop (navbar.tsx line 154-163)**: Uses `<Select>` with `handleLanguageChange`
   - Removes locale prefix but doesn't handle `/` root
   
2. **Mobile (navbar.tsx - check further)**:  Might have different logic

3. **Separate Component (language-switcher.tsx)**: Dropdown with `switchLocale`
   - Uses `window.location.pathname`
   - More buggy logic

**Problem**: Inconsistent behavior between desktop/mobile language switching

---

### 5. **ISSUE: Missing Translation Keys**

Messages that should be added:
- `navigation.payouts`
- `navigation.adminPanel` 
- `navigation.logOut` (currently just uses hardcoded text)

---

### 6. **ISSUE: Locale Detection in Navbar Hardcoded Links**

Some links hardcode locale prefix:
- Line 139: `href={`/${locale}/tools`}` ✅ (correct)
- Line 143: `href={`/${locale}/faq`}` ✅ (correct)
- Line 176: `href={`/${locale}/dashboard`}` ✅ (correct)

But others don't:
- Line 129: `href="/calculator"` ❌ (missing locale!)
- Line 132: `href="/wall-of-fame"` ❌ (missing locale!)
- Line 146: `href="/how-it-works"` ❌ (missing locale!)

**Impact**: These links go to Vietnamese (default) even when user selected English.

---

## 🔧 Fix Implementation Plan

### Phase 1: Consolidate Message Files
1. Delete `/messages/` directory
2. Keep `/src/messages/` only
3. Update `next-intl.config.ts` to reference correct path

### Phase 2: Fix Hardcoded Text in Navbar
1. Replace all hardcoded English text with `t()` calls
2. Add missing translation keys to messages

### Phase 3: Fix Locale-Aware Links
1. Add `locale` variable to all href paths
2. Ensure consistency across navbar

### Phase 4: Fix Language Switcher Logic
1. Consolidate into single component
2. Use `usePathname()` hook properly
3. Preserve query parameters
4. Handle root path `/` correctly

### Phase 5: Testing
1. Test language switching on all pages
2. Verify no mixed language text
3. Test with query parameters
4. Test mobile and desktop separately

---

## 🚀 Expected Outcome

**Before Fix**:
```
EN: /en/dashboard → Switch VI → Shows: "Bảng điều khiển | Dashboard | Payouts | Admin Panel"
                                      (Mixed VI+EN - BROKEN)
```

**After Fix**:
```
EN: /en/dashboard → Switch VI → Shows: "Bảng điều khiển | Hồ sơ | Thanh toán | Bảng điều khiển quản trị"
                                      (All VI - CORRECT)
VI: /dashboard → Switch EN → Shows: "/en/dashboard | Profile | Payouts | Admin Panel"
                                   (All EN - CORRECT)
```

---

## 📋 Files to Modify

- [ ] Delete `/messages/en.json` + `/messages/vi.json`
- [ ] Update `src/components/navbar.tsx`
- [ ] Update `src/messages/en.json` (add missing keys)
- [ ] Update `src/messages/vi.json` (add missing keys)
- [ ] Update `src/components/ui/language-switcher.tsx`
- [ ] Verify middleware.ts routes are correct
- [ ] Test all pages

---

## ⏱️ Estimated Fix Time

- Consolidate files: 5 min
- Fix navbar text: 10 min
- Fix links: 5 min
- Fix language switcher: 15 min
- Testing & verification: 10 min
- **Total**: ~45 min


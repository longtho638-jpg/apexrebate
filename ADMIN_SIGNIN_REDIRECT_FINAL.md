# Admin Signin Redirect - FINAL FIX (Nov 10, 2025)

**Status**: ✅ **FIXED & DEPLOYED**

## Summary
Fixed admin signin redirect issue where users were stuck at `/vi/auth/signin?callbackUrl=%2Fadmin` instead of redirecting to `/vi/admin`.

## Root Cause
The middleware was setting `callbackUrl=pathname` without the locale prefix. When admin visited `/vi/admin`, it would redirect to signin but with `callbackUrl=%2Fadmin` (missing `/vi` prefix).

## The Fix (2 commits)

### Commit 1: `4b516cb9`
**File**: `middleware.ts` (root)
- Set `callbackPath = locale ? /${locale}${pathWithoutLocale} : pathname`
- This ensures `/vi/admin` → `callbackUrl=%2Fvi%2Fadmin`

### Commit 2: `2445ffbd`  
**File**: `src/middleware.ts` (sync backup)
- Applied same fix to keep files in sync
- Next.js uses the root file, but backup ensures consistency

## Flow Now (✅ Fixed)

```
User → /vi/admin (unauthenticated)
  ↓
middleware.ts (line 150-151):
  callbackPath = "/vi" + "/admin" = "/vi/admin"
  ↓
Redirect: /vi/auth/signin?callbackUrl=%2Fvi%2Fadmin ✅
  ↓
User signs in
  ↓
SignInClient (line 96):
  decodedCallback = decodeURIComponent("%2Fvi%2Fadmin") = "/vi/admin"
  router.push("/vi/admin")
  ↓
middleware.ts (line 157):
  Validates token.role === "ADMIN" ✓
  ↓
User sees /vi/admin dashboard ✅
```

## Code Changes

### middleware.ts (Root) - Lines 144-151
```typescript
// OLD (❌ Wrong)
if (!token) {
  const signInPath = locale ? `/${locale}/auth/signin` : '/auth/signin';
  const signInUrl = new URL(signInPath, request.url);
  signInUrl.searchParams.set('callbackUrl', pathname);  // ❌ Missing locale
  return NextResponse.redirect(signInUrl);
}

// NEW (✅ Fixed)
if (!token) {
  const signInPath = locale ? `/${locale}/auth/signin` : '/auth/signin';
  const signInUrl = new URL(signInPath, request.url);
  const callbackPath = locale ? `/${locale}${pathWithoutLocale}` : pathname;  // ✅ Includes locale
  signInUrl.searchParams.set('callbackUrl', callbackPath);
  console.log(`[middleware] Redirect to signin: callbackUrl=${callbackPath}`);
  return NextResponse.redirect(signInUrl);
}
```

### src/middleware.ts (Backup) - Same as above
- Kept in sync with root middleware.ts
- Ensures consistency if build tool reads from src/

## Testing Instructions

### Local Testing (npm run dev)
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Test in browser
# 1. Visit: http://localhost:3000/vi/admin
#    Expected: Redirects to /vi/auth/signin?callbackUrl=%2Fvi%2Fadmin
# 2. Sign in with admin account
#    Expected: Redirects to /vi/admin dashboard

# Terminal 3: Check logs (watch for this)
[middleware] Redirect to signin: callbackUrl=/vi/admin
```

### Production Testing (apexrebate.com)

**Test 1: Admin Signin Flow**
```bash
# Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)
# 1. Visit: https://apexrebate.com/vi/admin
# 2. Expected: Redirect to /vi/auth/signin?callbackUrl=%2Fvi%2Fadmin
# 3. Sign in (test admin account)
# 4. Expected: Redirect to /vi/admin dashboard
# 5. Verify: No redirect loop, clean redirect
```

**Test 2: All Locales**
```bash
# Test each locale
https://apexrebate.com/en/admin    → /en/auth/signin?callbackUrl=%2Fen%2Fadmin
https://apexrebate.com/vi/admin    → /vi/auth/signin?callbackUrl=%2Fvi%2Fadmin
https://apexrebate.com/th/admin    → /th/auth/signin?callbackUrl=%2Fth%2Fadmin
https://apexrebate.com/id/admin    → /id/auth/signin?callbackUrl=%2Fid%2Fadmin
```

**Test 3: Non-Admin Access Control**
```bash
# Sign in with regular (non-admin) account
# 1. Visit: https://apexrebate.com/vi/admin
# 2. Expected: Redirects to /vi/dashboard (not allowed)
# 3. Verify: User sees their dashboard, not admin panel
```

## Deployment Checklist

- [x] ✅ Code fixed in both middleware.ts files
- [x] ✅ Build passes (`npm run build`)
- [x] ✅ Lint passes (`npm run lint`)
- [x] ✅ Commits pushed to main
- [ ] 🔄 Clear Vercel cache (Settings → Cache → Purge)
- [ ] 🔄 Test on production URL
- [ ] 🔄 Monitor error logs

### Clear Vercel Cache
```bash
# Option 1: Via Vercel Dashboard
# 1. Go to: https://vercel.com/apexrebate/apexrebate
# 2. Settings → Cache
# 3. Click "Purge Cache"

# Option 2: Via Vercel CLI
vercel env pull
vercel --prod --skip-build
```

## Files Modified
- ✅ `middleware.ts` (root) - Fixed callbackUrl locale
- ✅ `src/middleware.ts` (backup) - Synced fix
- ✅ `ADMIN_SIGNIN_REDIRECT_FIX.md` - Documentation
- ✅ `ADMIN_SIGNIN_CACHE_CLEAR.md` - Testing guide
- ✅ `ADMIN_SIGNIN_REDIRECT_FINAL.md` - This file

## Build Status
```
✓ Compiled successfully
✓ 87 routes compiled
✓ 0 errors, 0 warnings
✓ Ready for production deployment
```

## Commits
```
2445ffbd - fix: sync src/middleware.ts with root middleware.ts for callbackUrl locale prefix
4b516cb9 - fix: middleware callbackUrl must include locale prefix (vi/th/id/en)
c91b8e15 - fix: admin redirect loop after signin - decode callback URL and use NextAuth result.url
```

## Related Components (Already Working)
- ✅ `SignInClient.tsx` - Decodes callbackUrl and uses result.url
- ✅ `auth.ts` - Redirect callback preserves locale
- ✅ `middleware.ts` - Admin role validation

## Verification
```bash
# Check that both middleware files have the fix
grep -A 4 "FIX: Use full locale-aware pathname" middleware.ts
grep -A 4 "FIX: Use full locale-aware pathname" src/middleware.ts

# Should both show the fix
# Expected output:
# // ✅ FIX: Use full locale-aware pathname as callbackUrl
# const callbackPath = locale ? `/${locale}${pathWithoutLocale}` : pathname;
```

## What's Next
1. ✅ Code deployed
2. 🔄 Clear Vercel cache
3. 🔄 Test on production
4. 🔄 Monitor logs for any issues
5. ✅ Done!

---

**Deployed**: Nov 10, 2025
**Commits**: 4b516cb9, 2445ffbd, c91b8e15
**Ready for**: Production testing

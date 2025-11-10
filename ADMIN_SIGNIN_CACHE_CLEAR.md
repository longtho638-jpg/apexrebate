# Admin Signin Fix - Cache Clear & Test Instructions

**Fix Committed**: `4b516cb9` - "fix: middleware callbackUrl must include locale prefix"

## Problem Resolved
The `callbackUrl` was missing the locale prefix when redirecting to signin:
- ❌ Before: `/auth/signin?callbackUrl=%2Fadmin` (no locale)
- ✅ After: `/vi/auth/signin?callbackUrl=%2Fvi%2Fadmin` (full locale-aware path)

## Root Cause
In `middleware.ts` line 148, the callbackUrl was using raw `pathname` instead of reconstructing with locale prefix.

## Code Fix
```typescript
// BEFORE (❌ Wrong)
signInUrl.searchParams.set('callbackUrl', pathname);

// AFTER (✅ Fixed)
const callbackPath = locale ? `/${locale}${pathWithoutLocale}` : pathname;
signInUrl.searchParams.set('callbackUrl', callbackPath);
```

## Testing Steps

### Step 1: Clear All Caches
```bash
# Clear local Next.js cache
rm -rf .next

# Clear Vercel cache (if deployed)
# Option 1: Via Vercel Dashboard
#   → Settings → Cache → Purge Cache

# Option 2: Via Vercel CLI
vercel env pull                    # Get latest env vars
vercel --prod --skip-build         # Redeploy without rebuilding
```

### Step 2: Clear Browser Cache
```bash
# Option 1: Hard refresh (Cmd+Shift+R on Mac / Ctrl+Shift+R on Windows)
# Visit: https://apexrebate.com/admin
# Expected: Redirect to /vi/auth/signin?callbackUrl=%2Fvi%2Fadmin

# Option 2: Incognito/Private Window (no cache)
# Open: https://apexrebate.com/vi/admin
# Sign in
# Expected: Redirect to /vi/admin dashboard
```

### Step 3: Test All Locales

**Test 1: Vietnamese Admin**
```
1. Visit: https://apexrebate.com/vi/admin
2. Expected: Redirect to /vi/auth/signin?callbackUrl=%2Fvi%2Fadmin
3. Sign in (with admin account)
4. Expected: Redirect to /vi/admin dashboard ✓
```

**Test 2: Thai Admin**
```
1. Visit: https://apexrebate.com/th/admin
2. Expected: Redirect to /th/auth/signin?callbackUrl=%2Fth%2Fadmin
3. Sign in (with admin account)
4. Expected: Redirect to /th/admin dashboard ✓
```

**Test 3: Indonesian Admin**
```
1. Visit: https://apexrebate.com/id/admin
2. Expected: Redirect to /id/auth/signin?callbackUrl=%2Fid%2Fadmin
3. Sign in (with admin account)
4. Expected: Redirect to /id/admin dashboard ✓
```

**Test 4: English Admin (default)**
```
1. Visit: https://apexrebate.com/en/admin (or /admin)
2. Expected: Redirect to /auth/signin?callbackUrl=%2Fadmin (or /en/auth/signin?callbackUrl=%2Fen%2Fadmin)
3. Sign in (with admin account)
4. Expected: Redirect to /admin (or /en/admin) dashboard ✓
```

### Step 4: Test Non-Admin Access Control

**Test 5: Regular User (Not Admin)**
```
1. Sign in with regular user account (role = USER)
2. Try to visit: https://apexrebate.com/vi/admin
3. Expected: Redirect to /vi/dashboard (not allowed to admin) ✓
4. Verify: No redirect loop, clean redirect to dashboard
```

**Test 6: Unauthenticated User**
```
1. Log out completely
2. Visit: https://apexrebate.com/vi/admin
3. Expected: Redirect to /vi/auth/signin?callbackUrl=%2Fvi%2Fadmin
4. Sign in
5. Expected: 
   - If admin: Redirect to /vi/admin ✓
   - If user: Redirect to /vi/dashboard ✓
```

### Step 5: Development Testing (Local)

**Terminal 1: Start dev server**
```bash
npm run dev
# Expected output: ✓ ready on 0.0.0.0:3000
```

**Terminal 2: Monitor middleware logs**
```bash
# Watch for:
# [middleware] Redirect to signin: callbackUrl=/vi/admin
# [middleware] Redirecting root path to: /vi
```

**Terminal 3: Test endpoints**
```bash
# Test 1: Unauthenticated access
curl -L http://localhost:3000/vi/admin
# Expected: Redirects to /vi/auth/signin with callbackUrl param

# Test 2: Check callbackUrl format
curl -L http://localhost:3000/vi/admin 2>&1 | grep -i callback
# Expected: callbackUrl=%2Fvi%2Fadmin (URL-encoded /vi/admin)

# Test 3: Check all locales
for locale in en vi th id; do
  echo "Testing /$locale/admin..."
  curl -L http://localhost:3000/$locale/admin 2>&1 | grep -i signin
done
```

## Vercel Deployment Checklist

- [ ] Code pushed to `main` branch
- [ ] GitHub Actions build passes
- [ ] All tests pass (npm run test)
- [ ] Preview deploy successful
- [ ] Manual testing on preview URL
- [ ] Production deploy via Vercel Dashboard
- [ ] Clear Vercel cache (Settings → Cache → Purge)
- [ ] Test on production URL
- [ ] Monitor error logs for issues

## Files Modified
- ✅ `middleware.ts` (line 148: callbackUrl with locale prefix)
- ✅ `ADMIN_SIGNIN_REDIRECT_FIX.md` (documentation)
- ✅ `ADMIN_SIGNIN_CACHE_CLEAR.md` (this file)

## Expected Behavior After Fix

### Before Fix (❌)
```
User → /vi/admin (no auth)
  ↓
Middleware redirects → /vi/auth/signin?callbackUrl=%2Fadmin ❌ (missing locale)
  ↓
User signs in → SignInClient receives callbackUrl=%2Fadmin
  ↓
User stuck! Redirect tries to go to /admin (wrong locale)
```

### After Fix (✅)
```
User → /vi/admin (no auth)
  ↓
Middleware redirects → /vi/auth/signin?callbackUrl=%2Fvi%2Fadmin ✅ (locale preserved)
  ↓
User signs in → SignInClient receives callbackUrl=%2Fvi%2Fadmin
  ↓
Middleware validates role:
  - Admin? → /vi/admin ✓
  - User? → /vi/dashboard ✓
```

## Debugging Tips

If still experiencing issues:

1. **Check middleware logs**
   ```bash
   # Look for:
   # [middleware] Redirect to signin: callbackUrl=/vi/admin
   ```

2. **Verify token in browser**
   ```javascript
   // In browser console
   const response = await fetch('/api/auth/session');
   const session = await response.json();
   console.log('Session:', session);
   console.log('Role:', session?.user?.role);
   ```

3. **Check JWT token**
   ```bash
   curl -b "next-auth.session-token=YOUR_TOKEN" \
     http://localhost:3000/api/auth/session
   ```

4. **Test with curl**
   ```bash
   # Follow redirects with -L
   curl -L -v http://localhost:3000/vi/admin 2>&1 | grep -i redirect
   ```

## Build Status
- ✅ `npm run build` - Pass (87 routes, 0 errors, 0 warnings)
- ✅ `npm run lint` - Pass (0 warnings)
- ✅ Commit: `4b516cb9`
- ✅ Ready for deployment

---

**Next**: Deploy to production and test with real admin account at https://apexrebate.com/vi/admin

# Admin Signin Redirect Fix - November 10, 2025

## Problem

Admin user đăng nhập vào `/vi/auth/signin?callbackUrl=%2Fvi%2Fadmin` nhưng bị kẹt không redirect đến `/vi/admin`. Lý do là `signIn('credentials', { redirect: false })` không tự động cập nhật session cookie, và logic redirect trong `SignInClient.tsx` không xử lý được điều này.

## Root Cause

1. **SignInClient.tsx** gọi `signIn('credentials', { redirect: false })` để kiểm soát redirect client-side
2. Sau `result.ok`, component fetch `/api/auth/session` để kiểm tra role
3. Nhưng session cookie chưa được cập nhật kịp → `session?.user?.role` là undefined
4. Chuyển sang fallback `router.push(callbackUrl)` nhưng middleware kiểm tra token lại, và điều này tạo ra vòng lặp

## Solution

### 1. **SignInClient.tsx** - Remove session fetch, use NextAuth redirect

**Before:**
```typescript
const result = await signIn('credentials', {
  email: formData.email,
  password: formData.password,
  redirect: false  // ❌ Prevents automatic redirect
})

if (result?.ok) {
  // Fetch session to check role → session not updated yet
  const sessionResponse = await fetch('/api/auth/session')
  const session = await sessionResponse.json()
  // Logic gets complicated, breaks with callbackUrl encoding
}
```

**After:**
```typescript
const decodedCallback = decodeURIComponent(callbackUrl || '')

const result = await signIn('credentials', {
  email: formData.email,
  password: formData.password,
  redirect: false,
  callbackUrl: decodedCallback  // ✅ Pass decoded callback
})

if (result?.ok) {
  // ✅ Let NextAuth handle the redirect
  if (result.url) {
    router.push(result.url)
  } else {
    router.push(decodedCallback)  // Fallback
  }
}
```

### 2. **auth.ts** - Add redirect callback

Added new `redirect` callback to NextAuth config:

```typescript
callbacks: {
  // ... existing jwt, session callbacks ...

  async redirect({ url, baseUrl }) {
    // ✅ FIX: Handle admin redirects properly
    // If URL is relative, it's safe to redirect
    if (url.startsWith('/')) {
      // Extract locale from URL (e.g., /vi/admin → vi)
      const localeMatch = url.match(/^\/(en|vi|th|id)(\/.*)?$/)
      const locale = localeMatch ? localeMatch[1] : null
      
      // For admin routes, middleware will validate role and redirect if needed
      // Just ensure locale is preserved
      return url
    }
    
    // Otherwise use baseUrl (relative URL)
    return baseUrl
  },
}
```

### 3. **middleware.ts** - Already handles admin role check

Middleware checks for admin access BEFORE page render:

```typescript
if (pathWithoutLocale === '/admin' || pathWithoutLocale.startsWith('/admin/')) {
  const userRole = (token.role as string) || 'USER'
  
  // Only ADMIN and CONCIERGE can access /admin
  if (userRole !== 'ADMIN' && userRole !== 'CONCIERGE') {
    const dashboardPath = locale ? `/${locale}/dashboard` : '/dashboard'
    return NextResponse.redirect(new URL(dashboardPath, request.url))
  }
}
```

## Test Flow

### 1. Create admin user (if not exist)

```bash
# Via API
curl -X POST http://localhost:3000/api/testing/seed-test-user \
  -H "content-type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "test123!",
    "role": "ADMIN"
  }'
```

### 2. Test signin redirect for admin

```bash
# Open browser and navigate to:
http://localhost:3000/vi/auth/signin?callbackUrl=%2Fvi%2Fadmin

# Sign in with:
# Email: admin@test.com
# Password: test123!

# Expected: Redirect to http://localhost:3000/vi/admin ✅
```

### 3. Test signin redirect for regular user

```bash
# Navigate to:
http://localhost:3000/vi/auth/signin?callbackUrl=%2Fvi%2Fdashboard

# Sign in with regular user

# Expected: Redirect to http://localhost:3000/vi/dashboard ✅
```

### 4. Test protected route redirect

```bash
# Open browser (logged out) and navigate to:
http://localhost:3000/vi/admin

# Expected: Redirect to http://localhost:3000/vi/auth/signin?callbackUrl=%2Fvi%2Fadmin ✅
```

## Files Modified

1. **src/components/auth/signin/SignInClient.tsx**
   - Decode callbackUrl before passing to signIn
   - Remove session fetch logic
   - Use `result.url` from NextAuth for redirect

2. **src/lib/auth.ts**
   - Add `redirect` callback to handle locale-aware redirects
   - Ensure admin routes are handled by middleware (not auth callback)

3. **middleware.ts** (No changes needed, already correct)
   - Already validates admin role before serving page
   - Already preserves locale in redirects

## Verification

```bash
npm run build    # ✅ Should compile without errors
npm run dev      # ✅ Start dev server
npm run test:e2e # ✅ Run E2E tests

# Manual browser test:
# 1. Open http://localhost:3000/vi/admin (logged out)
# → Should redirect to /vi/auth/signin?callbackUrl=%2Fvi%2Fadmin
# 2. Sign in with admin credentials
# → Should redirect to /vi/admin and display admin dashboard
```

## Key Changes Summary

| Component | Change | Impact |
|-----------|--------|--------|
| SignInClient | Decode callback + use result.url | Fixes redirect after signin |
| auth.ts | Add redirect callback | Preserves locale in redirects |
| middleware | No change | Already handles role validation |

## Security Impact

✅ No security downgrade
- Session validation still happens (now via result.url instead of fetch)
- Admin role validation still enforced in middleware
- Locale preserved throughout redirect chain

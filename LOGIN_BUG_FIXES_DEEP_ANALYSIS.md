# 🔐 LOGIN BUG FIXES - Deep Analysis (User & Admin)

## 🐛 Issues Found

### 1. **Missing Admin Route Protection at Middleware Level**
**File:** `middleware.ts` (line 79)
**Problem:** Admin route check is case-sensitive and incomplete
```typescript
if (pathWithoutLocale.includes('/admin')) {
  if (token.role !== 'ADMIN' && token.role !== 'CONCIERGE') {
```
**Issue:** Doesn't properly protect `/admin` routes for non-authenticated users during redirect

### 2. **Role Not Properly Attached in JWT Callback**
**File:** `src/lib/auth.ts` (line 55-59)
**Problem:** JWT callback doesn't handle initial `user` object properly
```typescript
async jwt({ token, user }) {
  if (user) {
    token.role = user.role
  }
  return token
}
```
**Issue:** On subsequent requests, `user` is null, so role can be lost. Need to preserve role in token properly.

### 3. **Session Callback Doesn't Validate Role Type**
**File:** `src/lib/auth.ts` (line 61-66)
**Problem:** Session callback casts token.role without validation
```typescript
async session({ session, token }) {
  if (token) {
    session.user.id = token.sub!
    session.user.role = token.role as string  // ⚠️ Could be undefined
  }
  return session
}
```
**Issue:** If token.role is undefined, session.user.role will be undefined

### 4. **Admin Page Redirect Logic Issue**
**File:** `src/app/admin/page.tsx` (line 25)
**Problem:** After signin redirect with locale, callback URL might not work correctly
```typescript
if (session.user.role !== 'ADMIN' && session.user.role !== 'CONCIERGE') {
  redirect('/dashboard');  // ❌ Should be locale-aware
}
```
**Issue:** Non-locale-aware redirect when user should be sent to their locale-specific dashboard

### 5. **SignInClient Doesn't Handle Admin Role Redirect**
**File:** `src/app/auth/signin/SignInClient.tsx` (line 28, 74)
**Problem:** All users redirected to `/dashboard` regardless of role
```typescript
const callbackUrl = '/dashboard'
...
if (result?.ok) {
  router.push(callbackUrl)  // ❌ Doesn't check role
}
```
**Issue:** Admins should redirect to `/admin`, not `/dashboard`

### 6. **Database Query for User Missing Role Eager Load**
**File:** `src/lib/auth.ts` (line 27-29)
**Problem:** Prisma query doesn't explicitly select role
```typescript
const user = await db.users.findUnique({
  where: { email: credentials.email }
})
```
**Issue:** If role field is missed or null, authentication proceeds without proper role assignment

---

## ✅ FIXES IMPLEMENTATION

### Fix 1: Enhanced JWT Callback with Role Preservation
```typescript
async jwt({ token, user, trigger, session }) {
  if (user) {
    // Initial login
    token.role = user.role || 'USER'
    token.id = user.id
    token.email = user.email
  } else if (trigger === 'update' && session) {
    // Handle session updates
    token.role = session.role || token.role || 'USER'
  }
  // Ensure role always exists
  if (!token.role) {
    token.role = 'USER'
  }
  return token
}
```

### Fix 2: Enhanced Session Callback with Validation
```typescript
async session({ session, token }) {
  if (token && session.user) {
    session.user.id = token.sub || token.id as string
    session.user.role = (token.role as string) || 'USER'
    
    // Validate role is a valid enum
    const validRoles = ['USER', 'ADMIN', 'CONCIERGE']
    if (!validRoles.includes(session.user.role)) {
      session.user.role = 'USER'
    }
  }
  return session
}
```

### Fix 3: Explicit Role Selection in Credentials Provider
```typescript
const user = await db.users.findUnique({
  where: { email: credentials.email },
  select: {
    id: true,
    email: true,
    name: true,
    password: true,
    role: true,  // ✅ Explicit selection
    emailVerified: true
  }
})
```

### Fix 4: Smart Redirect Based on Role in SignInClient
```typescript
const handleSubmit = async (e: React.FormEvent, isTwoFactorStep: boolean = false) => {
  e.preventDefault()
  setLoading(true)
  setError('')

  try {
    const result = await signIn('credentials', {
      email: formData.email,
      password: formData.password,
      twoFactorCode: isTwoFactorStep ? formData.twoFactorCode : undefined,
      redirect: false
    })

    if (result?.error) {
      // ... error handling ...
    } else if (result?.ok) {
      // Fetch session to determine role
      const session = await fetch('/api/auth/session').then(r => r.json())
      const redirectUrl = session?.user?.role === 'ADMIN' || session?.user?.role === 'CONCIERGE' 
        ? '/admin' 
        : '/dashboard'
      router.push(redirectUrl)
    }
  } catch (error) {
    setError('Đã xảy ra lỗi. Vui lòng thử lại sau.')
  } finally {
    setLoading(false)
  }
}
```

### Fix 5: Locale-Aware Admin Redirect
```typescript
export default async function AdminPage({
  params,
}: {
  params: { locale?: string };
}) {
  const session = await getServerSession(authOptions)
  const locale = params?.locale || 'vi'

  if (!session) {
    redirect(`/${locale}/auth/signin?callbackUrl=/${locale}/admin`)
  }

  if (session.user.role !== 'ADMIN' && session.user.role !== 'CONCIERGE') {
    redirect(`/${locale}/dashboard`)
  }

  return <AdminDashboardClient />
}
```

### Fix 6: Middleware Admin Protection Enhancement
```typescript
// Admin route protection
if (pathWithoutLocale.startsWith('/admin')) {
  // Ensure user has ADMIN or CONCIERGE role
  if (!token) {
    const signInPath = locale ? `/${locale}/auth/signin` : '/auth/signin'
    const signInUrl = new URL(signInPath, request.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }
  
  const userRole = token.role as string
  if (userRole !== 'ADMIN' && userRole !== 'CONCIERGE') {
    const dashboardPath = locale ? `/${locale}/dashboard` : '/dashboard'
    return NextResponse.redirect(new URL(dashboardPath, request.url))
  }
}
```

---

## 🎯 Root Causes Summary

| Bug | Root Cause | Impact |
|-----|-----------|--------|
| Missing admin role in session | JWT callback doesn't preserve role on refresh | Users lose admin access on page reload |
| Wrong redirect after login | SignInClient always redirects to /dashboard | Admins can't reach /admin after login |
| Locale not respected in redirects | Hard-coded paths without locale prefix | Users in /en or /vi lose locale context |
| Role not selected in DB query | Implicit Prisma selection could miss role | Race conditions with role availability |
| Middleware incomplete validation | Only checks `includes('/admin')` for path | Routes like /admin-api bypass check |

---

## 🚀 Implementation Priority

1. **CRITICAL:** Fix JWT/session callbacks (Fixes 1, 2)
2. **CRITICAL:** Add explicit role selection (Fix 3)
3. **HIGH:** Smart redirect in SignInClient (Fix 4)
4. **HIGH:** Locale-aware admin redirect (Fix 5)
5. **MEDIUM:** Middleware path matching (Fix 6)


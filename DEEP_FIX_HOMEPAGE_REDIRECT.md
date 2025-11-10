# DEEP FIX: Homepage Redirect Flow (Nov 10, 2025)

## Issue Analysis

Current flow has a problem:
1. Root `/` → middleware detects locale → redirects to `/vi` (or other locale)
2. `/vi` → `[locale]/page.tsx` redirects to `/vi/dashboard`
3. `/vi/dashboard` → protected route → requires auth
4. Not authenticated → redirects to `/vi/auth/signin?callbackUrl=/vi/dashboard`

**Problem**: Unauthenticated users can't see the public homepage!

## Solution

**Expected Flow:**
1. Root `/` → middleware detects locale → redirects to `/vi` (or other)
2. `/vi` (no auth) → Show public homepage from `homepage-client.tsx`
3. `/vi/dashboard` → protected, redirects to `/vi/auth/signin?callbackUrl=/vi/dashboard`
4. Homepage has CTA buttons linking to `/auth/signup` or `/vi/auth/signin`

## Files to Modify

### 1. middleware.ts
- Remove redirect from `/vi` to `/vi/dashboard`
- Keep only root `/` redirect to detect locale

### 2. src/app/[locale]/page.tsx
- Show homepage instead of auto-redirecting to dashboard
- Check auth status and show appropriate content

### 3. src/app/page.tsx
- Keep root page as homepage too

## Implementation Status

- ✅ Analysis complete
- ⏳ Ready for implementation
- Implementation steps below...

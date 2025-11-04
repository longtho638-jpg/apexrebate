# 🔥 ROUTING ISSUE - CRITICAL FIX NEEDED

## Vấn đề phát hiện:

### ❌ Pages returning 404:
```
/calculator → 404 (file exists: src/app/calculator/page.tsx)
/wall-of-fame → 404 (file exists: src/app/wall-of-fame/page.tsx) 
/faq → 404 (file exists: src/app/faq/page.tsx)
/how-it-works → 404 (file exists: src/app/how-it-works/page.tsx)
/auth/signin → 404 (file exists: src/app/auth/signin/page.tsx)
/auth/signup → 404 (file exists: src/app/auth/signup/page.tsx)
```

### ✅ Pages working:
```
/ → 200 (root homepage)
/vi → 200 (Vietnamese homepage)
/en → 200 (English homepage)
/dashboard → 200 (works!)
/admin → 200 (works!)
/monitoring → 200 (works!)
```

## Root Cause Analysis:

### Current Structure:
```
src/app/
├── [locale]/          # i18n pages: /vi/..., /en/...
│   ├── dashboard/
│   ├── tools/
│   └── apex-pro/
├── calculator/        # ❌ Non-locale page - BROKEN!
├── wall-of-fame/      # ❌ Non-locale page - BROKEN!
├── auth/              # ❌ Non-locale page - BROKEN!
├── dashboard/         # ✅ Works (why?)
└── admin/             # ✅ Works (why?)
```

### Middleware Configuration:
```typescript
// middleware.ts
const intlMiddleware = createMiddleware({
  locales: ['en', 'vi'],
  defaultLocale: 'vi',
  localePrefix: 'as-needed'  // ⚠️ This may cause issues!
});

matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|.*\\..*).*)']
// ↑ Matches ALL paths including /calculator, /wall-of-fame, etc.
```

### Why some work and others don't?

**Theory**: next-intl middleware with `localePrefix: 'as-needed'` is:
1. Intercepting ALL requests (per matcher config)
2. Trying to resolve them as locale routes
3. Failing to find `/calculator` under `[locale]/calculator`
4. Returning 404 instead of falling back to root `/calculator`

**Why dashboard/admin work?**
- They may have BOTH structures:
  - `src/app/dashboard/` (root)
  - `src/app/[locale]/dashboard/` (locale)
- OR they're not being intercepted somehow

## 🎯 Solutions:

### Option 1: Move ALL pages under [locale] (RECOMMENDED)
```bash
# Move broken pages into [locale] structure
mv src/app/calculator src/app/[locale]/calculator
mv src/app/wall-of-fame src/app/[locale]/wall-of-fame
mv src/app/faq src/app/[locale]/faq
mv src/app/how-it-works src/app/[locale]/how-it-works
mv src/app/auth src/app/[locale]/auth
```

**Pros**: Clean structure, all pages support i18n
**Cons**: URLs change (but middleware can redirect)

### Option 2: Exclude paths from middleware matcher
```typescript
// middleware.ts
matcher: [
  '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|calculator|wall-of-fame|faq|how-it-works|auth|.*\\..*).*)
]
```

**Pros**: Quick fix, no file moves
**Cons**: Ugly, hard to maintain, pages won't support i18n

### Option 3: Change localePrefix to 'always'
```typescript
localePrefix: 'always'  // Force /vi/... or /en/... for ALL locale pages
```

**Pros**: Clear separation
**Cons**: All locale pages MUST have prefix (breaks existing URLs)

### Option 4: Custom middleware logic
```typescript
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip i18n for specific paths
  const skipPaths = ['/calculator', '/wall-of-fame', '/faq', '/how-it-works', '/auth'];
  if (skipPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }
  
  // Apply i18n for everything else
  return intlMiddleware(request);
}
```

**Pros**: Granular control
**Cons**: Manual path management

## 🚀 RECOMMENDED ACTION:

**Use Option 1 (Move to [locale])** because:
- ✅ All pages should support Vietnamese/English anyway
- ✅ Clean, consistent structure
- ✅ No middleware hacks needed
- ✅ Future-proof

**Implementation Steps**:
1. Move pages to `src/app/[locale]/`
2. Update imports if needed
3. Test locally: `npm run build && npm start`
4. Deploy to production
5. Re-run test: `./scripts/test-user-flows-final.sh`

## Expected Result:

After fix:
```
Total Tests: 35
Passed:      35  ← was 15-20
Failed:      0   ← was 15-20
Pass Rate:   100.0%  ← was 50-60%

🎉 SUCCESS! ALL USER FLOWS WORKING PERFECTLY!
```

---

**Decision needed**: Anh muốn tôi implement Option 1 (move files) hay Option 4 (custom middleware)?

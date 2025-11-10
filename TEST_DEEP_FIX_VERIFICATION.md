# TEST & VERIFICATION GUIDE: Deep Fix Homepage Redirect (Nov 10, 2025)

## Quick Start Testing

### Build Verification ✅

```bash
# Clean build
npm run build

# Expected output:
# ✔ Generated Prisma Client
# ✓ Generating static pages (87/87)
# ✓ Finalizing page optimization
# ✓ Collecting build traces
```

### Lint Verification ✅

```bash
# No errors or warnings
npm run lint

# Expected output:
# (no output = success, 0 errors)
```

---

## Manual Testing Guide

### Setup Dev Server

```bash
# Start development server
npm run dev

# Expected output in terminal:
# [localhost:3000] Ready in 2.5s
# [localhost:3000] Build complete
```

### Test 1: Homepage Load (Unauthenticated)

**Test Case:** User visits root path without logging in

```bash
# Open in browser or curl
curl -s http://localhost:3000/ | grep -o "Tối ưu hóa"

# Expected:
# - Redirect from / to /vi (or detected locale)
# - Homepage content loads (hero section visible)
# - CTA buttons present
# - URL shows http://localhost:3000/vi
```

**Browser Test:**
```
1. Open http://localhost:3000/
2. Wait for redirect
3. Verify you see:
   ✓ "Tối ưu hóa lợi nhuận ròng" heading
   ✓ Fee calculator section
   ✓ "Bắt đầu tối ưu hóa" button
   ✓ Wall of fame section
   ✓ FAQ section
4. NOT redirected to login
```

**✅ PASS CRITERIA:** 
- See homepage content (not login page)
- URL is http://localhost:3000/vi
- All CTA buttons clickable

---

### Test 2: Tools Marketplace (Unauthenticated)

**Test Case:** Browse tools without logging in

```bash
# Check tools page loads
curl -s http://localhost:3000/vi/tools | grep -c "tool"

# Expected: Content contains "tool" (>0 matches)
```

**Browser Test:**
```
1. Open http://localhost:3000/vi/tools
2. Verify you see:
   ✓ Tools list/grid displayed
   ✓ Search bar visible
   ✓ Filter options visible (Category, Type)
   ✓ Tool cards with descriptions
   ✓ "Sign up to purchase" buttons (not "Buy now")
3. Can click on tool to see details
4. NOT prompted to login
```

**✅ PASS CRITERIA:**
- Tools visible without auth
- Search & filters work
- Detail pages accessible

---

### Test 3: Protected Route Redirect (Unauthenticated)

**Test Case:** Try to access /dashboard without logging in

```bash
# Check redirect
curl -L http://localhost:3000/vi/dashboard | grep -o "signin" | head -1

# Expected: Contains "signin" (redirected to signin page)
```

**Browser Test:**
```
1. Open http://localhost:3000/vi/dashboard
2. Automatically redirected to:
   ✓ http://localhost:3000/vi/auth/signin
   ✓ WITH callbackUrl parameter
   ✓ Shows login form
3. URL should be:
   /vi/auth/signin?callbackUrl=%2Fvi%2Fdashboard
```

**✅ PASS CRITERIA:**
- Redirected to signin page
- callbackUrl preserved in URL
- Can see login form

---

### Test 4: Dashboard Access (Authenticated)

**Test Case:** After login, dashboard should load

```bash
# Browser test required - can't test auth without session
```

**Browser Test:**
```
1. On signin page, log in with test credentials
2. After successful auth:
   ✓ Redirected to /vi/dashboard
   ✓ Dashboard content loads
   ✓ No more redirect loops
   ✓ Can see:
     - Stat cards
     - Analytics tabs
     - User data
3. Navigate away and back:
   ✓ Still stays on dashboard
   ✓ No redirect to signin
```

**✅ PASS CRITERIA:**
- Dashboard loads after login
- Session persists across navigation
- No infinite redirects

---

### Test 5: Signin Callback Redirect

**Test Case:** After login, should redirect to callbackUrl

```bash
# Browser test required
```

**Browser Test:**
```
1. Open direct link to signin with callbackUrl:
   http://localhost:3000/vi/auth/signin?callbackUrl=%2Fvi%2Fdashboard

2. Log in with test credentials

3. After auth success:
   ✓ Redirected to /vi/dashboard (the callbackUrl)
   ✓ Not just dashboard root
   ✓ Can access protected content

4. Test with different callbackUrl:
   http://localhost:3000/vi/auth/signin?callbackUrl=%2Fvi%2Fprofile
   
5. After login:
   ✓ Redirected to /vi/profile
```

**✅ PASS CRITERIA:**
- Redirected to original callbackUrl
- Works with any protected route

---

### Test 6: Locale Detection

**Test Case:** Middleware should detect user locale

```bash
# Test Vietnamese
curl -H "Accept-Language: vi" -L http://localhost:3000/ | grep -o "/vi"

# Expected: Contains /vi (Vietnamese detected)

# Test Thai
curl -H "Accept-Language: th" -L http://localhost:3000/ | grep -o "/th"

# Expected: Contains /th (Thai detected)

# Test default (English if no match)
curl -H "Accept-Language: unknown" -L http://localhost:3000/ | grep -o "/en"

# Expected: No /en prefix (English is default)
```

**Browser Test:**
```
1. Clear browser locale settings
2. Open http://localhost:3000/ with different Accept-Language:
   ✓ Vietnamese user → /vi
   ✓ Thai user → /th
   ✓ Indonesian user → /id
   ✓ English/Other → / (no prefix)
```

**✅ PASS CRITERIA:**
- Correct locale detected
- Locale-specific homepage shows
- All languages supported (vi, th, id, en)

---

## Automated Testing

### Run E2E Tests

```bash
# Start test suite
npm run test:e2e

# Expected output:
# ✓ Homepage loads for unauthenticated users
# ✓ Protected routes redirect to signin
# ✓ Dashboard loads for authenticated users
# ✓ Tools marketplace accessible without auth
# ✓ Signin callback redirects correctly
# ✓ Locale detection works
```

### Run Unit Tests

```bash
# Run all unit tests
npm run test

# Expected output:
# PASS  src/components/__tests__/
# PASS  src/lib/__tests__/
# Tests:   XX passed, XX total
```

### Check Build Output

```bash
# Verify all routes built
npm run build 2>&1 | grep "✓ Generating static pages"

# Expected: ✓ Generating static pages (87/87)
```

---

## Route Verification Checklist

### Public Routes (No Auth) ✅

```bash
# Test each route returns 2xx status
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/vi            # 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/vi/tools      # 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/vi/hang-soi   # 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/vi/wall-of-fame # 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/vi/faq        # 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/vi/calculator # 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/vi/auth/signin # 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/vi/auth/signup # 200
```

**Expected:** All return `200` (not 302 redirect for public routes)

### Protected Routes (Auth Required) ✅

```bash
# These should redirect to signin (302)
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/vi/dashboard    # 302
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/vi/tools/upload # 302
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/vi/profile      # 302
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/admin/dlq       # 302
```

**Expected:** All return `302` (redirect to signin)

### Redirect Verification ✅

```bash
# Check root redirects to locale
curl -L -s http://localhost:3000/ | grep -o "Tối ưu hóa"

# Expected: Output contains "Tối ưu hóa" (homepage loaded)

# Check protected route redirects to signin
curl -L -s http://localhost:3000/vi/dashboard 2>&1 | grep -o "signin" | head -1

# Expected: Output contains "signin" (redirected to signin page)
```

---

## Performance Checks

### Page Load Times

```bash
# Homepage load time
curl -w "\nTime taken: %{time_total}s\n" -o /dev/null -s http://localhost:3000/vi

# Expected: < 2 seconds (< 2000ms)

# Tools page load time
curl -w "\nTime taken: %{time_total}s\n" -o /dev/null -s http://localhost:3000/vi/tools

# Expected: < 2 seconds
```

### Resource Sizes

```bash
# Check bundle size (should be unchanged)
npm run build 2>&1 | grep "First Load JS"

# Expected: Similar to previous builds (no significant increase)
```

---

## Lighthouse Audit

For production testing:

```bash
# Install lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse http://localhost:3000/vi --chrome-flags="--headless --no-sandbox"

# Expected metrics:
# Performance: > 80
# Accessibility: > 90
# Best Practices: > 90
# SEO: > 90
```

---

## Cross-Browser Testing

### Desktop Browsers
- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] Chrome Mobile
- [ ] Safari iOS
- [ ] Firefox Mobile

### Test Checklist for Each Browser:
```
[ ] Homepage loads
[ ] Tools marketplace browsable
[ ] Fee calculator works
[ ] Forms submit properly
[ ] Navigation works
[ ] Locale selector works (if available)
[ ] Login/logout flows work
[ ] Dashboard responsive on mobile
[ ] No console errors
[ ] No layout shifts
```

---

## Accessibility Testing

```bash
# Test keyboard navigation
# [Tab] through all interactive elements
# [Enter] should activate buttons/links
# [Escape] should close modals

# Test screen reader
# ARIA labels present on:
# - Form fields
# - Buttons
# - Icons
# - Links

# Test color contrast
# Use WebAIM Contrast Checker
# All text should meet WCAG AA standards
```

---

## Error Handling Tests

### Test Invalid Routes

```bash
# Non-existent route should show 404
curl -s http://localhost:3000/invalid-route | grep -o "404"

# Expected: 404 error page shown
```

### Test Network Errors

```bash
# Open DevTools → Network tab
# Throttle to "Slow 3G"
# Refresh homepage
# Expected: Page still loads, shows loading states

# Kill database connection
# Try to load dashboard
# Expected: Error message shown, not blank page
```

### Test Browser Console

```
1. Open DevTools (F12)
2. Go to Console tab
3. Refresh page
4. Expected: 
   ✓ No red errors
   ✓ No security warnings
   ✓ May have yellow warnings (acceptable)
```

---

## Regression Testing

### Compare with Previous Behavior

**Before Deep Fix:**
```
GET / → /vi/dashboard (redirects to protected route)
GET /vi → /vi/dashboard (auto-redirects)
Not authenticated → Blank page or error
```

**After Deep Fix:**
```
GET / → /vi (shows homepage with content)
GET /vi → Homepage displayed (auth-aware)
Not authenticated → Can browse public pages
After login → Auto-redirects to dashboard
```

### Verify No Regressions

```bash
# All existing tests still pass
npm run test:e2e

# All lint rules pass
npm run lint

# Build succeeds with no new errors
npm run build

# No new console errors in browser
# (check DevTools → Console tab)
```

---

## Staging Deployment Test

Before production deployment:

```bash
# 1. Deploy to staging environment
vercel --presets=nodejs --env NEXT_PUBLIC_API_URL=https://staging-api.example.com

# 2. Test all functionality
# (Run all manual tests above)

# 3. Verify analytics
# Check that:
# - Homepage tracking works
# - Tools pageviews recorded
# - Signup funnel tracked
# - Error tracking working

# 4. Check email deliverability
# - Signup confirmations sent
# - Password reset emails received
# - No bounces

# 5. Database integrity
# - No orphaned records
# - Foreign keys valid
# - Seeded data intact

# 6. Security checklist
# - No sensitive data in logs
# - Passwords hashed
# - Auth tokens secure
# - CORS headers correct
# - CSP headers set
```

---

## Issue Resolution Guide

### Issue: Homepage shows blank/loading state

**Solution:**
```
1. Check NextAuth session provider is wrapped
2. Verify NEXTAUTH_SECRET in .env
3. Check useSession() hook working
4. Clear browser cache (Ctrl+Shift+Delete)
5. Restart dev server (npm run dev)
```

### Issue: Protected routes not redirecting to signin

**Solution:**
```
1. Check middleware.ts is in root directory
2. Verify TOKEN check in middleware
3. Check auth matcher in middleware config
4. Verify NextAuth config correct
5. Check environment variables set
```

### Issue: Locale not detected properly

**Solution:**
```
1. Check COUNTRY_TO_LOCALE mapping in middleware.ts
2. Check Accept-Language header being sent
3. Try explicit locale URL (/vi, /th, /id, /en)
4. Check defaultLocale in middleware config
5. Verify Cloudflare header if using CF
```

### Issue: Build fails with auth import error

**Solution:**
```
1. This is expected for DLQ routes (use src/lib/auth-server)
2. Not caused by this fix
3. Doesn't affect page builds
4. Can ignore - it's in a protected admin route
```

---

## Final Validation Checklist

Before marking as complete:

- [ ] ✅ Build passes: `npm run build`
- [ ] ✅ Lint passes: `npm run lint`
- [ ] ✅ Homepage loads for unauthenticated users
- [ ] ✅ Tools marketplace publicly browsable
- [ ] ✅ Protected routes redirect to signin
- [ ] ✅ Dashboard loads after login
- [ ] ✅ Signin callback URL works
- [ ] ✅ Locale detection working
- [ ] ✅ All 87 routes generated
- [ ] ✅ No console errors in browser
- [ ] ✅ Responsive on mobile
- [ ] ✅ Keyboard navigation works
- [ ] ✅ Screen reader compatible
- [ ] ✅ E2E tests pass (npm run test:e2e)
- [ ] ✅ Performance acceptable (< 2s load)

---

## Success Criteria

### ✅ PASS = All conditions met:

1. **Homepage Accessibility**
   - Unauthenticated users can see homepage
   - No redirect loop
   - All content visible

2. **Protected Routes**
   - Require authentication
   - Redirect to signin with callbackUrl
   - Work after login

3. **Public SEED Pages**
   - Tools marketplace browsable
   - No signup required to view
   - Links work properly

4. **Build Quality**
   - 0 errors
   - 0 warnings in lint
   - All 87 routes compiled

5. **User Experience**
   - Smooth transitions
   - No page flicker
   - Proper loading states
   - Clear CTAs

---

## Next Steps After Testing

1. **If PASS:**
   ```bash
   git add .
   git commit -m "fix: deep fix homepage redirect & SEED pages"
   git push origin main
   # CI/CD pipeline runs tests
   # Deploy to production
   ```

2. **If FAIL:**
   ```bash
   # Review test results
   # Check issue resolution guide
   # Fix issues
   # Re-run tests
   # Repeat until PASS
   ```

---

**Last Updated:** Nov 10, 2025
**Test Environment:** localhost:3000
**Status:** Ready for Testing

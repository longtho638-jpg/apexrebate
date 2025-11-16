# 🚀 QWEN DEEP DEBUG & TEST COMMAND
**Status**: Production Testing (Nov 16, 2025)  
**Deploy URL**: https://apexrebate-1-kr3fajhqe-minh-longs-projects-f5c82c9b.vercel.app  
**Test Duration**: 30-45 minutes (comprehensive)  

---

## 📋 QWEN'S MISSION (Copy & Paste Exact)

```
🎯 MISSION: Deep Debug & Test Production Deployment (Comprehensive)

STEP 1: Verify Production Vercel Logs (5 min)
=====================================
1. Open: https://vercel.com/minh-longs-projects-f5c82c9b/apexrebate-1
2. Check "Functions" tab → Look for any 5xx errors
3. Check "Deployments" tab → Latest build logs
4. Report: Any errors? (YES/NO + details)

Task 1.1: Check Environment Variables
- Verify NEXTAUTH_SECRET set ✓
- Verify NEXTAUTH_URL set ✓
- Verify DATABASE_URL set ✓
- Verify VERCEL_ENV=production ✓

STEP 2: Deep Test All Routes (15 min)
=====================================
Run in terminal:
  npm run test:e2e -- --headed --reporter=html

Expected: All 7 tests pass
  ✓ Homepage loads
  ✓ Auth signin page loads
  ✓ Protected routes redirect
  ✓ API health endpoint works
  ✓ Dashboard accessible (with auth)
  ✓ Tools marketplace loads
  ✓ Admin panel protected

If FAIL: Report exact error + line number

STEP 3: Production Route Verification (10 min)
=============================================
Curl test each route (copy entire block):

# Test 1: Homepage (Public)
curl -I https://apexrebate-1-kr3fajhqe-minh-longs-projects-f5c82c9b.vercel.app/
# Expected: 200 OK

# Test 2: Signin (Public)
curl -I https://apexrebate-1-kr3fajhqe-minh-longs-projects-f5c82c9b.vercel.app/vi/auth/signin
# Expected: 200 OK

# Test 3: Dashboard (Protected - no session)
curl -I https://apexrebate-1-kr3fajhqe-minh-longs-projects-f5c82c9b.vercel.app/vi/dashboard
# Expected: 307 Redirect to /vi/auth/signin

# Test 4: Tools Marketplace (Public)
curl -I https://apexrebate-1-kr3fajhqe-minh-longs-projects-f5c82c9b.vercel.app/vi/tools
# Expected: 200 OK

# Test 5: Admin Panel (Protected)
curl -I https://apexrebate-1-kr3fajhqe-minh-longs-projects-f5c82c9b.vercel.app/admin/dlq
# Expected: 307 Redirect (auth required)

# Test 6: API Health
curl https://apexrebate-1-kr3fajhqe-minh-longs-projects-f5c82c9b.vercel.app/api/health
# Expected: {"status":"healthy"}

# Test 7: API Tools (Public API)
curl https://apexrebate-1-kr3fajhqe-minh-longs-projects-f5c82c9b.vercel.app/api/tools
# Expected: JSON array of tools

Report for each:
  Route | Status Code | Issue? (YES/NO)

STEP 4: Database Connectivity Check (5 min)
==========================================
1. Verify Neon connection:
   - Check .env.local has DATABASE_URL ✓
   - Run: npx prisma db execute --stdin < /dev/null
   - Expected: Connected (no error)

2. Verify Prisma schema:
   - Run: npm run db:generate
   - Expected: Prisma Client generated successfully

STEP 5: Deep Auth Flow Test (10 min)
===================================
Test actual signin/signout flow:

1. Open browser: https://apexrebate-1-kr3fajhqe-minh-longs-projects-f5c82c9b.vercel.app/vi/auth/signin
2. Login with test account:
   - Email: demo@apexrebate.com
   - Password: demo123
3. Expected: Redirect to /vi/dashboard
4. Check session cookie: (F12 → Application → Cookies)
   - Name: next-auth.session-token
   - Should have value ✓

5. Logout & verify redirect to homepage ✓

6. Try accessing /vi/admin (should redirect to signin) ✓

Report: SUCCESS/FAILURE + screenshot if issue

STEP 6: Check Error Logs (5 min)
==============================
Run all local tests with logs:
  npm run test 2>&1 | tee test-results.log
  
Expected: 72/72 tests pass

If ANY test fails:
  - Run: npm run test -- --testNamePattern="FAILING_TEST_NAME" --verbose
  - Capture full output
  - Report exact error

STEP 7: Production Build Verification (5 min)
============================================
Verify build is clean:
  npm run build 2>&1 | tail -50

Expected:
  ✓ Compiled successfully
  ✓ 87/87 routes compiled
  ✓ 0 warnings
  ✓ 0 errors

STEP 8: Debug Session & Auth Issues (if any)
===========================================
If auth fails:
  
  a) Check NextAuth logs:
     - Search AGENTS.md for NextAuth redirect callback
     - Verify role validation logic exists
     - Check: src/lib/auth.ts has session callback
  
  b) Check middleware:
     - Verify: src/middleware.ts has auth checks
     - Verify: Protected routes list is correct
     - Run: npm run build (catch any TS errors)
  
  c) Test with mock session:
     - Run: npm run test -- --testNamePattern="auth"
     - Expected: All auth tests pass
  
  d) Check database user role:
     - Verify demo@apexrebate.com exists
     - Verify role is 'USER' or 'ADMIN'
     - Run: npm run seed:handoff (if needed to reset test data)

FINAL REPORT
============
Create file: QWEN_DEEP_TEST_REPORT.md with:

## Production Deployment Test Report
Date: [TODAY]
Tester: Qwen
Deploy URL: https://apexrebate-1-kr3fajhqe-minh-longs-projects-f5c82c9b.vercel.app

### Results Summary
- [✓/✗] Step 1: Vercel logs check → PASS/FAIL (issue: ___)
- [✓/✗] Step 2: E2E tests (7/7) → PASS/FAIL (issue: ___)
- [✓/✗] Step 3: Route verification (7/7) → PASS/FAIL (issue: ___)
- [✓/✗] Step 4: Database connectivity → PASS/FAIL (issue: ___)
- [✓/✗] Step 5: Auth flow test → PASS/FAIL (issue: ___)
- [✓/✗] Step 6: Test logs clean → PASS/FAIL (issue: ___)
- [✓/✗] Step 7: Build verification → PASS/FAIL (issue: ___)
- [✓/✗] Step 8: Auth issues resolved → PASS/FAIL (issue: ___)

### Critical Issues Found
(List only if exists)
1. Issue: ___
   Root Cause: ___
   Fix Applied: ___
   Re-tested: [YES/NO]

2. Issue: ___
   ...

### Final Status
OVERALL: ✅ ALL TESTS PASS / ⚠️ ISSUES FOUND (details above)

### Recommendations
- [List any improvements needed]
- [Performance optimizations]
- [Security concerns]

### Next Steps
- [ ] Fix any critical issues
- [ ] Re-run full test suite
- [ ] Update AGENTS.md with new findings
- [ ] Commit: git commit -m "ci: deep test report [DATE]"
```

---

## 🎯 QWEN's Quick Reference

**When you see this error:**
```
Error: NEXT_PUBLIC_* environment variable missing
→ Check: .env.local + vercel.json environment config
→ Fix: Add missing var to Vercel project settings
→ Re-test: npm run build && npm run dev
```

**When you see this error:**
```
Error: Database connection failed
→ Check: DATABASE_URL is valid (Neon console)
→ Check: Connection pooling enabled
→ Fix: npm run db:push && npm run db:generate
→ Re-test: npx prisma db execute --stdin < /dev/null
```

**When you see this error:**
```
Error: Session authentication failed
→ Check: NextAuth config in src/lib/auth.ts
→ Check: Middleware auth rules in src/middleware.ts
→ Fix: Apply auth fixes from AGENTS.md § Admin Redirect Loop Fix
→ Re-test: npm run test -- --testNamePattern="auth"
```

**When you see this error:**
```
Error: API returns 5xx
→ Check: Vercel function logs (exact error line)
→ Check: Database availability
→ Check: Environment variables all set
→ Fix: Redeploy with: vercel --prod
→ Re-test: curl -v [endpoint]
```

---

## ✅ Success Criteria (HARD GATES)

**ALL must pass:**
- ✅ npm run build → 0 errors, 0 warnings
- ✅ npm run test → 72/72 tests pass (or skipped)
- ✅ npm run test:e2e → 7/7 tests pass
- ✅ Homepage loads (200 OK)
- ✅ Auth signin works (200 OK)
- ✅ Protected routes redirect (307 to signin)
- ✅ Database connection works
- ✅ Session/auth flow works end-to-end

**If ANY fails → Stop & Report Issue**

---

## 🚀 Execute This Exact Command

```bash
# Copy entire block to terminal:
echo "🚀 Starting QWEN Deep Debug..." && \
npm run build && \
echo "✅ Build OK" && \
npm run test && \
echo "✅ Unit tests OK" && \
npm run test:e2e && \
echo "✅ E2E tests OK" && \
echo "📝 Running route verification..." && \
curl -s https://apexrebate-1-kr3fajhqe-minh-longs-projects-f5c82c9b.vercel.app/ | head -50 && \
echo "✅ Production verification complete!"
```

---

## 📞 If Stuck

**Report with:**
1. Exact error message (full stack trace)
2. Which step it failed on
3. What you tried
4. Environment info (npm/node versions)

**Then:**
- Create issue: `QWEN_DEBUG_ISSUE_[DATE].md`
- Paste full output
- Wait for next instructions

---

**Remember**: "Làm đến đâu chắc đến đó" - Test thoroughly, report honestly, don't hide failures!

🎯 **GO!**

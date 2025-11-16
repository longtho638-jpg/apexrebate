# Enhanced Testing Strategy - ApexRebate

## Current Test Status (Nov 16, 2025)

### ✅ Passing (72 tests)
- Auth middleware logic & config tests
- Component tests
- Architecture tests

### ⚠️ API Tests (Need localStorage fix)
- `/api/dashboard`
- `/api/user-profile`
- `/api/user-referrals`

---

## 1️⃣ Run Auth Middleware Tests (Already Passing)

```bash
npm run test -- tests/unit/middleware/auth-middleware-logic.test.ts
npm run test -- tests/unit/middleware/auth-middleware-config.test.ts
```

**Coverage:**
- ✓ Protected route detection
- ✓ Admin role validation
- ✓ Locale extraction (en, vi, th, id)
- ✓ Callback URL preservation
- ✓ Edge cases (malformed URLs, query params)

---

## 2️⃣ Fix API Tests (localStorage error)

Update `jest.setup.js`:

```javascript
// Mock localStorage for Node.js environment
if (typeof global.localStorage === 'undefined') {
  global.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
}
```

Then run:
```bash
npm run test -- tests/unit/api/dashboard.test.ts
npm run test -- tests/unit/api/user-profile.test.ts
npm run test -- tests/unit/api/user-referrals.test.ts
```

---

## 3️⃣ Use Qwen Code for Full Audit

```bash
qwen
```

Paste these prompts in sequence:

### Prompt A: Middleware Audit
```
Analyze the middleware.ts file and the auth-middleware-logic.test.ts tests.
List any security gaps, edge cases not covered, or missing validations.
Focus on role-based access control (ADMIN, CONCIERGE, USER).
```

### Prompt B: API Route Security
```
Review all API routes in src/app/api:
1. Which endpoints have authentication checks?
2. Which endpoints are missing CSRF protection?
3. Which endpoints could have SQL injection or privilege escalation issues?
Provide specific file locations and fixes.
```

### Prompt C: Integration Tests
```
Generate E2E test cases (Playwright) for:
1. Non-admin user tries to access /admin → redirect to /dashboard
2. Admin user accesses /admin → shows admin panel
3. Unauthenticated user accesses /dashboard → redirect to signin
4. After signin, user lands on correct dashboard (vi, th, id, en locales)
```

### Prompt D: Performance Tests
```
Identify N+1 query problems in:
- Dashboard API (src/app/api/dashboard/route.ts)
- User referrals API (src/app/api/user-referrals/route.ts)
- Profile API (src/app/api/user-profile/route.ts)
Suggest Prisma optimizations (include, select).
```

---

## 4️⃣ Manual Test Checklist

### Auth Flow
- [ ] `/en/auth/signin` loads
- [ ] Enter valid credentials → redirects to `/en/dashboard`
- [ ] Non-admin tries `/en/admin` → redirects to `/en/dashboard`
- [ ] Admin user accesses `/en/admin` → shows admin panel
- [ ] Logout → redirects to homepage

### Locale Handling
- [ ] `/vi/auth/signin` → login → `/vi/dashboard` (not `/en/dashboard`)
- [ ] `/th/profile` loads correctly
- [ ] `/id/tools` accessible without auth

### Admin DLQ
- [ ] Admin accesses `/admin/dlq`
- [ ] 2-eyes token required for replay/delete
- [ ] Invalid token rejected

---

## 5️⃣ CI/CD Test Pipeline

```bash
# Quick test (unit only)
npm run test

# Full test (unit + E2E)
npm run test:e2e

# Coverage report
npm run test:coverage
```

---

## 6️⃣ Test Files to Create/Enhance

| File | Status | Priority |
|------|--------|----------|
| `tests/unit/middleware/auth-middleware-logic.test.ts` | ✅ Complete | High |
| `tests/unit/api/dashboard.test.ts` | ⚠️ Broken | High |
| `tests/e2e/auth-flow.spec.ts` | ❌ Missing | High |
| `tests/e2e/admin-dlq.spec.ts` | ❌ Missing | Medium |
| `tests/unit/lib/auth.test.ts` | ❌ Missing | Medium |
| `tests/unit/api/admin/*.test.ts` | ❌ Missing | Medium |

---

## 7️⃣ Next Steps (Priority Order)

1. **Fix localStorage** in `jest.setup.js` → run API tests
2. **Run Qwen audit** (use prompts A-D above)
3. **Create E2E tests** for critical auth flows
4. **Add performance tests** for query optimization
5. **Setup pre-commit** hooks to run tests on git push

---

## 8️⃣ Quick Commands

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test -- tests/unit/middleware/auth-middleware-logic.test.ts

# Watch mode (auto-rerun on file change)
npm run test:watch

# Use Qwen for code review
qwen
# Then paste any of the prompts above
```

---

**Last Updated:** Nov 16, 2025
**Test Status:** 72/72 middleware & unit tests ✅
**Next:** Fix API tests + Qwen audit

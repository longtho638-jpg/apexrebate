# 🚀 Qwen Production Audit Commands - Copy-Paste Ready

**Status:** Pre-Production Ready
**Target:** Zero-risk deployment to production
**Estimated Time:** 40-50 minutes
**Date:** Nov 16, 2025

---

## ⚡ Quick Start

```bash
# Step 1: Verify local build
bash START_PRODUCTION_AUDIT.sh

# Step 2: Open Qwen Code
qwen

# Step 3: Paste commands below in order (LỆNH 1 → LỆNH 12)
```

---

## 🔴 LỆNH 1: Build & Environment Verification (2 min)

**Paste vào Qwen:**

```
BUILD VERIFICATION - Kiểm tra sẵn sàng deploy:

1. Next.js Build Analysis:
   - Review next.config.mjs for production settings
   - Check for any hardcoded localhost URLs
   - Verify environment variables are used (not hardcoded)
   - Look for console.log() that should be removed
   
2. Environment Variables Checklist:
   - List all env vars used in the app
   - Which ones are REQUIRED for production?
   - Which ones have DEFAULTS (safe vs dangerous)?
   - Are secrets properly configured (not in git)?
   
   Check:
   - NEXTAUTH_URL (must be production domain)
   - NEXTAUTH_SECRET (must be strong random)
   - DATABASE_URL (Neon production URL)
   - API_KEYS (email, payment services)
   
3. API Routes Validation:
   - Are all API endpoints protected with auth where needed?
   - Do rate limits exist for public endpoints?
   - Are error messages safe for production (no stack traces)?
   - Is CORS configured correctly for production domain?
   
4. Database Readiness:
   - Are all Prisma migrations applied?
   - Is connection pooling configured for Neon?
   - Are there any pending migrations?
   - Is DATABASE_URL set correctly?
   
5. NextAuth Configuration:
   - Is NEXTAUTH_URL set to production domain?
   - Is NEXTAUTH_SECRET configured (not default)?
   - Are OAuth providers configured (if used)?
   - Is session timeout appropriate (not infinite)?

Output format: Checklist with ✅/❌ for each item.
Flag any 🚨 CRITICAL issues that block deployment.
```

**What to do after Qwen responds:**
1. Review checklist carefully
2. Address any 🚨 CRITICAL issues immediately
3. Document findings in: `QWEN_AUDIT_PHASE1_BUILD.md`
4. Proceed to LỆNH 2

---

## 🔒 LỆNH 2: Security Hardening (5 min)

**Paste vào Qwen:**

```
SECURITY HARDENING - Chuẩn bị production:

1. Secrets & Credentials Audit:
   - Search for hardcoded API keys, passwords, tokens
   - Check .env.example doesn't expose real values
   - Verify .gitignore includes .env.local, .env.production.local
   - Are GitHub secrets configured:
     * VERCEL_TOKEN
     * DATABASE_URL (production)
     * NEXTAUTH_SECRET
     * API keys for services
   
2. HTTP Headers & CSP Security:
   - Are security headers configured?
     * X-Frame-Options: DENY or SAMEORIGIN
     * X-Content-Type-Options: nosniff
     * X-XSS-Protection: 1; mode=block
   - Is Content-Security-Policy set?
   - Are CORS headers secure (not allow *)?
   - Is HSTS enabled for HTTPS?
   
3. Authentication Security:
   - Session timeout is configured (not infinite)?
   - JWT secret is strong (not weak default)?
   - Password requirements enforced in signup?
   - Is email verification required for new accounts?
   - Is 2FA available for admin accounts?
   
4. Admin Panel Security Audit:
   - Is /admin route only accessible to ADMIN/CONCIERGE role?
   - Is 2-eyes approval enforced for critical operations (DLQ)?
   - Are admin actions logged to audit_log?
   - Can admin passwords be changed?
   - Is there account lockout after 5+ failed login attempts?
   - Can admins be impersonated? (test with user role)
   
5. API Security Checklist:
   - POST/PUT/DELETE endpoints have CSRF protection?
   - Rate limiting on login endpoint (prevent brute force)?
   - File upload endpoints validate:
     * File types (whitelist, not blacklist)
     * File sizes (< 10MB)
     * Virus scanning (if applicable)
   - No SQL injection vulnerabilities in database queries?
   - No XSS vulnerabilities in rendered user content?
   - No open redirects in redirect() calls?
   
6. Data Protection:
   - User passwords hashed with bcrypt (min 10 rounds)?
   - Sensitive data encrypted at rest (payment info)?
   - API responses don't leak user data (other users)?
   - Logs don't contain passwords, tokens, card numbers?
   - User sessions properly cleared on logout?
   
7. DLQ & Webhook Security:
   - Webhook payloads signed with HMAC-SHA256?
   - 2-eyes token required for DLQ operations?
   - Failed webhooks logged with timestamp?
   - Retry logic prevents duplicate processing (idempotency)?
   - Max retries configured (not infinite)?

Output format: Security checklist with vulnerabilities flagged 🚨.
For each vulnerability, provide:
- Risk level (Critical/High/Medium/Low)
- File location (e.g., src/lib/auth.ts:45)
- Fix code example
```

**What to do after Qwen responds:**
1. Review all 🚨 CRITICAL issues
2. Apply fixes to code before deployment
3. Create test to verify each fix
4. Document in: `QWEN_AUDIT_PHASE2_SECURITY.md`
5. Proceed to LỆNH 3

---

## ⚠️ LỆNH 3: Dependency & License Audit (3 min)

**Paste vào Qwen:**

```
DEPENDENCY AUDIT - Kiểm tra thư viện bên thứ ba:

1. Vulnerability Check:
   - Run: npm audit and list vulnerable packages
   - Which packages have known CVEs (CVE numbers)?
   - Which ones are outdated (major version behind)?
   - Can they be patched (minor version upgrade)?
   
2. Unmaintained Packages:
   - List packages not updated in > 1 year
   - Are there active replacement packages?
   - Is the package critical (core vs optional)?
   
3. Duplicate Dependencies:
   - Are there packages doing similar things?
   - Example: lodash vs underscore (use one)
   - Can any be removed to reduce bundle?
   
4. License Compliance:
   - Are all licenses compatible with Apache-2.0?
   - Any GPL packages (require source code release)?
   - Any copyleft packages requiring disclosure?
   - Check LICENSES from packages:
     * next (MIT)
     * react (MIT)
     * prisma (Apache-2.0)
     * etc.
   
5. Bundle Size Impact:
   - Which npm packages are largest?
   - Are there lighter alternatives?
   - Can any packages be lazy-loaded?
   - Total JS bundle size (target: < 500KB)?

Output format: Priority list:
- 🚨 CRITICAL: Security issues (fix before deploy)
- ⚠️ WARNING: Vulnerabilities or unmaintained (fix soon)
- 💡 SUGGESTION: Optimization or cleanup (nice to have)

For each item show:
- Package name & version
- Issue description
- Recommendation
- Effort to fix (minutes)
```

**What to do after Qwen responds:**
1. Fix all 🚨 CRITICAL security issues
2. Run: `npm audit` to verify
3. Update dependencies if needed: `npm update`
4. Test after updates: `npm run build && npm run test`
5. Document in: `QWEN_AUDIT_PHASE3_DEPS.md`
6. Proceed to LỆNH 4

---

## ✅ LỆNH 4: E2E Test Generation (5 min)

**Paste vào Qwen:**

```
E2E TEST GENERATION - Tạo Playwright test cases:

Generate Playwright E2E test code (tests/e2e/) for:

1. User Signup & Login Journey:
   - Start: https://apexrebate.com/en/auth/signup
   - Fill: email, password
   - Submit form
   - Verify: Email verification sent (or auto-verified)
   - Login: /en/auth/signin with new credentials
   - Verify: Redirected to /en/dashboard
   - Check: User data displays correctly
   
2. Admin Login & Dashboard:
   - Admin user logs in at /en/auth/signin
   - Verify: Redirected to /en/admin (not /en/dashboard)
   - Check: Admin panel displays correctly
   - Test: Can access /admin/dlq
   
3. Non-Admin Cannot Access Admin:
   - Regular user logs in
   - Try to access /en/admin directly
   - Verify: Redirected to /en/dashboard
   - Not granted admin access
   
4. DLQ Operations (Admin Only):
   - Admin at /admin/dlq
   - List DLQ items
   - Click "Replay" on first item
   - System asks for 2-eyes token
   - Enter invalid token → Error
   - Enter valid token → Replay succeeds
   - Item status updated in database
   
5. Locale Persistence:
   - User signs up at /vi/auth/signup
   - After login, verify at /vi/dashboard (not /en/dashboard)
   - Logout
   - Login at /th/auth/signin
   - After login, verify at /th/dashboard
   
6. Tools Marketplace (Public):
   - Unauthenticated user visits /tools
   - Can browse tools
   - Can view tool details (/tools/[id])
   - Click "Upload Tool" disabled (or redirects to signup)
   - After signup, can upload tool
   
7. Logout & Session Cleanup:
   - User clicks logout
   - Verify: Session cleared
   - Try to access /dashboard → Redirected to signin
   - Old JWT token doesn't work
   - Can login again

For each test, provide:
- Test filename (e.g., auth-flow.spec.ts)
- Test code (complete, ready to run)
- Setup: Create test user, data
- Assertions: URL, data, status
- Cleanup: Logout, delete test data

Make tests independent (can run in any order).
Use fixtures for setup/teardown.
```

**What to do after Qwen responds:**
1. Copy test code to: `tests/e2e/`
2. Run tests: `npm run test:e2e`
3. Fix any failing tests
4. Commit tests: `git add tests/e2e/ && git commit -m "test: add E2E tests"`
5. Document in: `QWEN_AUDIT_PHASE4_E2E.md`
6. Proceed to LỆNH 5

---

## 🧪 LỆNH 5: API Contract Tests (3 min)

**Paste vào Qwen:**

```
API CONTRACT TESTS - Xác nhận API response format:

For each endpoint, generate Jest test code:

1. GET /api/dashboard:
   - Requires authentication (401 without auth)
   - Response format: { success: true, data: {...} }
   - Data includes: userData, savingsHistory, stats
   - Performance: < 500ms
   - No sensitive data leaked
   
2. GET /api/user-referrals:
   - Requires auth (401 without)
   - Only returns referrals for logged-in user
   - Supports pagination (limit, offset)
   - Sorting by date works
   - Cannot access other users' referrals (403)
   
3. GET /api/user-profile:
   - Returns only logged-in user's profile
   - Cannot fetch other users' profiles (404 or 403)
   - Update returns updated data
   - No passwords/sensitive fields in response
   
4. POST /api/tools (Upload Tool):
   - Requires auth (401 without)
   - Validates file type (whitelist)
   - Validates file size (< 10MB)
   - Successful: Returns 201 + toolId
   - Error: Returns 400 + error message
   - Tool appears in /tools marketplace
   
5. Admin APIs (/api/admin/*):
   - Requires ADMIN role (403 for non-admin)
   - Verify user role checked
   - All operations logged in audit_log
   - Rate limiting applied (429 if exceeded)
   
For each endpoint, test:
- ✅ Success case (correct status, response format)
- ❌ Unauthorized (401)
- ❌ Forbidden (403 for admin endpoints)
- ❌ Validation errors (400 with helpful message)
- ❌ Rate limit exceeded (429)

Provide test code ready to run with: npm run test
```

**What to do after Qwen responds:**
1. Copy test code to: `tests/unit/api/`
2. Run: `npm run test -- tests/unit/api/`
3. Fix failing tests
4. Document in: `QWEN_AUDIT_PHASE5_API.md`
5. Proceed to LỆNH 6

---

## ⚡ LỆNH 6: Performance Optimization (5 min)

**Paste vào Qwen:**

```
PERFORMANCE PRE-FLIGHT - Tối ưu hóa:

1. Database Query Analysis:
   For each API endpoint:
   - src/app/api/dashboard/route.ts
   - src/app/api/user-referrals/route.ts
   - src/app/api/user-profile/route.ts
   
   Provide for each:
   - Current: [N] SQL queries, [Xms] execution time
   - Issues: N+1 queries? Missing indexes?
   - Optimized: [M] queries, [Yms] time (estimated)
   - Code changes: Show before/after Prisma code
   - Expected improvement: [X-Y]ms faster

2. API Response Time SLO:
   - /dashboard: Target < 200ms
   - /referrals: Target < 300ms
   - /tools: Target < 150ms
   - /api/health: Target < 50ms (if exists)
   
   Which endpoints exceed target?
   For each, suggest fix (caching, pagination, query optimization)

3. Frontend Performance:
   - src/app/[locale]/dashboard/dashboard-client-vi.tsx
   - Identify unnecessary re-renders
   - Suggest React.memo() optimizations
   - Check image lazy-loading
   - Is bundle minified for production?

4. Caching Strategy:
   - Which API responses can be cached?
   - How long should cache be valid?
   - Are Cache-Control headers set?
   - Suggestions for Redis or similar

5. Vercel Edge Functions:
   - Which routes could run on Edge (faster)?
   - Configuration changes needed?

6. Load Simulation:
   - 100 concurrent login requests
   - 1000 /tools page views
   - 50 simultaneous tool uploads
   - Expected response times?
   - Potential bottlenecks?

Output: Performance roadmap with:
- Quick wins (< 30 min to implement)
- Medium effort (1-2 hours)
- Long-term (refactoring, architectural)
```

**What to do after Qwen responds:**
1. Implement quick wins first
2. Run performance tests: `npm run test -- --performance`
3. Test in production-like conditions
4. Document in: `QWEN_AUDIT_PHASE6_PERF.md`
5. Proceed to LỆNH 7

---

## 🗄️ LỆNH 7: Database Production Readiness (3 min)

**Paste vào Qwen:**

```
DATABASE PRODUCTION READINESS - Neon PostgreSQL:

1. Connection Pooling:
   - Is Neon connection pooling enabled?
   - Current pool size (default is usually 10)
   - Recommended for expected load?
   - How to monitor connection usage?
   
   Expected connection count:
   - 100 concurrent users = ~50-100 connections
   - Typical pool size: 10-20 connections
   - Recommendation: 25-50 connections for safety

2. Backup & Recovery:
   - Is automated backup configured?
   - Backup frequency (recommend: daily + hourly)
   - Retention period (recommend: 30 days)
   - Can you restore from backup?
   - RTO (Recovery Time Objective): How long to restore?
   - RPO (Recovery Point Objective): Max data loss acceptable?

3. Database Monitoring:
   - Are slow query logs available?
   - Table sizes and growth rate?
   - Active connection count?
   - Alerts for disk space (trigger at 80%)?
   - CPU/memory usage alerts?

4. Migration Safety:
   - Are zero-downtime migrations possible?
   - Rollback procedure if migration fails?
   - Data validation after migration?
   - Backup taken before migration?
   - Max downtime acceptable: 30 seconds?

5. Production Data:
   - Initial data seeding strategy?
   - Test vs production data separation?
   - GDPR compliance (delete user data)?
   - Data retention policy (keep 7 years)?
   - PII encryption at rest?

Provide checklist + commands for each.
```

**What to do after Qwen responds:**
1. Verify Neon PostgreSQL setup
2. Check backup configuration
3. Document RTO/RPO requirements
4. Document in: `QWEN_AUDIT_PHASE7_DB.md`
5. Proceed to LỆNH 8

---

## 🚀 LỆNH 8: Deployment Configuration (3 min)

**Paste vào Qwen:**

```
DEPLOYMENT CONFIGURATION - Vercel Setup:

1. Environment Variables for Production:
   List all required vars:
   - NEXTAUTH_URL = "https://apexrebate.com"
   - NEXTAUTH_SECRET = (strong random)
   - DATABASE_URL = "postgresql://user:pass@neon.tech/db"
   - NODE_ENV = "production"
   - ... others?
   
   For each, provide:
   - Variable name
   - Example value (not real)
   - How to set in Vercel (secret vs public)
   - Rotation frequency (if sensitive)

2. Vercel Deployment Settings:
   - Build command: npm run build
   - Start command: next start
   - Root directory: /
   - Regions: auto-detect or specific?
   - Environment: production
   - Serverless function timeout: 30-60 seconds?

3. Domain & SSL:
   - Primary domain: apexrebate.com
   - SSL automatic (Let's Encrypt)?
   - Redirect http → https?
   - Custom domain aliases (www, staging, etc)?
   - DNS records configured?

4. Analytics & Monitoring:
   - Vercel Analytics enabled?
   - Error tracking (Sentry) configured?
   - Performance monitoring dashboard?
   - Uptime monitoring (healthchecks.io)?
   - Email alerts on deployment failure?

5. CI/CD Pipeline:
   - GitHub branch connected: main
   - Automatic deployment on push?
   - Preview deployments for PRs?
   - Rollback: How to revert (1-click)?
   - Deployment history available?

6. Secrets Management:
   - Never commit .env.local to git ✅
   - Use Vercel Secrets or GitHub Secrets
   - How to rotate secrets safely?
   - Who has access (team members)?
   - Audit log of secret usage?

Step-by-step Vercel deployment checklist + commands.
```

**What to do after Qwen responds:**
1. Configure all environment variables in Vercel dashboard
2. Set GitHub secrets
3. Test preview deployment on branch
4. Document in: `QWEN_AUDIT_PHASE8_DEPLOY.md`
5. Proceed to LỆNH 9

---

## ✔️ LỆNH 9: Post-Deployment Verification (2 min)

**Paste vào Qwen:**

```
POST-DEPLOYMENT CHECKLIST - Verify production is working:

Provide curl/HTTP commands to test each point:

1. Website Accessibility:
   - [ ] https://apexrebate.com/ loads (< 3 seconds)
   - [ ] All pages accessible (tools, dashboard, admin)
   - [ ] API endpoints respond (check /api/health)
   - [ ] Database connections working
   - [ ] No 500 errors in response

2. Authentication Flow:
   - [ ] Can signup: POST /api/auth/signup with new email
   - [ ] Can login: POST /api/auth/signin with credentials
   - [ ] Redirects to /en/dashboard after login
   - [ ] Can logout (clears session)
   - [ ] Can login again immediately after logout

3. Admin Panel:
   - [ ] Admin user accesses /admin → success
   - [ ] User role accesses /admin → 403 Forbidden
   - [ ] DLQ panel at /admin/dlq works
   - [ ] Can view audit logs
   - [ ] 2-eyes token required for operations

4. Localization:
   - [ ] /vi/ (Vietnamese) works
   - [ ] /th/ (Thai) works
   - [ ] /id/ (Indonesian) works
   - [ ] /en/ (English) works
   - [ ] Content translated correctly

5. Performance:
   - [ ] /api/dashboard responds < 200ms
   - [ ] /tools marketplace responds < 150ms
   - [ ] Homepage loads < 2 seconds
   - [ ] No 5xx errors in logs
   - [ ] Database connection healthy

6. Security Headers:
   - [ ] X-Content-Type-Options: nosniff
   - [ ] X-Frame-Options: DENY
   - [ ] X-XSS-Protection: 1; mode=block
   - [ ] Strict-Transport-Security present
   - [ ] Content-Security-Policy configured

7. Error Handling:
   - [ ] 404 page returns proper error
   - [ ] Errors captured in Sentry
   - [ ] User gets friendly message (not stack trace)
   - [ ] Errors logged for debugging
   - [ ] No sensitive info in error messages

8. Database Health:
   - [ ] Tables created ✓
   - [ ] Migrations applied ✓
   - [ ] No orphaned records
   - [ ] Backups running ✓
   - [ ] Connection pooling healthy

Provide: curl commands for each verification point.
```

**What to do after Qwen responds:**
1. After deployment, run all verification commands
2. Fix any issues found
3. Document in: `QWEN_AUDIT_PHASE9_POSTDEPLOY.md`
4. Proceed to LỆNH 10

---

## 🔙 LỆNH 10: Rollback & Emergency (2 min)

**Paste vào Qwen:**

```
ROLLBACK & EMERGENCY PROCEDURES:

1. Quick Rollback (< 5 minutes):
   - Previous production deployment available?
   - How to revert in Vercel (1-click rollback)?
   - Database rollback procedure (if schema changed)?
   - How long does rollback take?

2. Critical Issues Response:
   - Authentication broken → Rollback immediately
   - Database inaccessible → Use backup
   - Performance > 50% slower → Investigate or rollback
   - Security breach detected → Kill sessions + investigate
   - Data corruption → Restore from backup

3. Incident Communication:
   - Who to notify (team, users)?
   - Status page updates?
   - Incident report template?
   - Post-mortem process?

4. Monitoring & Alerts:
   - Error rate spike (> 1% errors) → Alert?
   - Database down → Immediate alert?
   - Latency spike (> 1000ms) → Warning?
   - Disk space low (< 10%) → Alert?
   - Escalation path?

5. Testing Rollback:
   - Can you rollback from current production?
   - Does rollback restore data correctly?
   - Data loss risk?
   - Dry-run rollback possible?

Provide: Emergency procedures + rollback commands.
```

**What to do after Qwen responds:**
1. Document all emergency procedures
2. Test rollback procedure (dry-run)
3. Configure monitoring & alerts
4. Document in: `QWEN_AUDIT_PHASE10_ROLLBACK.md`
5. Proceed to LỆNH 11

---

## ✍️ LỆNH 11: Final Sign-Off (2 min)

**Paste vào Qwen:**

```
FINAL PRODUCTION SIGN-OFF - Ready to deploy?

Generate comprehensive checklist:

CRITICAL (Must-Have):
- [ ] All unit tests passing (npm run test)
- [ ] No build errors (npm run build)
- [ ] No TypeScript errors (npm run lint)
- [ ] No hardcoded secrets in code
- [ ] Admin routes protected (non-admin can't access)
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] SSL/TLS certificate valid
- [ ] Backup taken of current production database
- [ ] Rollback procedure tested

HIGH (Very Important):
- [ ] E2E tests for critical journeys passing
- [ ] API contract tests passing
- [ ] Performance tests within SLO
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Error tracking (Sentry) working
- [ ] Monitoring/alerting configured
- [ ] Logs aggregated (searchable)

MEDIUM (Important):
- [ ] Code review completed
- [ ] Dependencies updated (no critical CVEs)
- [ ] Documentation updated
- [ ] README has deployment instructions
- [ ] Emergency contact list documented
- [ ] On-call rotation assigned

LOW (Nice-to-Have):
- [ ] Performance optimized
- [ ] Bundle size minimized
- [ ] Analytics dashboard configured
- [ ] Team training completed

For each unchecked item:
- Why it's important
- How to verify
- Effort to complete (minutes)
- Impact if skipped

Output: Final sign-off checklist with sign-off fields (name/date).
```

**What to do after Qwen responds:**
1. Complete all CRITICAL items (non-negotiable)
2. Complete all HIGH items (strongly recommended)
3. Get approval from team lead/manager
4. Document in: `QWEN_AUDIT_FINAL_SIGN_OFF.md`
5. **Ready to deploy!**

---

## 🎬 DEPLOYMENT COMMANDS (When All Phases Complete)

```bash
# 1. Final verification
npm run build
npm run lint
npm run test -- tests/unit/middleware

# 2. Commit changes
git add .
git commit -m "chore: production ready (complete audit pass)"

# 3. Deploy
git push origin main
# Vercel auto-deploys, or manual trigger in dashboard

# 4. Monitor
# Watch logs, error tracking, performance for 24 hours
```

---

## 📊 Document Tracker

After each Qwen response, create:

| Phase | Document | Status |
|-------|----------|--------|
| 1 | `QWEN_AUDIT_PHASE1_BUILD.md` | ⏳ Pending |
| 2 | `QWEN_AUDIT_PHASE2_SECURITY.md` | ⏳ Pending |
| 3 | `QWEN_AUDIT_PHASE3_DEPS.md` | ⏳ Pending |
| 4 | `QWEN_AUDIT_PHASE4_E2E.md` | ⏳ Pending |
| 5 | `QWEN_AUDIT_PHASE5_API.md` | ⏳ Pending |
| 6 | `QWEN_AUDIT_PHASE6_PERF.md` | ⏳ Pending |
| 7 | `QWEN_AUDIT_PHASE7_DB.md` | ⏳ Pending |
| 8 | `QWEN_AUDIT_PHASE8_DEPLOY.md` | ⏳ Pending |
| 9 | `QWEN_AUDIT_PHASE9_POSTDEPLOY.md` | ⏳ Pending |
| 10 | `QWEN_AUDIT_PHASE10_ROLLBACK.md` | ⏳ Pending |
| 11 | `QWEN_AUDIT_FINAL_SIGN_OFF.md` | ⏳ Pending |

---

## ⏱️ Time Breakdown

| Phase | Time | Total |
|-------|------|-------|
| Lệnh 1-2 (Build + Security) | 7 min | 7 min |
| Lệnh 3-4 (Deps + E2E) | 8 min | 15 min |
| Lệnh 5-6 (API + Perf) | 8 min | 23 min |
| Lệnh 7-8 (DB + Deploy) | 6 min | 29 min |
| Lệnh 9-11 (Verify + Sign-Off) | 6 min | 35 min |
| Buffer (handle issues) | 15 min | **50 min** |

---

## 🎯 Success Criteria

All phases complete when:
- ✅ All documents created (11 files)
- ✅ All 🚨 CRITICAL issues fixed
- ✅ All tests passing (unit + E2E + API contracts)
- ✅ All checklist items completed
- ✅ Signed off by team lead
- ✅ Ready for production deployment

---

**Ready to start?**

```bash
qwen
# Then paste LỆNH 1
```

**Estimated deployment:** 50 minutes (with Qwen)
**Target:** Zero-risk production deployment

# 🚀 Production Deployment Audit Checklist - ApexRebate

**Status:** Pre-Production Ready
**Date:** Nov 16, 2025
**Deployment Target:** Vercel Production + Neon PostgreSQL

---

## 📋 PHASE 1: PRE-DEPLOYMENT VERIFICATION (30 min)

### Lệnh 1: Code Quality & Build Check
```bash
# Run locally first
npm run build
npm run lint
npm run test -- tests/unit/middleware

# Expected: All pass, 0 errors, 0 warnings
```

### Lệnh 2: Qwen - Build Verification
**Paste vào Qwen:**
```
BUILD VERIFICATION - Kiểm tra sẵn sàng deploy:

1. Next.js Build Analysis:
   - Review next.config.mjs for production settings
   - Check for any hardcoded localhost URLs
   - Verify environment variables are used (not hardcoded)
   - Look for console.log() that should be removed
   
2. Environment Variables:
   - List all env vars used in the app
   - Which ones are required for production?
   - Which ones have defaults (safe vs dangerous)?
   - Are secrets properly configured (not in git)?
   
3. API Routes Validation:
   - Are all API endpoints protected with auth where needed?
   - Do rate limits exist for public endpoints?
   - Are error messages safe for production (no stack traces)?
   - Is CORS configured correctly for production domain?
   
4. Database Readiness:
   - Are all Prisma migrations applied?
   - Is connection pooling configured for Neon?
   - Are there any pending migrations?
   - Is DATABASE_URL set correctly for production?
   
5. NextAuth Configuration:
   - Is NEXTAUTH_URL set to production domain?
   - Is NEXTAUTH_SECRET configured?
   - Are OAuth providers configured?
   - Is session timeout appropriate?

Output format: Checklist with ✅/❌ for each item. Flag any 🚨 CRITICAL issues.
```

---

## 🔒 PHASE 2: SECURITY PRE-FLIGHT (45 min)

### Lệnh 3: Qwen - Security Hardening
**Paste vào Qwen:**
```
SECURITY HARDENING - Chuẩn bị production:

1. Secrets & Credentials:
   - Search for hardcoded API keys, passwords, tokens
   - Check .env.example doesn't expose real values
   - Verify .gitignore includes .env.local, .env.production.local
   - Are GitHub secrets configured (VERCEL_TOKEN, DB credentials)?
   
2. HTTP Headers & CSP:
   - Are security headers configured (X-Frame-Options, X-Content-Type-Options)?
   - Is Content-Security-Policy set?
   - Are CORS headers secure?
   - Is HSTS enabled for HTTPS?
   
3. Authentication Security:
   - Session timeout is configured?
   - JWT secret is strong (not weak default)?
   - Password requirements enforced?
   - Is email verification required for new accounts?
   - Is 2FA available for admin accounts?
   
4. Admin Panel Security:
   - Is /admin route only accessible to ADMIN/CONCIERGE role?
   - Is 2-eyes approval enforced for critical operations?
   - Are admin actions logged?
   - Can admin passwords be changed?
   - Is there account lockout after failed login attempts?
   
5. API Security Checklist:
   - POST/PUT/DELETE endpoints have CSRF protection?
   - Rate limiting on login endpoint (prevent brute force)?
   - File upload endpoints validate file types/sizes?
   - No SQL injection vulnerabilities in queries?
   - No XSS vulnerabilities in rendered content?
   
6. Data Protection:
   - User passwords hashed with bcrypt (not plaintext)?
   - Sensitive data encrypted at rest (payment info)?
   - API responses don't leak user data?
   - Logs don't contain sensitive information?
   
7. DLQ & Webhook Security:
   - Webhook payloads signed with HMAC?
   - 2-eyes token required for DLQ operations?
   - Failed webhooks logged properly?
   - Retry logic prevents duplicate processing?

Output: Security checklist with vulnerabilities flagged 🚨 and fixes provided.
```

### Lệnh 4: Qwen - Third-Party Dependencies
**Paste vào Qwen:**
```
DEPENDENCY AUDIT - Kiểm tra thư viện bên thứ ba:

1. Package Vulnerabilities:
   - Run: npm audit and show vulnerable packages
   - Are there any known CVEs in dependencies?
   - Which packages are outdated (major version behind)?
   
2. Dependency Health:
   - List packages that haven't been updated in >1 year
   - Are there replacement packages (old/unmaintained ones)?
   - Check for duplicate dependencies (pkg A and pkg B do same thing)
   
3. Bundle Size Impact:
   - Which npm packages contribute most to bundle size?
   - Are there lighter alternatives?
   - Can any packages be made optional (only loaded when needed)?
   
4. License Compliance:
   - Are all licenses compatible with Apache-2.0?
   - Any GPL packages (require source code release)?
   - Any copyleft packages requiring disclosure?

Output: Actionable list of:
- 🚨 CRITICAL: Fix before production (security issues)
- ⚠️ WARNING: Fix soon (vulnerabilities, unmaintained)
- 💡 SUGGESTION: Nice to have (optimization, cleanup)
```

---

## ✅ PHASE 3: FUNCTIONALITY TESTING (60 min)

### Lệnh 5: Qwen - Critical User Journeys
**Paste vào Qwen:**
```
E2E TEST GENERATION - Tạo test cases cho critical flows:

Generate Playwright E2E test code for these critical user journeys:

1. Unauthenticated → SignUp → Authenticated → Dashboard:
   - User visits /{locale}/auth/signup
   - Fills email, password, accepts terms
   - Clicks submit → created in database
   - Redirected to /{locale}/dashboard
   - Can access referral page, profile page
   - Locale preserved (if entered via /vi/auth/signup → /vi/dashboard)

2. Login with Different Roles:
   - Regular user (USER role) can access /dashboard but NOT /admin
   - Admin user (ADMIN role) can access /admin
   - When admin accesses /admin → sees admin panel
   - When user tries /admin → redirected to /dashboard

3. Admin DLQ Operations:
   - Admin accesses /admin/dlq
   - Can list DLQ items
   - Clicking "Replay" requires 2-eyes token
   - Invalid token rejected
   - Valid token allows replay
   - Item status updated in database

4. Logout & Session Cleanup:
   - User clicks logout
   - Session cleared
   - Can't access /dashboard (redirected to signin)
   - Old session token doesn't work
   - Can login again with same account

5. Tools Marketplace (Public Access):
   - Unauthenticated user can browse /tools
   - Can view tool details (/tools/[id])
   - Cannot click "Upload Tool" (button disabled or redirects to signup)
   - After signup, can upload tools

6. Locale Switching:
   - User logs in via /vi/auth/signin
   - Redirects to /vi/dashboard (not /en/dashboard)
   - URL contains correct locale throughout
   - Can manually switch to /th/dashboard
   - User data consistent across locales

7. Admin Audit Trail:
   - Admin performs action (create user, modify payout rule)
   - Action logged in audit_log table
   - Admin can view audit log (/admin/audit or /admin/logs)
   - Log contains: who, what, when, outcome

For each test, provide:
- Setup (create test data, login)
- Actions (clicks, form fills)
- Assertions (URL check, data validation)
- Cleanup (logout, delete test data)

Focus on CRITICAL paths first (auth, admin, payments).
```

### Lệnh 6: Qwen - API Contract Testing
**Paste vào Qwen:**
```
API CONTRACT TESTS - Xác nhận response format:

For each API endpoint, generate contract tests ensuring:

1. GET /api/dashboard - Dashboard Data:
   - Authentication required ✅
   - Response format: { success: true, data: {...} }
   - Data structure includes: userData, savingsHistory, stats
   - No sensitive data leaked (e.g., other users' data)
   - Performance: response < 500ms

2. GET /api/user-referrals - Referral List:
   - Pagination working (limit, offset)
   - Only returns referrals for logged-in user
   - Sorting by date works
   - Response format consistent

3. GET /api/user-profile - User Profile:
   - Returns only logged-in user's data
   - Cannot fetch other users' profiles
   - Profile update returns updated data
   - No passwords/sensitive fields in response

4. POST /api/tools - Upload Tool:
   - Authentication required
   - File validation (type, size)
   - Error responses include helpful messages
   - Successful upload returns tool ID
   - Tool appears in /tools marketplace

5. Admin APIs (/api/admin/*):
   - ADMIN role required (not just authenticated)
   - Non-admin users get 403 Forbidden
   - All operations logged in audit_log
   - Rate limiting applied

For each endpoint:
- Show: Method, Path, Required Auth, Response Schema
- Test: Success case (200), Unauthorized (401), Forbidden (403), Validation error (400)
```

---

## 🚀 PHASE 4: PERFORMANCE & LOAD TESTING (45 min)

### Lệnh 7: Qwen - Performance Optimization
**Paste vào Qwen:**
```
PERFORMANCE PRE-FLIGHT - Tối ưu trước deploy:

1. Database Query Performance:
   - For each API endpoint (dashboard, referrals, profile):
     - How many DB queries are executed?
     - What's the total execution time?
     - Are there SELECT * queries (should be specific columns)?
     - Missing indexes on frequently filtered fields?
   
   Provide for each endpoint:
   - Current: [N] queries, [Xms] time
   - Optimized: [M] queries, [Yms] time
   - Code changes needed

2. API Response Time SLO:
   - Set target: /dashboard < 200ms, /referrals < 300ms, /tools < 150ms
   - Which endpoints exceed target?
   - How to fix (caching, pagination, query optimization)?

3. Frontend Performance:
   - Are there unnecessary re-renders in Dashboard component?
   - Can React.memo() be added to expensive components?
   - Is image lazy-loading configured?
   - Are CSS/JS bundles minified for production?

4. Caching Strategy:
   - Which API responses are cacheable?
   - How long should cache be valid?
   - Are cache headers set (Cache-Control, ETag)?
   - Is Redis or similar configured?

5. Vercel Edge Functions:
   - Which routes could run on Edge (faster response)?
   - Examples: API auth checks, redirects, rate limiting
   - How to configure in next.config.mjs?

6. Load Simulation:
   - 100 concurrent users logging in
   - 1000 users browsing /tools
   - 50 users uploading tools simultaneously
   - Expected response times and potential bottlenecks?

Output: Performance improvement roadmap with:
- Quick wins (< 30 min to implement)
- Medium effort (1-2 hours)
- Long term (refactor, architectural changes)
```

### Lệnh 8: Qwen - Database Connection & Pooling
**Paste vào Qwen:**
```
DATABASE PRODUCTION READINESS - Neon PostgreSQL:

1. Connection Pooling:
   - Is Neon connection pooling configured in .env?
   - Current pool size setting?
   - Recommendations for production load?
   - How to monitor connection usage?

2. Database Backup & Recovery:
   - Is automated backup configured?
   - Backup frequency (daily, hourly)?
   - Retention period (7 days, 30 days)?
   - Can you restore from backup?
   - How long is RTO (Recovery Time Objective)?

3. Database Monitoring:
   - Are there slow query logs?
   - Table sizes and growth rate?
   - Can you monitor active connections?
   - Are there alerts for disk space?

4. Migration Safety:
   - Are zero-downtime migrations possible?
   - Rollback procedure if migration fails?
   - Data validation after migration?
   - Backup taken before migration?

5. Production Data:
   - Initial data seeding strategy?
   - How to manage test vs production data?
   - GDPR compliance (can delete user data)?
   - Data retention policy?

Show: Checklist + commands for each item.
```

---

## 🔍 PHASE 5: DEPLOYMENT READINESS (30 min)

### Lệnh 9: Qwen - Deployment Configuration
**Paste vào Qwen:**
```
DEPLOYMENT CONFIGURATION - Vercel + Neon Setup:

1. Environment Variables for Production:
   - Which variables are required?
   - Which ones have defaults?
   - Current test values vs production values
   - How to set in Vercel dashboard?
   
   Required vars:
   - NEXTAUTH_URL (production domain)
   - NEXTAUTH_SECRET (strong, random)
   - DATABASE_URL (Neon production)
   - API keys (email, payment, etc.)

2. Vercel Deployment Settings:
   - Correct build command: npm run build
   - Correct start command: next start
   - Root directory: /
   - Regions: auto-detect or specific?
   - Environment: production
   
3. Domains & SSL:
   - Primary domain configured?
   - SSL/TLS automatic (Let's Encrypt)?
   - Redirect http → https?
   - Custom domain aliases?

4. Analytics & Monitoring:
   - Vercel Analytics enabled?
   - Error tracking (Sentry) configured?
   - Performance monitoring dashboard?
   - Uptime monitoring?

5. CI/CD Pipeline:
   - GitHub branch connected (main)?
   - Automatic deployment on push?
   - Preview deployments for PRs?
   - Rollback procedure?

6. Secrets Management:
   - How to store secrets (GitHub, Vercel)?
   - Never commit .env.local to git
   - Rotate secrets periodically?
   - Audit who has access?

Output: Step-by-step deployment checklist for Vercel.
```

### Lệnh 10: Qwen - Post-Deployment Verification
**Paste vào Qwen:**
```
POST-DEPLOYMENT CHECKLIST - After deploy to production:

1. Website Accessibility:
   - https://apexrebate.com/ loads (< 3 seconds)
   - All pages accessible (homepage, tools, dashboard)
   - API endpoints respond (check /api/health if exists)
   - Database connections working

2. Authentication Flow:
   - Can signup new account at https://apexrebate.com/en/auth/signup
   - Can login at https://apexrebate.com/en/auth/signin
   - Redirects to dashboard after login
   - Can logout and login again

3. Admin Panel:
   - Admin user can access https://apexrebate.com/admin
   - DLQ panel at /admin/dlq works
   - Can view logs/audit trail
   - 2-eyes token required for operations

4. Localization:
   - Vietnamese: https://apexrebate.com/vi works
   - Thai: https://apexrebate.com/th works
   - Indonesian: https://apexrebate.com/id works
   - English: https://apexrebate.com/en works

5. Performance:
   - Response times within SLO (dashboard < 200ms)
   - No 5xx errors in logs
   - Database connections healthy
   - Memory/CPU usage normal

6. Security Headers:
   - X-Content-Type-Options: nosniff
   - X-Frame-Options: DENY or SAMEORIGIN
   - X-XSS-Protection: 1; mode=block
   - Strict-Transport-Security: max-age=31536000

7. Error Handling:
   - 404 page returns proper error
   - Unhandled errors go to Sentry/monitoring
   - User gets friendly error messages (not stack traces)
   - Errors logged for debugging

8. Database Health:
   - Tables created successfully
   - Migrations applied
   - No orphaned records
   - Backups running

Provide: Curl commands to verify each point.
```

---

## ⚠️ PHASE 6: ROLLBACK STRATEGY (15 min)

### Lệnh 11: Qwen - Rollback Plan
**Paste vào Qwen:**
```
ROLLBACK & EMERGENCY PROCEDURES - Prepare for worst case:

1. Quick Rollback (< 5 min):
   - Previous production deployment available?
   - How to revert in Vercel (1-click rollback)?
   - Database rollback procedure if schema changed?
   
2. Critical Issues Response:
   - Authentication broken → Rollback immediately
   - Database inaccessible → Use backup
   - Performance degradation > 50% → Investigate
   - Security breach detected → Kill sessions + investigate
   
3. Incident Communication:
   - Who to notify (team, users)?
   - Status page updates?
   - Incident report template?
   - Post-mortem process?

4. Monitoring & Alerts:
   - Error rate spike detected → Alert on Slack?
   - Database down → Immediate alert?
   - High latency (> 1s) → Warning?
   - What's the escalation path?

5. Testing Rollback:
   - Can you rollback from current production?
   - Does rollback restore data correctly?
   - Any data loss risk?
   - Dry-run successful?

Output: Emergency procedures checklist + rollback commands.
```

---

## 📊 PHASE 7: FINAL SIGN-OFF (15 min)

### Lệnh 12: Qwen - Pre-Production Sign-Off
**Paste vào Qwen:**
```
FINAL PRE-PRODUCTION CHECKLIST - Last verification:

Generate a comprehensive sign-off checklist covering:

1. ✅ CRITICAL (Must-Have):
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

2. ✅ HIGH (Very Important):
   - [ ] E2E tests for critical user journeys passing
   - [ ] API contract tests passing
   - [ ] Performance tests within SLO
   - [ ] Security headers configured
   - [ ] Rate limiting enabled
   - [ ] Error tracking (Sentry) working
   - [ ] Monitoring/alerting configured
   - [ ] Logs aggregated (can be searched)

3. ✅ MEDIUM (Important):
   - [ ] Code review completed
   - [ ] Dependencies up-to-date (no critical CVEs)
   - [ ] Documentation updated
   - [ ] README has deployment instructions
   - [ ] Emergency contact list documented
   - [ ] On-call rotation assigned

4. ✅ LOW (Nice-to-Have):
   - [ ] Performance optimized
   - [ ] Bundle size minimized
   - [ ] Analytics dashboard configured
   - [ ] Team training completed

For each unchecked item, provide:
- Why it's important
- How to verify
- Effort to complete (minutes/hours)
- Impact if skipped

Output format: Markdown checklist with sign-off names/dates.
```

---

## 🎬 EXECUTION SEQUENCE

### Quick Start (Do now):
```bash
# Terminal 1: Local verification
npm run build
npm run lint
npm run test -- tests/unit/middleware

# Should see: ✅ All pass, 0 errors

# Terminal 2: Start Qwen
qwen

# Then paste prompts in order:
# 1. Lệnh 2: Build Verification (2 min)
# 2. Lệnh 3: Security Hardening (5 min)
# 3. Lệnh 4: Dependency Audit (3 min)
# 4. Lệnh 5: E2E Test Generation (5 min)
# 5. Lệnh 6: API Contract Tests (3 min)
# 6. Lệnh 7: Performance Optimization (5 min)
# 7. Lệnh 8: Database Readiness (3 min)
# 8. Lệnh 9: Deployment Configuration (3 min)
# 9. Lệnh 10: Post-Deployment Verification (2 min)
# 10. Lệnh 11: Rollback Strategy (2 min)
# 11. Lệnh 12: Final Sign-Off (2 min)

# Total: ~40 minutes of Qwen audit
```

---

## 📁 Output Documents (Auto-create):

After each Qwen audit, create:
- `QWEN_AUDIT_PHASE1_BUILD.md` → Build verification results
- `QWEN_AUDIT_PHASE2_SECURITY.md` → Security findings + fixes
- `QWEN_AUDIT_PHASE3_DEPS.md` → Dependency audit
- `QWEN_AUDIT_PHASE4_E2E.md` → E2E test code
- `QWEN_AUDIT_PHASE5_API.md` → API test code
- `QWEN_AUDIT_PHASE6_PERF.md` → Performance roadmap
- `QWEN_AUDIT_PHASE7_DB.md` → Database readiness
- `QWEN_AUDIT_PHASE8_DEPLOY.md` → Deployment steps
- `QWEN_AUDIT_PHASE9_POSTDEPLOY.md` → Verification steps
- `QWEN_AUDIT_PHASE10_ROLLBACK.md` → Emergency procedures
- `QWEN_AUDIT_FINAL_SIGN_OFF.md` → Final checklist ✅

---

## 🚀 Deployment Commands (When Ready):

```bash
# 1. Verify everything locally
npm run build && npm run test && npm run lint

# 2. Commit changes
git add .
git commit -m "chore: pre-production audit complete"
git push origin main

# 3. Vercel auto-deploys (if CI/CD configured)
# or manually trigger in Vercel dashboard

# 4. Run post-deployment verification
# (Use Qwen Lệnh 10 checklist)

# 5. Monitor for 24 hours
# Check logs, error tracking, performance metrics
```

---

**Last Updated:** Nov 16, 2025
**Status:** Ready for Production Audit
**Estimated Time:** 40-50 minutes (with Qwen)
**Next Step:** Start Qwen → Run Phase 1 (Build Verification)

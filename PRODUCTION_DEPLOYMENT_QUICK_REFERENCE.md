# 🚀 Production Deployment - Quick Reference Card

**ApexRebate Production Deployment Guide**
**Date:** Nov 16, 2025 | **Status:** Ready for Audit

---

## ⚡ 60-SECOND QUICKSTART

```bash
# 1. Run pre-flight check
bash START_PRODUCTION_AUDIT.sh

# 2. Start Qwen audit
qwen

# 3. Run 11 Qwen audit phases (40-50 min total)
# See PRODUCTION_DEPLOYMENT_AUDIT_CHECKLIST.md for prompts

# 4. Deploy to production
npm run build && git push origin main

# 5. Monitor & verify
# Check logs, error tracking, performance metrics
```

---

## 📋 QWEN AUDIT PHASES (Copy-Paste Ready)

| Phase | Topic | Time | File | Command |
|-------|-------|------|------|---------|
| **1** | Build Verification | 2 min | Lệnh 2 | See below |
| **2** | Security Hardening | 5 min | Lệnh 3 | See below |
| **3** | Dependency Audit | 3 min | Lệnh 4 | See below |
| **4** | E2E Tests | 5 min | Lệnh 5 | See below |
| **5** | API Contracts | 3 min | Lệnh 6 | See below |
| **6** | Performance | 5 min | Lệnh 7 | See below |
| **7** | Database | 3 min | Lệnh 8 | See below |
| **8** | Deployment | 3 min | Lệnh 9 | See below |
| **9** | Post-Deploy | 2 min | Lệnh 10 | See below |
| **10** | Rollback | 2 min | Lệnh 11 | See below |
| **11** | Sign-Off | 2 min | Lệnh 12 | See below |

---

## 🎯 COPY-PASTE PROMPTS FOR QWEN

### Step 1: Start Qwen
```bash
qwen
```

### Lệnh 2: BUILD VERIFICATION (2 min)
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

### Lệnh 3: SECURITY HARDENING (5 min)
```
SECURITY HARDENING - Chuẩn bị production:

1. Secrets & Credentials:
   - Search for hardcoded API keys, passwords, tokens
   - Check .env.example doesn't expose real values
   - Verify .gitignore includes .env.local
   - Are GitHub secrets configured?
   
2. HTTP Headers & CSP:
   - Are security headers configured?
   - Content-Security-Policy set?
   - CORS headers secure?
   - HSTS enabled for HTTPS?
   
3. Authentication Security:
   - Session timeout configured?
   - JWT secret is strong?
   - Password requirements enforced?
   - Email verification required?
   - 2FA available for admin?
   
4. Admin Panel Security:
   - Only ADMIN/CONCIERGE can access /admin?
   - 2-eyes approval enforced?
   - Admin actions logged?
   - Account lockout after failed login?
   
5. API Security:
   - CSRF protection on POST/PUT/DELETE?
   - Rate limiting on login endpoint?
   - File upload validation?
   - SQL injection protection?
   - XSS protection?
   
6. Data Protection:
   - Passwords hashed with bcrypt?
   - Sensitive data encrypted?
   - API responses don't leak user data?
   - Logs don't contain sensitive info?
   
7. DLQ & Webhook Security:
   - Webhook payloads signed?
   - 2-eyes token required?
   - Failed webhooks logged?
   - Retry prevents duplicates?

Output: Checklist with 🚨 vulnerabilities and fixes.
```

### Lệnh 4: DEPENDENCY AUDIT (3 min)
```
DEPENDENCY AUDIT - Kiểm tra thư viện bên thứ ba:

1. Package Vulnerabilities:
   - npm audit: list vulnerable packages
   - Any known CVEs?
   - Outdated packages?
   
2. Dependency Health:
   - Unmaintained packages?
   - Duplicate dependencies?
   - Can be replaced with lighter alternatives?
   
3. Bundle Size Impact:
   - Largest packages in bundle?
   - Lighter alternatives?
   - Can be lazy-loaded?
   
4. License Compliance:
   - Compatible with Apache-2.0?
   - Any GPL packages?
   - Any copyleft packages?

Output: Prioritized list of fixes needed before deployment.
```

### Lệnh 5: E2E TEST GENERATION (5 min)
```
E2E TEST GENERATION - Tạo test cases:

Generate Playwright E2E test code for:

1. Signup → Authentication → Dashboard (preserve locale)
2. Login with different roles (USER vs ADMIN)
3. Admin accesses /admin (non-admin gets redirected)
4. DLQ operations with 2-eyes approval
5. Logout & session cleanup
6. Tools marketplace (public access)
7. Locale switching (/vi vs /en)
8. Audit trail logging

For each test provide:
- Setup (test data, login)
- Actions (clicks, form fills)
- Assertions (URL, data validation)
- Cleanup

Output: Ready-to-run Playwright test code.
```

### Lệnh 6: API CONTRACT TESTS (3 min)
```
API CONTRACT TESTS - Xác nhận response format:

For each endpoint, generate contract tests:

1. GET /api/dashboard:
   - Auth required, response format, performance
   
2. GET /api/user-referrals:
   - Pagination, sorting, security
   
3. GET /api/user-profile:
   - Only returns logged-in user's data
   
4. POST /api/tools:
   - File validation, error handling
   
5. Admin APIs:
   - ADMIN role required, audit logging

For each: Method, Path, Auth, Response Schema, Test cases.
Output: Ready-to-run test code.
```

### Lệnh 7: PERFORMANCE OPTIMIZATION (5 min)
```
PERFORMANCE PRE-FLIGHT - Tối ưu trước deploy:

1. Database Query Performance:
   - For each API: how many queries? Response time?
   - SELECT * queries (should be specific columns)?
   - Missing indexes?
   
2. API Response Time SLO:
   - Target: /dashboard < 200ms, /referrals < 300ms, /tools < 150ms
   - Which endpoints exceed?
   - How to fix?
   
3. Frontend Performance:
   - Unnecessary re-renders?
   - React.memo() missing?
   - Image lazy-loading?
   - Minified bundles?
   
4. Caching Strategy:
   - Which responses cacheable?
   - How long?
   - Cache headers set?
   
5. Vercel Edge Functions:
   - Which routes could run on Edge?
   - How to configure?
   
6. Load Simulation:
   - 100 concurrent signups
   - 1000 users browsing /tools
   - 50 users uploading tools

Output: Roadmap (quick wins first).
```

### Lệnh 8: DATABASE PRODUCTION (3 min)
```
DATABASE PRODUCTION - Neon PostgreSQL:

1. Connection Pooling:
   - Configured? Pool size? Recommendations?
   
2. Backup & Recovery:
   - Automated backup? Frequency? Retention?
   - Can restore from backup? RTO?
   
3. Database Monitoring:
   - Slow query logs? Table sizes? Active connections?
   - Disk space alerts?
   
4. Migration Safety:
   - Zero-downtime migrations? Rollback procedure?
   - Data validation? Backup before migration?
   
5. Production Data:
   - Seeding strategy? Test vs production?
   - GDPR compliance? Data retention?

Output: Checklist + commands.
```

### Lệnh 9: DEPLOYMENT CONFIG (3 min)
```
DEPLOYMENT CONFIGURATION - Vercel + Neon:

1. Environment Variables:
   - Required vars (NEXTAUTH_URL, DATABASE_URL, etc.)
   - How to set in Vercel dashboard?
   
2. Vercel Settings:
   - Build command: npm run build
   - Start command: next start
   - Regions, environment, SSL
   
3. Domains & SSL:
   - Primary domain configured?
   - SSL automatic?
   - Redirect http → https?
   
4. Analytics & Monitoring:
   - Vercel Analytics? Sentry? Uptime?
   
5. CI/CD Pipeline:
   - GitHub branch connected?
   - Auto-deploy on push?
   - Preview deployments?
   
6. Secrets Management:
   - GitHub secrets? Vercel secrets?
   - Never commit .env.local
   - Rotate periodically?

Output: Step-by-step checklist for Vercel.
```

### Lệnh 10: POST-DEPLOYMENT VERIFICATION (2 min)
```
POST-DEPLOYMENT CHECKLIST - After deploy:

1. Website Accessibility:
   - apexrebate.com loads (< 3s)?
   - All pages accessible?
   - API endpoints respond?
   
2. Authentication Flow:
   - Can signup?
   - Can login?
   - Logout works?
   
3. Admin Panel:
   - /admin accessible to admin?
   - /admin/dlq works?
   - Logs/audit visible?
   
4. Localization:
   - /vi, /th, /id, /en all work?
   
5. Performance:
   - Within SLO?
   - No 5xx errors?
   - DB healthy?
   
6. Security Headers:
   - X-Content-Type-Options?
   - X-Frame-Options?
   - Strict-Transport-Security?
   
7. Error Handling:
   - 404 returns proper error?
   - Stack traces NOT exposed?
   - Errors in Sentry?
   
8. Database Health:
   - Tables created?
   - Migrations applied?
   - Backups running?

Output: Curl commands to verify each.
```

### Lệnh 11: ROLLBACK & EMERGENCY (2 min)
```
ROLLBACK & EMERGENCY PROCEDURES:

1. Quick Rollback (< 5 min):
   - Previous deployment available?
   - 1-click rollback in Vercel?
   - Database rollback procedure?
   
2. Critical Issues Response:
   - Auth broken → Rollback immediately
   - DB inaccessible → Use backup
   - Performance degraded > 50% → Investigate
   - Security breach → Kill sessions + investigate
   
3. Incident Communication:
   - Who to notify?
   - Status page updates?
   - Incident report template?
   
4. Monitoring & Alerts:
   - Error rate spike → Alert?
   - Database down → Alert?
   - High latency → Warning?
   
5. Testing Rollback:
   - Can rollback from current?
   - Data restored correctly?
   - Data loss risk?

Output: Emergency procedures + rollback commands.
```

### Lệnh 12: FINAL SIGN-OFF (2 min)
```
FINAL PRE-PRODUCTION CHECKLIST:

Generate sign-off checklist:

1. ✅ CRITICAL (Must-Have):
   - [ ] Tests passing
   - [ ] Build successful
   - [ ] No hardcoded secrets
   - [ ] Admin routes protected
   - [ ] Migrations tested
   - [ ] Env vars configured
   - [ ] SSL valid
   - [ ] Backup taken
   - [ ] Rollback tested

2. ✅ HIGH (Very Important):
   - [ ] E2E tests passing
   - [ ] API contracts passing
   - [ ] Performance within SLO
   - [ ] Security headers set
   - [ ] Rate limiting enabled
   - [ ] Error tracking working
   - [ ] Monitoring configured
   - [ ] Logs aggregated

3. ✅ MEDIUM (Important):
   - [ ] Code reviewed
   - [ ] Dependencies updated
   - [ ] Documentation updated
   - [ ] Emergency contact list

4. ✅ LOW (Nice-to-Have):
   - [ ] Performance optimized
   - [ ] Bundle minimized
   - [ ] Analytics dashboard

For each unchecked: why important, how to verify, effort needed.

Output: Markdown checklist with sign-off.
```

---

## 🚀 DEPLOYMENT FLOW

```
1. Run: bash START_PRODUCTION_AUDIT.sh
2. Open: qwen
3. Run: 11 Qwen audit phases (40-50 min)
4. Review: All findings
5. Fix: Any 🚨 CRITICAL issues
6. Execute:
   npm run build
   git add .
   git commit -m "chore: production ready (audit complete)"
   git push origin main
7. Monitor: Logs, errors, performance (24 hours)
```

---

## ✅ SUCCESS CRITERIA

| Item | Status | Check |
|------|--------|-------|
| Build | ✅ | npm run build |
| Tests | ✅ | npm run test |
| Lint | ✅ | npm run lint |
| Qwen Audit | ⏳ | 11 phases |
| Security | ⏳ | No 🚨 CRITICAL |
| Performance | ⏳ | Within SLO |
| Database | ⏳ | Migrations done |
| Deployment | ⏳ | Config ready |
| Post-Deploy | ⏳ | Smoke tests pass |
| Sign-Off | ⏳ | All boxes checked |

---

## 🆘 EMERGENCY ROLLBACK

```bash
# If something goes wrong in production:

# 1. Immediate: Revert to previous deployment
# (In Vercel dashboard: Click "Rollback" button)

# 2. Or via Git:
git revert HEAD
git push origin main

# 3. Monitor:
npm run dev  # Test locally first
# Then check production logs

# 4. Notify:
# - Slack: #operations
# - Email: ops@apexrebate.com
# - Create incident report
```

---

## 📞 SUPPORT CONTACTS

| Role | Contact | Escalation |
|------|---------|-----------|
| **On-Call** | TBD | Pages if critical |
| **Manager** | TBD | For decisions |
| **DevOps** | TBD | Infrastructure |
| **Security** | TBD | Security issues |

---

## 📊 FINAL STATUS

✅ **Ready for Production Audit**
- Local build: PASS
- Middleware tests: 24/24 PASS
- Qwen installed: v0.2.1
- Audit plan: 11 phases ready
- Estimated time: 40-50 minutes

**Next:** `bash START_PRODUCTION_AUDIT.sh` → `qwen` → Run Lệnh 2

---

**Last Updated:** Nov 16, 2025 18:23 UTC+7
**Prepared By:** Amp + Qwen Code
**Target Deployment:** This week if all audits pass

# Qwen Code Audit Prompts for ApexRebate

**Setup:** Start Qwen in project root
```bash
cd /Users/macbookprom1/apexrebate-1
qwen
```

---

## 🔴 Critical Audits (Run in Order)

### 1. SECURITY AUDIT
```
Perform a comprehensive security audit of this Next.js project:

1. Authentication & Authorization:
   - Review src/lib/auth.ts and middleware.ts
   - Check for role validation vulnerabilities
   - Verify JWT/session handling is secure
   
2. API Security:
   - Check all POST/PUT/DELETE endpoints for CSRF protection
   - Verify API rate limiting is configured
   - Check for SQL injection risks in database queries
   
3. Data Protection:
   - Verify sensitive data is not logged
   - Check for hardcoded secrets/API keys
   - Review password hashing (bcrypt vs plain text)
   
4. Admin Routes:
   - Are admin endpoints properly protected?
   - Can non-admins bypass role checks?
   - Is 2-eyes approval enforced for critical operations?

List all vulnerabilities with file locations and severity (Critical/High/Medium/Low).
```

### 2. AUTHENTICATION FLOW AUDIT
```
Analyze the authentication flow in detail:

1. Sign-in Flow:
   - Trace the signin request from UI → NextAuth → database
   - Check for redirect vulnerabilities (open redirect, loop)
   - Verify locale preservation during redirect
   
2. Session Handling:
   - Is session timeout configured?
   - How is JWT token refreshed?
   - Can expired tokens be replayed?
   
3. Role-Based Access:
   - Does middleware properly check user.role?
   - Are admin routes protected at multiple levels?
   - What happens when role changes mid-session?
   
4. Logout:
   - Is session properly cleared on logout?
   - Are tokens revoked?
   - Can logged-out users access protected routes?

Provide a sequence diagram for signin → authenticated → protected route.
```

### 3. DATABASE & PRISMA AUDIT
```
Review the Prisma schema and database queries:

1. Schema Review:
   - List all models and their relationships
   - Check for missing indexes on frequently queried fields
   - Verify foreign key constraints are correct
   
2. Query Performance:
   - Find N+1 query problems in API routes
   - Check for SELECT * queries (missing explicit fields)
   - Identify missing .include() or .select() optimizations
   
3. Data Integrity:
   - Are unique constraints properly defined?
   - Check for cascading deletes that could cause data loss
   - Verify transaction support for critical operations
   
4. Migrations:
   - Are there pending migrations?
   - Any rollback risks?
   - Are migrations idempotent?

Focus on: src/app/api/dashboard, /user-profile, /user-referrals routes.
```

### 4. PERFORMANCE AUDIT
```
Identify performance bottlenecks:

1. API Response Times:
   - Which endpoints are slowest?
   - Are there database queries causing delays?
   - Is pagination implemented for large datasets?
   
2. Component Rendering:
   - Identify unnecessary re-renders
   - Check for missing React.memo() or useMemo()
   - Are event handlers properly memoized?
   
3. Bundle Size:
   - Are there unused dependencies?
   - Is code splitting configured correctly?
   - Are large libraries lazy-loaded?
   
4. Server-Side:
   - Is ISR (Incremental Static Regeneration) used where applicable?
   - Are cached queries causing stale data?
   - Is edge computing (Vercel Edge) available for critical routes?

Provide a performance optimization roadmap prioritized by impact.
```

### 5. ERROR HANDLING & LOGGING AUDIT
```
Review error handling across the application:

1. API Error Handling:
   - Are all endpoints catching errors properly?
   - Are error responses consistent (status codes, format)?
   - Are stack traces exposed to clients?
   
2. User Feedback:
   - Are error messages user-friendly or technical?
   - Is there a global error boundary for UI?
   - Are form validation errors handled?
   
3. Logging:
   - Are critical events logged (auth, payments, admin actions)?
   - Is sensitive data (passwords, tokens) logged?
   - Can logs be queried/searched?
   
4. Monitoring:
   - Are errors tracked (Sentry integration)?
   - Is there real-time alerting?
   - Can you reproduce user-reported issues from logs?

Check: src/app/api/*, middleware.ts, components/*.
```

---

## 🟡 Medium Priority Audits

### 6. CODE QUALITY AUDIT
```
Review code quality and maintainability:

1. Type Safety:
   - Are all TypeScript files correctly typed?
   - Any 'any' types that should be specific?
   - Are generics used properly?
   
2. Code Duplication:
   - Which functions/components are duplicated?
   - Can they be extracted to shared utilities?
   
3. Naming & Conventions:
   - Are function/variable names descriptive?
   - Is code organization logical?
   - Do components follow atomic design principles?
   
4. Documentation:
   - Are complex functions documented?
   - Is API documentation up-to-date?
   - Are there architectural decision records (ADRs)?

Suggest refactoring candidates with before/after examples.
```

### 7. TESTING COVERAGE AUDIT
```
Assess test coverage:

1. Current Tests:
   - What's currently being tested?
   - What's NOT being tested (gaps)?
   - Are edge cases covered?
   
2. Missing Tests:
   - Auth middleware: protected vs public routes (CRITICAL)
   - Admin route access control (CRITICAL)
   - API error responses (HIGH)
   - Database transaction rollbacks (MEDIUM)
   
3. Test Quality:
   - Are mocks realistic?
   - Do tests cover happy path AND error paths?
   - Are async operations handled correctly?
   
4. E2E Tests:
   - What user journeys need E2E tests?
   - Can you test the complete signin → dashboard flow?

Generate test cases with code examples.
```

### 8. ARCHITECTURE AUDIT
```
Review overall architecture:

1. Separation of Concerns:
   - Is business logic separated from UI?
   - Are API concerns isolated (auth, validation, DB)?
   
2. Dependencies:
   - Are there circular dependencies?
   - Can you list the import tree for critical modules?
   
3. Scalability:
   - Can this architecture scale to 10,000 users?
   - What are the bottlenecks?
   
4. Deployment:
   - How are environment variables managed?
   - Is there a staging → production pipeline?
   - How do you handle database migrations in production?

Suggest architectural improvements for 10x scale.
```

---

## 🟢 Low Priority (Nice-to-have)

### 9. FRONTEND UX AUDIT
```
Evaluate user experience:

1. Responsiveness:
   - Is the app mobile-friendly?
   - Are layouts responsive across all device sizes?
   
2. Accessibility:
   - Can keyboard users navigate the app?
   - Are form labels properly associated?
   - Is color contrast sufficient?
   
3. Loading States:
   - Are loading skeletons shown?
   - Is there perceived performance optimization?
   
4. Error UX:
   - Are error messages helpful?
   - Can users recover from errors easily?

Check: Dashboard, Auth pages, Admin panel.
```

### 10. INTERNATIONALIZATION AUDIT
```
Review i18n implementation:

1. Locale Support:
   - Which locales are supported (en, vi, th, id)?
   - Is default locale correct?
   - Can users switch locales?
   
2. Translation Files:
   - Are all strings translated?
   - Are there untranslated keys?
   - Is there a way to track missing translations?
   
3. Date/Time Handling:
   - Are dates formatted per locale?
   - Is timezone handling correct?
   
4. RTL Support:
   - Does the UI work for RTL languages?

Check: src/app/[locale]/*, messages/*.
```

---

## 📋 Quick Summary Prompt

If you only want a 5-minute overview:

```
Give me a 5-minute executive summary of this Next.js codebase:
1. What does it do?
2. What are the 3 biggest risks?
3. What are the 3 biggest opportunities for improvement?
4. How production-ready is it (1-10)?
5. What's the most critical thing to fix first?
```

---

## 🚀 Quick Start (Paste This First)

```bash
qwen
```

Then paste:
```
Analyze this Next.js project and answer these questions:

1. **Architecture**: What are the main components and how do they interact?
2. **Auth Flow**: Walk me through how a user signs in, step by step.
3. **Admin Panel**: What admin features are available? Are they properly secured?
4. **Locales**: How are multiple languages (en, vi, th, id) handled?
5. **Database**: What's the Prisma schema? Any obvious issues?
6. **Testing**: What's being tested? What's missing?

Focus on SECURITY first, then PERFORMANCE, then CODE QUALITY.
```

---

**Last Updated:** Nov 16, 2025
**Qwen Version:** 0.2.1
**Free Requests/Day:** 2,000

# 🧪 Admin Signin Manual Test Report

**Date:** November 10, 2025  
**Tester:** Copilot Agent  
**Status:** ⏳ In Progress

---

## Test Environment

### Local Development
- **URL:** http://localhost:3000/vi/auth/signin
- **Dev Server:** ✅ Running (port 3000)
- **Prisma Studio:** ✅ Running (port 5555)
- **Database:** Neon PostgreSQL (connected)

### Production
- **URL:** https://apexrebate-1-40fla36ew-minh-longs-projects-f5c82c9b.vercel.app/vi/auth/signin
- **Deploy:** ✅ Live (Nov 10, 2025)
- **Build:** ✅ 87 routes, 0 errors
- **Status:** ✅ All routes accessible

---

## Test Credentials

**Admin User:**
```
Email: admin@apexrebate.com
Password: admin123
Role: ADMIN
```

**Expected Behavior:**
- ✅ Login succeeds (no errors)
- ✅ Redirect to /vi/admin (or /vi/dashboard if not admin)
- ✅ No stuck screen
- ✅ Session persists
- ✅ Can access protected routes

---

## Test Scenarios

### Scenario 1: Admin Login to Dashboard
**URL:** http://localhost:3000/vi/auth/signin?callbackUrl=%2Fvi%2Fdashboard

**Steps:**
1. Open browser to signin URL
2. Enter email: admin@apexrebate.com
3. Enter password: admin123
4. Click "Đăng Nhập" button
5. Wait for redirect

**Expected Result:**
- Button shows "Signing In..." during auth
- Redirect to /vi/dashboard within 1 second
- Dashboard loads with admin user info

**Actual Result:** ⏳ **PENDING MANUAL TEST**

---

### Scenario 2: Admin Login to Admin Panel
**URL:** http://localhost:3000/vi/auth/signin?callbackUrl=%2Fvi%2Fadmin

**Steps:**
1. Open browser to signin URL
2. Enter email: admin@apexrebate.com
3. Enter password: admin123
4. Click "Đăng Nhập" button
5. Wait for redirect

**Expected Result:**
- Button shows "Signing In..." during auth
- Redirect to /vi/admin within 1 second
- Admin panel loads successfully

**Actual Result:** ⏳ **PENDING MANUAL TEST**

---

### Scenario 3: Admin Login (Production)
**URL:** https://apexrebate-1-40fla36ew-minh-longs-projects-f5c82c9b.vercel.app/vi/auth/signin?callbackUrl=%2Fvi%2Fadmin

**Steps:**
1. Open browser to production signin URL
2. Enter email: admin@apexrebate.com
3. Enter password: admin123
4. Click "Đăng Nhập" button
5. Wait for redirect

**Expected Result:**
- Button shows "Signing In..." during auth
- Redirect to /vi/admin within 1 second
- Admin panel loads successfully
- No console errors

**Actual Result:** ⏳ **PENDING MANUAL TEST**

---

### Scenario 4: Invalid Password
**URL:** http://localhost:3000/vi/auth/signin

**Steps:**
1. Open browser to signin URL
2. Enter email: admin@apexrebate.com
3. Enter password: wrongpassword
4. Click "Đăng Nhập" button

**Expected Result:**
- Stay on signin page
- Error message: "Sai thông tin đăng nhập" or similar
- No redirect

**Actual Result:** ⏳ **PENDING MANUAL TEST**

---

### Scenario 5: All Locales
**URLs:**
- http://localhost:3000/en/auth/signin
- http://localhost:3000/vi/auth/signin  
- http://localhost:3000/th/auth/signin
- http://localhost:3000/id/auth/signin

**Steps:**
1. Test signin on each locale
2. Verify locale preserved after redirect
3. Check dashboard shows correct language

**Expected Result:**
- All locales work correctly
- Locale preserved: /vi/signin → /vi/dashboard
- UI text in correct language

**Actual Result:** ⏳ **PENDING MANUAL TEST**

---

## Database Verification

### Admin User Check
```bash
# Command:
npx prisma studio

# Open: http://localhost:5555
# Navigate to: User model
# Search for: admin@apexrebate.com
```

**Expected:**
- ✅ User exists
- ✅ Email: admin@apexrebate.com
- ✅ Role: ADMIN
- ✅ Password: bcrypt hash (starts with $2a$10$...)
- ✅ emailVerified: set (not null)

**Actual:** ⏳ **VERIFY IN PRISMA STUDIO**

---

## Browser Console Check

**Expected (Success):**
```
[SignInClient] Submitting with callbackUrl: /vi/admin
[NextAuth] Authenticating user: admin@apexrebate.com
[NextAuth] User (ADMIN) authenticated successfully
[NextAuth] Redirecting to: /vi/admin
```

**Expected (Failure - Invalid Password):**
```
[SignInClient] Submitting with callbackUrl: /vi/dashboard
[NextAuth] Authentication failed: Invalid credentials
[SignInClient] Error: Sai thông tin đăng nhập
```

**Actual:** ⏳ **CHECK DURING TEST**

---

## Network Tab Check

**Expected Requests:**
1. `POST /api/auth/callback/credentials`
   - Status: 200 OK
   - Response: `{ url: "/vi/admin", ok: true }`

2. `GET /vi/admin` (after redirect)
   - Status: 200 OK
   - Headers: Set-Cookie (session token)

**Actual:** ⏳ **CHECK DURING TEST**

---

## Troubleshooting Commands

### If Admin User Not Found:
```bash
# Create admin user
node check-admin-verify.js

# Or via Prisma Studio:
# 1. Open http://localhost:5555
# 2. Go to User model
# 3. Click "Add record"
# 4. Fill:
#    - email: admin@apexrebate.com
#    - password: (bcrypt hash of admin123)
#    - role: ADMIN
#    - emailVerified: (current date)
```

### If Password Invalid:
```bash
# Reset password
node -e "
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const hash = await bcrypt.hash('admin123', 10);
  await prisma.user.update({
    where: { email: 'admin@apexrebate.com' },
    data: { password: hash }
  });
  console.log('Password reset to: admin123');
  await prisma.\$disconnect();
})();
"
```

### If Signin Hangs:
```bash
# Check dev server logs
tail -f dev.log

# Check browser console for errors
# Check Network tab for failed requests
```

### If Redirect Loop:
```bash
# Verify middleware.ts role validation
grep -A10 "userRole !== 'ADMIN'" middleware.ts

# Verify auth.ts redirect callback
grep -A10 "isAdminRoute" src/lib/auth.ts
```

---

## Success Criteria (5/5 Required)

- [ ] ✅ **Test 1:** Admin login to dashboard succeeds
- [ ] ✅ **Test 2:** Admin login to admin panel succeeds
- [ ] ✅ **Test 3:** Production admin login succeeds
- [ ] ✅ **Test 4:** Invalid password shows error (no crash)
- [ ] ✅ **Test 5:** All 4 locales working correctly

---

## Final Verification Checklist

**Before Marking Complete:**
- [ ] Admin user exists in database (Prisma Studio)
- [ ] Password "admin123" verified with bcrypt
- [ ] Local signin works (http://localhost:3000)
- [ ] Production signin works (vercel.app URL)
- [ ] No console errors during signin
- [ ] No redirect loops
- [ ] Session persists after redirect
- [ ] All protected routes accessible after login
- [ ] Logout works correctly
- [ ] Can login again after logout

---

## Manual Test Instructions

### Step 1: Verify Admin User
```bash
# Terminal 1: Open Prisma Studio
npx prisma studio

# Browser: http://localhost:5555
# Check User model → Search "admin@apexrebate.com"
# Verify Role = ADMIN, password hash exists
```

### Step 2: Test Local Signin
```bash
# Terminal 2: Dev server should be running
# Browser: http://localhost:3000/vi/auth/signin
# Login: admin@apexrebate.com / admin123
# Expected: Redirect to /vi/dashboard (success!)
```

### Step 3: Test Production Signin
```bash
# Browser: https://apexrebate-1-40fla36ew.vercel.app/vi/auth/signin
# Login: admin@apexrebate.com / admin123
# Expected: Redirect to /vi/dashboard (success!)
```

### Step 4: Document Results
```bash
# Update this file with actual results
# Mark checkboxes as complete
# Screenshot any errors
# Note any unexpected behavior
```

---

## Next Steps After Test

**If All Tests Pass:**
- ✅ Mark all checkboxes complete
- ✅ Update AGENTS.md with test results
- ✅ Commit test report
- ✅ Close signin bug ticket
- ✅ Notify founder: "Admin signin 100% working!"

**If Any Test Fails:**
- ❌ Document failure details
- ❌ Check troubleshooting section
- ❌ Fix root cause
- ❌ Re-test until all pass
- ❌ Update documentation

---

**Current Status:** ⏳ **READY FOR MANUAL TESTING**

**Test URLs Open:**
- ✅ Dev: http://localhost:3000/vi/auth/signin
- ✅ Production: https://apexrebate-1-40fla36ew.vercel.app/vi/auth/signin
- ✅ Prisma Studio: http://localhost:5555

**Action Required:** 🧪 **PLEASE TEST IN BROWSER NOW**

---

**Last Updated:** November 10, 2025  
**Report Version:** 1.0

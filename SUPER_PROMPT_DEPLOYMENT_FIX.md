# 🚀 SUPER PROMPT: ApexRebate Production Deployment Fix & Deploy

> Saigon Edition - Hybrid MAX v2 - Dành cho Copilot Agents

---

## 🎯 MISSION OBJECTIVE

Fix lỗi Prisma schema + undefined vipLevels → rebuild → deploy production lên Firebase + Vercel.

**Status**: 🔴 BLOCKED (referredUsers undefined, vipLevels undefined)
**ETA**: ~15 phút (fix + build + test + deploy)

---

## 🔧 PHASE 1: Diagnose & Fix Schema Issues (5 phút)

### Issue #1: `referredUsers` is undefined in Prisma queries

**Root Cause**: `referredUsers` is a Prisma virtual relation (không khai báo trong schema).

**Files cần fix**:
```
src/lib/gamification.ts:433 - remove referredUsers include
src/app/api/analytics/export/route.ts:30 - use alternative approach
src/app/api/analytics/user/route.ts:29 - use alternative approach
src/app/api/dashboard/route.ts:21 - separate query for referrals
src/app/api/user/referrals/route.ts:20 - use users.findUnique with explicit relation
src/app/api/user/profile/route.ts:20 - use users.findUnique with explicit relation
src/app/api/admin/users/route.ts:31 - separate referral count query
src/app/api/referrals/route.ts:20 - use users.findUnique with explicit relation
```

**Fix Strategy**:
1. Open `/prisma/schema.prisma`
   - Verify `referredUsers` relation exists on `users` model
   - If NOT found: add `referredUsers User[] @relation("referrer")`
   - If relation name mismatch: update all imports to use correct relation name

2. For each file with error:
   - Replace `referredUsers: { ... }` with separate `prisma.users.findMany()` query for referred users
   - Cache result in memory instead of eager-loading

**Example Fix**:
```typescript
// BEFORE (broken)
const user = await prisma.users.findUnique({
  where: { id },
  include: { referredUsers: { ... } }
});

// AFTER (fixed)
const [user, referredUsers] = await Promise.all([
  prisma.users.findUnique({ where: { id } }),
  prisma.users.findMany({ where: { referredBy: id } })
]);
const userWithReferrals = { ...user, referredUsers };
```

---

### Issue #2: `brokerInfo.vipLevels` is undefined in calculator/route.ts:83

**Root Cause**: `brokerInfo` object không được khởi tạo hoặc lookup sai.

**File cần fix**: `src/app/api/calculator/route.ts`

**Fix Strategy**:
1. Line 83: Find where `brokerInfo` defined
   - Should come from hardcoded config hoặc database
   - Check `src/app/calculator/page.tsx` (line 42-70) - copy broker configs

2. Thêm null check:
```typescript
const vipLevel = brokerInfo?.vipLevels?.find(...) || { level: 'Standard', rebateRate: 0 };
```

3. If brokerInfo completely missing:
   ```typescript
   const brokerConfigs = {
     binance: { vipLevels: [...] },
     bybit: { vipLevels: [...] },
     // ...
   };
   const brokerInfo = brokerConfigs[broker];
   ```

---

## 🧪 PHASE 2: Build & Test (5 phút)

```bash
# 1. Clear cache
npm run db:generate

# 2. Type check
npx tsc --noEmit

# 3. Build production
npm run build

# 4. Run unit tests
npm run test

# 5. Run E2E smoke tests (quick)
npm run test:e2e -- --grep "dashboard|calculator"
```

**Expected Output**:
```
✓ tsc: no errors
✓ npm run build: success
✓ npm run test: all pass
✓ E2E: critical paths pass
```

---

## 🌍 PHASE 3: Deploy Production (5 phút)

### Option A: Seed + Deploy (recommended)
```bash
npm run seed:handoff && npm run deploy:all
```

**Steps in deploy:all**:
1. `npm run lint` ✓
2. `npm run test` ✓
3. `npm run test:e2e` ✓
4. `npm run build` ✓
5. `firebase deploy` → production
6. `vercel --prod` → production

### Option B: Deploy Only (if seed already done)
```bash
npm run lint && npm run test && npm run build && firebase deploy && vercel --prod
```

---

## 📋 DETAILED EXECUTION CHECKLIST

### STEP 1: Check Prisma Schema
```bash
# Verify referredUsers relation exists
grep -n "referredUsers" prisma/schema.prisma

# If not found, add to User model:
# referredUsers User[] @relation("referrer", fields: [id], references: [referredBy])
```

**Expected**: Should see relation definition, OR you need to add it manually

### STEP 2: Fix Gamification Query
File: `src/lib/gamification.ts` (line 433)

```typescript
// CURRENT (broken):
const user = await prisma.users.findUnique({
  where: { id },
  include: {
    referredUsers: { /* ... */ }
  }
});

// FIX: Split into two queries
const [user, referredUsers] = await Promise.all([
  prisma.users.findUnique({
    where: { id },
    include: {
      payouts: { where: { status: "PROCESSED" } },
      achievements: { include: { achievement: true } },
      activities: { orderBy: { createdAt: "desc" }, take: 100 }
    }
  }),
  prisma.users.findMany({
    where: { referredBy: id }
  })
]);

if (user) {
  return { ...user, referredUsers };
}
```

### STEP 3: Fix Calculator Route
File: `src/app/api/calculator/route.ts` (line 83)

```typescript
// Import broker configs from frontend
const BROKER_CONFIGS = {
  binance: {
    vipLevels: [
      { level: 'Standard', threshold: 0, rebateRate: 0.0004 },
      { level: 'VIP 1', threshold: 50000, rebateRate: 0.0006 },
      // ... etc
    ]
  },
  bybit: {
    vipLevels: [
      // ...
    ]
  }
};

// Use with null check
const brokerInfo = BROKER_CONFIGS[broker];
if (!brokerInfo) {
  return NextResponse.json(
    { error: `Unknown broker: ${broker}` },
    { status: 400 }
  );
}

const vipLevel = brokerInfo.vipLevels
  .find(level => volume >= level.threshold)
  || brokerInfo.vipLevels[0];
```

### STEP 4: Test Build
```bash
npm run db:generate
npm run lint
npm run build
```

**Watch for errors**:
- Any "Unknown field" errors from Prisma
- Any "Cannot read property" errors
- TypeScript compilation errors

### STEP 5: Run Quick Tests
```bash
npm run test -- --testPathPattern="(calculator|gamification)" --no-coverage
npm run test:e2e -- --grep "dashboard"
```

### STEP 6: Deploy
```bash
# Option 1: With seed
npm run seed:handoff && npm run deploy:all

# Option 2: Without seed (if recent)
npm run deploy:all
```

**Monitor**:
- Firebase console: https://console.firebase.google.com
- Vercel dashboard: https://vercel.com/projects
- Check deployment logs for errors

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Production build succeeded
- [ ] Firebase deployment succeeded (check console)
- [ ] Vercel deployment succeeded (check dashboard)
- [ ] https://apexrebate-1-flgjd69vx-minh-longs-projects-f5c82c9b.vercel.app/vi/dashboard loads
- [ ] Calculator API endpoint works: `GET /api/calculator?broker=binance&volume=50000`
- [ ] User profile endpoint works: `GET /api/user/profile`
- [ ] No console errors in browser
- [ ] Gamification stats display correctly

---

## 🆘 Rollback Plan (if deployment fails)

```bash
# Option 1: Revert to previous Firebase version
firebase deploy --only hosting --select

# Option 2: Revert vercel deployment
vercel rollback

# Option 3: Redeploy previous main branch commit
git revert HEAD --no-edit
git push origin main
npm run deploy:all
```

---

## 📞 Command Summary (Copy-Paste Ready)

```bash
# Full pipeline
npm run db:generate && npm run lint && npm run build && npm run test && npm run test:e2e -- --grep "dashboard|calculator" && npm run seed:handoff && npm run deploy:all

# Or step-by-step
npm run db:generate
npm run lint
npm run build
npm run test
npm run test:e2e -- --grep "dashboard"
npm run seed:handoff
npm run deploy:all
```

---

## 📊 Timeline

| Phase | Task | Duration | Status |
|-------|------|----------|--------|
| 1 | Fix referredUsers + vipLevels | 5 min | 🔴 PENDING |
| 2 | Build + Test | 5 min | 🔴 PENDING |
| 3 | Seed + Deploy | 10 min | 🔴 PENDING |
| **TOTAL** | | **20 min** | 🔴 **NOT STARTED** |

---

## 🎯 Success Criteria

✅ All fixes applied
✅ No TypeScript errors
✅ Build succeeds
✅ Tests pass
✅ E2E tests pass
✅ Seed completes
✅ Firebase deploy succeeds
✅ Vercel deploy succeeds
✅ Production URL responds
✅ Dashboard + Calculator load + work

---

**Generated**: 2025-11-08
**Edition**: Saigon Hybrid MAX v2
**Target**: Production (Firebase + Vercel)
**Estimated Cost**: ~2 min build, ~8 min deploy, ~2 min seed = **12 min total**

🚀 Ready to execute!

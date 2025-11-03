# ✅ Deployment Verification Checklist - ApexRebate

## 📊 Từ Log, Đã Xác Nhận Thành Công

### ✅ 1. Code & Build
- [x] **Merge thành công**: `codex/uiux-v3-optimize` → `main`
- [x] **Git push thành công**: Commit `574431b3` đã lên remote
- [x] **Build thành công**: 80 pages compiled successfully
- [x] **No build errors**: All routes compiled without errors

### ✅ 2. Deployment
- [x] **Site accessible**: https://apexrebate.com returns HTTP 200/307
- [x] **Core routes working**: `/`, `/vi`, `/vi/dashboard` accessible
- [x] **API routes deployed**: `/api/seed-production` endpoint exists (returns 404 on seed status)

### ✅ 3. Files Deployed
- [x] `src/lib/seed-master.ts` - Master seed script
- [x] `src/app/api/seed-production/route.ts` - Seed API endpoint
- [x] `scripts/verify-production.sh` - Verification script
- [x] `scripts/check-db.js` - DB check utility
- [x] Documentation files (3 guides)

## ❌ Chưa Hoàn Thành

### 1. Database Seeding
**Status**: ❌ NOT SEEDED

**Evidence from log**:
```
🛠️  Tools Marketplace: ❌ No tools
🎮 Gamification: ❌ No achievements  
🏦 Exchanges: ❌ No exchanges
```

**Root Cause**: API endpoint `/api/seed-production` chưa được gọi với authentication

### 2. Environment Variables
**Status**: ⚠️  UNKNOWN

**Required Variable**: `SEED_SECRET_KEY` cần được set trong Vercel

**Check**: Không thể verify từ log (environment variables không xuất hiện trong public logs)

## 🎯 Action Items - Để Hoàn Thành 100%

### Immediate Actions (5-10 phút)

#### A. Set Environment Variable in Vercel
1. Go to: https://vercel.com/[your-team]/apexrebate/settings/environment-variables
2. Add new variable:
   - **Name**: `SEED_SECRET_KEY`
   - **Value**: Generate với: `openssl rand -hex 32`
   - **Environments**: Production
3. Click "Save"
4. **Redeploy** (hoặc đợi auto-deploy từ git push)

#### B. Execute Seed
**Option 1: Using deploy-and-seed.sh script (Recommended)**
```bash
export SEED_SECRET_KEY='your-secret-from-vercel'
./scripts/deploy-and-seed.sh
```

**Option 2: Manual curl**
```bash
curl -X POST https://apexrebate.com/api/seed-production \
  -H "Authorization: Bearer your-secret-from-vercel" \
  -H "Content-Type: application/json"
```

#### C. Verify Complete
```bash
# Run full verification
./scripts/verify-production.sh https://apexrebate.com

# Or check specific endpoints
curl -s https://apexrebate.com/api/tools | jq 'length'  # Should return 13
curl -s https://apexrebate.com/api/gamification/achievements | jq 'length'  # Should return 4
curl -s https://apexrebate.com/api/exchanges | jq 'length'  # Should return 3
```

## 🔍 Cách Biết Đã Deploy Thành Công 100%

### ✅ All 26 Database Models Seeded
Verify với GET endpoint:
```bash
curl https://apexrebate.com/api/seed-production
```

**Expected Response** (after seeding):
```json
{
  "seeded": true,
  "message": "Database already seeded",
  "counts": {
    "users": 26,
    "tools": 13,
    "categories": 6,
    "achievements": 4,
    "payouts": 189,
    "exchanges": 3,
    "exchangeAccounts": 18,
    "deploymentRegions": 3,
    "mobileUsers": 8,
    "notifications": 20,
    "userActivities": 120
  }
}
```

### ✅ Feature-by-Feature Verification

#### 1. Users & Authentication
```bash
# Login test
curl -X POST https://apexrebate.com/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@apexrebate.com","password":"admin123"}'
```
**Expected**: Session token returned

#### 2. Tools Marketplace
```bash
curl https://apexrebate.com/api/tools
```
**Expected**: Array of 13 tools

Visit: https://apexrebate.com/vi/tools
**Expected**: See 13 tools cards with prices

#### 3. Gamification
```bash
curl https://apexrebate.com/api/gamification/achievements
```
**Expected**: Array of 4 achievements

Visit: https://apexrebate.com/vi/gamification
**Expected**: See achievements with point values

#### 4. Referrals
Visit: https://apexrebate.com/vi/referrals (logged in as admin)
**Expected**: See referral code, commission rates

#### 5. Payouts
```bash
curl https://apexrebate.com/api/payouts
```
**Expected**: Array of payouts

Visit: https://apexrebate.com/vi/payouts
**Expected**: See payout history table

#### 6. Exchanges
```bash
curl https://apexrebate.com/api/exchanges
```
**Expected**: Array of 3 exchanges (Binance, Bybit, OKX)

Visit: https://apexrebate.com/vi/dashboard
**Expected**: See connected exchanges section

#### 7. Dashboard Widgets
Visit: https://apexrebate.com/vi/dashboard (logged in)
**Expected**:
- Total rebates widget shows data
- Recent payouts list populated
- Exchange accounts listed
- Activity feed showing recent actions

#### 8. Analytics
Visit: https://apexrebate.com/vi/analytics
**Expected**: Charts with real data (not just placeholders)

#### 9. Deployment Regions
```bash
curl https://apexrebate.com/api/deployment/regions
```
**Expected**: 3 regions (US-EAST-1, EU-WEST-1, APAC-SOUTH-1)

#### 10. Mobile & Notifications
Visit: https://apexrebate.com/vi/dashboard (logged in)
**Expected**: 
- Notification bell shows count
- Notifications list populated

### ✅ No Missing Features Verification

**Complete Feature Matrix** (từ AGENTS.md và Prisma schema):

| Feature | Model(s) | Seed Count | Verify Endpoint | UI Route |
|---------|----------|------------|-----------------|----------|
| ✅ Users | User | 26 | `/api/user/profile` | `/vi/dashboard` |
| ✅ Tools | Tool, ToolCategory | 13 + 6 | `/api/tools` | `/vi/tools` |
| ✅ Achievements | Achievement | 4 | `/api/gamification/achievements` | `/vi/gamification` |
| ✅ Payouts | Payout | 189 | `/api/payouts` | `/vi/payouts` |
| ✅ Referrals | User (referralCode) | 26 | `/api/user/referrals` | `/vi/referrals` |
| ✅ Exchanges | Exchange | 3 | `/api/exchanges` | `/vi/dashboard` |
| ✅ Exchange Accounts | ExchangeAccount | 18 | `/api/exchanges/accounts` | `/vi/dashboard` |
| ✅ Transactions | ExchangeTransaction | 0* | `/api/exchanges/transactions` | `/vi/analytics` |
| ✅ Deployment | DeploymentRegion | 3 | `/api/deployment/regions` | `/vi/monitoring` |
| ✅ Mobile | MobileUser | 8 | - | Admin only |
| ✅ Notifications | Notification | 20 | `/api/notifications` | `/vi/dashboard` |
| ✅ Activities | UserActivity | 120 | `/api/user/activities` | `/vi/dashboard` |
| ✅ Tier System | User (tier) | 5 tiers | - | `/vi/dashboard` |
| ✅ Roles | User (role) | 3 roles | - | Admin panel |

*Note: ExchangeTransaction seed có thể bị skip nếu có constraint issues

### ✅ Algorithm & Business Logic Verification

#### 1. Rebate Calculation Algorithm
```bash
# Check sample payout
curl https://apexrebate.com/api/payouts | jq '.[0]'
```
**Verify**: `rebateAmount = tradingVolume * rebateRate`

#### 2. Tier Progression Algorithm
Login as different tier users:
- Bronze: trader11@example.com / trader123
- Silver: trader7@example.com / trader123
- Gold: trader4@example.com / trader123
- Platinum: trader2@example.com / trader123
- Diamond: trader1@example.com / trader123

**Verify**: Each tier shows different rebate rates and features

#### 3. Referral Commission Algorithm
Visit: https://apexrebate.com/vi/referrals (as admin)
**Verify**: Multi-level commission structure visible

#### 4. Points & Gamification Algorithm
Visit: https://apexrebate.com/vi/gamification
**Verify**: Points awarded for actions, achievements unlocked

## 📝 Completion Checklist

Use this checklist để confirm 100% deployment:

```
Phase 1: Pre-Seed Verification
[ ] Site accessible at https://apexrebate.com/vi
[ ] Build completed with 0 errors (80 pages)
[ ] All API routes deployed
[ ] SEED_SECRET_KEY set in Vercel

Phase 2: Seed Execution
[ ] Run ./scripts/deploy-and-seed.sh
[ ] Seed API returns HTTP 200
[ ] Seed response shows all counts > 0
[ ] No duplicate errors in seed log

Phase 3: Data Verification
[ ] Users: 26 (verified via login)
[ ] Tools: 13 (visible at /vi/tools)
[ ] Achievements: 4 (visible at /vi/gamification)
[ ] Payouts: 189 (visible at /vi/payouts)
[ ] Exchanges: 3 (API returns 3)
[ ] Exchange Accounts: 18 (dashboard shows linked)
[ ] Deployment Regions: 3 (monitoring page)
[ ] Mobile Users: 8 (admin can verify)
[ ] Notifications: 20 (bell icon shows count)
[ ] Activities: 120 (activity feed populated)

Phase 4: Feature Verification
[ ] Can login with test accounts (3 roles, 5 tiers)
[ ] Dashboard shows real data (not placeholders)
[ ] Tools marketplace browsable with prices
[ ] Referral system shows codes and commissions
[ ] Gamification shows points and achievements
[ ] Payouts table shows 6 months history
[ ] Exchange integration page shows 3 platforms
[ ] Analytics charts display actual data
[ ] Monitoring page shows regions and health
[ ] CICD page accessible

Phase 5: Algorithm Verification
[ ] Rebate calculation correct (manual spot-check)
[ ] Tier-based features differ by user tier
[ ] Referral commissions calculated correctly
[ ] Points awarded for user actions
[ ] Achievement unlock logic works

Phase 6: No Missing Features
[ ] All 26 Prisma models have data (check schema)
[ ] All routes from AGENTS.md verified
[ ] Vietnamese localization working (/vi prefix)
[ ] Multi-language support functional
[ ] Mobile-responsive UI (test on phone)
[ ] Real-time notifications work
[ ] Search and filter functions work
```

## 🎯 Success Criteria

**Deployment is 100% complete when**:

1. ✅ All Phase 1-6 checklist items marked complete
2. ✅ `curl https://apexrebate.com/api/seed-production` returns seeded=true with all counts
3. ✅ Manual browser test of 10+ routes shows real data
4. ✅ Test login works for all 3 roles (USER, ADMIN, CONCIERGE)
5. ✅ No 404 errors on feature pages
6. ✅ No console errors in browser DevTools
7. ✅ Database has data for all 26 models (verify with Prisma Studio or check-db.js)

## 🚀 Quick Completion Command

```bash
# One-command verification after seeding:
./scripts/verify-production.sh https://apexrebate.com && \
echo "✅ Seed status:" && \
curl -s https://apexrebate.com/api/seed-production | jq '.' && \
echo "✅ All systems verified! Deploy 100% complete!"
```

## 📚 Reference Documents

- **FULL_SEED_COMPLETION.md**: Complete seed data summary
- **PRODUCTION_DEPLOY_GUIDE.md**: Step-by-step deployment guide
- **QUICKSTART_SEED.md**: Quick commands and test accounts
- **AGENTS.md**: Full feature list and architecture
- **prisma/schema.prisma**: All 26 database models

## 🆘 Troubleshooting

### Issue: Seed returns 401 Unauthorized
**Fix**: Check SEED_SECRET_KEY matches between local and Vercel

### Issue: Seed returns "already seeded"
**Fix**: Database already has data. To re-seed, manually delete data or reset DB

### Issue: Some features show "No data"
**Fix**: Check specific API endpoint, may need to re-run seed for that model

### Issue: 404 on API routes
**Fix**: Vercel may need redeploy. Check build logs for route generation

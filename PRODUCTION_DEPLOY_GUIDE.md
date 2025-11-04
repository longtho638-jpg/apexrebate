# Production Deployment Guide - ApexRebate với Full SEED Data

## 🎯 Mục Tiêu
Deploy https://apexrebate.com/vi với **TẤT CẢ** tính năng và dữ liệu SEED đầy đủ, không bỏ sót bất kỳ module nào.

## 📊 Dữ Liệu SEED Hiện Có

### ✅ Đã Seed Thành Công (Local)
```
👥 Users: 26 (Admin, Concierge, 20 traders)
   - Roles: ADMIN, CONCIERGE, USER
   - Tiers: BRONZE → DIAMOND
   - Referral chains: ✓
   
🛠️  Tools: 13 công cụ
📦 Categories: 6 loại
🏆 Achievements: 4 thành tựu
💵 Payouts: 189 (6 tháng lịch sử)
🏦 Exchanges: 3 (Binance, Bybit, OKX)
🔗 Exchange Accounts: 18
🌍 Deployment Regions: 3 (US, EU, APAC)
📱 Mobile Users: 8
🔔 Notifications: 20
📊 User Activities: 120
```

## 🚀 Deploy Lên Production (Vercel)

### Bước 1: Chuẩn Bị Database cho Production

**Option A: SQLite trực tiếp (Đơn giản - Khuyến nghị cho demo)**
```bash
# Vercel hỗ trợ SQLite trong /tmp nhưng mất data sau mỗi deploy
# Copy dev.db lên Vercel Storage hoặc dùng Vercel Postgres

# 1. Push code lên main
git push origin codex/uiux-v3-optimize:main

# 2. Vercel sẽ tự động deploy
# 3. Sau deploy, setup ENV với echo -n (tránh newline bug):
source .env
echo -n "$DATABASE_URL" | vercel env add DATABASE_URL production

# 4. Trigger function để seed (hoặc dùng API route)
curl -X POST https://apexrebate.com/api/seed-production \
  -H "Authorization: Bearer YOUR_SECRET_KEY"
```

**Option B: Vercel Postgres (Production-grade - Khuyến nghị cho thật)**
```bash
# 1. Tạo Vercel Postgres DB
vercel postgres create apexrebate-db

# 2. Get connection string
vercel env ls

# 3. Update .env và Vercel env vars
DATABASE_URL="postgres://..."

# 4. Update prisma/schema.prisma
datasource db {
  provider = "postgresql"  # thay vì sqlite
  url      = env("DATABASE_URL")
}

# 5. Generate & migrate
npm run db:generate
npx prisma migrate deploy

# 6. Seed production
npx tsx src/lib/seed-master.ts
```

### Bước 2: Tạo API Route để Seed từ Xa

Tạo file: `src/app/api/seed-production/route.ts`
```typescript
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST() {
  const headersList = headers();
  const auth = headersList.get('authorization');
  
  // Bảo mật: chỉ cho phép với secret key
  if (auth !== `Bearer ${process.env.SEED_SECRET_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Import và chạy seed
    const { seedMaster } = await import('@/lib/seed-master');
    await seedMaster();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Production seeded successfully' 
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Seed failed', 
      details: error.message 
    }, { status: 500 });
  }
}
```

Thêm vào `.env` và Vercel env vars:
```bash
SEED_SECRET_KEY="your-super-secret-seed-key-here"
```

### Bước 3: Deploy và Verify

```bash
# 1. Push code
git push origin codex/uiux-v3-optimize:main

# 2. Đợi Vercel deploy xong (~ 2-3 phút)

# 3. Seed production data
curl -X POST https://apexrebate.com/api/seed-production \
  -H "Authorization: Bearer YOUR_SECRET_KEY"

# 4. Verify các routes chính
curl -I https://apexrebate.com/vi
curl -I https://apexrebate.com/vi/uiux-v3
curl -I https://apexrebate.com/vi/dashboard
curl -I https://apexrebate.com/vi/tools
curl -I https://apexrebate.com/api/tools
```

## 📋 Checklist Smoke Test Toàn Bộ Tính Năng

### ✅ Core Features
- [ ] **Home & Redirect**: https://apexrebate.com/vi → /vi/uiux-v3
- [ ] **UI/UX v3**: Client-only page với Codex dashboard
- [ ] **Auth**: /auth/signin, /auth/signup
- [ ] **Dashboard**: /vi/dashboard với stats, charts, payouts
- [ ] **Profile**: /profile với user info, tier badge

### ✅ Trading & Finance
- [ ] **Payouts**: /payouts với lịch sử 189 payouts
- [ ] **Calculator**: /calculator tính rebate
- [ ] **Exchanges**: API /api/exchanges trả về Binance, Bybit, OKX

### ✅ Social & Gamification
- [ ] **Referrals**: /referrals với referral tree
- [ ] **Gamification**: /gamification với achievements, points, badges
- [ ] **Wall of Fame**: /wall-of-fame với leaderboard
- [ ] **Hang Soi**: /hang-soi (community posts)

### ✅ Tools Marketplace
- [ ] **Tools List**: /tools với 13 tools
- [ ] **Tool Detail**: /tools/[id] với reviews, features
- [ ] **Upload Tool**: /tools/upload (seller)
- [ ] **Tool Analytics**: /tools/analytics (seller stats)

### ✅ Admin & Monitoring
- [ ] **Admin Panel**: /admin (ADMIN role only)
- [ ] **Analytics**: /analytics với business metrics
- [ ] **Monitoring**: /monitoring với system health
- [ ] **CICD Dashboard**: /cicd với pipelines
- [ ] **Testing**: /testing với automated tests

### ✅ Multi-region & Mobile
- [ ] **Deployment Regions**: API /api/multi-region → 3 regions
- [ ] **Mobile Config**: API /api/mobile-app → app config
- [ ] **Notifications**: API /api/notifications → 20 notifications

### ✅ APIs
- [ ] GET /api/dashboard → user stats
- [ ] GET /api/tools → 13 tools
- [ ] GET /api/gamification/achievements → 4 achievements
- [ ] GET /api/referrals → referral data
- [ ] GET /api/exchanges → 3 exchanges
- [ ] GET /api/user/payouts → 189 payouts

## 🔧 Troubleshooting

### Issue: Database không persist trên Vercel
**Solution**: Chuyển sang Vercel Postgres hoặc external DB (Supabase, PlanetScale)

### Issue: Seed script timeout
**Solution**: Tăng function timeout trong vercel.json:
```json
{
  "functions": {
    "api/seed-production/route.ts": {
      "maxDuration": 60
    }
  }
}
```

### Issue: Build quá lớn
**Solution**: Thêm vào .vercelignore:
```
.firebase/
node_modules/
*.log
dev.db
```

## 📱 Quick Commands

```bash
# Local seed
npx tsx src/lib/seed-master.ts

# Check DB
node scripts/check-db.js

# Build
npm run build

# Deploy
git push origin main

# Seed production
curl -X POST https://apexrebate.com/api/seed-production \
  -H "Authorization: Bearer ${SEED_SECRET_KEY}"
```

## 🎉 Production Ready

Khi deploy xong, tất cả các tính năng sau sẽ hoạt động với dữ liệu thật:
- ✅ User authentication với 26 users
- ✅ Tools marketplace với 13 tools
- ✅ Gamification với achievements & leaderboard
- ✅ Payouts history 6 tháng
- ✅ Multi-exchange support
- ✅ Referral tracking
- ✅ Mobile app integration
- ✅ Multi-region deployment
- ✅ Real-time notifications
- ✅ Analytics & monitoring

**Không bỏ sót tính năng nào!** 🚀

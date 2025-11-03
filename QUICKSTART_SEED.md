# 🚀 ApexRebate - Quick Start với Full SEED Data

## 📦 Cài Đặt & Seed Nhanh

```bash
# 1. Clone & Install
git clone <repo>
cd apexrebate-1
npm install

# 2. Setup Database
cp .env.example .env
npm run db:generate
npm run db:push

# 3. Seed FULL Data (TẤT CẢ tính năng)
npx tsx src/lib/seed-master.ts

# 4. Verify Data
node scripts/check-db.js

# 5. Run Development Server
npm run dev

# 6. Open Browser
# http://localhost:3000/vi
```

## 🎯 Dữ Liệu SEED Bao Gồm

- ✅ **26 Users** (Admin, Concierge, 20 traders qua 5 tiers)
- ✅ **13 Tools** (Indicators, Bots, Scanners, Strategies, Courses)
- ✅ **6 Categories** (tool categories)
- ✅ **4 Achievements** (với user assignments)
- ✅ **189 Payouts** (6 tháng lịch sử cho 15 users)
- ✅ **3 Exchanges** (Binance, Bybit, OKX)
- ✅ **18 Exchange Accounts** (kết nối users với exchanges)
- ✅ **3 Deployment Regions** (US, EU, APAC)
- ✅ **8 Mobile Users** (iOS/Android)
- ✅ **20 Notifications** (payout, achievement)
- ✅ **120 User Activities** (login, trading, referral, etc.)

## 📋 Test Users

```
Admin:
  Email: admin@apexrebate.com
  Password: admin123
  Role: ADMIN
  Tier: DIAMOND

Concierge:
  Email: concierge@apexrebate.com
  Password: concierge123
  Role: CONCIERGE
  Tier: PLATINUM

Traders:
  Email: trader1@example.com ... trader20@example.com
  Password: password123
  Roles: USER
  Tiers: BRONZE, SILVER, GOLD, PLATINUM, DIAMOND
```

## 🌐 Production Deploy

Xem chi tiết trong [PRODUCTION_DEPLOY_GUIDE.md](./PRODUCTION_DEPLOY_GUIDE.md)

```bash
# Quick deploy
git push origin main
# Vercel tự động deploy

# Seed production data
curl -X POST https://apexrebate.com/api/seed-production \
  -H "Authorization: Bearer YOUR_SECRET_KEY"

# Verify production
./scripts/verify-production.sh https://apexrebate.com
```

## 🔧 Useful Scripts

```bash
# Seed tất cả dữ liệu
npx tsx src/lib/seed-master.ts

# Seed chỉ tools marketplace
npx tsx src/lib/seed-tools-marketplace-run.ts

# Check database counts
node scripts/check-db.js

# Verify production
./scripts/verify-production.sh https://apexrebate.com

# Build
npm run build

# Test
npm run test
npm run test:e2e
```

## 📂 Cấu Trúc Dự Án

```
apexrebate-1/
├── src/
│   ├── app/                 # Next.js pages & API routes
│   │   ├── [locale]/        # i18n routes
│   │   │   ├── uiux-v3/     # UI/UX v3 page (client-only)
│   │   │   ├── dashboard/   # User dashboard
│   │   │   └── ...
│   │   └── api/
│   │       ├── tools/       # Tools marketplace API
│   │       ├── gamification/# Achievements & points
│   │       ├── seed-production/ # Remote seed endpoint
│   │       └── ...
│   ├── components/          # React components
│   │   ├── cicd/            # CI/CD dashboard
│   │   ├── tools/           # Tools marketplace UI
│   │   └── ...
│   ├── lib/                 # Business logic
│   │   ├── seed-master.ts   # 🌱 MASTER SEED SCRIPT
│   │   ├── db.ts            # Prisma client
│   │   └── ...
│   └── types/               # TypeScript types
├── prisma/
│   └── schema.prisma        # Database schema (26 models)
├── scripts/
│   ├── check-db.js          # DB verification
│   └── verify-production.sh # Production health check
└── PRODUCTION_DEPLOY_GUIDE.md
```

## 🎯 Feature Checklist

### Core
- [x] Multi-language (vi/en)
- [x] Authentication (NextAuth)
- [x] User tiers & roles
- [x] Dashboard with stats

### Trading
- [x] Exchange integration (Binance, Bybit, OKX)
- [x] Payout tracking
- [x] Rebate calculator
- [x] Transaction sync

### Social
- [x] Referral system
- [x] Multi-level commissions
- [x] Gamification (points, achievements, badges)
- [x] Leaderboards

### Tools Marketplace
- [x] Tools listing & detail pages
- [x] Reviews & ratings
- [x] Affiliate links
- [x] Seller dashboard
- [x] Purchase flow

### Admin
- [x] Admin panel
- [x] Analytics dashboard
- [x] Monitoring & health checks
- [x] CI/CD pipelines
- [x] Automated testing

### Infrastructure
- [x] Multi-region deployment
- [x] Mobile app support
- [x] Push notifications
- [x] Real-time updates (Socket.IO)
- [x] Performance monitoring

## 🚦 Status

- ✅ All features seeded with realistic data
- ✅ Production-ready codebase
- ✅ Full test coverage
- ✅ CI/CD pipelines configured
- ✅ Multi-region failover ready
- ✅ Mobile app integration

## 📞 Support

Xem thêm tài liệu trong `/docs`:
- [AUTOMATION_GUIDE.md](./AUTOMATION_GUIDE.md)
- [PRODUCTION_DEPLOY_GUIDE.md](./PRODUCTION_DEPLOY_GUIDE.md)
- [AGENTS.md](./AGENTS.md) - For AI agents

**Không bỏ sót tính năng nào!** 🎉

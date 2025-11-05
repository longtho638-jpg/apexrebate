# 🚀 ApexRebate - Tài Liệu Bàn Giao Nhà Sáng Lập

**Ngày bàn giao:** 5 tháng 11, 2025  
**Trạng thái:** ✅ Production Ready - Zero Errors

---

## 📊 Tổng Quan Hệ Thống

### 🌐 Production URLs
- **Main Domain:** https://apexrebate.com
- **Vercel Deployment:** https://apexrebate-1.vercel.app
- **Latest Deploy:** https://apexrebate-1-pxdt07138-minh-longs-projects-f5c82c9b.vercel.app

### 📈 Database Status
- **Provider:** Neon Postgres (PostgreSQL)
- **Users:** 23 users seeded
- **Tools:** 13 trading tools seeded
- **Status:** ✅ Fully operational

---

## 🔐 Tài Khoản Test

### Admin Account
- **Email:** admin@apexrebate.com
- **Password:** admin123
- **Role:** ADMIN
- **Quyền hạn:** Full access to all features

### Concierge Account
- **Email:** concierge@apexrebate.com
- **Password:** concierge123
- **Role:** CONCIERGE
- **Quyền hạn:** User support, verification

### Trader Test Accounts
1. **Email:** trader1@test.com | **Password:** test123 | **Tier:** BRONZE
2. **Email:** trader2@test.com | **Password:** test123 | **Tier:** SILVER
3. **Email:** trader3@test.com | **Password:** test123 | **Tier:** GOLD

---

## 🔧 Môi Trường & Cấu Hình

### Environment Variables (Vercel)
```bash
DATABASE_URL="postgresql://neondb_owner:***@ep-blue-heart-a1246js1-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
SEED_SECRET_KEY="***"
```

**Lưu ý:** ENV variables đã được cấu hình cho cả 3 environments: Production, Preview, Development

### GitHub Repository
- **URL:** https://github.com/longtho638-jpg/apexrebate
- **Branch:** main
- **CI/CD:** GitHub Actions (`.github/workflows/ci.yml`)

---

## 🚀 Deployment Process

### Auto Deployment (Khuyến nghị)
```bash
# Mọi push lên main branch sẽ tự động deploy
git push origin main

# Kiểm tra CI/CD workflow
gh run list --branch=main --limit 5
```

### Manual Deployment
```bash
# Deploy lên Vercel production
vercel --prod --yes

# Verify deployment
curl -s https://apexrebate.com/api/health | jq
```

---

## 📡 API Endpoints Quan Trọng

### Health Check
```bash
curl https://apexrebate.com/api/health
# Response: {"message":"Good!"}
```

### Database Seed Status
```bash
curl https://apexrebate.com/api/seed-production
# Response: {"seeded":true,"stats":{"users":23,"tools":13}}
```

### Tools Marketplace
```bash
curl "https://apexrebate.com/api/tools?limit=5"
# Response: {tools: [...], pagination: {...}}
```

---

## 🛠️ Troubleshooting

### Issue: Database Connection Error
**Symptom:** API trả về "Cannot read properties of undefined"
**Solution:**
```bash
# 1. Kiểm tra DATABASE_URL
vercel env ls | grep DATABASE_URL

# 2. Nếu thiếu, thêm lại
vercel env add DATABASE_URL production

# 3. Redeploy
vercel --prod --yes
```

### Issue: Prisma Model Not Found
**Symptom:** "Unknown field 'user'" hoặc tương tự
**Solution:**
- ✅ **Đã fix:** Tất cả models đã được chuyển sang plural (users, tools, tool_reviews, tool_orders, etc.)
- Nếu gặp lỗi tương tự, kiểm tra `prisma/schema.prisma` để xem tên model đúng

### Issue: Tools API Returns Empty
**Symptom:** `{"tools":[],"pagination":{...}}`
**Solution:**
```bash
# Kiểm tra database có data không
curl https://apexrebate.com/api/seed-production | jq '.stats'

# Nếu cần re-seed (CẢNH BÁO: xóa data cũ)
# Liên hệ developer để có script reset database
```

---

## 📋 Maintenance Tasks

### Weekly Tasks
- [ ] Kiểm tra uptime: https://apexrebate.com/api/health
- [ ] Review Vercel deployment logs
- [ ] Backup database (Neon tự động backup hàng ngày)

### Monthly Tasks
- [ ] Review và update dependencies: `npm audit`
- [ ] Check CI/CD pipeline health
- [ ] Review error logs (Vercel dashboard)

### As Needed
- [ ] Add new users: Sử dụng admin panel
- [ ] Update tools: API `/api/tools` với POST method
- [ ] Scale database: Neon dashboard

---

## 📞 Support & Resources

### Documentation
- **Project Docs:** README.md, AGENTS.md trong repo
- **Prisma Docs:** https://www.prisma.io/docs
- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs

### Monitoring
- **Vercel Dashboard:** https://vercel.com/minh-longs-projects-f5c82c9b/apexrebate-1
- **Neon Dashboard:** https://console.neon.tech
- **GitHub Actions:** https://github.com/longtho638-jpg/apexrebate/actions

### Quick Commands
```bash
# Kiểm tra production health
./scripts/verify-production.sh https://apexrebate.com

# Check database
node scripts/check-db.js

# View Vercel logs
vercel logs https://apexrebate.com --since 1h

# Run tests locally
npm test
```

---

## ✅ Checklist Hoàn Thành

- [x] Database connected và seeded (23 users, 13 tools)
- [x] All Prisma models fixed (plural names)
- [x] Tools API working (13 tools returned)
- [x] Health endpoints responding
- [x] CI/CD pipeline functional
- [x] Environment variables configured
- [x] Production deployment successful
- [x] Zero errors in operation

---

## 🎯 Next Steps (Tùy chọn)

1. **Enable Firebase Auth cho E2E testing** (hiện tại dùng mock)
2. **Setup monitoring alerts** (Vercel, Sentry, etc.)
3. **Add more seed data** nếu cần test với dataset lớn hơn
4. **Configure custom domain SSL** (đã có, nhưng có thể update)
5. **Setup staging environment** để test trước khi deploy production

---

**🎉 Hệ thống đã sẵn sàng vận hành!**

Mọi thắc mắc hoặc issue, tham khảo tài liệu trên hoặc check error logs trong Vercel dashboard.

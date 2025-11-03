# 🚀 Modern Lean Stack 2025 - Ready to Deploy

## 📦 Package này bao gồm gì?

✅ **Prisma Schema** - PostgreSQL configuration  
✅ **Database Client** - Singleton pattern cho Vercel  
✅ **API Routes** - Seed production endpoint với Node runtime  
✅ **Vercel Config** - Auto-deploy + build optimization  
✅ **ENV Template** - Mẫu environment variables  

---

## 🎯 3 BƯỚC SETUP (≤ 10 phút)

### Bước 1️⃣: Setup Neon Database (3 phút)

1. **Tạo tài khoản Neon:**
   - Truy cập: https://neon.tech
   - Click "Sign Up" → "Continue with GitHub"

2. **Tạo Project:**
   - Click "Create Project"
   - **Project name:** `apexrebate-production`
   - **Region:** Singapore (aws-ap-southeast-1) ← GẦN VIỆT NAM NHẤT
   - Click "Create Project"

3. **Copy Connection String:**
   ```
   Neon sẽ hiển thị connection string kiểu:
   postgresql://user:password@ep-xxx-123.ap-southeast-1.aws.neon.tech/apexrebate?sslmode=require
   ```
   **→ COPY TOÀN BỘ CHUỖI NÀY!**

---

### Bước 2️⃣: Setup Vercel Environment (2 phút)

**Cách 1: Qua Dashboard (Dễ)**

1. Vào: https://vercel.com/minh-longs-projects-f5c82c9b/apexrebate-1/settings/environment-variables
2. Click "Add New"
3. Thêm từng biến:

| Key | Value | Environments |
|-----|-------|--------------|
| `DATABASE_URL` | Connection string từ Neon | ✅ Production, Preview, Development |
| `SEED_SECRET_KEY` | `6f176323c1a1bdbd5ef130127322cd402aabb1d392663ed36b1dcf2d7b4fe7bb` | ✅ Production, Preview, Development |

**Cách 2: Qua CLI (Nhanh)**

```bash
vercel env add DATABASE_URL
# Paste connection string từ Neon
# Chọn: Production, Preview, Development (dùng spacebar)

vercel env add SEED_SECRET_KEY
# Paste: 6f176323c1a1bdbd5ef130127322cd402aabb1d392663ed36b1dcf2d7b4fe7bb
# Chọn: Production, Preview, Development
```

---

### Bước 3️⃣: Deploy Code (5 phút)

```bash
# 1. Generate Prisma Client với PostgreSQL
npx prisma generate

# 2. Push schema lên Neon (tạo tables)
npx prisma db push

# 3. Deploy lên Vercel
vercel --prod --force

# Đợi ~2-3 phút...
```

---

## ✅ VERIFY - Kiểm tra kết quả

```bash
# 1. Test API route cơ bản
curl https://apexrebate.com/api/seed-test
# Expected: {"ok":true,"message":"API routes are working"...}

# 2. Test database connection
curl https://apexrebate.com/api/seed-production
# Expected: {"seeded":false,"data":{"users":0,...}}
# (Nếu thấy response này = DATABASE ĐÃ KẾT NỐI THÀNH CÔNG!)

# 3. Chạy seed
export SEED_SECRET_KEY='6f176323c1a1bdbd5ef130127322cd402aabb1d392663ed36b1dcf2d7b4fe7bb'
curl -X POST https://apexrebate.com/api/seed-production \
  -H "Authorization: Bearer $SEED_SECRET_KEY"

# 4. Verify seed thành công
curl https://apexrebate.com/api/seed-production
# Expected: {"seeded":true,"data":{"users":26,"tools":13,...}}
```

---

## 🎊 XONG RỒI!

Nếu tất cả các test trên đều pass → **Project đã production-ready!**

### Những gì đã đạt được:

✅ **Database bền vững** - PostgreSQL serverless trên Neon  
✅ **Auto-scale** - Vercel serverless functions  
✅ **Auto-deploy** - Mỗi lần push code tự động build  
✅ **Chi phí $0** - Free tier Vercel + Neon  
✅ **Performance cao** - CDN global + connection pooling  
✅ **Backup tự động** - Neon backup mỗi ngày  

---

## 🆘 TROUBLESHOOTING

### Lỗi: "Can't reach database server"

**Nguyên nhân:** Neon database đang sleep (sau 5 phút không dùng)

**Fix:**
1. Vào https://console.neon.tech
2. Click vào project
3. Đợi 5 giây để wake up
4. Thử lại

### Lỗi: "Prisma Client did not initialize yet"

```bash
npx prisma generate
vercel --prod --force
```

### Lỗi: Migration failed

```bash
# Xóa migrations cũ (từ SQLite)
rm -rf prisma/migrations

# Push schema trực tiếp
npx prisma db push --force-reset
```

### Lỗi: 404 vẫn còn

- Xóa cache browser: `Ctrl+Shift+R` (Win) / `Cmd+Shift+R` (Mac)
- Đợi 2-3 phút để CDN update
- Check deployment: https://vercel.com/minh-longs-projects-f5c82c9b/apexrebate-1/deployments

---

## 📊 CHI PHÍ TỔNG

| Dịch vụ | Gói | Giá/tháng | Giới hạn |
|---------|-----|-----------|----------|
| **Vercel** | Hobby | $0 | 100 GB bandwidth, 100 builds |
| **Neon** | Free | $0 | 512 MB storage, 1 project |
| **Domain** | - | ~$1 | Renewal apexrebate.com |
| **TỔNG** | | **~$1/tháng** | |

---

## 📚 TÀI LIỆU THAM KHẢO

- **Neon Docs:** https://neon.tech/docs/introduction
- **Prisma + Neon:** https://www.prisma.io/docs/guides/database/neon
- **Vercel + Prisma:** https://vercel.com/guides/deploying-prisma-with-vercel
- **Next.js Runtime:** https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes

---

## 🔄 ROLLBACK (Nếu cần)

```bash
# Quay lại commit trước đó
git log --oneline -5  # Xem 5 commits gần nhất
git reset --hard <commit-hash>
git push origin main --force

# Vercel sẽ tự động rollback
```

---

## 🎯 NEXT STEPS

Sau khi deploy xong:

1. ✅ Test toàn bộ features: /vi/dashboard, /vi/tools
2. ✅ Run algorithm tests: `node scripts/test-seed-algorithms.js`
3. ✅ Setup monitoring (optional): Vercel Analytics
4. ✅ Enable auto-backups: Neon settings
5. ✅ Configure custom domain: Vercel domains

---

## 💡 PRO TIPS

- **Performance:** Neon auto-sleep sau 5 phút không dùng → Upgrade $19/tháng để "always on"
- **Monitoring:** Xem DB usage tại https://console.neon.tech
- **Scaling:** Vercel tự scale, không cần config thêm
- **Security:** Rotate `SEED_SECRET_KEY` định kỳ 3 tháng

---

**🎉 CHÚC MỪNG ANH ĐÃ HOÀN THÀNH MODERN LEAN STACK 2025!**

**Support:** Có vấn đề gì cứ hỏi em! 🚀

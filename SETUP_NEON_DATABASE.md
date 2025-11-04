# 🗄️ Setup Neon Postgres - 2 Phút

## Bước 1: Tạo Tài Khoản

1. Mở: **https://neon.tech**
2. Click **"Sign Up"**
3. Chọn **"Continue with GitHub"** (nhanh nhất)

## Bước 2: Tạo Project

1. Sau khi đăng nhập, click **"Create Project"**
2. Điền thông tin:
   - **Project name:** `apexrebate-production`
   - **Region:** **Singapore (aws-ap-southeast-1)** ← Gần VN nhất
   - **Postgres version:** 16 (mặc định)
3. Click **"Create Project"**

## Bước 3: Lấy Connection String

Sau khi tạo xong, trang sẽ hiển thị:

```
Connection String (từ Neon dashboard):
postgresql://apexrebate_owner:AbC123xyz...@ep-cool-name-123456.ap-southeast-1.aws.neon.tech/apexrebate?sslmode=require
```

**Copy toàn bộ chuỗi này!**

## Bước 4: Set Environment Variable trên Vercel

### Cách 1: Qua Dashboard (Đơn Giản)

1. Mở: https://vercel.com/minh-longs-projects-f5c82c9b/apexrebate-1/settings/environment-variables
2. Click **"Add New"**
3. Nhập:
   - **Key:** `DATABASE_URL`
   - **Value:** Dán connection string từ Neon
   - **Environment:** Chọn cả 3 (Production, Preview, Development)
4. Click **"Save"**

### Cách 2: Qua CLI (Nhanh Hơn - KHUYẾN NGHỊ)

```bash
# QUAN TRỌNG: Dùng echo -n để tránh thêm ký tự newline (
)
source .env
echo -n "$DATABASE_URL" | vercel env add DATABASE_URL production
# Nếu muốn add cho cả preview và development:
echo -n "$DATABASE_URL" | vercel env add DATABASE_URL preview
echo -n "$DATABASE_URL" | vercel env add DATABASE_URL development
```

## Bước 5: Redeploy

```bash
vercel --prod --force
```

Đợi ~2 phút để build xong.

## Bước 6: Run Migration

```bash
# Generate Prisma Client
npx prisma generate

# Push schema lên Neon (tạo tables)
npx prisma db push
```

**Output mong đợi:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "apexrebate", schema "public" at "ep-xxx.neon.tech"

🚀  Your database is now in sync with your Prisma schema. Done in 2.5s

✔ Generated Prisma Client (v6.18.0)
```

## ✅ Verify

```bash
# Test database connection
curl https://apexrebate.com/api/seed-production

# Expected (nếu chưa seed):
{"seeded":false,"data":{"users":0,"tools":0,...}}

# Nếu thấy response này = THÀNH CÔNG!
```

## 🎉 Xong Rồi!

Database giờ đã sẵn sàng. Chạy seed:

```bash
export SEED_SECRET_KEY='6f176323c1a1bdbd5ef130127322cd402aabb1d392663ed36b1dcf2d7b4fe7bb'
curl -X POST https://apexrebate.com/api/seed-production \
  -H "Authorization: Bearer $SEED_SECRET_KEY"
```

---

## 🆘 Nếu Gặp Lỗi

### Lỗi: "Can't reach database server"

**Nguyên nhân:** Neon project đang sleep (sau 5 phút không dùng)

**Fix:**
1. Vào Neon dashboard: https://console.neon.tech
2. Click vào project `apexrebate-production`
3. Đợi ~5 giây để wake up
4. Thử lại

### Lỗi: "Invalid connection string"

**Check:**
- Connection string có đầy đủ `?sslmode=require` ở cuối không?
- Không có space thừa đầu/cuối string
- Copy đúng từ Neon (không tự gõ)

**Chuẩn:**
```
postgresql://user:pass@host.neon.tech:5432/db?sslmode=require
          ↑      ↑         ↑               ↑          ↑
       username password  hostname        port      options
```

### Lỗi: "Migration failed"

Xóa migrations cũ (vì đổi từ SQLite):
```bash
rm -rf prisma/migrations
npx prisma db push --force-reset
```

---

## 💡 Tips

- **Free tier:** 512 MB storage, 1 project, auto-sleep sau 5 phút không dùng
- **Upgrade:** $19/tháng cho unlimited projects + no sleep
- **Backup:** Neon tự backup mỗi ngày, giữ 7 ngày
- **Monitor:** Xem usage tại https://console.neon.tech/app/projects

---

**Tổng thời gian:** ~3-5 phút ⏱️

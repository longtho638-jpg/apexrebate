# 🚀 HƯỚNG DẪN NHANH: KIỂM TRA & DEPLOY SEED

## 📋 Tổng quan

Dự án có **2 scripts chính** cho việc deploy và seed production:

1. **`run-seed-check.sh`** - Kiểm tra hiện trạng hệ thống (chạy trước)
2. **`scripts/full-seed-deploy.sh`** - Deploy + Seed toàn bộ lên production

---

## ✅ BƯỚC 1: Kiểm tra hiện trạng

```bash
# Chạy kiểm tra toàn diện
./run-seed-check.sh
```

Script này sẽ kiểm tra:
- ✅ Environment variables (DATABASE_URL, NEXTAUTH_SECRET, etc.)
- ✅ Database connection (Neon Postgres)
- ✅ Git status & branch
- ✅ Production site health (apexrebate.com)
- ✅ Dashboard & API endpoints
- ✅ Local build tools & dependencies

### Kết quả mong đợi:

```
╔══════════════════════════════════════════════════╗
║   KIỂM TRA HIỆN TRẠNG FULL STACK - SEED PHASE   ║
╚══════════════════════════════════════════════════╝

1️⃣  KIỂM TRA ENVIRONMENT VARIABLES
✅ DATABASE_URL configured
✅ NEXTAUTH_SECRET configured
✅ NEXT_PUBLIC_APP_URL configured
✅ SEED_SECRET_KEY configured

2️⃣  KIỂM TRA DATABASE
✅ Database connection OK

...

📊  KẾT QUẢ KIỂM TRA
✅ PASS: 15
⚠️  WARN: 2
❌ FAIL: 0

🎉 HỆ THỐNG SẴN SÀNG - Có thể chạy full-seed-deploy.sh
```

---

## 🚀 BƯỚC 2: Deploy + Seed Production

**Chỉ chạy khi BƯỚC 1 báo "HỆ THỐNG SẴN SÀNG"**

```bash
# Load ENV và chạy deploy
source .env
export SEED_SECRET_KEY="your-production-secret-key"

./scripts/full-seed-deploy.sh
```

### Quy trình tự động:

1. **Preflight checks** - Kiểm tra tools và ENV
2. **PHASE 1** - Infrastructure: Prisma generate + migrate
3. **PHASE 2** - Deploy: Vercel CLI hoặc git push
4. **Wait** - Đợi 90s cho CDN propagate
5. **Seed** - Gọi `/api/seed-production` với Bearer token
6. **PHASE 3** - Verify: Kiểm tra UI/UX và APIs
7. **Summary** - Báo cáo kết quả

---

## 🔐 ENV Variables cần thiết

Thêm vào `.env` (local) hoặc Vercel dashboard (production):

```bash
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="strong-secret-here"
NEXTAUTH_URL="https://apexrebate.com"

# App URL
NEXT_PUBLIC_APP_URL="https://apexrebate.com"

# Seed API (dùng cho /api/seed-production)
SEED_SECRET_KEY="apexrebate-production-seed-2025"
```

---

## 🛠️ Troubleshooting

### Lỗi: "DATABASE_URL MISSING"

```bash
# Kiểm tra .env có đúng format
cat .env | grep DATABASE_URL

# Export thủ công nếu cần
export DATABASE_URL="postgresql://..."
```

### Lỗi: "Seed failed (HTTP 401)"

- Kiểm tra `SEED_SECRET_KEY` trong .env khớp với Vercel ENV
- Đảm bảo `/api/seed-production` route có middleware check:
  ```typescript
  if (auth !== `Bearer ${process.env.SEED_SECRET_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  ```

### Lỗi: "Site not ready"

- Đợi thêm thời gian cho Vercel deploy (mặc định 90s)
- Tăng `WAIT_AFTER_DEPLOY_SEC` nếu cần:
  ```bash
  export WAIT_AFTER_DEPLOY_SEC=120
  ./scripts/full-seed-deploy.sh
  ```

### Lỗi: "Vercel CLI not found"

- Script sẽ tự động fallback sang git push
- Hoặc cài Vercel CLI:
  ```bash
  npm install -g vercel
  vercel login
  ```

---

## 📁 File structure

```
apexrebate/
├── run-seed-check.sh              # ← Wrapper tiện lợi (load ENV tự động)
├── scripts/
│   ├── check-seed-readiness.sh   # ← Script kiểm tra chi tiết
│   └── full-seed-deploy.sh        # ← Script deploy + seed production
├── src/app/api/
│   └── seed-production/route.ts  # ← API endpoint seed (POST with Bearer)
└── .env                           # ← ENV variables (local only, gitignored)
```

---

## 🎯 Quick Commands

```bash
# 1. Kiểm tra nhanh
./run-seed-check.sh

# 2. Deploy (nếu check OK)
source .env && ./scripts/full-seed-deploy.sh

# 3. Chỉ seed (không deploy lại)
curl -X POST https://apexrebate.com/api/seed-production \
  -H "Authorization: Bearer ${SEED_SECRET_KEY}" \
  -H "Content-Type: application/json"
```

---

## ⚠️ Lưu ý quan trọng

- **KHÔNG commit `.env`** vào git (đã có trong `.gitignore`)
- **SEED_SECRET_KEY** phải match giữa local `.env` và Vercel ENV
- **Chạy `run-seed-check.sh` trước** mỗi lần deploy để tránh lỗi
- **Production seed chỉ chạy 1 lần** - script có check `userCount > 5` để tránh duplicate

---

## 📊 Hiện trạng hiện tại

- ✅ Database: 31 tables (Neon Postgres)
- ✅ Production: https://apexrebate.com
- ✅ Dashboard: HTTP 200, no errors
- ✅ API: `/api/dashboard`, `/api/health` OK
- ✅ Bundle: `dashboard/page-2b1497835729347c.js`

---

**Commit mới nhất:**
- `cd04215f` - fix(devops): reformat full-seed-deploy.sh
- `5037c4b9` - feat(devops): add run-seed-check.sh wrapper

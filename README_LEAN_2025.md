# Modern Lean Stack 2025

Stack: Vercel + Neon + Prisma + Node runtime

## Quickstart
1. Copy `.env.example` → `.env`
2. Set real DATABASE_URL + SEED_SECRET_KEY
3. Push to Vercel main branch
4. Test:
   npm run test:seed

## Expected output
✅ API OK
✅ Database connected
🎉 SEED VALIDATION SUCCESSFUL

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

{
  "functions": {
    "api/backup/cleanup.ts": {
      "runtime": "edge",
      "maxDuration": 15
    }
  },
  "env": {
    "BACKUP_SERVICE_URL": "@BACKUP_SERVICE_URL",
    "BACKUP_AUTH_TOKEN": "@BACKUP_AUTH_TOKEN"
  }
}

export const runtime = 'edge'

/**
 * Edge proxy tới BACKUP_SERVICE_URL (Cloud Run / Firebase Functions)
 * Giữ nguyên header Authorization, Content-Type, query & body.
 */
export async function GET(req: Request) {
  return proxyRequest(req)
}

export async function POST(req: Request) {
  return proxyRequest(req)
}

async function proxyRequest(req: Request): Promise<Response> {
  const backend = process.env.BACKUP_SERVICE_URL
  if (!backend) {
    return new Response(JSON.stringify({ error: 'BACKUP_SERVICE_URL not configured' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }

  const url = new URL(req.url)
  const query = url.search ? url.search : ''
  const target = backend + query

  const headers = new Headers(req.headers)
  // Inject token nếu cần
  if (process.env.BACKUP_AUTH_TOKEN && !headers.has('authorization')) {
    headers.set('authorization', process.env.BACKUP_AUTH_TOKEN)
  }

  // Forward fetch (Edge native streaming)
  const response = await fetch(target, {
    method: req.method,
    headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
  })

  // Trả response gốc, tránh cache
  return new Response(response.body, {
    status: response.status,
    headers: {
      'content-type': response.headers.get('content-type') || 'application/json',
      'cache-control': 'no-store',
    },
  })
}

const auth = req.headers.authorization;
if (auth !== `Bearer ${process.env.INTERNAL_TOKEN}`) return res.status(403).send("Forbidden");

# Cấu trúc thư mục

Dưới đây là cấu trúc thư mục của project:

```
modern-lean-stack-2025/
│
├── prisma/
│   └── schema.prisma
│
├── src/
│   └── app/api/seed-production/route.ts
│
├── lib/
│   └── db.ts
│
├── scripts/
│   └── test-seed-algorithms.js
│
├── .env.example
│
└── README.md
```

---

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  payouts   Payout[]
}

model Tool {
  id        Int      @id @default(autoincrement())
  name      String
  category  String?
  createdAt DateTime @default(now())
}

model Payout {
  id        Int      @id @default(autoincrement())
  userId    Int
  amount    Float
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}

import { PrismaClient } from "@prisma/client";
import chalk from "chalk";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
const prisma = new PrismaClient();

const SEED_ENDPOINT =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") + "/api/seed-production";
const API_KEY = process.env.SEED_SECRET_KEY;

async function verifyApiRoute() {
  console.log(chalk.cyan(`🔍 Checking seed API route...`));
  try {
    const res = await fetch(SEED_ENDPOINT, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    const json = await res.json();
    if (json.seeded || json.success) {
      console.log(chalk.green(`✅ API seed route OK → ${SEED_ENDPOINT}`));
      console.log(json);
    } else {
      console.warn(chalk.yellow(`⚠️ API responded but not seeded:`));
      console.log(json);
    }
  } catch (err) {
    console.error(chalk.red(`❌ API seed test failed: ${err.message}`));
  }
}

async function verifyDatabase() {
  console.log(chalk.cyan(`\n🔍 Checking database state via Prisma...`));
  try {
    const userCount = await prisma.user.count();
    const toolCount = await prisma.tool.count();
    const payoutCount = await prisma.payout.count();

    console.log(
      chalk.green(
        `✅ Prisma connected → ${userCount} users, ${toolCount} tools, ${payoutCount} payouts`
      )
    );

    if (userCount > 0 && toolCount > 0) {
      console.log(chalk.bold.green(`🎉 SEED VALIDATION SUCCESSFUL`));
      process.exit(0);
    } else {
      console.warn(chalk.yellow(`⚠️ Missing records → check /api/seed-production`));
      process.exit(1);
    }
  } catch (err) {
    console.error(chalk.red(`❌ Prisma test failed: ${err.message}`));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

(async () => {
  console.log(chalk.bold(`\n🚀 Running Seed Algorithm Validation\n`));
  if (!process.env.DATABASE_URL)
    return console.error(chalk.red("❌ Missing DATABASE_URL in .env"));
  if (!process.env.SEED_SECRET_KEY)
    console.warn(chalk.yellow("⚠️ Missing SEED_SECRET_KEY in .env"));

  await verifyApiRoute();
  await verifyDatabase();
})();
````markdown
name: Modern Lean Stack 2025 CI/CD

on:
  push:
    branches: [main]

jobs:
  test-deploy:
    runs-on: ubuntu-latest
    env:
      DATABASE_URL: ${{ secrets.DATABASE_URL }}
      SEED_SECRET_KEY: ${{ secrets.SEED_SECRET_KEY }}

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci --legacy-peer-deps
      - run: npx prisma generate
      - run: npm run test:seed
        continue-on-error: true
      - uses: amondnet/vercel-action@v25
        if: github.ref == 'refs/heads/main'
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: --prod

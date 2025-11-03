# 🔧 API Route Fix Required: /api/seed-production

## ❌ Vấn Đề Hiện Tại

```bash
curl https://apexrebate.com/api/seed-production
→ 404 Not Found
```

**Root cause:** API route `/api/seed-production` không được build/deploy trên Vercel production.

## ✅ File Đã Tạo Đúng

File: `src/app/api/seed-production/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() { ... }
export async function GET() { ... }
```

✅ File tồn tại local  
✅ Code syntax đúng  
✅ Đã commit: `bb294dfe`  
❌ Chưa accessible trên production  

## 🔍 Nguyên Nhân Có Thể

### 1. Vercel Chưa Redeploy
- Commit đã push nhưng Vercel chưa auto-deploy
- Hoặc deployment bị failed

### 2. Build Configuration Issue
- Route có thể bị skip trong build output
- Check `.vercelignore` hoặc `next.config.ts`

### 3. Routing Conflict
- Middleware có thể block API routes
- Check `middleware.ts` matcher config

## 🚀 Giải Pháp

### Option 1: Force Redeploy Vercel (RECOMMENDED)

```bash
# 1. Push lại với force trigger
git commit --allow-empty -m "trigger: force vercel redeploy for seed-production API"
git push origin main

# 2. Hoặc redeploy manual trên Vercel dashboard
# Go to: https://vercel.com/[your-team]/apexrebate/deployments
# Click "..." → "Redeploy"

# 3. Đợi 2-3 phút, test lại:
curl -I https://apexrebate.com/api/seed-production
# Expected: HTTP/2 200 (not 404)
```

### Option 2: Check Build Logs

1. Go to Vercel Dashboard → Deployments
2. Click latest deployment
3. View "Building" logs
4. Search for: `api/seed-production`
5. Verify route is included in build output

Expected in logs:
```
Route (app)                                ... /api/seed-production
```

### Option 3: Verify Middleware Not Blocking

Check `middleware.ts`:

```typescript
export const config = {
  // API routes should be EXCLUDED
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|.*\\..*).*)']
};
```

API routes (`/api/*`) must be in the exclude pattern `(?!api|...)`.

## ✅ Verification Steps

### After Redeploy:

```bash
# 1. Check route exists (GET)
curl https://apexrebate.com/api/seed-production

# Expected response:
{
  "seeded": false,
  "data": {
    "users": 0,
    "tools": 0,
    ...
  }
}

# 2. Test POST (with auth)
export SEED_SECRET_KEY='your-key'
curl -X POST https://apexrebate.com/api/seed-production \
  -H "Authorization: Bearer $SEED_SECRET_KEY"

# Expected: 401 Unauthorized (if key wrong) or 200 with seed results

# 3. Run full seed script
./scripts/deploy-and-seed.sh

# Should complete without 404 errors
```

## 📊 Current Status

| Item | Status | Notes |
|------|--------|-------|
| File created | ✅ | `src/app/api/seed-production/route.ts` |
| Code correct | ✅ | Uses PrismaClient directly |
| Committed | ✅ | Commit `bb294dfe` |
| Pushed | ✅ | On `main` branch |
| **Vercel Deploy** | ❌ | **PENDING REDEPLOY** |
| Production accessible | ❌ | Returns 404 |

## 🎯 Next Immediate Action

**Do này trước:**

```bash
# Force Vercel redeploy
git commit --allow-empty -m "deploy: force rebuild for seed-production API"
git push origin main

# Monitor deployment
# Visit: https://vercel.com/[your-team]/apexrebate/deployments
# Wait for "Ready" status (~2 mins)

# Then test
curl https://apexrebate.com/api/seed-production
```

**Nếu vẫn 404 sau redeploy:**

1. Check Vercel build logs for errors
2. Verify route appears in build output
3. Check middleware.ts excludes `/api/*`
4. Try creating route in `pages/api/` instead (legacy router)

## 🆘 Alternative: Pages Router Version

Nếu App Router không work, tạo Pages Router version:

**File:** `pages/api/seed-production.ts`

```typescript
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = req.headers.authorization
  
  if (auth !== `Bearer ${process.env.SEED_SECRET_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  if (req.method === 'GET') {
    const counts = {
      users: await prisma.user.count(),
      tools: await prisma.tool.count()
    }
    return res.json({ seeded: counts.users > 5, data: counts })
  }
  
  if (req.method === 'POST') {
    // Import and run seed
    const seedModule = require('@/lib/seed-master')
    await seedModule.default()
    
    return res.json({ success: true })
  }
  
  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
```

## 📚 Related Files

- `src/app/api/seed-production/route.ts` - Main API route (App Router)
- `scripts/deploy-and-seed.sh` - Deployment script that calls this API
- `scripts/seed-production-simple.sh` - Simpler seed script
- `src/lib/seed-master.ts` - Master seed function
- `middleware.ts` - Routing middleware (check excludes API)

---

**TL;DR**: Route file correct, just need Vercel redeploy. Force push or manual redeploy on Vercel dashboard.

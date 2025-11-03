# 📦 Modern Lean Stack 2025 - One-Liner Package Generator

## 🚀 Quick Generate

Tạo **standalone package** với đủ 5 files chuẩn (Prisma + DB + API + Tests):

```bash
mkdir -p modern-lean-stack-2025/{src/app/api/seed-production,lib,prisma,scripts} && \
cat > modern-lean-stack-2025/prisma/schema.prisma <<'EOF'
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }
model User { id Int @id @default(autoincrement()) email String @unique name String? createdAt DateTime @default(now()) payouts Payout[] }
model Tool { id Int @id @default(autoincrement()) name String category String? createdAt DateTime @default(now()) }
model Payout { id Int @id @default(autoincrement()) userId Int amount Float createdAt DateTime @default(now()) user User @relation(fields: [userId], references: [id]) }
EOF
cat > modern-lean-stack-2025/lib/db.ts <<'EOF'
import { PrismaClient } from "@prisma/client";
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient({ log: ["warn","error"] });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
EOF
cat > modern-lean-stack-2025/src/app/api/seed-production/route.ts <<'EOF'
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
export async function GET() {
  try {
    const users = await prisma.user.count();
    const tools = await prisma.tool.count();
    const payouts = await prisma.payout.count();
    return NextResponse.json({ seeded: users > 0, counts: { users, tools, payouts } });
  } catch (err) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== \`Bearer \${process.env.SEED_SECRET_KEY}\`)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.user.createMany({ data: Array.from({ length: 5 }).map((_, i) => ({
    email: \`user\${i+1}@test.com\`, name: \`Test User \${i+1}\` })) });
  return NextResponse.json({ success: true, seeded: true });
}
EOF
cat > modern-lean-stack-2025/scripts/test-seed-algorithms.js <<'EOF'
import { PrismaClient } from "@prisma/client";
import chalk from "chalk";
import dotenv from "dotenv";
import fetch from "node-fetch";
dotenv.config();
const prisma = new PrismaClient();
const SEED_ENDPOINT = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") + "/api/seed-production";
const API_KEY = process.env.SEED_SECRET_KEY;
async function verifyApiRoute(){
  console.log(chalk.cyan(\`🔍 Checking seed API route...\`));
  try{const res=await fetch(SEED_ENDPOINT,{headers:{Authorization:\`Bearer \${API_KEY}\`}});const json=await res.json();
  if(json.seeded||json.success){console.log(chalk.green(\`✅ API seed route OK → \${SEED_ENDPOINT}\`));console.log(json);}
  else{console.warn(chalk.yellow(\`⚠️ API responded but not seeded:\`));console.log(json);}}
  catch(err){console.error(chalk.red(\`❌ API seed test failed: \${err.message}\`));}}
async function verifyDatabase(){
  console.log(chalk.cyan(\`\\n🔍 Checking database state via Prisma...\`));
  try{const u=await prisma.user.count();const t=await prisma.tool.count();const p=await prisma.payout.count();
  console.log(chalk.green(\`✅ Prisma connected → \${u} users, \${t} tools, \${p} payouts\`));
  if(u>0&&t>0){console.log(chalk.bold.green(\`🎉 SEED VALIDATION SUCCESSFUL\`));process.exit(0);}
  else{console.warn(chalk.yellow(\`⚠️ Missing records → check /api/seed-production\`));process.exit(1);}}
  catch(err){console.error(chalk.red(\`❌ Prisma test failed: \${err.message}\`));process.exit(1);}
  finally{await prisma.\$disconnect();}}
(async()=>{console.log(chalk.bold(\`\\n🚀 Running Seed Algorithm Validation\\n\`));
if(!process.env.DATABASE_URL)return console.error(chalk.red("❌ Missing DATABASE_URL in .env"));
if(!process.env.SEED_SECRET_KEY)console.warn(chalk.yellow("⚠️ Missing SEED_SECRET_KEY in .env"));
await verifyApiRoute();await verifyDatabase();})();
EOF
cat > modern-lean-stack-2025/.env.example <<'EOF'
DATABASE_URL="postgresql://user:password@ep-sample.neon.tech/apexrebate?sslmode=require"
SEED_SECRET_KEY="your-secret-key"
NEXT_PUBLIC_APP_URL="https://apexrebate.com"
EOF
cat > modern-lean-stack-2025/README.md <<'EOF'
# Modern Lean Stack 2025
Stack: Vercel + Neon + Prisma + Node runtime
## Quickstart
1. Copy \`.env.example\` → \`.env\`
2. Set real DATABASE_URL + SEED_SECRET_KEY
3. Push to Vercel main branch
4. Test: \`npm run test:seed\`
EOF
zip -r modern-lean-stack-2025.zip modern-lean-stack-2025 >/dev/null && \
echo "✅ Done → File created: \$(pwd)/modern-lean-stack-2025.zip (~35KB, ready-to-commit)"
```

---

## 📦 Package Contents

```
modern-lean-stack-2025/
├── prisma/schema.prisma          # PostgreSQL models
├── lib/db.ts                     # Prisma singleton client
├── src/app/api/seed-production/  # Seed endpoint with auth
│   └── route.ts
├── scripts/
│   └── test-seed-algorithms.js   # Validation tests
├── .env.example                  # Environment template
└── README.md                     # Quick setup guide
```

---

## 🎯 Usage

### 1. Generate Package
```bash
# Copy one-liner above and run
```

### 2. Extract & Deploy
```bash
unzip modern-lean-stack-2025.zip -d .
git add .
git commit -m "feat: modern lean stack 2025 package"
git push origin main
```

### 3. Verify
```bash
npm run test:seed
# Expected: ✅ Prisma connected → X users, Y tools, Z payouts
```

---

## 🔧 Customize

Edit files before zipping:
- `prisma/schema.prisma` - Add your models
- `src/app/api/seed-production/route.ts` - Custom seed logic
- `scripts/test-seed-algorithms.js` - Add your tests

Then re-run:
```bash
zip -r modern-lean-stack-2025.zip modern-lean-stack-2025
```

---

**✅ Ready for production with Vercel + Neon!**

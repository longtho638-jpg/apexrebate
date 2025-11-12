# 🏭 Relay Factory - ApexRebate Edition

**Bootstrap production-ready projects in seconds** from battle-tested Agentic templates.

Relay Factory là kho lưu trữ các template dự án tối ưu, được tích hợp sẵn:
- 🤖 **Kimi K2 Agent** (AI orchestration)
- 🔐 **Authentication** (NextAuth / JWT)
- 🗄️ **Database** (Prisma / TypeORM / SQLModel)
- 🧪 **Testing** (Jest / Pytest)
- 📦 **CI/CD** (GitHub Actions, semantic-release)
- 🌐 **Deployment** (Vercel / Docker / Railway)

---

## 🚀 Quick Start

### 1. List Available Templates

```bash
cd factory/scripts
ls -la ../templates/
```

**Available Templates:**
- `nextjs-agentic` — Next.js 15 + App Router + Agentic
- `nestjs-agentic` — NestJS REST API + TypeORM
- `fastapi-agentic` — FastAPI + SQLModel
- `cloudflare-worker-agentic` — Cloudflare Workers (coming soon)
- `web3-foundry-agentic` — Solidity + Foundry (coming soon)
- `remix-agentic` — Remix SSR (coming soon)
- `vite-agentic` — Vite SPA (coming soon)

### 2. Create a New Project

```bash
cd factory/scripts

# Syntax: ./mkproj.sh <project-name> <template>
./mkproj.sh acme-web nextjs-agentic
./mkproj.sh api-gateway nestjs-agentic
./mkproj.sh data-pipeline fastapi-agentic
```

### 3. Start Developing

```bash
cd ../acme-web          # Navigate to your new project
code .                   # Open in VS Code

# Then follow the template's README for setup
cat README.md
```

---

## 📂 Factory Structure

```
factory/
├── scripts/
│   ├── mkproj.sh                 # ⭐ Main template generator
│   └── setup-templates.sh         # Initialize new templates
├── templates/
│   ├── nextjs-agentic/           # Next.js template
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   ├── .env.example
│   │   ├── _gitignore
│   │   └── README.md
│   ├── nestjs-agentic/           # NestJS template
│   ├── fastapi-agentic/          # FastAPI template
│   └── [more templates]
├── README.md                      # This file
└── GUIDE.md                       # Detailed guide
```

---

## 📖 Detailed Usage

### Option A: Generate from macOS/Linux Terminal

```bash
cd ~/apexrebate-1/factory/scripts
chmod +x ./mkproj.sh              # First time only

# Create new project
./mkproj.sh my-app nextjs-agentic

# Navigate and open
cd ../my-app
code .
```

### Option B: Generate from Windows PowerShell

```powershell
cd C:\apexrebate-1\factory\scripts

# Create new project
bash ./mkproj.sh my-app nextjs-agentic

# Navigate and open
cd ..\my-app
code .
```

### Option C: One-Liner (macOS/Linux)

```bash
cd ~/apexrebate-1/factory/scripts && ./mkproj.sh my-app nextjs-agentic && cd ../my-app && code .
```

---

## 🛠️ What Each Template Includes

### Next.js Agentic
```
✅ Next.js 15 with App Router
✅ Tailwind CSS pre-configured
✅ Prisma ORM setup
✅ NextAuth.js multi-provider
✅ TypeScript strict mode
✅ Jest + React Testing Library
✅ ESLint + Prettier
✅ GitHub Actions CI/CD
```

Setup:
```bash
pnpm i
cp .env.example .env.local
pnpm dev
```

### NestJS Agentic
```
✅ NestJS 10 with dependency injection
✅ TypeORM with PostgreSQL
✅ JWT authentication ready
✅ Validation pipes configured
✅ CORS enabled
✅ Class transformers
✅ Docker support
✅ GitHub Actions CI/CD
```

Setup:
```bash
pnpm i
cp .env.example .env.local
pnpm start:dev
```

### FastAPI Agentic
```
✅ FastAPI with async support
✅ SQLModel for ORM
✅ Pydantic validation
✅ JWT authentication
✅ CORS configured
✅ Alembic migrations
✅ Pytest fixtures
✅ Docker support
```

Setup:
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 3000
```

---

## 🔧 Customizing Templates

### Add a New Template

```bash
cd factory/templates
mkdir my-custom-template
cd my-custom-template

# Copy base files
touch package.json tsconfig.json README.md
echo "*" > .gitignore
```

Then update `mkproj.sh` to recognize it:
```bash
# mkproj.sh will auto-discover templates
./mkproj.sh my-app my-custom-template
```

### Modify Existing Template

```bash
# Edit any template file
nano factory/templates/nextjs-agentic/package.json

# Next project will use the updated version
./mkproj.sh new-app nextjs-agentic
```

---

## 🚀 Deploy Your Generated Project

### Vercel (Next.js)
```bash
cd acme-web
vercel
```

### Railway (All)
```bash
cd api-gateway
railway up
```

### Fly.io (All)
```bash
cd data-pipeline
flyctl launch
flyctl deploy
```

### Docker (NestJS/FastAPI)
```bash
cd api-gateway
docker build -t api-gateway .
docker run -p 3000:3000 api-gateway
```

---

## 🤖 Agent Integration

Each template is pre-configured for K2 agents:

```bash
# In your generated project
cp .env.example .env
# Set these:
KIMI_API_KEY=your-key
K2_PROVIDER=kimi
K2_MODEL=kimi-9b
GOOGLE_GEMINI_API_KEY=your-gemini-key
```

Then use in your code:

**Next.js:**
```typescript
const { response } = await k2Agent.execute({
  prompt: "Analyze this data...",
});
```

**NestJS:**
```typescript
@Injectable()
export class AnalysisService {
  async analyze(data: any) {
    const result = await this.k2Agent.execute({
      prompt: `Analyze: ${JSON.stringify(data)}`,
    });
  }
}
```

**FastAPI:**
```python
from app.agents import k2_agent

async def analyze_data(data: dict):
    result = await k2_agent.execute(
        prompt=f"Analyze: {json.dumps(data)}"
    )
    return result
```

---

## 📋 Example: Create Full Stack App in 2 Minutes

```bash
# 1. Generate frontend
cd ~/apexrebate-1/factory/scripts
./mkproj.sh acme-frontend nextjs-agentic

# 2. Generate backend
./mkproj.sh acme-backend nestjs-agentic

# 3. Open in VS Code
cd ../acme-frontend && code . &
cd ../acme-backend && code .

# 4. Install & start
# Terminal 1 (Frontend)
pnpm i && pnpm dev

# Terminal 2 (Backend)
pnpm i && pnpm start:dev
```

Frontend connects to backend:
```typescript
// acme-frontend/src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
```

---

## 🧪 Testing Generated Projects

```bash
# Navigate to project
cd acme-web

# Run tests
pnpm test              # All templates
pnpm test:watch       # Watch mode
pnpm test:cov         # With coverage
pytest                # FastAPI only
```

---

## 🔐 Security Best Practices

When using factory projects:

1. **Never commit `.env`** — Add to `.gitignore` ✅
2. **Rotate API keys** — Use GitHub Secrets for CI/CD
3. **Use HTTPS in production** — Enabled by default
4. **Enable CORS selectively** — Update `ALLOWED_ORIGINS`
5. **Validate all inputs** — Middleware pre-configured

---

## 📊 Performance Metrics

Generated projects come with performance:

| Metric | Target | How |
|--------|--------|-----|
| **Next.js Build** | < 60s | SWC compiler |
| **API Response** | < 100ms | Optimized routing |
| **Bundle Size** | < 50KB | Tree-shaking enabled |
| **Core Web Vitals** | 90+ | Image optimization |

---

## 🐛 Troubleshooting

### `mkproj.sh` not found
```bash
cd factory/scripts
chmod +x ./mkproj.sh
./mkproj.sh my-app nextjs-agentic
```

### Template not found
```bash
ls -la factory/templates/
# Make sure template directory exists
```

### Port 3000 already in use
```bash
# Change port in .env
PORT=3001
pnpm dev
```

### Database connection failed
```bash
# Check DATABASE_URL in .env
# Ensure PostgreSQL is running
psql -U postgres -d {{PROJECT_NAME}}
```

---

## 🤝 Contributing

Add a new template:

1. Create directory: `factory/templates/my-template/`
2. Copy base files from existing template
3. Customize for your stack
4. Test with `mkproj.sh`: `./mkproj.sh test-app my-template`
5. Commit and push

---

## 📞 Support

- 📖 See individual template READMEs
- 🐛 Report issues to factory maintainers
- 💬 Discuss in team Slack/Discord

---

## 📄 License

MIT - Free for personal and commercial use

---

**Ready to build?** 🚀

```bash
cd factory/scripts && ./mkproj.sh awesome-app nextjs-agentic
```

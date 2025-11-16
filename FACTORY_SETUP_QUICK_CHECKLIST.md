# 🏭 Factory System Setup - Quick Checklist

## ✅ System Status (Nov 12, 2025)

### CLI Tools Available
- ✅ Node.js v24.10.0
- ✅ npm 11.6.0
- ✅ pnpm 10.21.0
- ✅ Python 3.9.6
- ✅ Git 2.x
- ⚠️ Docker (optional, for containerization)

### Factory System
- ✅ Generator: `factory/scripts/mkproj.sh`
- ✅ 4 Templates: nextjs, nestjs, fastapi, cloudflare-worker
- ✅ Documentation: 4 complete guides
- ✅ API Integration: Templates ready

---

## 🚀 Quick Start (2 minutes)

### Step 1: Navigate to Factory
```bash
cd ~/apexrebate-1/factory/scripts
```

### Step 2: Create First Project
```bash
./mkproj.sh my-first-app nextjs-agentic
```

### Step 3: Run It
```bash
cd ../my-first-app
pnpm install
pnpm dev
```

### Step 4: Open Browser
```
http://localhost:3000
```

✅ **Done!** Your app is live.

---

## 🔧 Optional: Enhanced Setup (10 minutes)

To install deployment tools + API integrations:

```bash
cd ~/apexrebate-1/factory/scripts
bash setup-factory-cli.sh
```

This will:
- [ ] Optionally install Docker Desktop
- [ ] Optionally install Railway CLI
- [ ] Optionally install Fly.io CLI
- [ ] Optionally install Vercel CLI
- [ ] Setup API integration templates
- [ ] Test factory generation
- [ ] Verify everything works

---

## 📋 Available Templates

### 1️⃣ Next.js (nextjs-agentic)
```bash
./mkproj.sh my-web nextjs-agentic
cd ../my-web && pnpm i && pnpm dev
# Opens: http://localhost:3000
```
**Best for:** Web apps, dashboards, frontend

### 2️⃣ NestJS (nestjs-agentic)
```bash
./mkproj.sh my-api nestjs-agentic
cd ../my-api && pnpm i && pnpm start:dev
# Opens: http://localhost:3000 (API)
```
**Best for:** REST APIs, microservices, backend

### 3️⃣ FastAPI (fastapi-agentic)
```bash
./mkproj.sh my-python fastapi-agentic
cd ../my-python
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 3000
# Opens: http://localhost:3000/docs (API docs)
```
**Best for:** Python APIs, data pipelines, ML services

### 4️⃣ Cloudflare Worker (cloudflare-worker-agentic)
```bash
./mkproj.sh my-edge cloudflare-worker-agentic
cd ../my-edge && pnpm i && pnpm dev
# Opens: http://localhost:8787
```
**Best for:** Edge computing, serverless functions, CDN

---

## 🔌 Connect to ApexRebate

### Option A: Microservice (Recommended)
```bash
# Create standalone service
./mkproj.sh my-kyc-service nestjs-agentic

# Configure connection
cd ../my-kyc-service
cat .env.local
# Add: APEX_API_URL=http://localhost:3000/api

# Start service
pnpm i && pnpm start:dev
# Service runs on port 3000 (different terminal from main app)
```

### Option B: Full Stack in 2 Minutes
```bash
# Create frontend
./mkproj.sh my-dashboard nextjs-agentic

# Create backend
./mkproj.sh my-backend nestjs-agentic

# Start both in different terminals
# Terminal 1:
cd ../my-dashboard && pnpm i && pnpm dev

# Terminal 2:
cd ../my-backend && pnpm i && pnpm start:dev
```

### Option C: Add to ApexRebate package.json
```json
{
  "scripts": {
    "factory:create": "cd factory/scripts && ./mkproj.sh",
    "factory:list": "ls factory/templates"
  }
}
```

Then:
```bash
npm run factory:create my-module nestjs-agentic
```

---

## 📦 Deployment Options

### For Next.js
```bash
cd my-web
vercel login
vercel  # Auto-deploys to Vercel
```

### For Any Project (Railway)
```bash
cd my-api
railway login
railway up  # Interactive setup
```

### For Any Project (Fly.io)
```bash
cd my-api
flyctl auth login
flyctl launch
flyctl deploy
```

### Docker (Manual)
```bash
cd my-api
docker build -t my-api .
docker run -p 3000:3000 my-api
```

---

## ✅ Verification Checklist

- [ ] Node/npm/pnpm installed: `node --version && npm --version && pnpm --version`
- [ ] Factory generator ready: `ls -la factory/scripts/mkproj.sh`
- [ ] Templates available: `ls factory/templates/`
- [ ] Create test project: `./mkproj.sh test-app nextjs-agentic`
- [ ] Test runs: `cd ../test-app && pnpm i && pnpm dev`
- [ ] Opens in browser: `http://localhost:3000`

---

## 🐛 Troubleshooting

### `mkproj.sh: command not found`
```bash
chmod +x factory/scripts/mkproj.sh
```

### `Template not found`
```bash
ls factory/templates/  # Verify exact name
./mkproj.sh my-app nextjs-agentic  # Correct
```

### `Port 3000 already in use`
```bash
lsof -i :3000 && kill -9 <PID>
# Or: PORT=3001 pnpm dev
```

### `pnpm: command not found`
```bash
npm install -g pnpm
```

---

## 📚 Documentation

| Doc | Path | Purpose |
|-----|------|---------|
| Diagnostic | `FACTORY_SYSTEM_DIAGNOSTIC_NOV12.md` | Full system check |
| Setup Guide | `factory/START_HERE.md` | First-time users |
| Full Reference | `factory/README.md` | Complete guide |
| Deployment | `factory/FACTORY_DEPLOYMENT.md` | Production setup |
| API Integration | `factory/API_INTEGRATION_GUIDE.md` | Connect to ApexRebate |

---

## 🎯 Next Steps

**Right Now (5 min):**
1. Run: `cd factory/scripts && ./mkproj.sh demo nextjs-agentic`
2. Verify: `cd ../demo && pnpm i && pnpm dev`
3. Check: http://localhost:3000

**Next 1 Hour:**
1. Read: `factory/START_HERE.md`
2. Create: NestJS microservice
3. Test: Connect to ApexRebate API

**This Week:**
1. Create full-stack app (frontend + backend)
2. Test all 4 templates
3. Deploy to Vercel/Railway
4. Add to production

---

## 💡 Pro Tips

### 1. Watch Mode
```bash
cd my-app
pnpm dev  # Auto-reloads on file changes
```

### 2. Parallel Services
```bash
# Terminal 1
cd my-frontend && pnpm dev

# Terminal 2 (new terminal)
cd my-backend && pnpm start:dev

# Terminal 3 (new terminal)
cd my-python-api && python -m uvicorn app.main:app --reload
```

### 3. Bulk Generation
```bash
for i in {1..3}; do
  ./mkproj.sh service-$i nestjs-agentic
done
```

### 4. Custom Template
```bash
# Modify a template
nano factory/templates/nextjs-agentic/package.json
# Add your packages

# Generate from modified template
./mkproj.sh new-app nextjs-agentic  # Auto-uses latest
```

---

## 🔐 Security Reminders

- ✅ Never commit `.env` files
- ✅ Use GitHub Secrets for CI/CD
- ✅ Rotate API keys regularly
- ✅ Enable HTTPS in production
- ✅ Keep dependencies updated: `pnpm up`

---

## 📞 Support

- 📖 Quick help: `factory/START_HERE.md`
- 🚀 Full guide: `factory/README.md`
- 💻 Troubleshooting: See section above
- 🔧 Template-specific: `factory/templates/*/README.md`

---

**Status**: ✅ **FACTORY SYSTEM READY TO USE**

**Last Updated**: Nov 12, 2025  
**Next Action**: `cd factory/scripts && ./mkproj.sh my-app nextjs-agentic`

🎉 Happy building!

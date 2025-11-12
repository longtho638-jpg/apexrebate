# 🚀 START HERE - Relay Factory Quick Guide

**Relay Factory** is integrated into ApexRebate. Create production-ready projects in **60 seconds**.

---

## ⚡ The Fastest Way to Start

### 1. Open Terminal

```bash
cd ~/apexrebate-1/factory/scripts
```

### 2. Choose Your Stack

**Web App (React + Next.js)?**
```bash
./mkproj.sh my-web-app nextjs-agentic
```

**REST API (Node.js + NestJS)?**
```bash
./mkproj.sh my-api nestjs-agentic
```

**Python API (FastAPI)?**
```bash
./mkproj.sh my-python-api fastapi-agentic
```

**Serverless Edge (Cloudflare)?**
```bash
./mkproj.sh my-edge cloudflare-worker-agentic
```

### 3. Run It

```bash
cd ../my-web-app           # (or your project name)
cp .env.example .env.local
pnpm i                     # (npm install or pip install -r requirements.txt)
pnpm dev                   # (npm start:dev or uvicorn...)
```

✅ **Done!** Open browser → http://localhost:3000

---

## 📚 Find What You Need

| I want to... | Go to... | Time |
|--------------|----------|------|
| **Create first project** | ☝️ Above | 60 sec |
| **See all templates** | [`README.md`](./README.md) | 5 min |
| **Deep technical guide** | [`GUIDE.md`](./GUIDE.md) | 30 min |
| **Integration with ApexRebate** | [`FACTORY_DEPLOYMENT.md`](./FACTORY_DEPLOYMENT.md) | 15 min |
| **60-second summary** | [`QUICK_START.md`](./QUICK_START.md) | 1 min |

---

## 🎯 Common Tasks

### Create a Frontend & Backend in 2 Minutes

```bash
cd ~/apexrebate-1/factory/scripts

# Frontend
./mkproj.sh my-frontend nextjs-agentic

# Backend
./mkproj.sh my-backend nestjs-agentic

# Open both
cd ../my-frontend && code .
# New terminal:
cd ../my-backend && code .
```

### Deploy to Production

```bash
cd my-web-app

# Vercel (Next.js)
vercel

# Railway (Any template)
railway up

# Fly.io (Any template)
flyctl deploy
```

### Add a Feature to ApexRebate

```bash
cd ~/apexrebate-1/factory/scripts
./mkproj.sh apexrebate-new-module nestjs-agentic

# Use this new service alongside ApexRebate
```

---

## 🤖 AI Integration (Kimi K2)

Every template has K2 agent support built-in:

```bash
# In your .env file
KIMI_API_KEY=your-key
K2_MODEL=kimi-9b
```

Then use in your code — check individual template README for examples.

---

## 🔍 Templates Overview

```
nextjs-agentic        → Full-stack web apps, UIs
nestjs-agentic        → REST APIs, microservices
fastapi-agentic       → Python APIs, data pipelines
cloudflare-worker     → Serverless edge computing
```

---

## ❓ FAQ

**Q: Can I use these templates for production?**
A: Yes! They include CI/CD, testing, and all production best practices.

**Q: Can I customize templates?**
A: Yes! Edit files in `factory/templates/nextjs-agentic/` and next projects inherit changes.

**Q: Can I create my own template?**
A: Yes! Copy `factory/templates/nextjs-agentic/` to `factory/templates/my-template/`, customize, and use.

**Q: How do I deploy?**
A: Each template has deploy docs. Quick: `vercel` (Vercel), `railway up` (Railway), `flyctl deploy` (Fly).

**Q: Do I need to commit `.env`?**
A: No! It's in `.gitignore`. Use GitHub Secrets for CI/CD.

---

## 🚀 Next Steps

1. **Run the 60-second setup** above ☝️
2. **Read template README** (in your new project folder)
3. **Start coding** 
4. **Deploy** when ready

---

**Questions?** See the other markdown files in this folder.

**Ready?** `cd factory/scripts && ./mkproj.sh my-app nextjs-agentic`

🎉 **Happy building!**

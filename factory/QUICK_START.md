# ⚡ Relay Factory - 60 Second Setup

## 1️⃣ Go to Factory

```bash
cd ~/apexrebate-1/factory/scripts
```

## 2️⃣ Pick Your Stack

| Template | Command | Framework |
|----------|---------|-----------|
| **Web App** | `./mkproj.sh myapp nextjs-agentic` | Next.js + React |
| **API** | `./mkproj.sh api nestjs-agentic` | NestJS + TypeORM |
| **Python API** | `./mkproj.sh pyapi fastapi-agentic` | FastAPI + SQLModel |

## 3️⃣ Run It

```bash
cd ../myapp                    # Your project folder
cp .env.example .env.local     # (or .env for Python)
pnpm i                         # Install (npm i for Python: pip install -r requirements.txt)
pnpm dev                       # Run (NestJS: pnpm start:dev, FastAPI: uvicorn app.main:app --reload)
```

## 4️⃣ Open Browser

- **Next.js:** http://localhost:3000
- **NestJS:** http://localhost:3000 (API)
- **FastAPI:** http://localhost:3000/docs (auto docs)

---

## 📝 Environment Setup

```bash
# Edit these files:
.env.local              # Next.js
.env                    # NestJS / FastAPI

# Must set:
KIMI_API_KEY=your-key
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
```

---

## 🚀 Deploy in 1 Command

```bash
# Vercel (Next.js)
vercel

# Railway (Any template)
railway up

# Fly.io (Any template)
flyctl deploy
```

---

## 📚 Learn More

- Detailed guide: [`GUIDE.md`](./GUIDE.md)
- All templates: [`README.md`](./README.md)
- Specific template: See `README.md` in your project folder

---

**That's it!** You have a production-ready app. Start coding! 🎉

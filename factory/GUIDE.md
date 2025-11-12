# 📚 Relay Factory - Complete Guide

**From zero to production in minutes.**

---

## 📖 Table of Contents

1. [Installation](#installation)
2. [Creating Your First Project](#creating-your-first-project)
3. [Template Deep Dives](#template-deep-dives)
4. [Development Workflow](#development-workflow)
5. [Database Setup](#database-setup)
6. [Authentication](#authentication)
7. [Deployment](#deployment)
8. [CI/CD Integration](#cicd-integration)
9. [Troubleshooting](#troubleshooting)

---

## Installation

### Prerequisites

- **Node.js** 18+ (for Node.js templates)
- **Python** 3.11+ (for FastAPI)
- **Git** 2.0+
- **PostgreSQL** 12+ (optional, for local database)
- **pnpm** or **npm** (Node package manager)

### Step 1: Clone/Verify Factory

Factory is already part of ApexRebate:

```bash
cd ~/apexrebate-1/factory
ls -la
```

You should see:
- `scripts/mkproj.sh`
- `templates/`
- `README.md`

### Step 2: Make Scripts Executable

```bash
chmod +x ~/apexrebate-1/factory/scripts/mkproj.sh
chmod +x ~/apexrebate-1/factory/scripts/*.sh
```

### Step 3: Verify Installation

```bash
cd ~/apexrebate-1/factory/scripts
./mkproj.sh
# Should show: "Usage: ./mkproj.sh <project-name> <template-name>"
```

✅ **Done!** Factory is ready.

---

## Creating Your First Project

### Quick Path: Next.js App

```bash
cd ~/apexrebate-1/factory/scripts

# Create project
./mkproj.sh my-startup nextjs-agentic

# Navigate and setup
cd ../my-startup
cp .env.example .env.local
pnpm i
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — your app is live!

### Quick Path: NestJS API

```bash
cd ~/apexrebate-1/factory/scripts

# Create project
./mkproj.sh api-server nestjs-agentic

# Navigate and setup
cd ../api-server
cp .env.example .env.local
pnpm i
pnpm start:dev
```

API running at [http://localhost:3000](http://localhost:3000)

### Quick Path: FastAPI Backend

```bash
cd ~/apexrebate-1/factory/scripts

# Create project
./mkproj.sh data-api fastapi-agentic

# Navigate and setup
cd ../data-api
python -m venv .venv
source .venv/bin/activate    # Windows: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 3000
```

API + Docs at [http://localhost:3000/docs](http://localhost:3000/docs)

---

## Template Deep Dives

### Next.js Agentic

**Best for:** Full-stack web apps, dashboards, content sites

**Includes:**
- Next.js 15 App Router
- Tailwind CSS
- Prisma ORM
- NextAuth.js
- TypeScript
- Jest testing

**File Structure:**
```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   ├── api/                # API routes
│   └── [dynamic]/          # Dynamic routes
├── components/             # React components
├── lib/                    # Utilities
└── prisma/                 # Database schema
```

**Key Commands:**
```bash
pnpm dev              # Dev server (port 3000)
pnpm build            # Production build
pnpm start            # Start production
pnpm lint             # ESLint check
pnpm test             # Jest tests
pnpm db:push          # Sync Prisma schema
```

**Add a Page:**
```bash
# Create src/app/dashboard/page.tsx
touch src/app/dashboard/page.tsx
```

```typescript
export default function Dashboard() {
  return <h1>Dashboard</h1>;
}
```

**Add an API Route:**
```bash
# Create src/app/api/users/route.ts
touch src/app/api/users/route.ts
```

```typescript
export async function GET() {
  return Response.json({ users: [] });
}
```

---

### NestJS Agentic

**Best for:** REST APIs, microservices, scalable backends

**Includes:**
- NestJS 10
- TypeORM
- PostgreSQL
- JWT Auth
- Class Validation
- Testing framework

**File Structure:**
```
src/
├── main.ts             # Entry point
├── app.module.ts       # Root module
├── app.controller.ts   # Controllers
├── app.service.ts      # Services
├── modules/            # Feature modules
├── entities/           # Database entities
└── dto/                # Data Transfer Objects
```

**Key Commands:**
```bash
pnpm start:dev         # Dev with hot reload
pnpm build             # Production build
pnpm start:prod        # Start production
pnpm test              # Jest tests
pnpm lint              # ESLint
```

**Generate a Module:**
```bash
nest g module features/posts
nest g controller features/posts
nest g service features/posts
```

**Add an Endpoint:**
```typescript
@Post('posts')
async createPost(@Body() createPostDto: CreatePostDto) {
  return this.postsService.create(createPostDto);
}
```

---

### FastAPI Agentic

**Best for:** Data APIs, ML pipelines, async services

**Includes:**
- FastAPI framework
- SQLModel ORM
- Pydantic validation
- JWT authentication
- Async/await support
- Auto-generated API docs

**File Structure:**
```
app/
├── main.py             # Entry point
├── __init__.py
├── api/                # API routes
│   ├── v1/
│   │   └── endpoints/
│   └── deps.py
├── models/             # SQLModel models
├── schemas/            # Pydantic schemas
├── crud/               # Database operations
└── core/               # Config & utilities
```

**Key Commands:**
```bash
uvicorn app.main:app --reload --port 3000   # Dev
pip install -r requirements.txt              # Dependencies
pytest                                        # Tests
pytest --cov=app                             # Coverage
```

**Add an Endpoint:**
```python
from fastapi import APIRouter

router = APIRouter()

@router.get("/items")
async def list_items():
    return {"items": []}
```

**Add a Database Model:**
```python
from sqlmodel import SQLModel, Field

class Item(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    description: str
```

---

## Development Workflow

### File Changes

Factory projects use hot reload by default:

**Next.js:**
- Save a file → Instantly reload in browser
- No manual restart needed

**NestJS:**
```bash
pnpm start:dev
# Auto-detects changes, recompiles
```

**FastAPI:**
```bash
uvicorn app.main:app --reload
# Auto-detects changes, reloads
```

### Environment Variables

Each project has `.env.example`:

```bash
cp .env.example .env.local    # Next.js
cp .env.example .env          # NestJS/FastAPI
```

Edit the `.env*` file with your values:
```
KIMI_API_KEY=sk-...
DATABASE_URL=postgresql://...
```

⚠️ **Never commit `.env`** — It's in `.gitignore` ✅

### Debugging

**Next.js:**
```bash
# VS Code Debug Console
# Set breakpoint → F5 to debug
```

**NestJS:**
```bash
pnpm start:debug
# Chrome DevTools at chrome://inspect
```

**FastAPI:**
```python
import pdb; pdb.set_trace()  # Add breakpoint
uvicorn app.main:app --reload
```

---

## Database Setup

### Local PostgreSQL

```bash
# Install PostgreSQL (macOS)
brew install postgresql

# Start service
brew services start postgresql

# Create database
createdb my_project_db

# Verify
psql -U postgres -l
```

### Connection String

Add to `.env`:
```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/my_project_db
```

### Prisma (Next.js)

```bash
# Generate client
pnpm db:generate

# Apply schema
pnpm db:push

# Seed data
pnpm seed
```

### TypeORM (NestJS)

```bash
# Generate migration
npm run typeorm migration:generate src/migrations/InitialSchema

# Run migrations
npm run typeorm migration:run

# Revert
npm run typeorm migration:revert
```

### SQLModel (FastAPI)

```bash
# Generate migration with Alembic
alembic revision --autogenerate -m "Initial schema"

# Apply migrations
alembic upgrade head
```

---

## Authentication

### Next.js with NextAuth

Already configured in template:

```typescript
// src/lib/auth.ts
export const authConfig = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Verify against database
        return user;
      },
    }),
  ],
};
```

Use in components:
```typescript
import { useSession } from "next-auth/react";

export default function Profile() {
  const { data: session } = useSession();
  return <p>Welcome {session?.user?.email}</p>;
}
```

### NestJS with JWT

Guard already configured:

```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
async getProfile(@Req() req) {
  return req.user;
}
```

Generate token:
```typescript
const token = this.jwtService.sign({ 
  sub: user.id, 
  email: user.email 
});
```

### FastAPI with JWT

```python
from fastapi.security import HTTPBearer

security = HTTPBearer()

@app.get("/protected")
async def protected(credentials: HTTPAuthCredentials = Depends(security)):
    token = credentials.credentials
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    return payload
```

---

## Deployment

### Vercel (Next.js)

```bash
cd my-startup
vercel
# Login → Select project → Auto-deploy
```

### Railway (All Templates)

```bash
cd my-app
railway up
# Interactive setup → Deploy
```

### Fly.io (All Templates)

```bash
cd my-app
flyctl auth login
flyctl launch          # Generate fly.toml
flyctl deploy          # Deploy
```

### Docker

**Build:**
```bash
cd my-api
docker build -t my-api .
docker run -p 3000:3000 my-api
```

**Docker Compose (with database):**
```bash
docker-compose up -d
# Starts both app + PostgreSQL
```

---

## CI/CD Integration

### GitHub Actions

Each project has `.github/workflows/ci.yml`:

```yaml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install
        run: pnpm i
      - name: Test
        run: pnpm test
      - name: Build
        run: pnpm build
```

### Semantic Release

Auto-version bumping on merge to main:

```bash
# Commit message
git commit -m "feat: add user dashboard"
# Triggers: v0.1.0 → v0.2.0
```

### Deploy Preview

Every PR gets a preview URL:
- Next.js: Vercel preview
- NestJS/FastAPI: Railway/Fly preview

---

## Troubleshooting

### Port 3000 Already in Use

```bash
# Kill process
lsof -i :3000
kill -9 <PID>

# Or use different port
PORT=3001 pnpm dev
```

### Database Connection Error

```bash
# Check PostgreSQL is running
psql -U postgres
# If error: Install or start PostgreSQL

# Verify DATABASE_URL
cat .env | grep DATABASE
# Should be: postgresql://user:password@host:port/db
```

### `pnpm` Command Not Found

```bash
# Install pnpm
npm install -g pnpm

# Verify
pnpm --version
```

### TypeScript Errors

```bash
# Regenerate types
pnpm db:generate       # Prisma
pnpm tsc --noEmit      # Type check

# In NestJS
nest build
```

### Tests Failing

```bash
# Reset test database
pnpm db:reset

# Clear cache
rm -rf node_modules/.cache

# Run with verbose output
pnpm test --verbose
```

---

## 🎓 Next Steps

✅ **You're ready to build!**

1. Generate a project: `./mkproj.sh my-app nextjs-agentic`
2. Follow the template's README
3. Add your business logic
4. Deploy with one command
5. Scale with confidence

**Questions?** Check individual template READMEs or contribute back!

---

**Happy coding!** 🚀

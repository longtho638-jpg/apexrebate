# {{PROJECT_NAME}}

Next.js Agentic project bootstrapped from **Relay Factory**.

## Quick Start

```bash
# Install dependencies
pnpm i

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your API keys

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- ⚡ **Next.js 15** with App Router
- 🤖 **Kimi K2 Agent** integration for intelligent automation
- 🔐 **NextAuth.js** for authentication
- 📊 **Prisma ORM** for database operations
- 🎨 **Tailwind CSS** for styling
- 📝 **TypeScript** for type safety

## Environment Setup

### 1. Database
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/{{PROJECT_NAME}}
```

### 2. Authentication
```bash
NEXTAUTH_SECRET=openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
```

### 3. AI Agents
```bash
# Kimi K2 (Main Agent)
KIMI_API_KEY=your-api-key
K2_PROVIDER=kimi
K2_MODEL=kimi-9b

# Gemini (for MCP subagent)
GOOGLE_GEMINI_API_KEY=your-api-key
```

## Scripts

- `pnpm dev` - Start dev server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Type check with TypeScript
- `pnpm test` - Run Jest tests
- `pnpm db:push` - Push Prisma schema to database
- `pnpm seed` - Seed database

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── layout.tsx
│   ├── page.tsx
│   └── api/          # API routes
├── components/       # Reusable React components
├── lib/              # Utilities and helpers
├── types/            # TypeScript types
└── prisma/           # Database schema
```

## Deployment

### Vercel

```bash
vercel
```

### Docker

```bash
docker build -t {{PROJECT_NAME}} .
docker run -p 3000:3000 {{PROJECT_NAME}}
```

### Railway

```bash
railway up
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Kimi K2 Integration](https://www.kimi.ai)
- [NextAuth.js](https://next-auth.js.org)

## License

MIT

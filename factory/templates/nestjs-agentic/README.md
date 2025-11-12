# {{PROJECT_NAME}}

NestJS Agentic REST API bootstrapped from **Relay Factory**.

## Quick Start

```bash
# Install dependencies
pnpm i

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your API keys

# Start development server
pnpm start:dev
```

The API will be running at [http://localhost:3000](http://localhost:3000).

## Features

- 🏗️ **NestJS** - Progressive Node.js framework
- 🤖 **Kimi K2 Agent** integration for intelligent automation
- 🗄️ **TypeORM** with PostgreSQL support
- 🔐 **JWT Authentication** ready
- 📝 **TypeScript** for type safety
- ✅ **Class Validation** with class-validator
- 📊 **CORS** enabled and configurable

## Environment Setup

### 1. Database
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/{{PROJECT_NAME}}
DATABASE_SYNCHRONIZE=false  # Use migrations in production
```

### 2. Authentication
```bash
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=3600  # 1 hour
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

- `pnpm start` - Start production server
- `pnpm start:dev` - Start with hot reload
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm test` - Run Jest tests
- `pnpm test:cov` - Generate coverage report
- `pnpm test:e2e` - Run end-to-end tests

## Project Structure

```
src/
├── main.ts           # Application entry point
├── app.module.ts     # Root module
├── app.controller.ts # Root controller
├── app.service.ts    # Root service
├── modules/          # Feature modules
├── entities/         # TypeORM entities
├── dto/              # Data Transfer Objects
├── guards/           # Auth guards & middleware
└── pipes/            # Custom pipes
```

## Creating a Feature Module

```bash
# Generate module with controller and service
nest g module features/posts
nest g controller features/posts
nest g service features/posts
```

## Database Migrations

```bash
# Generate migration after schema changes
npm run typeorm migration:generate src/migrations/InitialSchema

# Run migrations
npm run typeorm migration:run

# Revert last migration
npm run typeorm migration:revert
```

## Deployment

### Docker

```bash
docker build -t {{PROJECT_NAME}} .
docker run -p 3000:3000 {{PROJECT_NAME}}
```

### Railway

```bash
railway up
```

### Fly.io

```bash
flyctl launch
flyctl deploy
```

## Learn More

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Docs](https://typeorm.io)
- [Kimi K2 Integration](https://www.kimi.ai)
- [PostgreSQL](https://www.postgresql.org)

## License

MIT

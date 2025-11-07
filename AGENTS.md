# Agent Guidelines for ApexRebate

## Build/Lint/Test Commands

- **Build**: `npm run build` (Next.js production build)
- **Lint**: `npm run lint` (Next.js ESLint)
- **Test all**: `npm run test` (Jest unit tests)
- **Test watch**: `npm run test:watch` (Jest with file watching)
- **Test coverage**: `npm run test:coverage` (Jest with coverage report)
- **E2E tests**: `npm run test:e2e` (Playwright)
- **E2E UI**: `npm run test:e2e:ui` (Playwright with UI mode)
- **Single test**: `npx jest --testNamePattern="TestName"` or `npx jest path/to/test.spec.ts`
- **Database**: `npm run db:push` (Prisma push), `npm run db:generate` (Prisma generate)

## Architecture & Codebase Structure

### Tech Stack
- **Frontend**: Next.js 16 with TypeScript, React 19, Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **Auth**: NextAuth.js with multiple providers
- **Real-time**: Socket.IO for notifications and updates
- **Deployment**: Firebase hosting, multi-region support with failover
- **Mobile**: React Native support with push notifications
- **AI/ML**: Recommendation engine and anomaly detection

### Directory Structure
- `src/app/` - Next.js app router pages and API routes
- `src/components/` - Reusable React components
- `src/lib/` - Core business logic and utilities
- `src/lib/automation/` - Workflow automation system
- `src/lib/exchanges/` - Cryptocurrency exchange integrations
- `src/lib/services/` - External service integrations
- `src/types/` - TypeScript type definitions
- `prisma/` - Database schema and migrations

### Key Systems
- **User Management**: Roles (USER/ADMIN/CONCIERGE), tiers (BRONZE to DIAMOND), achievements
- **Exchange Integration**: Binance, Bybit, OKX with transaction sync and rebate calculation
- **Referral System**: Multi-level referrals with commissions and tracking
- **Tools Marketplace**: Digital tools for traders with affiliate program
- **Gamification**: Points, streaks, badges, leaderboards
- **Notifications**: Email, push, and in-app notifications

## Code Style Guidelines

### TypeScript
- Strict mode enabled but `noImplicitAny: false` (allows implicit any)
- Path alias: `@/*` maps to `./src/*`
- Many ESLint rules disabled for flexibility

### Imports & Modules
- Use ES6 imports with named exports preferred
- Group imports: external libs, then internal modules, then types
- Example:
```typescript
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { User } from '@/types'
```

### Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile`)
- **Files**: kebab-case for components, camelCase for utilities
- **Functions/Variables**: camelCase
- **Types/Interfaces**: PascalCase
- **Constants**: SCREAMING_SNAKE_CASE

### Error Handling
- Use try/catch blocks with specific error types
- Log errors with Winston logger
- Return appropriate HTTP status codes in API routes

### Styling
- Tailwind CSS with custom `cn()` utility for class merging
- Component variants using `class-variance-authority`
- Responsive design with mobile-first approach

### Database
- Prisma client for all database operations
- Use transactions for multi-step operations
- Follow Prisma naming conventions (camelCase for fields, PascalCase for models)

## Communication Guidelines

### Reporting Style
- **Language**: Vietnamese with Saigon dialect (Sài Gòn style) - use colloquial expressions like "ơi", "đấy", "thôi", "má", etc.
- **AI Assistant**: Always mention and use Kimi K2 for advanced reasoning and code generation
- **Tone**: Friendly, direct, and professional with local flavor

### Example Saigon Vietnamese Report Style:
```
Ê, tao vừa làm xong phase này rồi đấy! Dùng Kimi K2 optimize cho mượt mà lắm, build success 100% nhé!
```

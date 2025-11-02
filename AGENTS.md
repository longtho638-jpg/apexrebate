# AGENTS.md - ApexRebate Development Guide

## Commands
- **Dev**: `npm run dev` - Start dev server with nodemon & tsx
- **Build**: `npm run build` - Production build with Next.js
- **Lint**: `npm run lint` - Run ESLint
- **Test**: `npm test` or `jest` - Run all Jest tests
- **Test (single)**: `jest path/to/test.spec.ts` - Run specific test file
- **Test (watch)**: `npm run test:watch` - Run tests in watch mode
- **E2E**: `npm run test:e2e` - Run Playwright tests
- **DB Push**: `npm run db:push` - Push Prisma schema to DB
- **DB Generate**: `npm run db:generate` - Generate Prisma client

## Architecture
- **Stack**: Next.js 15 App Router + TypeScript + Prisma ORM + PostgreSQL/SQLite
- **Frontend**: React 19, Tailwind CSS 4, shadcn/ui components, Lucide icons
- **Backend**: NextAuth.js authentication, Socket.IO real-time, Firebase Functions (functions/)
- **Database**: Prisma schema in prisma/, dev.db for local, PostgreSQL for production
- **Key directories**: src/app (routes), src/components (UI), src/lib (utilities), src/hooks, functions/ (Firebase)

## Code Style
- **Imports**: Use `@/` path alias for src imports (e.g., `@/components/ui/button`)
- **Components**: Use 'use client' directive for client components, default export for pages
- **Types**: Strict TypeScript (noImplicitAny: false in tsconfig), Zod for validation
- **Naming**: camelCase for variables/functions, PascalCase for components/types, kebab-case for files
- **Error handling**: Try-catch blocks with proper error messages, status codes for API routes
- **Formatting**: Follow existing file patterns, use shadcn/ui components, Tailwind for styling

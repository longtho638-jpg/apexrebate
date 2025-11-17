// ARCHITECTURE LOCK - DO NOT MODIFY
// Hand-written core architecture. AI-generated code MUST import from here.

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Export prisma instance for NextAuth adapter
export const prisma = db

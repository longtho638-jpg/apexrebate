export const runtime = 'nodejs'

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const hasDbUrl = !!process.env.DATABASE_URL;
    const dbUrlLength = process.env.DATABASE_URL?.length || 0;
    
    // Import Prisma
    const { PrismaClient } = await import('@prisma/client');
    const { prisma } = await import('@/lib/db');
    
    // Deep inspect prisma instance
    const prismaKeys = Object.keys(prisma);
    const prismaHasUser = 'users' in prisma;
    const userValue = (prisma as any).users;
    const userType = typeof userValue;
    const userKeys = userValue ? Object.keys(userValue) : [];
    
    // Try manual query
    let manualQueryError = null;
    let manualQuerySuccess = false;
    try {
      const newPrisma = new PrismaClient();
      const count = await newPrisma.users.count();
      manualQuerySuccess = true;
      await newPrisma.$disconnect();
    } catch (e: any) {
      manualQueryError = e.message;
    }
    
    return NextResponse.json({
      diagnostics: {
        hasDbUrl,
        dbUrlLength,
        dbUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + '...',
        prismaKeys: prismaKeys.slice(0, 20),
        prismaHasUser,
        userType,
        userKeys: userKeys.slice(0, 10),
        manualQuerySuccess,
        manualQueryError
      }
    });
    
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Test failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

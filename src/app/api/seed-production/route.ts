export const runtime = 'nodejs'

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';

/**
 * Production Seed API Route
 * POST /api/seed-production
 * Headers: Authorization: Bearer {SEED_SECRET_KEY}
 * 
 * This endpoint allows seeding production database remotely after deployment.
 */
export async function POST() {
  try {
    const headersList = await headers();
    const auth = headersList.get('authorization');
    
    // Debug logging
    console.log('[SEED] Auth received:', auth ? `${auth.substring(0, 30)}...` : 'MISSING');
    console.log('[SEED] ENV key exists:', !!process.env.SEED_SECRET_KEY);
    
    // Security: only allow with secret key
    if (!process.env.SEED_SECRET_KEY || auth !== `Bearer ${process.env.SEED_SECRET_KEY}`) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Valid SEED_SECRET_KEY required',
        debug: {
          hasAuth: !!auth,
          hasEnvKey: !!process.env.SEED_SECRET_KEY
        }
      }, { status: 401 });
    }

    // Check if already seeded to prevent duplicate data
    const userCount = await prisma.user.count();
    if (userCount > 5) {
      return NextResponse.json({ 
        warning: 'Database appears to be already seeded',
        currentUsers: userCount,
        message: 'Delete existing data first or use force=true'
      }, { status: 400 });
    }

    // Import seed function
    const { seedMaster } = await import('@/lib/seed/seed-master');
    
    // Run seed
    const result = await seedMaster();
    
    return NextResponse.json({
      success: true,
      message: 'Production database seeded successfully',
      data: result
    });
    
  } catch (error: any) {
    console.error('[SEED] Error:', error);
    return NextResponse.json({ 
      error: 'Seed failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

// GET to check seed status
export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const toolCount = await prisma.tool.count();
    
    return NextResponse.json({
      seeded: userCount > 0,
      stats: {
        users: userCount,
        tools: toolCount
      },
      message: userCount > 5 ? 'Already seeded' : 'Ready to seed'
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Failed to check seed status',
      message: error.message 
    }, { status: 500 });
  }
}

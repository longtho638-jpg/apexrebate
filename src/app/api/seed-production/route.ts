import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db } from '@/lib/db';

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
    
    // Security: only allow with secret key
    if (!process.env.SEED_SECRET_KEY || auth !== `Bearer ${process.env.SEED_SECRET_KEY}`) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Valid SEED_SECRET_KEY required'
      }, { status: 401 });
    }

    // Check if already seeded to prevent duplicate data
    const userCount = await db.user.count();
    if (userCount > 5) {
      return NextResponse.json({ 
        warning: 'Database appears to be already seeded',
        currentUsers: userCount,
        message: 'Delete existing data first or use force=true'
      }, { status: 400 });
    }

    // Dynamic import to avoid loading seed code unnecessarily
    const seedModule = await import('@/lib/seed-master');
    
    // Run seed
    console.log('Starting production seed...');
    await seedModule.default();
    
    // Get final counts
    const counts = {
      users: await db.user.count(),
      tools: await db.tool.count(),
      categories: await db.toolCategory.count(),
      achievements: await db.achievement.count(),
      payouts: await db.payout.count(),
      exchanges: await db.exchange.count(),
      exchangeAccounts: await db.exchangeAccount.count(),
      regions: await db.deploymentRegion.count(),
      mobileUsers: await db.mobileUser.count(),
      notifications: await db.notification.count(),
      activities: await db.userActivity.count()
    };

    return NextResponse.json({ 
      success: true, 
      message: 'Production database seeded successfully',
      data: counts,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Seed production failed:', error);
    return NextResponse.json({ 
      error: 'Seed failed', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

// GET method to check seed status
export async function GET() {
  try {
    const counts = {
      users: await db.user.count(),
      tools: await db.tool.count(),
      categories: await db.toolCategory.count(),
      achievements: await db.achievement.count(),
      payouts: await db.payout.count(),
      exchanges: await db.exchange.count(),
      exchangeAccounts: await db.exchangeAccount.count(),
      regions: await db.deploymentRegion.count(),
      mobileUsers: await db.mobileUser.count(),
      notifications: await db.notification.count(),
      activities: await db.userActivity.count()
    };

    const isSeeded = counts.users > 5;

    return NextResponse.json({
      seeded: isSeeded,
      data: counts,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Failed to check seed status',
      details: error.message
    }, { status: 500 });
  }
}

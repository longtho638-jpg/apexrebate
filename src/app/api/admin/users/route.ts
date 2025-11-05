import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin or concierge
    if (session.user.role !== 'ADMIN' && session.user.role !== 'CONCIERGE') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get users with their statistics
    const users = await db.users.findMany({
      include: {
        payouts: {
          select: { amount: true }
        },
        referredUsers: {
          select: { id: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit to last 100 users
    });

    // Calculate additional statistics for each user
    const usersWithStats = users.map(user => ({
      id: user.id,
      name: user.name || 'Chưa cập nhật',
      email: user.email,
      role: user.role,
      emailVerified: !!user.emailVerified,
      createdAt: user.createdAt.toISOString(),
      tradingVolume: user.tradingVolume,
      preferredBroker: user.preferredBroker,
      referralCode: user.referralCode,
      referralCount: user.referredUsers.length,
      totalSavings: user.payouts.reduce((sum, payout) => sum + payout.amount, 0),
    }));

    return NextResponse.json({
      success: true,
      data: usersWithStats
    });

  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
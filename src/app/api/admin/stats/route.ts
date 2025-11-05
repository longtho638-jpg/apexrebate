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

    // Get current date for monthly calculations
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Calculate admin statistics
    const [
      totalUsers,
      verifiedUsers,
      totalPayouts,
      pendingPayouts,
      currentMonthSignups,
      currentMonthPayouts
    ] = await Promise.all([
      // Total users
      db.users.count(),
      
      // Verified users
      db.users.count({
        where: { emailVerified: { not: null } }
      }),
      
      // Total payouts
      db.payout.count(),
      
      // Pending payouts
      db.payout.count({
        where: { status: 'PENDING' }
      }),
      
      // Current month signups
      db.users.count({
        where: {
          createdAt: {
            gte: new Date(currentYear, currentMonth, 1),
            lt: new Date(currentYear, currentMonth + 1, 1)
          }
        }
      }),
      
      // Current month payouts
      db.payout.count({
        where: {
          createdAt: {
            gte: new Date(currentYear, currentMonth, 1),
            lt: new Date(currentYear, currentMonth + 1, 1)
          }
        }
      })
    ]);

    // Calculate total amounts
    const [totalPayoutAmount, pendingPayoutAmount] = await Promise.all([
      // Total payout amount
      db.payout.aggregate({
        _sum: { amount: true }
      }),
      
      // Pending payout amount
      db.payout.aggregate({
        where: { status: 'PENDING' },
        _sum: { amount: true }
      })
    ]);

    const stats = {
      totalUsers,
      verifiedUsers,
      totalPayouts,
      totalPayoutAmount: totalPayoutAmount._sum.amount || 0,
      pendingPayouts,
      pendingPayoutAmount: pendingPayoutAmount._sum.amount || 0,
      currentMonthSignups,
      currentMonthPayouts,
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
}
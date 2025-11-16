import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await db.users.findUnique({
      where: { id: session.user.id },
      include: {
        referredUsers: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            tradingVolume: true,
            payouts: {
              select: { amount: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        payouts: {
          select: { amount: true },
          orderBy: { createdAt: 'desc' },
          take: 100
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Process referrals data
    const referrals = user.referredUsers.map(referral => {
      const totalEarnings = referral.payouts.reduce((sum, payout) => sum + payout.amount, 0);
      const status = (referral.tradingVolume || 0) > 0 ? 'active' : 'pending';
      
      return {
        id: referral.id,
        name: referral.name || 'Anonymous',
        email: referral.email,
        status,
        joinedAt: referral.createdAt.toISOString(),
        tradingVolume: referral.tradingVolume || 0,
        totalEarnings: totalEarnings * 0.1, // 10% referral commission
        avatar: null
      };
    });

    // Calculate referral stats
    const totalReferrals = referrals.length;
    const activeReferrals = referrals.filter(r => r.status === 'active').length;
    const pendingReferrals = referrals.filter(r => r.status === 'pending').length;
    const totalEarnings = referrals.reduce((sum, r) => sum + (r.totalEarnings || 0), 0);
    const pendingEarnings = referrals.filter(r => r.status === 'pending').reduce((sum, r) => sum + (r.totalEarnings || 0), 0);
    const conversionRate = totalReferrals > 0 ? (activeReferrals / totalReferrals) * 100 : 0;

    // Check if user is a top earner (simplified logic)
    const allUsers = await db.users.findMany({
      include: {
        referredUsers: {
          include: {
            payouts: true
          }
        }
      }
    });

    const userEarnings = totalEarnings;
    const allEarnings = allUsers.map(u => 
      u.referredUsers.reduce((sum, r) => 
        sum + (r.payouts.reduce((pSum, p) => pSum + p.amount, 0) * 0.1), 0
      )
    ).sort((a, b) => b - a);

    const topEarner = userEarnings >= (allEarnings[4] || 0); // Top 5

    const referralStats = {
      totalReferrals,
      activeReferrals,
      pendingReferrals,
      totalEarnings,
      pendingEarnings,
      conversionRate,
      topEarner
    };

    // Generate referral code if not exists
    let referralCode = user.referralCode;
    if (!referralCode) {
      referralCode = generateReferralCode(user.name || user.email);
      await db.users.update({
        where: { id: session.user.id },
        data: { referralCode }
      });
    }

    const referralLink = `${process.env.NEXTAUTH_URL}?ref=${referralCode}`;

    return NextResponse.json({
      success: true,
      stats: referralStats,
      referrals,
      referralCode,
      referralLink
    });

  } catch (error) {
    console.error('Referral fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateReferralCode(nameOrEmail: string): string {
  const base = nameOrEmail.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return (base || 'USER').substring(0, 6) + random;
}

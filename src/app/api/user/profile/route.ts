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
          select: { id: true }
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

    const totalSavings = user.payouts.reduce((sum, payout) => sum + payout.amount, 0);
    const referralCount = user.referredUsers.length;

    const profile = {
      id: user.id,
      email: user.email,
      name: user.name || '',
      image: user.image,
      role: user.role,
      tradingVolume: user.tradingVolume || 0,
      preferredBroker: user.preferredBroker || 'binance',
      experience: user.experience || 'beginner',
      referralCode: user.referralCode || '',
      referralCount,
      totalSavings,
      memberSince: user.createdAt.toISOString(),
      status: 'active',
      phone: '',
      timezone: 'UTC+7',
      notifications: {
        email: true,
        payout: true,
        referral: true,
        weekly: true
      }
    };

    return NextResponse.json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      tradingVolume,
      preferredBroker,
      experience
    } = body;

    // Validate required fields
    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters long' },
        { status: 400 }
      );
    }

    if (tradingVolume && (tradingVolume < 0 || tradingVolume > 10000000000)) {
      return NextResponse.json(
        { error: 'Trading volume must be between 0 and 10,000,000,000' },
        { status: 400 }
      );
    }

    // Update user profile
    const updatedUser = await db.users.update({
      where: { id: session.user.id },
      data: {
        name: name.trim(),
        tradingVolume: tradingVolume ? parseFloat(tradingVolume) : undefined,
        preferredBroker: preferredBroker || undefined,
        experience: experience || undefined,
        updatedAt: new Date()
      }
    });

    // Fetch updated profile with relations
    const user = await db.users.findUnique({
      where: { id: session.user.id },
      include: {
        referredUsers: {
          select: { id: true }
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
        { error: 'User not found after update' },
        { status: 404 }
      );
    }

    const totalSavings = user.payouts.reduce((sum, payout) => sum + payout.amount, 0);
    const referralCount = user.referredUsers.length;

    const profile = {
      id: user.id,
      email: user.email,
      name: user.name || '',
      image: user.image,
      role: user.role,
      tradingVolume: user.tradingVolume || 0,
      preferredBroker: user.preferredBroker || 'binance',
      experience: user.experience || 'beginner',
      referralCode: user.referralCode || '',
      referralCount,
      totalSavings,
      memberSince: user.createdAt.toISOString(),
      status: 'active',
      phone: '',
      timezone: 'UTC+7',
      notifications: {
        email: true,
        payout: true,
        referral: true,
        weekly: true
      }
    };

    return NextResponse.json({
      success: true,
      data: profile,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

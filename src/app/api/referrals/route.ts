import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { GamificationService } from '@/lib/gamification';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        referralCode: true,
        referralCount: true,
        referredUsers: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            totalSaved: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate referral code if user doesn't have one
    let referralCode = user.referralCode;
    if (!referralCode) {
      referralCode = generateReferralCode(session.user.id);
      await db.user.update({
        where: { id: session.user.id },
        data: { referralCode }
      });
    }

    return NextResponse.json({
      referralCode,
      referralCount: user.referralCount,
      referredUsers: user.referredUsers,
      referralLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?ref=${referralCode}`
    });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { referralCode } = body;

    if (!referralCode) {
      return NextResponse.json({ error: 'Referral code is required' }, { status: 400 });
    }

    // Find the referrer
    const referrer = await db.user.findUnique({
      where: { referralCode }
    });

    if (!referrer) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
    }

    if (referrer.id === session.user.id) {
      return NextResponse.json({ error: 'Cannot refer yourself' }, { status: 400 });
    }

    // Check if user already has a referrer
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { referredBy: true }
    });

    if (currentUser?.referredBy) {
      return NextResponse.json({ error: 'User already has a referrer' }, { status: 400 });
    }

    // Update user with referrer
    await db.user.update({
      where: { id: session.user.id },
      data: { referredBy: referrer.id }
    });

    // Process referral rewards
    await GamificationService.processReferral(referrer.id, session.user.id);

    return NextResponse.json({
      message: 'Referral applied successfully',
      referrer: {
        name: referrer.name,
        email: referrer.email
      }
    });
  } catch (error) {
    console.error('Error applying referral:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateReferralCode(userId: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
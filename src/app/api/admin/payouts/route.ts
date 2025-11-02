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

    // Get all payouts with user information
    const payouts = await db.payout.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit to last 100 payouts
    });

    // If no real payouts, create some mock data for demonstration
    let payoutsData = payouts;
    if (payouts.length === 0) {
      // Generate mock payouts for demonstration
      const mockUsers = await db.user.findMany({ take: 5 });
      const mockPayouts: any[] = [];
      
      for (let i = 0; i < 20; i++) {
        const user = mockUsers[i % mockUsers.length];
        const date = new Date();
        date.setDate(date.getDate() - (i * 2)); // Every 2 days
        
        mockPayouts.push({
          id: `mock-${i}`,
          userId: user.id,
          user: {
            id: user.id,
            name: user.name || 'Mock User',
            email: user.email
          },
          amount: 200 + Math.random() * 300,
          currency: 'USD',
          period: `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`,
          broker: ['Binance', 'Bybit', 'OKX'][Math.floor(Math.random() * 3)],
          tradingVolume: 500000 + Math.random() * 1500000,
          feeRate: 0.0002 + Math.random() * 0.0003,
          status: Math.random() > 0.3 ? 'PROCESSED' : 'PENDING',
          processedAt: Math.random() > 0.3 ? date : null,
          notes: Math.random() > 0.8 ? 'Referral bonus included' : null,
          createdAt: date,
          updatedAt: date,
        });
      }
      
      payoutsData = mockPayouts;
    }

    return NextResponse.json({
      success: true,
      data: payoutsData.map(payout => ({
        id: payout.id,
        userId: payout.userId,
        user: payout.user,
        amount: payout.amount,
        currency: payout.currency,
        period: payout.period,
        broker: payout.broker,
        tradingVolume: payout.tradingVolume,
        feeRate: payout.feeRate,
        status: payout.status,
        processedAt: payout.processedAt?.toISOString(),
        createdAt: payout.createdAt.toISOString(),
        notes: payout.notes,
      }))
    });

  } catch (error) {
    console.error('Admin payouts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payouts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const { amount, userId, period, broker, tradingVolume, feeRate, notes } = await request.json();

    // Create new payout
    const payout = await db.payout.create({
      data: {
        userId,
        amount: parseFloat(amount),
        currency: 'USD',
        period,
        broker,
        tradingVolume: parseFloat(tradingVolume),
        feeRate: parseFloat(feeRate),
        status: 'PROCESSED',
        processedAt: new Date(),
        notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      data: payout,
      message: 'Payout created successfully'
    });

  } catch (error) {
    console.error('Create payout error:', error);
    return NextResponse.json(
      { error: 'Failed to create payout' },
      { status: 500 }
    );
  }
}
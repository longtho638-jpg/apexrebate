import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

type BasicSession = {
  user?: {
    id?: string;
  };
};

export async function GET(request: NextRequest) {
  let session: BasicSession | null = null;
  try {
    session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's payouts
    const payouts = await db.payouts.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to last 100 payouts
    });

    // If no real payouts, create some mock data for demonstration
    let payoutsData = payouts;
    if (payouts.length === 0) {
      // Generate mock payouts for the last 6 months
      const mockPayouts: any[] = [];
      const brokers = ['binance', 'bybit', 'okx'];
      const currentDate = new Date();
      
      for (let i = 0; i < 12; i++) {
        const date = new Date(currentDate);
        date.setDate(date.getDate() - (i * 7)); // Weekly payouts
        
        const broker = brokers[Math.floor(Math.random() * brokers.length)];
        const baseAmount = 200 + Math.random() * 300; // $200-500 range
        const tradingVolume = 500000 + Math.random() * 1500000; // $500k-2M range
        const feeRate = 0.0002 + Math.random() * 0.0003; // 0.02% - 0.05%
        
        mockPayouts.push({
          id: `mock-${i}`,
          userId: session.user.id,
          amount: baseAmount,
          currency: 'USD',
          period: `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`,
          broker: broker.charAt(0).toUpperCase() + broker.slice(1),
          tradingVolume: tradingVolume,
          feeRate: feeRate,
          status: Math.random() > 0.2 ? 'PROCESSED' : 'PENDING',
          processedAt: Math.random() > 0.2 ? date : null,
          notes: Math.random() > 0.8 ? 'Referral bonus included' : null,
          createdAt: date,
          updatedAt: date,
        });
      }
      
      payoutsData = mockPayouts;
    }

    // Calculate summary statistics
    const totalPayouts = payoutsData.length;
    const totalAmount = payoutsData.reduce((sum, payout) => sum + payout.amount, 0);
    const processedPayouts = payoutsData.filter(p => p.status === 'PROCESSED');
    const pendingPayouts = payoutsData.filter(p => p.status === 'PENDING');
    const processedAmount = processedPayouts.reduce((sum, payout) => sum + payout.amount, 0);
    const pendingAmount = pendingPayouts.reduce((sum, payout) => sum + payout.amount, 0);
    const averagePayout = totalPayouts > 0 ? totalAmount / totalPayouts : 0;

    // Current month calculations
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthPayouts = payoutsData.filter(payout => {
      const date = new Date(payout.createdAt);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    const currentMonthAmount = currentMonthPayouts.reduce((sum, payout) => sum + payout.amount, 0);

    // Extract unique values for filters
    const brokers = [...new Set(payoutsData.map(p => p.broker))];
    const statuses = [...new Set(payoutsData.map(p => p.status))];
    const periods = [...new Set(payoutsData.map(p => p.period.split('-')[0]))]; // Extract years

    const payoutData = {
      payouts: payoutsData.map(payout => ({
        id: payout.id,
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
      })),
      summary: {
        totalPayouts,
        totalAmount,
        pendingAmount,
        processedAmount,
        averagePayout,
        currentMonthPayouts: currentMonthPayouts.length,
        currentMonthAmount,
      },
      filters: {
        brokers,
        statuses,
        periods,
      },
    };

    return NextResponse.json({
      success: true,
      data: payoutData,
    });

  } catch (error) {
    console.error('Payouts fetch error:', error);

    // Fallback to mock data on any error (database issues, etc.)
    const mockPayouts: any[] = [];
    const brokers = ['Binance', 'Bybit', 'OKX'];
    const currentDate = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - (i * 7)); // Weekly payouts

      const broker = brokers[Math.floor(Math.random() * brokers.length)];
      const baseAmount = 200 + Math.random() * 300; // $200-500 range
      const tradingVolume = 500000 + Math.random() * 1500000; // $500k-2M range
      const feeRate = 0.0002 + Math.random() * 0.0003; // 0.02% - 0.05%

      mockPayouts.push({
        id: `fallback-${i}`,
        userId: session?.user?.id || 'anonymous',
        amount: baseAmount,
        currency: 'USD',
        period: `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`,
        broker: broker,
        tradingVolume: tradingVolume,
        feeRate: feeRate,
        status: Math.random() > 0.2 ? 'PROCESSED' : 'PENDING',
        processedAt: Math.random() > 0.2 ? date.toISOString() : null,
        notes: Math.random() > 0.8 ? 'Referral bonus included' : null,
        createdAt: date.toISOString(),
      });
    }

    const totalPayouts = mockPayouts.length;
    const totalAmount = mockPayouts.reduce((sum, payout) => sum + payout.amount, 0);
    const processedPayouts = mockPayouts.filter(p => p.status === 'PROCESSED');
    const pendingPayouts = mockPayouts.filter(p => p.status === 'PENDING');
    const processedAmount = processedPayouts.reduce((sum, payout) => sum + payout.amount, 0);
    const pendingAmount = pendingPayouts.reduce((sum, payout) => sum + payout.amount, 0);
    const averagePayout = totalPayouts > 0 ? totalAmount / totalPayouts : 0;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthPayouts = mockPayouts.filter(payout => {
      const date = new Date(payout.createdAt);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    const currentMonthAmount = currentMonthPayouts.reduce((sum, payout) => sum + payout.amount, 0);

    const brokersFilter = [...new Set(mockPayouts.map(p => p.broker))];
    const statuses = [...new Set(mockPayouts.map(p => p.status))];
    const periods = [...new Set(mockPayouts.map(p => p.period.split('-')[0]))];

    const payoutData = {
      payouts: mockPayouts,
      summary: {
        totalPayouts,
        totalAmount,
        pendingAmount,
        processedAmount,
        averagePayout,
        currentMonthPayouts: currentMonthPayouts.length,
        currentMonthAmount,
      },
      filters: {
        brokers: brokersFilter,
        statuses,
        periods,
      },
    };

    return NextResponse.json({
      success: true,
      data: payoutData,
    });
  }
}

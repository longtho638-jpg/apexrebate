import { NextRequest, NextResponse } from 'next/server';

// Mock detailed payout data
const mockPayoutDetails = [
  {
    id: 'payout_001',
    amount: 127.45,
    broker: 'Binance',
    period: '2024-09-01 to 2024-09-07',
    processedAt: '2024-09-08T10:30:00Z',
    status: 'processed',
    type: 'weekly',
    breakdown: {
      tradingVolume: 2500000,
      totalFees: 1000.00,
      brokerRebate: 400.00, // 40% of fees
      apexRebate: 40.00, // 10% of broker rebate
      bonusAmount: 87.45, // Additional bonus
      effectiveRate: 0.0051 // Effective savings rate
    },
    transactions: [
      {
        date: '2024-09-08T10:30:00Z',
        type: 'payout',
        amount: 127.45,
        method: 'bank_transfer',
        status: 'completed',
        reference: 'TXN-APX-001'
      }
    ]
  },
  {
    id: 'payout_002',
    amount: 143.28,
    broker: 'Binance',
    period: '2024-09-08 to 2024-09-14',
    processedAt: '2024-09-15T09:45:00Z',
    status: 'processed',
    type: 'weekly',
    breakdown: {
      tradingVolume: 2800000,
      totalFees: 1120.00,
      brokerRebate: 448.00,
      apexRebate: 44.80,
      bonusAmount: 98.48,
      effectiveRate: 0.0051
    },
    transactions: [
      {
        date: '2024-09-15T09:45:00Z',
        type: 'payout',
        amount: 143.28,
        method: 'bank_transfer',
        status: 'completed',
        reference: 'TXN-APX-002'
      }
    ]
  },
  {
    id: 'payout_003',
    amount: 156.89,
    broker: 'Binance',
    period: '2024-09-15 to 2024-09-21',
    processedAt: '2024-09-22T11:20:00Z',
    status: 'processed',
    type: 'weekly',
    breakdown: {
      tradingVolume: 3100000,
      totalFees: 1240.00,
      brokerRebate: 496.00,
      apexRebate: 49.60,
      bonusAmount: 107.29,
      effectiveRate: 0.0051
    },
    transactions: [
      {
        date: '2024-09-22T11:20:00Z',
        type: 'payout',
        amount: 156.89,
        method: 'bank_transfer',
        status: 'completed',
        reference: 'TXN-APX-003'
      }
    ]
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const payoutId = searchParams.get('id');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (payoutId) {
      // Return specific payout details
      const payout = mockPayoutDetails.find(p => p.id === payoutId);
      if (!payout) {
        return NextResponse.json(
          { error: 'Payout not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: payout
      });
    }

    // Return paginated payout history
    const paginatedPayouts = mockPayoutDetails
      .slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        payouts: paginatedPayouts,
        pagination: {
          total: mockPayoutDetails.length,
          limit,
          offset,
          hasMore: offset + limit < mockPayoutDetails.length
        }
      }
    });

  } catch (error) {
    console.error('Payouts API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
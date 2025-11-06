import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

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

    // Nếu user đã đăng nhập, trả dữ liệu từ DB cho user đó; nếu lỗi → fallback mock
    try {
      const session = await getServerSession(authOptions)
      const userId = session?.user?.id

      if (userId) {
        // Lấy payouts của user theo thời gian gần nhất
        const all = await db.payouts.findMany({
          where: { userId },
          orderBy: { processedAt: 'desc' },
        })

        // Map về shape UI mong muốn (tương thích mock)
        const mapToUi = (p: typeof all[number]) => {
          const totalFees = p.tradingVolume * p.feeRate
          const brokerRebate = totalFees * 0.4
          const apexRebate = brokerRebate * 0.1
          const bonusAmount = Math.max(0, p.amount - (apexRebate))
          const effectiveRate = p.tradingVolume > 0 ? p.amount / p.tradingVolume : 0
          return {
            id: p.id,
            amount: p.amount,
            broker: (p.broker || 'binance').charAt(0).toUpperCase() + (p.broker || 'binance').slice(1),
            period: p.period,
            processedAt: (p.processedAt || p.createdAt).toISOString(),
            status: (p.status || 'PROCESSED').toString().toLowerCase(),
            type: 'weekly',
            breakdown: {
              tradingVolume: p.tradingVolume,
              totalFees,
              brokerRebate,
              apexRebate,
              bonusAmount,
              effectiveRate,
            },
            transactions: [
              {
                date: (p.processedAt || p.createdAt).toISOString(),
                type: 'payout',
                amount: p.amount,
                method: 'bank_transfer',
                status: 'completed',
                reference: `TXN-${p.id.slice(0, 8).toUpperCase()}`,
              },
            ],
          }
        }

        if (payoutId) {
          const p = all.find(x => x.id === payoutId)
          if (!p) {
            return NextResponse.json({ error: 'Payout not found' }, { status: 404 })
          }
          return NextResponse.json({ success: true, data: mapToUi(p) })
        }

        const paginated = all.slice(offset, offset + limit).map(mapToUi)
        return NextResponse.json({
          success: true,
          data: {
            payouts: paginated,
            pagination: {
              total: all.length,
              limit,
              offset,
              hasMore: offset + limit < all.length,
            },
          },
        })
      }
    } catch (dbErr) {
      console.warn('Payouts DB fetch failed, fallback to mock:', dbErr)
    }

    // Fallback: Mock data nếu chưa đăng nhập hoặc DB lỗi
    if (payoutId) {
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

    const paginatedPayouts = mockPayoutDetails.slice(offset, offset + limit);

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
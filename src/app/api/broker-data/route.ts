import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const broker = searchParams.get('broker');

    // Mock broker data for development
    const brokerMocks = {
      binance: {
        name: 'Binance',
        affiliateRate: 0.4, // 40% of trading fees
        typicalFee: 0.0004, // 0.04% typical trading fee
        processingTime: '24-48 hours',
        logo: '/binance-logo.png'
      },
      bybit: {
        name: 'Bybit',
        affiliateRate: 0.35, // 35% of trading fees
        typicalFee: 0.00045, // 0.045% typical trading fee
        processingTime: '24-48 hours',
        logo: '/bybit-logo.png'
      },
      okx: {
        name: 'OKX',
        affiliateRate: 0.3, // 30% of trading fees
        typicalFee: 0.0005, // 0.05% typical trading fee
        processingTime: '48-72 hours',
        logo: '/okx-logo.png'
      }
    };

    const brokerData = brokerMocks[broker?.toLowerCase()] || {
      name: broker || 'Unknown',
      affiliateRate: 0.3,
      typicalFee: 0.0005,
      processingTime: '48-72 hours',
      logo: '/default-broker.png'
    };

    return NextResponse.json({
      success: true,
      data: brokerData
    });

  } catch (error) {
    console.error('Broker data error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
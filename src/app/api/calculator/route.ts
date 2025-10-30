import { NextRequest, NextResponse } from 'next/server';

// Broker fee structures (these would typically come from a database or config)
const BROKER_FEES = {
  binance: {
    name: 'Binance',
    makerFee: 0.0002,  // 0.02%
    takerFee: 0.0004,  // 0.04%
    vipLevels: [
      { level: 'VIP 0', threshold: 0, makerFee: 0.0002, takerFee: 0.0004, rebateShare: 0.4 },
      { level: 'VIP 1', threshold: 1000000, makerFee: 0.00019, takerFee: 0.00038, rebateShare: 0.45 },
      { level: 'VIP 2', threshold: 5000000, makerFee: 0.00018, takerFee: 0.00036, rebateShare: 0.5 },
      { level: 'VIP 3', threshold: 25000000, makerFee: 0.00017, takerFee: 0.00034, rebateShare: 0.55 },
      { level: 'VIP 4', threshold: 100000000, makerFee: 0.00016, takerFee: 0.00032, rebateShare: 0.6 },
      { level: 'VIP 5', threshold: 250000000, makerFee: 0.00015, takerFee: 0.0003, rebateShare: 0.65 },
      { level: 'VIP 6', threshold: 1000000000, makerFee: 0.00014, takerFee: 0.00028, rebateShare: 0.7 },
      { level: 'VIP 7', threshold: 2500000000, makerFee: 0.00013, takerFee: 0.00026, rebateShare: 0.75 },
      { level: 'VIP 8', threshold: 5000000000, makerFee: 0.00012, takerFee: 0.00024, rebateShare: 0.8 },
      { level: 'VIP 9', threshold: 10000000000, makerFee: 0.0001, takerFee: 0.0002, rebateShare: 0.85 },
    ]
  },
  bybit: {
    name: 'Bybit',
    makerFee: 0.0001,  // 0.01%
    takerFee: 0.0006,  // 0.06%
    vipLevels: [
      { level: 'VIP 0', threshold: 0, makerFee: 0.0001, takerFee: 0.0006, rebateShare: 0.35 },
      { level: 'VIP 1', threshold: 100000, makerFee: 0.00009, takerFee: 0.00055, rebateShare: 0.4 },
      { level: 'VIP 2', threshold: 500000, makerFee: 0.00008, takerFee: 0.0005, rebateShare: 0.45 },
      { level: 'VIP 3', threshold: 2500000, makerFee: 0.00007, takerFee: 0.00045, rebateShare: 0.5 },
      { level: 'VIP 4', threshold: 10000000, makerFee: 0.00006, takerFee: 0.0004, rebateShare: 0.55 },
      { level: 'VIP 5', threshold: 50000000, makerFee: 0.00005, takerFee: 0.00035, rebateShare: 0.6 },
      { level: 'VIP 6', threshold: 200000000, makerFee: 0.00004, takerFee: 0.0003, rebateShare: 0.65 },
      { level: 'VIP 7', threshold: 500000000, makerFee: 0.00003, takerFee: 0.00025, rebateShare: 0.7 },
      { level: 'VIP 8', threshold: 1000000000, makerFee: 0.00002, takerFee: 0.0002, rebateShare: 0.75 },
      { level: 'VIP 9', threshold: 2000000000, makerFee: 0.00001, takerFee: 0.00015, rebateShare: 0.8 },
    ]
  },
  okx: {
    name: 'OKX',
    makerFee: 0.0008,  // 0.08%
    takerFee: 0.001,   // 0.1%
    vipLevels: [
      { level: 'VIP 0', threshold: 0, makerFee: 0.0008, takerFee: 0.001, rebateShare: 0.3 },
      { level: 'VIP 1', threshold: 100000, makerFee: 0.00075, takerFee: 0.00095, rebateShare: 0.35 },
      { level: 'VIP 2', threshold: 500000, makerFee: 0.0007, takerFee: 0.0009, rebateShare: 0.4 },
      { level: 'VIP 3', threshold: 1000000, makerFee: 0.00065, takerFee: 0.00085, rebateShare: 0.45 },
      { level: 'VIP 4', threshold: 5000000, makerFee: 0.0006, takerFee: 0.0008, rebateShare: 0.5 },
      { level: 'VIP 5', threshold: 10000000, makerFee: 0.00055, takerFee: 0.00075, rebateShare: 0.55 },
      { level: 'VIP 6', threshold: 50000000, makerFee: 0.0005, takerFee: 0.0007, rebateShare: 0.6 },
      { level: 'VIP 7', threshold: 100000000, makerFee: 0.00045, takerFee: 0.00065, rebateShare: 0.65 },
      { level: 'VIP 8', threshold: 500000000, makerFee: 0.0004, takerFee: 0.0006, rebateShare: 0.7 },
      { level: 'VIP 9', threshold: 1000000000, makerFee: 0.00035, takerFee: 0.00055, rebateShare: 0.75 },
    ]
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const volume = parseFloat(searchParams.get('volume') || '0');
    const broker = searchParams.get('broker') || 'binance';
    const tradeType = searchParams.get('tradeType') || 'taker'; // maker or taker
    const tradesPerMonth = parseInt(searchParams.get('tradesPerMonth') || '20');

    if (volume <= 0) {
      return NextResponse.json(
        { error: 'Trading volume must be greater than 0' },
        { status: 400 }
      );
    }

    if (!BROKER_FEES[broker as keyof typeof BROKER_FEES]) {
      return NextResponse.json(
        { error: 'Invalid broker specified' },
        { status: 400 }
      );
    }

    const brokerInfo = BROKER_FEES[broker as keyof typeof BROKER_FEES];
    
    // Determine VIP level based on monthly volume
    const vipLevel = brokerInfo.vipLevels
      .slice()
      .reverse()
      .find(level => volume >= level.threshold) || brokerInfo.vipLevels[0];

    // Calculate fees
    const feeRate = tradeType === 'maker' ? vipLevel.makerFee : vipLevel.takerFee;
    const monthlyFees = volume * feeRate;
    const yearlyFees = monthlyFees * 12;

    // Calculate rebates
    const brokerRebateShare = vipLevel.rebateShare; // What broker shares with affiliates
    const apexRebateShare = 0.1; // ApexRebate takes 10% of broker's rebate
    const userRebateRate = brokerRebateShare * apexRebateShare;
    
    const monthlyRebate = monthlyFees * userRebateRate;
    const yearlyRebate = yearlyFees * userRebateRate;

    // Calculate additional metrics
    const averageTradeSize = volume / tradesPerMonth;
    const feePerTrade = averageTradeSize * feeRate;
    const rebatePerTrade = feePerTrade * userRebateRate;

    // Calculate savings compared to no rebate
    const monthlySavings = monthlyRebate;
    const yearlySavings = yearlyRebate;
    const savingsPercentage = (monthlyRebate / monthlyFees) * 100;

    // Calculate effective fee rate after rebate
    const effectiveFeeRate = feeRate - (feeRate * userRebateRate);

    return NextResponse.json({
      success: true,
      data: {
        input: {
          volume,
          broker,
          tradeType,
          tradesPerMonth,
        },
        broker: {
          name: brokerInfo.name,
          vipLevel: vipLevel.level,
          makerFee: vipLevel.makerFee,
          takerFee: vipLevel.takerFee,
          brokerRebateShare: vipLevel.rebateShare,
        },
        fees: {
          monthly: monthlyFees,
          yearly: yearlyFees,
          feeRate,
          feePerTrade,
          effectiveFeeRate,
        },
        rebates: {
          monthly: monthlyRebate,
          yearly: yearlyRebate,
          rebateRate: userRebateRate,
          rebatePerTrade,
          savingsPercentage,
        },
        savings: {
          monthly: monthlySavings,
          yearly: yearlySavings,
          totalYearly: yearlySavings,
        },
        metrics: {
          averageTradeSize,
          tradesPerMonth,
          totalFeesWithoutRebate: yearlyFees,
          totalFeesWithRebate: yearlyFees - yearlyRebate,
        },
        projections: {
          // Projections for different volumes
          lowVolume: calculateProjection(500000, broker, tradeType, 15),
          currentVolume: calculateProjection(volume, broker, tradeType, tradesPerMonth),
          highVolume: calculateProjection(volume * 2, broker, tradeType, tradesPerMonth * 1.5),
        }
      },
    });

  } catch (error) {
    console.error('Calculator API error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate rebate' },
      { status: 500 }
    );
  }
}

function calculateProjection(volume: number, broker: string, tradeType: string, tradesPerMonth: number) {
  const brokerInfo = BROKER_FEES[broker as keyof typeof BROKER_FEES];
  const vipLevel = brokerInfo.vipLevels
    .slice()
    .reverse()
    .find(level => volume >= level.threshold) || brokerInfo.vipLevels[0];

  const feeRate = tradeType === 'maker' ? vipLevel.makerFee : vipLevel.takerFee;
  const monthlyFees = volume * feeRate;
  const brokerRebateShare = vipLevel.rebateShare;
  const userRebateRate = brokerRebateShare * 0.1;
  const monthlyRebate = monthlyFees * userRebateRate;

  return {
    volume,
    monthlyRebate,
    yearlyRebate: monthlyRebate * 12,
    vipLevel: vipLevel.level,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { volume, broker, tradeType, tradesPerMonth } = body;

    // For POST requests, we can handle bulk calculations or more complex scenarios
    if (Array.isArray(volume)) {
      // Handle multiple volume calculations
      const results = volume.map(v => {
        const params = new URLSearchParams({
          volume: v.toString(),
          broker: broker || 'binance',
          tradeType: tradeType || 'taker',
          tradesPerMonth: (tradesPerMonth || 20).toString(),
        });
        
        // This would normally call the GET logic, but for simplicity we'll inline it
        return calculateSingleRebate(parseFloat(v.toString()), broker || 'binance', tradeType || 'taker', tradesPerMonth || 20);
      });

      return NextResponse.json({
        success: true,
        data: {
          results,
          summary: {
            totalMonthlyRebate: results.reduce((sum, r) => sum + r.monthlyRebate, 0),
            totalYearlyRebate: results.reduce((sum, r) => sum + r.yearlyRebate, 0),
            averageRebateRate: results.reduce((sum, r) => sum + r.rebateRate, 0) / results.length,
          }
        }
      });
    }

    // Single calculation (same as GET)
    return NextResponse.json({
      success: true,
      data: calculateSingleRebate(volume, broker, tradeType, tradesPerMonth)
    });

  } catch (error) {
    console.error('Calculator POST error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate rebate' },
      { status: 500 }
    );
  }
}

function calculateSingleRebate(volume: number, broker: string, tradeType: string, tradesPerMonth: number) {
  const brokerInfo = BROKER_FEES[broker as keyof typeof BROKER_FEES];
  const vipLevel = brokerInfo.vipLevels
    .slice()
    .reverse()
    .find(level => volume >= level.threshold) || brokerInfo.vipLevels[0];

  const feeRate = tradeType === 'maker' ? vipLevel.makerFee : vipLevel.takerFee;
  const monthlyFees = volume * feeRate;
  const brokerRebateShare = vipLevel.rebateShare;
  const userRebateRate = brokerRebateShare * 0.1;
  const monthlyRebate = monthlyFees * userRebateRate;

  return {
    volume,
    broker,
    tradeType,
    monthlyRebate,
    yearlyRebate: monthlyRebate * 12,
    feeRate,
    rebateRate: userRebateRate,
    vipLevel: vipLevel.level,
  };
}
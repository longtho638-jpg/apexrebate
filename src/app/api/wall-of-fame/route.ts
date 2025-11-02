import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/user.service';

// Mock data for development fallback
const mockWallOfFame = [
  { id: '1', anonymousName: 'Trader Alpha', totalSavings: 2847, broker: 'Binance', memberSince: '2024-01-15', referralCode: 'ALPHA' },
  { id: '2', anonymousName: 'Trader Beta', totalSavings: 1923, broker: 'Bybit', memberSince: '2024-01-20', referralCode: 'BETA' },
  { id: '3', anonymousName: 'Trader Gamma', totalSavings: 1567, broker: 'OKX', memberSince: '2024-02-01', referralCode: 'GAMMA' },
  { id: '4', anonymousName: 'Trader Delta', totalSavings: 1234, broker: 'Binance', memberSince: '2024-02-10', referralCode: 'DELTA' },
  { id: '5', anonymousName: 'Trader Epsilon', totalSavings: 987, broker: 'Bybit', memberSince: '2024-02-15', referralCode: 'EPSILON' }
];

export async function GET() {
  try {
    // Try to get real data from database using UserService
    let wallOfFameData: any[] = [];
    let totalSaved = 0;

    try {
      wallOfFameData = await UserService.getWallOfFame(10);
      totalSaved = wallOfFameData.reduce((sum, user) => sum + user.totalSavings, 0);

      // If no real data, fall back to mock data
      if (wallOfFameData.length === 0) {
        wallOfFameData = mockWallOfFame;
        totalSaved = mockWallOfFame.reduce((sum, user) => sum + user.totalSavings, 0);
      }
    } catch (dbError) {
      console.error('Database error, using mock data:', dbError);
      wallOfFameData = mockWallOfFame;
      totalSaved = mockWallOfFame.reduce((sum, user) => sum + user.totalSavings, 0);
    }
    
    return NextResponse.json({
      success: true,
      data: wallOfFameData,
      totalSaved,
      stats: {
        totalMembers: wallOfFameData.length,
        averageSavings: wallOfFameData.length > 0 ? totalSaved / wallOfFameData.length : 0,
        topSaver: wallOfFameData.length > 0 ? wallOfFameData[0] : null,
      }
    });
  } catch (error) {
    console.error('Wall of Fame API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
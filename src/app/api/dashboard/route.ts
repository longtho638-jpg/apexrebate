import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/user.service';

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, you would:
    // 1. Authenticate the user (get user ID from session/token)
    // 2. Fetch user data from database using UserService
    // 3. Return personalized data

    // For now, return mock data that matches the frontend expectations
    // In production, you would get the user ID from the session
    const userId = "demo-user-id"; // This would come from authentication

    try {
      const dashboardData = await UserService.getDashboardAnalytics(userId);
      
      return NextResponse.json({
        success: true,
        data: dashboardData
      });
    } catch (dbError) {
      console.error('Database error, using mock data:', dbError);
      
      // Fallback to mock data
      const mockUserData = {
        totalSavings: 2847.50,
        monthlySavings: 237.29,
        totalVolume: 2500000,
        memberSince: '2024-01-15',
        rank: 'Silver',
        nextRankProgress: 65,
        referrals: 3,
        referralEarnings: 142.50
      };
      
      const mockSavingsHistory = [
        { month: '2024-01', savings: 145.20, volume: 1200000 },
        { month: '2024-02', savings: 189.45, volume: 1500000 },
        { month: '2024-03', savings: 234.80, volume: 1800000 },
        { month: '2024-04', savings: 278.90, volume: 2100000 },
        { month: '2024-05', savings: 237.29, volume: 2500000 }
      ];
      
      const mockBrokerStats = [
        { broker: 'Binance', volume: 1500000, savings: 142.50, percentage: 60 },
        { broker: 'Bybit', volume: 750000, savings: 71.25, percentage: 30 },
        { broker: 'OKX', volume: 250000, savings: 23.54, percentage: 10 }
      ];
      
      const mockAchievements = [
        { id: 'first_savings', title: 'Tiết kiệm đầu tiên', description: 'Hoàn thành lần hoàn phí đầu tiên', icon: 'Star', unlocked: true, date: '2024-01-15' },
        { id: 'monthly_100', title: 'Thành viên tháng', description: 'Tiết kiệm hơn $100 trong tháng', icon: 'Award', unlocked: true, date: '2024-02-01' },
        { id: 'referral_1', title: 'Người giới thiệu', description: 'Giới thiệu thành công 1 thành viên', icon: 'Users', unlocked: true, date: '2024-03-10' },
        { id: 'savings_1000', title: 'Nhà tiết kiệm', description: 'Tổng tiết kiệm đạt $1,000', icon: 'Crown', unlocked: true, date: '2024-04-15' },
        { id: 'savings_5000', title: 'Bậc thầy tiết kiệm', description: 'Tổng tiết kiệm đạt $5,000', icon: 'Gem', unlocked: false, progress: 57 },
        { id: 'apex_pro', title: 'ApexPro Member', description: 'Nâng cấp lên ApexPro SaaS', icon: 'Shield', unlocked: false, progress: 80 }
      ];

      return NextResponse.json({
        success: true,
        data: {
          userData: mockUserData,
          savingsHistory: mockSavingsHistory,
          brokerStats: mockBrokerStats,
          achievements: mockAchievements
        }
      });
    }

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
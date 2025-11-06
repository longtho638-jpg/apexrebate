import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { UserService } from '@/lib/services/user.service';

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, you would:
    // 1. Authenticate the user (get user ID from session/token)
    // 2. Fetch user data from database using UserService
    // 3. Return personalized data

    // Ưu tiên: nếu có session → tính toán dữ liệu từ DB
    try {
      const session = await getServerSession(authOptions)
      const userId = session?.user?.id

      if (userId) {
        // Lấy user + payouts + referrals + achievements
        const [user, payouts, referredUsers, userAchievements] = await Promise.all([
          db.users.findUnique({
            where: { id: userId },
            select: {
              id: true,
              createdAt: true,
              tier: true,
              totalSaved: true,
              tradingVolume: true,
            }
          }),
          db.payouts.findMany({ where: { userId, status: 'PROCESSED' }, orderBy: { createdAt: 'asc' } }),
          db.users.findMany({ where: { referredBy: userId }, select: { id: true, createdAt: true } }),
          db.user_achievements.findMany({
            where: { userId },
            include: { achievements: true },
          })
        ])

        if (user) {
          const totalSavings = (user.totalSaved || payouts.reduce((s, p) => s + p.amount, 0))
          const totalVolume = (user.tradingVolume || payouts.reduce((s, p) => s + p.tradingVolume, 0))

          // Monthly savings (tháng hiện tại)
          const now = new Date()
          const monthlySavings = payouts
            .filter(p => p.createdAt.getMonth() === now.getMonth() && p.createdAt.getFullYear() === now.getFullYear())
            .reduce((s, p) => s + p.amount, 0)

          // Savings history (5-6 điểm gần nhất theo tháng)
          const buckets = new Map<string, { savings: number; volume: number }>()
          payouts.forEach(p => {
            const k = `${p.createdAt.getFullYear()}-${String(p.createdAt.getMonth() + 1).padStart(2, '0')}`
            const cur = buckets.get(k) || { savings: 0, volume: 0 }
            cur.savings += p.amount
            cur.volume += p.tradingVolume
            buckets.set(k, cur)
          })
          const last6 = Array.from(buckets.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .slice(-6)
            .map(([month, vals]) => ({ month, savings: Math.round(vals.savings * 100) / 100, volume: vals.volume }))

          // Broker stats
          const brokerMap = new Map<string, { volume: number; savings: number; count: number }>()
          payouts.forEach(p => {
            const b = (p.broker || 'binance').toLowerCase()
            const cur = brokerMap.get(b) || { volume: 0, savings: 0, count: 0 }
            cur.volume += p.tradingVolume
            cur.savings += p.amount
            cur.count += 1
            brokerMap.set(b, cur)
          })
          const totalSavingsForPct = Array.from(brokerMap.values()).reduce((s, v) => s + v.savings, 0) || 1
          const brokerStats = Array.from(brokerMap.entries()).map(([broker, v]) => ({
            broker: broker.charAt(0).toUpperCase() + broker.slice(1),
            volume: Math.round(v.volume),
            savings: Math.round(v.savings * 100) / 100,
            percentage: Math.round((v.savings / totalSavingsForPct) * 100)
          }))

          // Achievements
          const achievements = userAchievements.map(ua => ({
            id: ua.achievementId,
            title: ua.achievements.title,
            description: ua.achievements.description,
            icon: ua.achievements.icon,
            unlocked: true,
            date: ua.unlockedAt.toISOString().slice(0, 10),
          }))

          const data = {
            userData: {
              totalSavings: Math.round(totalSavings * 100) / 100,
              monthlySavings: Math.round(monthlySavings * 100) / 100,
              totalVolume: Math.round(totalVolume),
              memberSince: user.createdAt.toISOString().slice(0, 10),
              rank: user.tier,
              nextRankProgress: 65, // ước lượng đơn giản
              referrals: referredUsers.length,
              referralEarnings: 0, // giữ 0 cho an toàn, có thể tính theo chính sách sau
            },
            savingsHistory: last6,
            brokerStats,
            achievements,
          }

          return NextResponse.json({ success: true, data })
        }
      }
    } catch (dbError) {
      console.error('Dashboard DB error, using mock data:', dbError)
    }

    // Fallback mock khi không có session hoặc lỗi DB
    try {
      const dashboardData = await UserService.getDashboardAnalytics('demo-user-id');
      return NextResponse.json({ success: true, data: dashboardData });
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
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Bạn cần đăng nhập để xem phân tích' } },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '6m'
    const type = searchParams.get('type') || 'overview'

    // Get user's data
    const user = await db.users.findUnique({
      where: { id: session.user.id },
      include: {
        payouts: {
          where: { status: 'PROCESSED' },
          orderBy: { createdAt: 'asc' }
        },
        referredUsers: {
          include: {
            payouts: {
              where: { status: 'PROCESSED' }
            }
          }
        },
        achievements: {
          include: {
            achievement: true
          }
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 100
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'USER_NOT_FOUND', message: 'Không tìm thấy người dùng' } },
        { status: 404 }
      )
    }

    // Calculate date range based on period
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case '1m':
        startDate.setMonth(now.getMonth() - 1)
        break
      case '3m':
        startDate.setMonth(now.getMonth() - 3)
        break
      case '6m':
        startDate.setMonth(now.getMonth() - 6)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate = new Date(0) // All time
    }

    // Filter payouts by period
    const filteredPayouts = user.payouts.filter(payout => 
      new Date(payout.createdAt) >= startDate
    )

    // Calculate payouts over time
    const payoutsByMonth = new Map<string, number>()
    let cumulative = 0
    
    filteredPayouts.forEach(payout => {
      const monthKey = new Date(payout.createdAt).toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' })
      cumulative += payout.amount
      payoutsByMonth.set(monthKey, (payoutsByMonth.get(monthKey) || 0) + payout.amount)
    })

    const payoutsOverTime = Array.from(payoutsByMonth.entries()).map(([date, amount], index) => {
      cumulative = Array.from(payoutsByMonth.entries()).slice(0, index + 1).reduce((sum, [, amt]) => sum + amt, 0)
      return { date, amount, cumulative }
    })

    // Calculate broker distribution
    const brokerStats = filteredPayouts.reduce((acc, payout) => {
      const broker = payout.broker || 'unknown'
      if (!acc[broker]) {
        acc[broker] = { count: 0, amount: 0, volume: 0 }
      }
      acc[broker].count += 1
      acc[broker].amount += payout.amount
      acc[broker].volume += payout.tradingVolume || 0
      return acc
    }, {} as Record<string, { count: number; amount: number; volume: number }>)

    const totalAmount = (Object.values(brokerStats) as { count: number; amount: number; volume: number }[]).reduce((sum, stat) => sum + stat.amount, 0)
    
    const brokerDistribution = Object.entries(brokerStats).map(([broker, stats]) => {
      const typedStats = stats as { count: number; amount: number; volume: number };
      return {
        broker: broker.charAt(0).toUpperCase() + broker.slice(1),
        amount: Math.round(typedStats.amount * 100) / 100,
        percentage: Math.round((typedStats.amount / totalAmount) * 100),
        volume: Math.round(typedStats.volume),
        avgPayout: Math.round((typedStats.amount / typedStats.count) * 100) / 100,
        color: broker === 'binance' ? '#0088FE' : broker === 'bybit' ? '#00C49F' : broker === 'okx' ? '#FFBB28' : '#8884D8'
      };
    })

    // Calculate referral growth
    const referralsByMonth = new Map<string, number>()
    let totalReferrals = 0
    
    user.referredUsers.forEach(referral => {
      const monthKey = new Date(referral.createdAt).toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' })
      totalReferrals += 1
      referralsByMonth.set(monthKey, (referralsByMonth.get(monthKey) || 0) + 1)
    })

    const referralGrowth = Array.from(referralsByMonth.entries()).map(([date, count], index) => {
      totalReferrals = Array.from(referralsByMonth.entries()).slice(0, index + 1).reduce((sum, [, cnt]) => sum + cnt, 0)
      return { date, count, total: totalReferrals }
    })

    // Calculate monthly comparison
    const monthlyComparison: any[] = []
    for (let i = 5; i >= 0; i--) {
      const currentDate = new Date()
      currentDate.setMonth(currentDate.getMonth() - i)
      const monthKey = currentDate.toLocaleDateString('vi-VN', { month: 'long' })
      
      const currentMonthPayouts = filteredPayouts.filter(payout => {
        const payoutDate = new Date(payout.createdAt)
        return payoutDate.getMonth() === currentDate.getMonth() && 
               payoutDate.getFullYear() === currentDate.getFullYear()
      })
      
      const previousMonthDate = new Date(currentDate)
      previousMonthDate.setMonth(previousMonthDate.getMonth() - 1)
      
      const previousMonthPayouts = filteredPayouts.filter(payout => {
        const payoutDate = new Date(payout.createdAt)
        return payoutDate.getMonth() === previousMonthDate.getMonth() && 
               payoutDate.getFullYear() === previousMonthDate.getFullYear()
      })
      
      monthlyComparison.push({
        month: monthKey,
        current: currentMonthPayouts.reduce((sum, p) => sum + p.amount, 0),
        previous: previousMonthPayouts.reduce((sum, p) => sum + p.amount, 0)
      })
    }

    // Calculate performance metrics
    const totalPayouts = filteredPayouts.reduce((sum, payout) => sum + payout.amount, 0)
    const monthsWithData = payoutsOverTime.length || 1
    const averageMonthly = Math.round((totalPayouts / monthsWithData) * 100) / 100
    
    // Find best month
    const bestMonthData = payoutsOverTime.reduce((best, current) => 
      current.amount > best.amount ? current : best, 
      { amount: 0, date: '' }
    )
    
    // Calculate growth rate
    const growthRate = monthlyComparison.length >= 2 
      ? Math.round(((monthlyComparison[monthlyComparison.length - 1].current - monthlyComparison[0].current) / 
                   Math.max(monthlyComparison[0].current, 1)) * 100)
      : 0

    // Calculate conversion rate
    const activeReferrals = user.referredUsers.filter(referral => 
      referral.payouts.length > 0
    ).length
    const conversionRate = user.referredUsers.length > 0 
      ? Math.round((activeReferrals / user.referredUsers.length) * 100)
      : 0

    // Calculate trading efficiency
    const totalTradingVolume = filteredPayouts.reduce((sum, payout) => sum + (payout.tradingVolume || 0), 0)
    const efficiencyRate = totalTradingVolume > 0 
      ? Math.round((totalPayouts / totalTradingVolume) * 10000) / 100 // Basis points
      : 0

    // Achievement analytics
    const achievementsByCategory = user.achievements.reduce((acc, ua) => {
      const category = ua.achievement.category
      if (!acc[category]) acc[category] = 0
      acc[category] += 1
      return acc
    }, {} as Record<string, number>)

    // Activity patterns
    const recentActivity = user.activities.slice(0, 30)
    const activityByType = recentActivity.reduce((acc, activity) => {
      if (!acc[activity.type]) acc[activity.type] = 0
      acc[activity.type] += 1
      return acc
    }, {} as Record<string, number>)

    // Predictive analytics
    const predictedNextMonth = averageMonthly * (1 + (growthRate / 100))
    const predictedYearEnd = totalPayouts + (predictedNextMonth * 12)

    const performanceMetrics = {
      totalPayouts: Math.round(totalPayouts * 100) / 100,
      averageMonthly: Math.round(averageMonthly * 100) / 100,
      bestMonth: bestMonthData.date || 'N/A',
      growthRate,
      totalReferrals: user.referredUsers.length,
      conversionRate,
      efficiencyRate,
      totalTradingVolume: Math.round(totalTradingVolume),
      predictedNextMonth: Math.round(predictedNextMonth * 100) / 100,
      predictedYearEnd: Math.round(predictedYearEnd * 100) / 100,
      currentTier: user.tier,
      totalPoints: user.points,
      streak: user.streak
    }

    // Top referrers (mock for individual user, would be different for admin)
    const topReferrers = user.referredUsers
      .filter(referral => referral.payouts.length > 0)
      .map(referral => ({
        name: referral.name || referral.email?.split('@')[0] || 'Anonymous',
        amount: referral.payouts.reduce((sum, p) => sum + p.amount, 0),
        referrals: 1,
        joinedAt: referral.createdAt
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    const analyticsData = {
      payoutsOverTime,
      brokerDistribution,
      referralGrowth,
      monthlyComparison,
      topReferrers,
      performanceMetrics,
      achievementsByCategory,
      activityByType,
      period,
      generatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: analyticsData
    })

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Lỗi server nội bộ' } },
      { status: 500 }
    )
  }
}
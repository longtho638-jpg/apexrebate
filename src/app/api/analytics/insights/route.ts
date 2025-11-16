import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Bạn cần đăng nhập để xem insights' } },
        { status: 401 }
      )
    }

    // Get user's comprehensive data
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
        user_achievements: {
          include: {
            achievements: true
          }
        },
        user_activities: {
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

    // Generate insights
    const insights = await generateInsights(user)

    return NextResponse.json({
      success: true,
      data: insights
    })

  } catch (error) {
    console.error('Insights API error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Lỗi server nội bộ' } },
      { status: 500 }
    )
  }
}

async function generateInsights(user: any) {
  const payouts = user.payouts
  const referrals = user.referredUsers
  const achievements = user.user_achievements
  const activities = user.user_activities

  // 1. Performance Insights
  const performanceInsights = generatePerformanceInsights(payouts, user)

  // 2. Trading Pattern Insights
  const tradingInsights = generateTradingInsights(payouts)

  // 3. Referral Insights
  const referralInsights = generateReferralInsights(referrals, user)

  // 4. Achievement Insights
  const achievementInsights = generateAchievementInsights(achievements, user)

  // 5. Predictive Insights
  const predictiveInsights = generatePredictiveInsights(payouts, referrals, user)

  // 6. Recommendations
  const recommendations = generateRecommendations(user, payouts, referrals, achievements)

  // 7. Risk Analysis
  const riskAnalysis = generateRiskAnalysis(payouts, user)

  return {
    performanceInsights,
    tradingInsights,
    referralInsights,
    achievementInsights,
    predictiveInsights,
    recommendations,
    riskAnalysis,
    generatedAt: new Date().toISOString(),
    dataQuality: assessDataQuality(payouts, referrals, achievements)
  }
}

function generatePerformanceInsights(payouts: any[], user: any) {
  const totalPayouts = payouts.reduce((sum, p) => sum + p.amount, 0)
  const totalVolume = payouts.reduce((sum, p) => sum + (p.tradingVolume || 0), 0)
  const efficiencyRate = totalVolume > 0 ? (totalPayouts / totalVolume) * 10000 : 0 // in basis points

  // Calculate consistency score
  const monthlyPayouts = groupPayoutsByMonth(payouts)
  const avgMonthly = monthlyPayouts.reduce((sum, m) => sum + m.total, 0) / monthlyPayouts.length
  const variance = monthlyPayouts.reduce((sum, m) => sum + Math.pow(m.total - avgMonthly, 2), 0) / monthlyPayouts.length
  const consistencyScore = Math.max(0, 100 - (Math.sqrt(variance) / avgMonthly) * 100)

  // Growth trend
  const growthTrend = calculateGrowthTrend(monthlyPayouts)

  return {
    totalEarnings: totalPayouts,
    efficiencyRate: Math.round(efficiencyRate * 100) / 100,
    consistencyScore: Math.round(consistencyScore),
    growthTrend,
    performanceGrade: calculatePerformanceGrade(totalPayouts, consistencyScore, growthTrend),
    comparisonToAverage: compareUserToAverage(user, totalPayouts)
  }
}

function generateTradingInsights(payouts: any[]) {
  const brokerStats = payouts.reduce((acc, payout) => {
    if (!acc[payout.broker]) {
      acc[payout.broker] = { count: 0, volume: 0, earnings: 0 }
    }
    acc[payout.broker].count += 1
    acc[payout.broker].volume += payout.tradingVolume || 0
    acc[payout.broker].earnings += payout.amount
    return acc
  }, {} as Record<string, any>)

  // Find best performing broker
  const bestBroker = Object.entries(brokerStats).reduce((best, [broker, stats]) => {
    const typedStats = stats as { count: number; volume: number; earnings: number };
    const efficiency = typedStats.volume > 0 ? (typedStats.earnings / typedStats.volume) * 10000 : 0
    const bestEfficiency = best.stats.volume > 0 ? (best.stats.earnings / best.stats.volume) * 10000 : 0
    return efficiency > bestEfficiency ? { broker, efficiency, stats: typedStats } : best
  }, { broker: '', efficiency: 0, stats: { count: 0, volume: 0, earnings: 0 } })

  // Trading frequency analysis
  const tradingFrequency = analyzeTradingFrequency(payouts)

  // Volume patterns
  const volumePatterns = analyzeVolumePatterns(payouts)

  return {
    brokerPerformance: brokerStats,
    bestBroker,
    tradingFrequency,
    volumePatterns,
    diversificationScore: calculateDiversificationScore(brokerStats)
  }
}

function generateReferralInsights(referrals: any[], user: any) {
  const activeReferrals = referrals.filter(r => r.payouts.length > 0)
  const totalReferralEarnings = referrals.reduce((sum, r) => 
    sum + r.payouts.reduce((pSum: number, p: any) => pSum + p.amount, 0), 0
  )

  // Referral quality analysis
  const referralQuality = activeReferrals.map(referral => ({
    name: referral.name || referral.email?.split('@')[0] || 'Anonymous',
    earnings: referral.payouts.reduce((sum: number, p: any) => sum + p.amount, 0),
    activity: referral.payouts.length,
    joinedAt: referral.createdAt,
    qualityScore: calculateReferralQuality(referral)
  }))

  // Referral timeline patterns
  const timelinePatterns = analyzeReferralTimeline(referrals)

  return {
    totalReferrals: referrals.length,
    activeReferrals: activeReferrals.length,
    totalReferralEarnings,
    averageReferralEarnings: activeReferrals.length > 0 ? totalReferralEarnings / activeReferrals.length : 0,
    referralQuality,
    timelinePatterns,
    referralEfficiency: referrals.length > 0 ? (activeReferrals.length / referrals.length) * 100 : 0
  }
}

function generateAchievementInsights(achievements: any[], user: any) {
  const achievementsByCategory = achievements.reduce((acc, ua) => {
    const category = ua.achievements.category
    if (!acc[category]) acc[category] = []
    acc[category].push(ua)
    return acc
  }, {} as Record<string, any[]>)

  // Achievement progress
  const categoryProgress = Object.entries(achievementsByCategory).map(([category, achs]) => {
    const typedAchs = achs as any[];
    return {
      category,
      count: typedAchs.length,
      totalPoints: typedAchs.reduce((sum, ach) => sum + ach.achievements.points, 0),
      completionRate: calculateCategoryCompletionRate(category, typedAchs.length)
    };
  })

  // Recent achievements momentum
  const recentAchievements = achievements
    .filter(ach => new Date(ach.unlockedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    .length

  return {
    totalAchievements: achievements.length,
    totalPoints: achievements.reduce((sum, ach) => sum + ach.achievements.points, 0),
    categoryProgress,
    recentAchievements,
    achievementMomentum: recentAchievements > 0 ? 'high' : achievements.length > 5 ? 'medium' : 'low',
    nextMilestone: null
  }
}

function generatePredictiveInsights(payouts: any[], referrals: any[], user: any) {
  // Predict next month earnings
  const monthlyData = groupPayoutsByMonth(payouts)
  const prediction = predictNextMonth(monthlyData)

  // Predict tier progression
  const tierPrediction = predictTierProgression(user, monthlyData)

  // Predict referral growth
  const referralPrediction = predictReferralGrowth(referrals)

  // Predict achievement timeline
  const achievementPrediction = predictAchievementTimeline(user.user_achievements, user)

  return {
    nextMonthPrediction: prediction,
    tierProgression: tierPrediction,
    referralGrowth: referralPrediction,
    achievementTimeline: achievementPrediction,
    confidenceLevel: calculatePredictionConfidence(payouts.length, referrals.length)
  }
}

function generateRecommendations(user: any, payouts: any[], referrals: any[], achievements: any[]) {
  const recommendations: any[] = []

  // Trading recommendations
  if (payouts.length > 0) {
    const brokerStats = analyzeBrokerPerformance(payouts)
    if (brokerStats.underutilized.length > 0) {
      recommendations.push({
        type: 'trading',
        priority: 'medium',
        title: 'Tối ưu hóa Sàn giao dịch',
        description: `Hãy xem xét sử dụng ${brokerStats.underutilized[0]} để tăng hiệu suất hoàn phí`,
        action: 'Xem phân tích sàn giao dịch'
      })
    }
  }

  // Referral recommendations
  if (referrals.length < 5) {
    recommendations.push({
      type: 'referral',
      priority: 'high',
      title: 'Tăng cường Giới thiệu',
      description: 'Mời thêm bạn bè để tăng thu nhập thụ động',
      action: 'Chia sẻ mã giới thiệu'
    })
  }

  // Achievement recommendations
  const lockedAchievements = getLockedAchievements(user)
  if (lockedAchievements.length > 0) {
    recommendations.push({
      type: 'achievement',
      priority: 'low',
      title: 'Mở khóa Thành tựu mới',
      description: `Bạn còn ${lockedAchievements.length} thành tựh có thể mở khóa`,
      action: 'Xem các thành tựh khả dụng'
    })
  }

  // Activity recommendations
  if (user.streak < 7) {
    recommendations.push({
      type: 'activity',
      priority: 'medium',
      title: 'Duy trì Hoạt động',
      description: 'Đăng nhập thường xuyên để duy trì chuỗi hoạt động',
      action: 'Đăng nhập hàng ngày'
    })
  }

  return recommendations
}

function generateRiskAnalysis(payouts: any[], user: any) {
  const risks: any[] = []

  // Concentration risk
  const brokerConcentration = calculateBrokerConcentration(payouts)
  if (brokerConcentration > 80) {
    risks.push({
      type: 'concentration',
      level: 'high',
      description: 'Rủi ro tập trung cao vào một sàn giao dịch',
      mitigation: 'Cân đối lại danh mục sàn giao dịch'
    })
  }

  // Activity risk
  const recentActivity = payouts.filter(p => 
    new Date(p.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  )
  if (recentActivity.length === 0) {
    risks.push({
      type: 'activity',
      level: 'medium',
      description: 'Không có hoạt động gần đây',
      mitigation: 'Tăng cường hoạt động giao dịch'
    })
  }

  // Performance risk
  const performanceTrend = calculatePerformanceTrend(payouts)
  if (performanceTrend < -20) {
    risks.push({
      type: 'performance',
      level: 'high',
      description: 'Hiệu suất đang giảm',
      mitigation: 'Xem xét lại chiến lược giao dịch'
    })
  }

  return {
    risks,
    overallRiskLevel: calculateOverallRiskLevel(risks),
    riskScore: calculateRiskScore(risks)
  }
}

// Helper functions
function groupPayoutsByMonth(payouts: any[]) {
  const grouped = payouts.reduce((acc, payout) => {
    const monthKey = new Date(payout.createdAt).toISOString().slice(0, 7)
    if (!acc[monthKey]) acc[monthKey] = []
    acc[monthKey].push(payout)
    return acc
  }, {} as Record<string, any[]>)

  return Object.entries(grouped).map(([month, ps]) => {
    const typedPs = ps as any[];
    return {
      month,
      total: typedPs.reduce((sum, p) => sum + p.amount, 0),
      count: typedPs.length,
      volume: typedPs.reduce((sum, p) => sum + (p.tradingVolume || 0), 0)
    };
  })
}

function calculateGrowthTrend(monthlyData: any[]) {
  if (monthlyData.length < 2) return 0
  
  const recent = monthlyData.slice(-3)
  const previous = monthlyData.slice(-6, -3)
  
  const recentAvg = recent.reduce((sum, m) => sum + m.total, 0) / recent.length
  const previousAvg = previous.length > 0 ? previous.reduce((sum, m) => sum + m.total, 0) / previous.length : recentAvg
  
  return previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0
}

function calculatePerformanceGrade(earnings: number, consistency: number, growth: number) {
  let score = 0
  
  // Earnings score (40%)
  if (earnings > 1000) score += 40
  else if (earnings > 500) score += 30
  else if (earnings > 100) score += 20
  else score += 10
  
  // Consistency score (35%)
  score += (consistency / 100) * 35
  
  // Growth score (25%)
  if (growth > 20) score += 25
  else if (growth > 10) score += 20
  else if (growth > 0) score += 15
  else if (growth > -10) score += 10
  else score += 5
  
  if (score >= 85) return 'A+'
  if (score >= 75) return 'A'
  if (score >= 65) return 'B+'
  if (score >= 55) return 'B'
  if (score >= 45) return 'C+'
  if (score >= 35) return 'C'
  return 'D'
}

function compareUserToAverage(user: any, earnings: number) {
  // This would typically compare against platform averages
  // For now, return a mock comparison
  return {
    percentile: Math.min(95, Math.max(5, (earnings / 10) * 100)),
    betterThan: Math.min(95, Math.max(5, (earnings / 10) * 100)),
    totalUsers: 1000 // Mock number
  }
}

function analyzeTradingFrequency(payouts: any[]) {
  if (payouts.length === 0) return { frequency: 'none', pattern: 'none' }
  
  const daysBetweenPayouts = payouts.slice(1).map((payout, index) => {
    const prevDate = new Date(payouts[index].createdAt)
    const currDate = new Date(payout.createdAt)
    return (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
  })
  
  const avgDays = daysBetweenPayouts.reduce((sum, days) => sum + days, 0) / daysBetweenPayouts.length
  
  if (avgDays < 7) return { frequency: 'high', pattern: 'weekly' }
  if (avgDays < 30) return { frequency: 'medium', pattern: 'monthly' }
  return { frequency: 'low', pattern: 'irregular' }
}

function analyzeVolumePatterns(payouts: any[]) {
  const volumes = payouts.map(p => p.tradingVolume || 0)
  const avgVolume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length
  const maxVolume = Math.max(...volumes)
  const minVolume = Math.min(...volumes)
  
  return {
    average: avgVolume,
    maximum: maxVolume,
    minimum: minVolume,
    volatility: maxVolume > 0 ? ((maxVolume - minVolume) / maxVolume) * 100 : 0
  }
}

function calculateDiversificationScore(brokerStats: Record<string, any>) {
  const brokers = Object.keys(brokerStats)
  if (brokers.length === 0) return 0
  if (brokers.length === 1) return 20
  if (brokers.length === 2) return 60
  if (brokers.length === 3) return 90
  return 100
}

function calculateReferralQuality(referral: any) {
  const earnings = referral.payouts.reduce((sum: number, p: any) => sum + p.amount, 0)
  const activity = referral.payouts.length
  
  let score = 0
  if (earnings > 100) score += 40
  else if (earnings > 50) score += 30
  else if (earnings > 0) score += 20
  
  if (activity > 5) score += 30
  else if (activity > 2) score += 20
  else if (activity > 0) score += 10
  
  // Recent activity bonus
  const recentActivity = referral.payouts.filter((p: any) => 
    new Date(p.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length
  score += Math.min(30, recentActivity * 10)
  
  return Math.min(100, score)
}

function analyzeReferralTimeline(referrals: any[]) {
  const monthlyReferrals = referrals.reduce((acc, referral) => {
    const monthKey = new Date(referral.createdAt).toISOString().slice(0, 7)
    acc[monthKey] = (acc[monthKey] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const totalKeys = Object.keys(monthlyReferrals).length;
  const averagePerMonth = totalKeys > 0 
    ? (Object.values(monthlyReferrals) as number[]).reduce((sum, count) => sum + count, 0) / totalKeys
    : 0;
  
  return {
    monthlyBreakdown: monthlyReferrals,
    peakMonth: Object.entries(monthlyReferrals).reduce((peak, [month, count]) => 
      (count as number) > peak.count ? { month, count: count as number } : peak, 
      { month: '', count: 0 }
    ),
    averagePerMonth
  }
}

function calculateCategoryCompletionRate(category: string, count: number) {
  // Mock completion rates based on typical achievement distributions
  const categoryTotals: Record<string, number> = {
    'SAVINGS': 10,
    'REFERRALS': 8,
    'ACTIVITY': 12,
    'TRADING': 15,
    'LOYALTY': 6,
    'SPECIAL': 5
  }
  
  const total = categoryTotals[category] || 10
  return Math.round((count / total) * 100)
}

function predictNextMonth(monthlyData: any[]) {
  if (monthlyData.length < 2) {
    return { amount: 0, confidence: 'low' }
  }
  
  // Simple linear regression for prediction
  const recent = monthlyData.slice(-6)
  const n = recent.length
  
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0
  
  recent.forEach((data, index) => {
    sumX += index
    sumY += data.total
    sumXY += index * data.total
    sumX2 += index * index
  })
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  
  const prediction = slope * n + intercept
  
  return {
    amount: Math.max(0, prediction),
    confidence: monthlyData.length >= 6 ? 'high' : monthlyData.length >= 3 ? 'medium' : 'low'
  }
}

function predictTierProgression(user: any, monthlyData: any[]) {
  const currentTier = user.tier
  const monthlyEarnings = monthlyData.length > 0 ? 
    monthlyData.reduce((sum, m) => sum + m.total, 0) / monthlyData.length : 0
  
  // Mock tier requirements
  const tierRequirements = {
    'BRONZE': { minEarnings: 0, nextTier: 'SILVER', requiredEarnings: 500 },
    'SILVER': { minEarnings: 500, nextTier: 'GOLD', requiredEarnings: 1500 },
    'GOLD': { minEarnings: 1500, nextTier: 'PLATINUM', requiredEarnings: 3000 },
    'PLATINUM': { minEarnings: 3000, nextTier: 'DIAMOND', requiredEarnings: 5000 },
    'DIAMOND': { minEarnings: 5000, nextTier: null, requiredEarnings: null }
  }
  
  const currentTierInfo = tierRequirements[currentTier as keyof typeof tierRequirements]
  
  if (!currentTierInfo?.nextTier) {
    return { currentTier, nextTier: null, monthsToNext: null, progress: 100 }
  }
  
  const userEarnings = user.totalSaved || 0
  const requiredEarnings = currentTierInfo.requiredEarnings || 0
  const remaining = Math.max(0, requiredEarnings - userEarnings)
  const monthsToNext = monthlyEarnings > 0 ? Math.ceil(remaining / monthlyEarnings) : null
  
  return {
    currentTier,
    nextTier: currentTierInfo.nextTier,
    monthsToNext,
    progress: Math.round((userEarnings / requiredEarnings) * 100)
  }
}

function predictReferralGrowth(referrals: any[]) {
  const recentReferrals = referrals.filter(r => 
    new Date(r.createdAt) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  )
  
  const monthlyRate = recentReferrals.length / 3
  const predictedNextMonth = Math.round(monthlyRate * 1.1) // 10% growth assumption
  
  return {
    currentRate: monthlyRate,
    predictedNextMonth,
    confidence: referrals.length > 10 ? 'high' : referrals.length > 5 ? 'medium' : 'low'
  }
}

function predictAchievementTimeline(achievements: any[], user: any) {
  const recentAchievements = achievements.filter(a => 
    new Date(a.unlockedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  )
  
  const rate = recentAchievements.length
  const predictedNext = rate > 0 ? Math.ceil(30 / rate) : 90 // days
  
  return {
    currentRate: rate,
    predictedNextAchievement: predictedNext,
    confidence: rate > 0 ? 'medium' : 'low'
  }
}

function calculatePredictionConfidence(payoutCount: number, referralCount: number) {
  let confidence = 0
  
  if (payoutCount > 20) confidence += 40
  else if (payoutCount > 10) confidence += 25
  else if (payoutCount > 5) confidence += 15
  
  if (referralCount > 10) confidence += 30
  else if (referralCount > 5) confidence += 20
  else if (referralCount > 2) confidence += 10
  
  // Data recency bonus
  confidence += 30
  
  return Math.min(100, confidence)
}

function getLockedAchievements(user: any) {
  // Mock function - in real implementation, this would query available achievements
  return []
}

function analyzeBrokerPerformance(payouts: any[]) {
  const brokerStats = payouts.reduce((acc, payout) => {
    if (!acc[payout.broker]) acc[payout.broker] = []
    acc[payout.broker].push(payout)
    return acc
  }, {} as Record<string, any[]>)
  
  const performance = Object.entries(brokerStats).map(([broker, ps]) => {
    const typedPs = ps as any[];
    return {
      broker,
      efficiency: typedPs.reduce((sum, p) => sum + (p.amount / (p.tradingVolume || 1)), 0) / typedPs.length,
      totalEarnings: typedPs.reduce((sum, p) => sum + p.amount, 0)
    };
  })
  
  const sorted = performance.sort((a, b) => b.efficiency - a.efficiency)
  const underutilized = sorted.slice(1).map(s => s.broker)
  
  return { best: sorted[0]?.broker, underutilized }
}

function calculateBrokerConcentration(payouts: any[]) {
  if (payouts.length === 0) return 0
  
  const brokerStats = payouts.reduce((acc, payout) => {
    acc[payout.broker] = (acc[payout.broker] || 0) + payout.amount
    return acc
  }, {} as Record<string, number>)
  
  const total = (Object.values(brokerStats) as number[]).reduce((sum, amount) => sum + amount, 0)
  const maxBroker = Math.max(...(Object.values(brokerStats) as number[]))
  
  return (maxBroker / total) * 100
}

function calculatePerformanceTrend(payouts: any[]) {
  const recent = payouts.slice(-10)
  const previous = payouts.slice(-20, -10)
  
  const recentSum = recent.reduce((sum, p) => sum + p.amount, 0)
  const previousSum = previous.reduce((sum, p) => sum + p.amount, 0)
  
  return previousSum > 0 ? ((recentSum - previousSum) / previousSum) * 100 : 0
}

function calculateOverallRiskLevel(risks: any[]) {
  if (risks.length === 0) return 'low'
  
  const highRisks = risks.filter(r => r.level === 'high').length
  const mediumRisks = risks.filter(r => r.level === 'medium').length
  
  if (highRisks > 0) return 'high'
  if (mediumRisks > 1) return 'medium'
  return 'low'
}

function calculateRiskScore(risks: any[]) {
  let score = 100
  
  risks.forEach(risk => {
    if (risk.level === 'high') score -= 30
    else if (risk.level === 'medium') score -= 15
    else score -= 5
  })
  
  return Math.max(0, score)
}

function assessDataQuality(payouts: any[], referrals: any[], achievements: any[]) {
  let quality = 100
  
  if (payouts.length === 0) quality -= 30
  if (payouts.length < 5) quality -= 15
  
  if (referrals.length === 0) quality -= 10
  
  if (achievements.length === 0) quality -= 10
  
  // Data recency
  const recentPayouts = payouts.filter(p => 
    new Date(p.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  )
  if (recentPayouts.length === 0) quality -= 20
  
  return Math.max(0, quality)
}

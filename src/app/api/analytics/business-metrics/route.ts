import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface BusinessMetrics {
  revenue: {
    current: number
    previous: number
    growth: number
    target: number
    achievement: number
  }
  users: {
    total: number
    active: number
    new: number
    retention: number
  }
  conversions: {
    rate: number
    total: number
    value: number
    cost: number
    roi: number
  }
  engagement: {
    pageViews: number
    sessions: number
    bounceRate: number
    avgSessionDuration: number
  }
}

// 生成业务指标数据
const generateBusinessMetrics = (period: string): BusinessMetrics => {
  const periodMultiplier = {
    '7d': 0.2,
    '30d': 1,
    '90d': 3,
    '1y': 12
  }[period] || 1

  const baseRevenue = 1250000
  const baseUsers = 45230
  const baseConversions = 1847
  const basePageViews = 2850000

  return {
    revenue: {
      current: baseRevenue * periodMultiplier,
      previous: baseRevenue * periodMultiplier * 0.78,
      growth: 27.6 + Math.random() * 10 - 5,
      target: baseRevenue * periodMultiplier * 1.2,
      achievement: 83.3 + Math.random() * 10 - 5
    },
    users: {
      total: baseUsers * periodMultiplier,
      active: Math.floor(baseUsers * periodMultiplier * 0.275),
      new: Math.floor(baseUsers * periodMultiplier * 0.072),
      retention: 78.5 + Math.random() * 5 - 2.5
    },
    conversions: {
      rate: 3.8 + Math.random() * 1 - 0.5,
      total: Math.floor(baseConversions * periodMultiplier),
      value: 675 + Math.random() * 100 - 50,
      cost: 125 + Math.random() * 25 - 12.5,
      roi: 440 + Math.random() * 60 - 30
    },
    engagement: {
      pageViews: Math.floor(basePageViews * periodMultiplier),
      sessions: Math.floor(basePageViews * periodMultiplier * 0.17),
      bounceRate: 32.4 + Math.random() * 5 - 2.5,
      avgSessionDuration: 245 + Math.random() * 60 - 30
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    // 验证用户权限
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = session.user?.role || 'user'
    if (!['admin', 'moderator', 'analyst'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // 生成业务指标
    const metrics = generateBusinessMetrics(period)

    // 如果指定了日期范围，可以进一步调整数据
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      
      // 根据天数调整指标
      const dayMultiplier = days / 30
      metrics.revenue.current *= dayMultiplier
      metrics.revenue.previous *= dayMultiplier
      metrics.users.total = Math.floor(metrics.users.total * dayMultiplier)
      metrics.users.active = Math.floor(metrics.users.active * dayMultiplier)
      metrics.users.new = Math.floor(metrics.users.new * dayMultiplier)
      metrics.conversions.total = Math.floor(metrics.conversions.total * dayMultiplier)
      metrics.engagement.pageViews = Math.floor(metrics.engagement.pageViews * dayMultiplier)
      metrics.engagement.sessions = Math.floor(metrics.engagement.sessions * dayMultiplier)
    }

    // 计算额外的派生指标
    const derivedMetrics = {
      arpu: metrics.revenue.current / metrics.users.active,
      ltv: metrics.revenue.current / metrics.users.new,
      cac: metrics.conversions.cost,
      paybackPeriod: metrics.conversions.cost / (metrics.revenue.current / metrics.users.new),
      churnRate: (100 - metrics.users.retention) / 100,
      revenuePerSession: metrics.revenue.current / metrics.engagement.sessions,
      conversionRateBySession: (metrics.conversions.total / metrics.engagement.sessions) * 100
    }

    const response = {
      success: true,
      data: metrics,
      derived: derivedMetrics,
      period,
      dateRange: startDate && endDate ? { startDate, endDate } : null,
      timestamp: new Date().toISOString()
    }

    // 添加缓存头
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300', // 5分钟缓存
    })

    return NextResponse.json(response, { headers })
  } catch (error) {
    console.error('Error fetching business metrics:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch business metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
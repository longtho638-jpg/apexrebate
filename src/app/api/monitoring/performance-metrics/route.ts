import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 生成性能指标数据
const generatePerformanceMetrics = () => {
  return {
    timestamp: new Date().toISOString(),
    database: {
      queryOptimization: 75 + Math.random() * 20,
      indexUsage: 80 + Math.random() * 15,
      cacheHitRate: 85 + Math.random() * 10,
      connectionPool: 70 + Math.random() * 25,
      slowQueries: Math.floor(Math.random() * 5),
      deadlockCount: Math.floor(Math.random() * 2)
    },
    api: {
      responseTime: 100 + Math.random() * 200,
      throughput: 500 + Math.random() * 1000,
      errorRate: Math.random() * 2,
      compressionRate: 70 + Math.random() * 25,
      cacheHitRate: 60 + Math.random() * 30,
      activeConnections: 50 + Math.floor(Math.random() * 100)
    },
    frontend: {
      loadTime: 1.5 + Math.random() * 2,
      firstContentfulPaint: 0.8 + Math.random() * 1.2,
      largestContentfulPaint: 2 + Math.random() * 2,
      cumulativeLayoutShift: Math.random() * 0.3,
      firstInputDelay: 50 + Math.random() * 100,
      totalBlockingTime: 100 + Math.random() * 200
    },
    infrastructure: {
      cpuOptimization: 60 + Math.random() * 30,
      memoryUsage: 50 + Math.random() * 40,
      diskIO: 70 + Math.random() * 20,
      networkLatency: 20 + Math.random() * 60,
      diskUsage: 60 + Math.random() * 30,
      networkBandwidth: 40 + Math.random() * 50
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
    if (!['admin', 'moderator'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || 'current'
    const category = searchParams.get('category')

    let metrics
    
    if (timeframe === 'current') {
      metrics = generatePerformanceMetrics()
    } else {
      // 生成历史数据
      const points = timeframe === 'hour' ? 12 : timeframe === 'day' ? 24 : 7
      metrics = Array.from({ length: points }, (_, i) => {
        const data = generatePerformanceMetrics()
        data.timestamp = new Date(Date.now() - i * (timeframe === 'hour' ? 5 * 60 * 1000 : timeframe === 'day' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000)).toISOString()
        return data
      }).reverse()
    }

    // 如果指定了类别，只返回该类别的数据
    if (category && metrics && !Array.isArray(metrics)) {
      metrics = { [category]: metrics[category as keyof typeof metrics] }
    }

    const response = {
      success: true,
      data: metrics,
      timeframe,
      category: category || 'all',
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching performance metrics:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch performance metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
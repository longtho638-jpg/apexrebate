import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 模拟系统指标数据
const generateSystemMetrics = () => {
  const now = new Date()
  
  return {
    timestamp: now.toISOString(),
    cpu: {
      usage: 20 + Math.random() * 60, // 20-80%
      cores: 8,
      temperature: 45 + Math.random() * 25 // 45-70°C
    },
    memory: {
      used: 4 + Math.random() * 8, // 4-12GB
      total: 16,
      percentage: (4 + Math.random() * 8) / 16 * 100
    },
    disk: {
      used: 100 + Math.random() * 200, // 100-300GB
      total: 500,
      percentage: (100 + Math.random() * 200) / 500 * 100
    },
    network: {
      inbound: Math.random() * 1000, // KB/s
      outbound: Math.random() * 1000, // KB/s
      latency: 10 + Math.random() * 40 // 10-50ms
    },
    database: {
      connections: 5 + Math.floor(Math.random() * 25), // 5-30 connections
      queryTime: 20 + Math.random() * 80, // 20-100ms
      cacheHit: 75 + Math.random() * 20 // 75-95%
    },
    api: {
      requests: 50 + Math.floor(Math.random() * 300), // 50-350 requests/min
      responseTime: 50 + Math.random() * 150, // 50-200ms
      errorRate: Math.random() * 3 // 0-3%
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

    // 检查用户是否有管理员权限
    const userRole = session.user?.role || 'user'
    if (!['admin', 'moderator'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || 'current'
    
    let metrics
    
    switch (timeframe) {
      case 'current':
        metrics = generateSystemMetrics()
        break
      case 'hour':
        // 生成过去1小时的数据点
        metrics = Array.from({ length: 12 }, (_, i) => {
          const data = generateSystemMetrics()
          data.timestamp = new Date(Date.now() - i * 5 * 60 * 1000).toISOString()
          return data
        }).reverse()
        break
      case 'day':
        // 生成过去24小时的数据点
        metrics = Array.from({ length: 24 }, (_, i) => {
          const data = generateSystemMetrics()
          data.timestamp = new Date(Date.now() - i * 60 * 60 * 1000).toISOString()
          return data
        }).reverse()
        break
      default:
        metrics = generateSystemMetrics()
    }

    // 添加系统健康状态
    const healthStatus = {
      status: 'healthy',
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      lastRestart: new Date(Date.now() - process.uptime() * 1000).toISOString()
    }

    const response = {
      success: true,
      data: metrics,
      health: healthStatus,
      timestamp: new Date().toISOString()
    }

    // 添加缓存头
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=30', // 30秒缓存
    })

    return NextResponse.json(response, { headers })
  } catch (error) {
    console.error('Error fetching system metrics:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch system metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// 支持POST请求来触发特定的系统检查
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    let result
    
    switch (action) {
      case 'health_check':
        result = {
          status: 'healthy',
          checks: {
            database: 'ok',
            redis: 'ok',
            external_apis: 'ok'
          },
          timestamp: new Date().toISOString()
        }
        break
      case 'performance_test':
        result = {
          test_duration: '5s',
          requests_per_second: 1000 + Math.floor(Math.random() * 500),
          average_response_time: 50 + Math.random() * 50,
          success_rate: 99 + Math.random(),
          timestamp: new Date().toISOString()
        }
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      action,
      result,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in POST /api/monitoring/system-metrics:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
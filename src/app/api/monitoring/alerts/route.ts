import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 模拟警报数据
const generateAlerts = () => {
  const alerts = [
    {
      id: '1',
      level: 'critical' as const,
      message: 'CPU使用率超过90%',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      resolved: false,
      source: 'system_monitor',
      details: {
        current_value: 92,
        threshold: 90,
        duration: '5分钟'
      }
    },
    {
      id: '2',
      level: 'warning' as const,
      message: '内存使用率较高',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      resolved: false,
      source: 'system_monitor',
      details: {
        current_value: 78,
        threshold: 75,
        duration: '15分钟'
      }
    },
    {
      id: '3',
      level: 'info' as const,
      message: '数据库备份完成',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      resolved: true,
      source: 'backup_system',
      details: {
        backup_size: '2.3GB',
        duration: '12分钟'
      }
    },
    {
      id: '4',
      level: 'warning' as const,
      message: 'API响应时间增加',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      resolved: true,
      source: 'api_monitor',
      details: {
        current_response_time: 350,
        threshold: 300,
        affected_endpoints: ['/api/dashboard', '/api/analytics']
      }
    }
  ]

  return alerts
}

export async function GET(request: NextRequest) {
  try {
    // 验证用户权限
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 检查用户权限
    const userRole = session.user?.role || 'user'
    if (!['admin', 'moderator'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level')
    const resolved = searchParams.get('resolved')
    const limit = parseInt(searchParams.get('limit') || '50')

    let alerts = generateAlerts()

    // 过滤警报
    if (level) {
      alerts = alerts.filter(alert => alert.level === level)
    }
    
    if (resolved !== null) {
      const isResolved = resolved === 'true'
      alerts = alerts.filter(alert => alert.resolved === isResolved)
    }

    // 限制返回数量
    alerts = alerts.slice(0, limit)

    // 按时间戳排序
    alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    const response = {
      success: true,
      data: alerts,
      summary: {
        total: alerts.length,
        critical: alerts.filter(a => a.level === 'critical').length,
        warning: alerts.filter(a => a.level === 'warning').length,
        info: alerts.filter(a => a.level === 'info').length,
        unresolved: alerts.filter(a => !a.resolved).length
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch alerts',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// 创建新警报
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { level, message, source, details } = body

    // 验证必需字段
    if (!level || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: level, message' },
        { status: 400 }
      )
    }

    // 验证警报级别
    const validLevels = ['critical', 'warning', 'info']
    if (!validLevels.includes(level)) {
      return NextResponse.json(
        { error: 'Invalid alert level. Must be: critical, warning, or info' },
        { status: 400 }
      )
    }

    // 创建新警报
    const newAlert = {
      id: Date.now().toString(),
      level,
      message,
      timestamp: new Date().toISOString(),
      resolved: false,
      source: source || 'manual',
      details: details || {}
    }

    // 这里应该将警报保存到数据库
    // await db.alert.create({ data: newAlert })

    return NextResponse.json({
      success: true,
      data: newAlert,
      message: 'Alert created successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error creating alert:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create alert',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// 更新警报状态
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { alertId, resolved } = body

    if (!alertId || resolved === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: alertId, resolved' },
        { status: 400 }
      )
    }

    // 这里应该更新数据库中的警报状态
    // await db.alert.update({ 
    //   where: { id: alertId }, 
    //   data: { resolved, resolvedAt: resolved ? new Date() : null }
    // })

    return NextResponse.json({
      success: true,
      message: `Alert ${alertId} marked as ${resolved ? 'resolved' : 'unresolved'}`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error updating alert:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update alert',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
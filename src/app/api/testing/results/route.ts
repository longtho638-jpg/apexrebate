import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface TestResult {
  id: string
  suiteId: string
  testName: string
  status: 'passed' | 'failed' | 'skipped'
  duration: number
  error?: string
  timestamp: string
  metadata?: Record<string, any>
}

// 生成测试结果数据
const generateTestResults = (suiteId?: string): TestResult[] => {
  const baseResults: TestResult[] = [
    {
      id: '1',
      suiteId: '1',
      testName: 'User authentication test',
      status: 'passed',
      duration: 120,
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      metadata: {
        browser: 'chrome',
        version: '120.0.0',
        platform: 'linux'
      }
    },
    {
      id: '2',
      suiteId: '1',
      testName: 'Data validation test',
      status: 'failed',
      duration: 85,
      error: 'Expected value to be truthy',
      timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      metadata: {
        assertion: 'expect(user.email).to.be.truthy',
        actual: 'null',
        expected: 'truthy'
      }
    },
    {
      id: '3',
      suiteId: '1',
      testName: 'Password encryption test',
      status: 'passed',
      duration: 45,
      timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString()
    },
    {
      id: '4',
      suiteId: '2',
      testName: 'API integration test',
      status: 'failed',
      duration: 230,
      error: 'Request timeout after 5000ms',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      metadata: {
        endpoint: '/api/users',
        method: 'POST',
        statusCode: 408
      }
    },
    {
      id: '5',
      suiteId: '2',
      testName: 'Database connection test',
      status: 'passed',
      duration: 156,
      timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString()
    },
    {
      id: '6',
      suiteId: '3',
      testName: 'User registration flow',
      status: 'passed',
      duration: 1250,
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      metadata: {
        steps: ['navigate to register', 'fill form', 'submit', 'verify email'],
        screenshots: ['register.png', 'confirmation.png']
      }
    },
    {
      id: '7',
      suiteId: '3',
      testName: 'Login flow test',
      status: 'passed',
      duration: 890,
      timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString()
    }
  ]

  if (suiteId) {
    return baseResults.filter(result => result.suiteId === suiteId)
  }

  return baseResults
}

export async function GET(request: NextRequest) {
  try {
    // 验证用户权限
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = session.user?.role || 'user'
    if (!['admin', 'moderator', 'developer'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const suiteId = searchParams.get('suiteId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    let testResults = generateTestResults(suiteId || undefined)

    // 过滤结果
    if (status) {
      testResults = testResults.filter(result => result.status === status)
    }

    // 限制返回数量
    testResults = testResults.slice(0, limit)

    // 按时间戳排序
    testResults.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // 计算统计信息
    const stats = {
      total: testResults.length,
      byStatus: {
        passed: testResults.filter(r => r.status === 'passed').length,
        failed: testResults.filter(r => r.status === 'failed').length,
        skipped: testResults.filter(r => r.status === 'skipped').length
      },
      averageDuration: testResults.reduce((acc, r) => acc + r.duration, 0) / testResults.length,
      totalDuration: testResults.reduce((acc, r) => acc + r.duration, 0)
    }

    const response = {
      success: true,
      data: testResults,
      stats,
      filters: { suiteId, status, limit },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching test results:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch test results',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// 添加新的测试结果
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { suiteId, testName, status, duration, error, metadata } = body

    if (!suiteId || !testName || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: suiteId, testName, status' },
        { status: 400 }
      )
    }

    const validStatuses = ['passed', 'failed', 'skipped']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // 创建新测试结果
    const newResult: TestResult = {
      id: Date.now().toString(),
      suiteId,
      testName,
      status,
      duration: duration || 0,
      error,
      timestamp: new Date().toISOString(),
      metadata
    }

    // 这里应该保存到数据库
    // await db.testResult.create({ data: newResult })

    return NextResponse.json({
      success: true,
      data: newResult,
      message: 'Test result recorded successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error creating test result:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create test result',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
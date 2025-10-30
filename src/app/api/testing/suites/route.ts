import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface TestSuite {
  id: string
  name: string
  type: 'unit' | 'integration' | 'e2e' | 'performance' | 'security' | 'accessibility'
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped'
  duration: number
  tests: {
    total: number
    passed: number
    failed: number
    skipped: number
  }
  coverage?: number
  lastRun: string
  description?: string
}

// 生成测试套件数据
const generateTestSuites = (): TestSuite[] => {
  return [
    {
      id: '1',
      name: '单元测试套件',
      type: 'unit',
      status: 'passed',
      duration: 120,
      tests: { total: 150, passed: 148, failed: 2, skipped: 0 },
      coverage: 85,
      lastRun: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      description: '测试独立的函数和组件'
    },
    {
      id: '2',
      name: '集成测试套件',
      type: 'integration',
      status: 'failed',
      duration: 300,
      tests: { total: 45, passed: 42, failed: 3, skipped: 0 },
      coverage: 72,
      lastRun: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      description: '测试模块间的集成'
    },
    {
      id: '3',
      name: 'E2E测试套件',
      type: 'e2e',
      status: 'running',
      duration: 0,
      tests: { total: 25, passed: 18, failed: 0, skipped: 0 },
      coverage: 65,
      lastRun: new Date().toISOString(),
      description: '端到端用户流程测试'
    },
    {
      id: '4',
      name: '性能测试套件',
      type: 'performance',
      status: 'pending',
      duration: 0,
      tests: { total: 15, passed: 0, failed: 0, skipped: 0 },
      coverage: 0,
      lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      description: '应用性能和负载测试'
    },
    {
      id: '5',
      name: '安全测试套件',
      type: 'security',
      status: 'passed',
      duration: 180,
      tests: { total: 30, passed: 30, failed: 0, skipped: 0 },
      coverage: 78,
      lastRun: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      description: '安全漏洞和渗透测试'
    },
    {
      id: '6',
      name: '可访问性测试套件',
      type: 'accessibility',
      status: 'skipped',
      duration: 0,
      tests: { total: 20, passed: 0, failed: 0, skipped: 20 },
      coverage: 0,
      lastRun: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      description: 'WCAG可访问性标准测试'
    }
  ]
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
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    let testSuites = generateTestSuites()

    // 过滤测试套件
    if (type) {
      testSuites = testSuites.filter(suite => suite.type === type)
    }
    
    if (status) {
      testSuites = testSuites.filter(suite => suite.status === status)
    }

    // 计算统计信息
    const stats = {
      total: testSuites.length,
      byType: {
        unit: testSuites.filter(s => s.type === 'unit').length,
        integration: testSuites.filter(s => s.type === 'integration').length,
        e2e: testSuites.filter(s => s.type === 'e2e').length,
        performance: testSuites.filter(s => s.type === 'performance').length,
        security: testSuites.filter(s => s.type === 'security').length,
        accessibility: testSuites.filter(s => s.type === 'accessibility').length
      },
      byStatus: {
        pending: testSuites.filter(s => s.status === 'pending').length,
        running: testSuites.filter(s => s.status === 'running').length,
        passed: testSuites.filter(s => s.status === 'passed').length,
        failed: testSuites.filter(s => s.status === 'failed').length,
        skipped: testSuites.filter(s => s.status === 'skipped').length
      },
      totalTests: testSuites.reduce((acc, suite) => acc + suite.tests.total, 0),
      totalPassed: testSuites.reduce((acc, suite) => acc + suite.tests.passed, 0),
      totalFailed: testSuites.reduce((acc, suite) => acc + suite.tests.failed, 0),
      totalSkipped: testSuites.reduce((acc, suite) => acc + suite.tests.skipped, 0),
      averageCoverage: testSuites.reduce((acc, suite) => acc + (suite.coverage || 0), 0) / testSuites.length
    }

    const response = {
      success: true,
      data: testSuites,
      stats,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching test suites:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch test suites',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// 创建新的测试套件
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = session.user?.role || 'user'
    if (!['admin', 'moderator'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { name, type, description } = body

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type' },
        { status: 400 }
      )
    }

    const validTypes = ['unit', 'integration', 'e2e', 'performance', 'security', 'accessibility']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // 创建新测试套件
    const newSuite: TestSuite = {
      id: Date.now().toString(),
      name,
      type,
      status: 'pending',
      duration: 0,
      tests: { total: 0, passed: 0, failed: 0, skipped: 0 },
      coverage: 0,
      lastRun: new Date().toISOString(),
      description
    }

    // 这里应该保存到数据库
    // await db.testSuite.create({ data: newSuite })

    return NextResponse.json({
      success: true,
      data: newSuite,
      message: 'Test suite created successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error creating test suite:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create test suite',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
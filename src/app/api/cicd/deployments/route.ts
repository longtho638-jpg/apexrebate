import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface Deployment {
  id: string
  version: string
  environment: 'development' | 'staging' | 'production'
  status: 'pending' | 'running' | 'success' | 'failed' | 'rolled_back'
  branch: string
  commit: string
  author: string
  startedAt: string
  completedAt?: string
  duration?: number
  changes: {
    added: number
    modified: number
    deleted: number
  }
  tests: {
    total: number
    passed: number
    failed: number
  }
}

// 生成部署数据
const generateDeployments = (): Deployment[] => {
  return [
    {
      id: '1',
      version: 'v2.1.0',
      environment: 'production',
      status: 'success',
      branch: 'main',
      commit: 'a1b2c3d4e5f6',
      author: 'John Doe',
      startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
      duration: 1800,
      changes: { added: 12, modified: 34, deleted: 5 },
      tests: { total: 285, passed: 276, failed: 9 }
    },
    {
      id: '2',
      version: 'v2.0.9',
      environment: 'staging',
      status: 'running',
      branch: 'develop',
      commit: 'e5f6g7h8i9j0',
      author: 'Jane Smith',
      startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      changes: { added: 8, modified: 22, deleted: 3 },
      tests: { total: 265, passed: 245, failed: 0 }
    },
    {
      id: '3',
      version: 'v2.0.8',
      environment: 'development',
      status: 'failed',
      branch: 'feature/new-ui',
      commit: 'i9j0k1l2m3n4',
      author: 'Bob Johnson',
      startedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      duration: 300,
      changes: { added: 15, modified: 28, deleted: 7 },
      tests: { total: 295, passed: 280, failed: 15 }
    },
    {
      id: '4',
      version: 'v2.0.7',
      environment: 'production',
      status: 'success',
      branch: 'main',
      commit: 'o5p6q7r8s9t0',
      author: 'Alice Wilson',
      startedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 5.5 * 60 * 60 * 1000).toISOString(),
      duration: 1800,
      changes: { added: 6, modified: 18, deleted: 2 },
      tests: { total: 275, passed: 270, failed: 5 }
    },
    {
      id: '5',
      version: 'v2.0.6',
      environment: 'staging',
      status: 'rolled_back',
      branch: 'hotfix/security-patch',
      commit: 'u1v2w3x4y5z6',
      author: 'Charlie Brown',
      startedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
      duration: 3600,
      changes: { added: 3, modified: 8, deleted: 1 },
      tests: { total: 255, passed: 250, failed: 5 }
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
    const environment = searchParams.get('environment')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')

    let deployments = generateDeployments()

    // 过滤部署
    if (environment) {
      deployments = deployments.filter(deployment => deployment.environment === environment)
    }
    
    if (status) {
      deployments = deployments.filter(deployment => deployment.status === status)
    }

    // 限制返回数量
    deployments = deployments.slice(0, limit)

    // 按开始时间排序
    deployments.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())

    // 计算统计信息
    const stats = {
      total: deployments.length,
      byEnvironment: {
        development: deployments.filter(d => d.environment === 'development').length,
        staging: deployments.filter(d => d.environment === 'staging').length,
        production: deployments.filter(d => d.environment === 'production').length
      },
      byStatus: {
        pending: deployments.filter(d => d.status === 'pending').length,
        running: deployments.filter(d => d.status === 'running').length,
        success: deployments.filter(d => d.status === 'success').length,
        failed: deployments.filter(d => d.status === 'failed').length,
        rolled_back: deployments.filter(d => d.status === 'rolled_back').length
      },
      totalTests: deployments.reduce((acc, d) => acc + d.tests.total, 0),
      totalPassed: deployments.reduce((acc, d) => acc + d.tests.passed, 0),
      totalFailed: deployments.reduce((acc, d) => acc + d.tests.failed, 0),
      averageDuration: deployments.reduce((acc, d) => acc + (d.duration || 0), 0) / deployments.filter(d => d.duration).length
    }

    const response = {
      success: true,
      data: deployments,
      stats,
      filters: { environment, status, limit },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching deployments:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch deployments',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// 创建新部署
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
    const { environment, branch, version } = body

    if (!environment) {
      return NextResponse.json(
        { error: 'Missing required field: environment' },
        { status: 400 }
      )
    }

    const validEnvironments = ['development', 'staging', 'production']
    if (!validEnvironments.includes(environment)) {
      return NextResponse.json(
        { error: `Invalid environment. Must be one of: ${validEnvironments.join(', ')}` },
        { status: 400 }
      )
    }

    // 创建新部署
    const newDeployment: Deployment = {
      id: Date.now().toString(),
      version: version || `v2.1.1-${Date.now().toString(36)}`,
      environment,
      status: 'pending',
      branch: branch || 'main',
      commit: 'deploy-' + Date.now().toString(36),
      author: session.user?.name || 'Unknown',
      startedAt: new Date().toISOString(),
      changes: { added: 0, modified: 0, deleted: 0 },
      tests: { total: 0, passed: 0, failed: 0 }
    }

    // 这里应该保存到数据库
    // await db.deployment.create({ data: newDeployment })

    // 异步执行部署
    executeDeployment(newDeployment.id).then(async (result) => {
      // 更新部署状态
      // await db.deployment.update({
      //   where: { id: newDeployment.id },
      //   data: {
      //     status: result.status,
      //     completedAt: result.completedAt,
      //     duration: result.duration,
      //     changes: result.changes,
      //     tests: result.tests
      //   }
      // })

      console.log(`Deployment ${newDeployment.id} completed:`, result)
    }).catch(error => {
      console.error(`Deployment ${newDeployment.id} failed:`, error)
    })

    return NextResponse.json({
      success: true,
      data: newDeployment,
      message: 'Deployment started successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error creating deployment:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create deployment',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// 模拟部署执行
async function executeDeployment(deploymentId: string) {
  // 模拟部署过程
  const duration = 5 + Math.random() * 10 // 5-15分钟
  
  await new Promise(resolve => setTimeout(resolve, duration * 1000))

  const success = Math.random() > 0.2 // 80% 成功率

  return {
    deploymentId,
    status: success ? 'success' : 'failed',
    completedAt: new Date().toISOString(),
    duration: Math.floor(duration * 60),
    changes: {
      added: Math.floor(Math.random() * 20),
      modified: Math.floor(Math.random() * 50),
      deleted: Math.floor(Math.random() * 10)
    },
    tests: {
      total: 200 + Math.floor(Math.random() * 100),
      passed: Math.floor((200 + Math.random() * 100) * (success ? 0.95 : 0.8)),
      failed: success ? Math.floor(Math.random() * 10) : Math.floor(Math.random() * 30)
    }
  }
}
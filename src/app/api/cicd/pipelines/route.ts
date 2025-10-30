import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface Pipeline {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive' | 'paused'
  lastRun: string
  nextRun?: string
  triggers: string[]
  stages: {
    name: string
    status: 'pending' | 'running' | 'success' | 'failed' | 'skipped'
    duration?: number
  }[]
}

// 生成管道数据
const generatePipelines = (): Pipeline[] => {
  return [
    {
      id: '1',
      name: '主应用部署管道',
      description: '主应用程序的完整CI/CD流程',
      status: 'active',
      lastRun: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      nextRun: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      triggers: ['push', 'pull_request', 'schedule'],
      stages: [
        { name: '代码检查', status: 'success', duration: 120 },
        { name: '单元测试', status: 'success', duration: 180 },
        { name: '构建镜像', status: 'success', duration: 300 },
        { name: '部署到Staging', status: 'success', duration: 240 },
        { name: '集成测试', status: 'running' },
        { name: '部署到Production', status: 'pending' }
      ]
    },
    {
      id: '2',
      name: '微服务部署管道',
      description: '微服务架构的独立部署流程',
      status: 'active',
      lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      triggers: ['push', 'manual'],
      stages: [
        { name: '服务构建', status: 'success', duration: 200 },
        { name: '容器化', status: 'success', duration: 150 },
        { name: '服务测试', status: 'success', duration: 180 },
        { name: '服务部署', status: 'success', duration: 120 }
      ]
    },
    {
      id: '3',
      name: '数据库迁移管道',
      description: '数据库schema迁移和备份流程',
      status: 'paused',
      lastRun: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      triggers: ['manual'],
      stages: [
        { name: '数据库备份', status: 'success', duration: 300 },
        { name: '迁移脚本', status: 'pending' },
        { name: '数据验证', status: 'pending' },
        { name: '性能测试', status: 'pending' }
      ]
    },
    {
      id: '4',
      name: '安全扫描管道',
      description: '安全漏洞扫描和合规检查',
      status: 'active',
      lastRun: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      triggers: ['push', 'schedule'],
      stages: [
        { name: '依赖扫描', status: 'success', duration: 90 },
        { name: '代码安全分析', status: 'success', duration: 120 },
        { name: '容器安全扫描', status: 'success', duration: 150 },
        { name: '合规检查', status: 'success', duration: 60 }
      ]
    },
    {
      id: '5',
      name: '性能测试管道',
      description: '负载测试和性能基准测试',
      status: 'inactive',
      lastRun: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      triggers: ['manual', 'schedule'],
      stages: [
        { name: '负载测试', status: 'pending' },
        { name: '压力测试', status: 'pending' },
        { name: '性能基准', status: 'pending' },
        { name: '报告生成', status: 'pending' }
      ]
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
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')

    let pipelines = generatePipelines()

    // 过滤管道
    if (status) {
      pipelines = pipelines.filter(pipeline => pipeline.status === status)
    }

    // 限制返回数量
    pipelines = pipelines.slice(0, limit)

    // 计算统计信息
    const stats = {
      total: pipelines.length,
      byStatus: {
        active: pipelines.filter(p => p.status === 'active').length,
        inactive: pipelines.filter(p => p.status === 'inactive').length,
        paused: pipelines.filter(p => p.status === 'paused').length
      },
      totalStages: pipelines.reduce((acc, p) => acc + p.stages.length, 0),
      runningStages: pipelines.reduce((acc, p) => 
        acc + p.stages.filter(s => s.status === 'running').length, 0
      )
    }

    const response = {
      success: true,
      data: pipelines,
      stats,
      filters: { status, limit },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching pipelines:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch pipelines',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// 创建新管道
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
    const { name, description, triggers, stages } = body

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description' },
        { status: 400 }
      )
    }

    // 创建新管道
    const newPipeline: Pipeline = {
      id: Date.now().toString(),
      name,
      description,
      status: 'inactive',
      lastRun: new Date().toISOString(),
      triggers: triggers || ['manual'],
      stages: stages || []
    }

    // 这里应该保存到数据库
    // await db.pipeline.create({ data: newPipeline })

    return NextResponse.json({
      success: true,
      data: newPipeline,
      message: 'Pipeline created successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error creating pipeline:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create pipeline',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
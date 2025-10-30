import { NextRequest, NextResponse } from 'next/server'

interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  steps: number
  uses: number
  rating: number
  tags: string[]
  features: string[]
  roi: string
  author: string
  preview?: string
  icon: string
  color: string
  isNew?: boolean
  isPopular?: boolean
  config?: any
}

const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: '1',
    name: '智能返佣计算系统',
    description: '自动化处理多平台返佣计算，支持实时数据同步和智能分润算法',
    category: '返佣管理',
    difficulty: 'intermediate',
    estimatedTime: '2-3天',
    steps: 8,
    uses: 1247,
    rating: 4.8,
    tags: ['返佣', '计算', '自动化', '分润'],
    features: [
      '多平台数据集成',
      '实时计算引擎',
      '智能分润算法',
      '自动报表生成',
      '异常监控告警'
    ],
    roi: '300%',
    author: 'ApexRebate Team',
    icon: 'DollarSign',
    color: 'text-green-600',
    isPopular: true,
    config: {
      steps: [
        {
          id: 'step-1',
          type: 'api',
          name: '获取交易数据',
          config: {
            url: '/api/trading/data',
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          }
        },
        {
          id: 'step-2',
          type: 'data',
          name: '数据清洗处理',
          config: {
            transformations: ['filter', 'normalize', 'validate']
          }
        },
        {
          id: 'step-3',
          type: 'calculation',
          name: '计算返佣金额',
          config: {
            formula: 'amount * rate * tier_multiplier',
            variables: ['amount', 'rate', 'tier_multiplier']
          }
        }
      ]
    }
  },
  {
    id: '2',
    name: '用户生命周期管理',
    description: '从注册到活跃的全流程自动化，提升用户留存和转化率',
    category: '用户管理',
    difficulty: 'advanced',
    estimatedTime: '5-7天',
    steps: 12,
    uses: 892,
    rating: 4.6,
    tags: ['用户管理', '营销自动化', '留存', '转化'],
    features: [
      '智能用户画像',
      '个性化推荐',
      '自动化营销',
      '流失预警',
      'A/B测试'
    ],
    roi: '250%',
    author: 'Product Team',
    icon: 'Users',
    color: 'text-blue-600',
    isNew: true,
    config: {
      steps: [
        {
          id: 'step-1',
          type: 'api',
          name: '用户注册监听',
          config: {
            trigger: 'user.signup',
            endpoint: '/api/users'
          }
        },
        {
          id: 'step-2',
          type: 'data',
          name: '用户画像分析',
          config: {
            analysis: ['demographics', 'behavior', 'preferences']
          }
        }
      ]
    }
  },
  {
    id: '3',
    name: '风险控制监控系统',
    description: '实时监控交易风险，自动识别异常行为并触发预警机制',
    category: '风险控制',
    difficulty: 'advanced',
    estimatedTime: '7-10天',
    steps: 15,
    uses: 656,
    rating: 4.9,
    tags: ['风控', '监控', '预警', '安全'],
    features: [
      '实时风险监控',
      '智能异常检测',
      '自动处置机制',
      '风险分析报告',
      '合规检查'
    ],
    roi: '400%',
    author: 'Security Team',
    icon: 'Shield',
    color: 'text-red-600',
    isPopular: true,
    config: {
      steps: [
        {
          id: 'step-1',
          type: 'api',
          name: '实时数据采集',
          config: {
            sources: ['transactions', 'user_behavior', 'market_data']
          }
        }
      ]
    }
  },
  {
    id: '4',
    name: '数据同步与报表自动化',
    description: '多源数据自动同步，生成可视化报表和业务洞察',
    category: '数据分析',
    difficulty: 'beginner',
    estimatedTime: '1-2天',
    steps: 6,
    uses: 1823,
    rating: 4.5,
    tags: ['数据同步', '报表', 'BI', '可视化'],
    features: [
      '多数据源集成',
      '自动数据清洗',
      '可视化报表',
      '趋势分析',
      '定时推送'
    ],
    roi: '200%',
    author: 'Data Team',
    icon: 'BarChart3',
    color: 'text-purple-600',
    config: {
      steps: [
        {
          id: 'step-1',
          type: 'api',
          name: '数据源连接',
          config: {
            databases: ['postgresql', 'mysql', 'mongodb'],
            apis: ['internal', 'external']
          }
        }
      ]
    }
  },
  {
    id: '5',
    name: '智能通知系统',
    description: '多渠道通知发送，支持个性化消息和智能调度',
    category: '通知系统',
    difficulty: 'intermediate',
    estimatedTime: '2-3天',
    steps: 7,
    uses: 934,
    rating: 4.4,
    tags: ['通知', '消息', '邮件', '短信'],
    features: [
      '多渠道发送',
      '个性化消息',
      '智能调度',
      '发送统计',
      '失败重试'
    ],
    roi: '180%',
    author: 'Communication Team',
    icon: 'Bell',
    color: 'text-orange-600',
    config: {
      steps: [
        {
          id: 'step-1',
          type: 'notification',
          name: '消息模板处理',
          config: {
            templates: ['email', 'sms', 'push'],
            personalization: true
          }
        }
      ]
    }
  },
  {
    id: '6',
    name: 'API集成自动化',
    description: '第三方API集成，数据同步和业务流程自动化',
    category: 'API集成',
    difficulty: 'intermediate',
    estimatedTime: '3-4天',
    steps: 9,
    uses: 756,
    rating: 4.7,
    tags: ['API', '集成', '同步', '自动化'],
    features: [
      'RESTful API集成',
      '数据格式转换',
      '错误处理',
      '限流控制',
      '日志记录'
    ],
    roi: '220%',
    author: 'Integration Team',
    icon: 'Zap',
    color: 'text-yellow-600',
    isNew: true,
    config: {
      steps: [
        {
          id: 'step-1',
          type: 'api',
          name: '第三方API调用',
          config: {
            authentication: 'oauth2',
            rate_limit: '1000/hour'
          }
        }
      ]
    }
  }
]

// GET - 获取模板列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'popular'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    let filteredTemplates = [...WORKFLOW_TEMPLATES]

    // 筛选
    if (category && category !== 'all') {
      filteredTemplates = filteredTemplates.filter(template => 
        template.category === category
      )
    }

    if (difficulty && difficulty !== 'all') {
      filteredTemplates = filteredTemplates.filter(template => 
        template.difficulty === difficulty
      )
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredTemplates = filteredTemplates.filter(template =>
        template.name.toLowerCase().includes(searchLower) ||
        template.description.toLowerCase().includes(searchLower) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // 排序
    switch (sort) {
      case 'popular':
        filteredTemplates.sort((a, b) => b.uses - a.uses)
        break
      case 'rating':
        filteredTemplates.sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
        filteredTemplates.sort((a, b) => b.id.localeCompare(a.id))
        break
      case 'difficulty':
        const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 }
        filteredTemplates.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty])
        break
    }

    // 分页
    const total = filteredTemplates.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedTemplates = filteredTemplates.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: paginatedTemplates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      filters: {
        category,
        difficulty,
        search,
        sort
      }
    })

  } catch (error) {
    console.error('模板API错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// POST - 创建新模板
export async function POST(request: NextRequest) {
  try {
    const templateData = await request.json()
    
    // 验证必填字段
    const requiredFields = ['name', 'description', 'category', 'difficulty']
    for (const field of requiredFields) {
      if (!templateData[field]) {
        return NextResponse.json(
          { error: `缺少必填字段: ${field}` },
          { status: 400 }
        )
      }
    }

    // 创建新模板
    const newTemplate: WorkflowTemplate = {
      id: `template-${Date.now()}`,
      name: templateData.name,
      description: templateData.description,
      category: templateData.category,
      difficulty: templateData.difficulty,
      estimatedTime: templateData.estimatedTime || '待评估',
      steps: templateData.steps || 0,
      uses: 0,
      rating: 0,
      tags: templateData.tags || [],
      features: templateData.features || [],
      roi: templateData.roi || '待计算',
      author: templateData.author || '用户创建',
      icon: templateData.icon || 'Zap',
      color: templateData.color || 'text-blue-600',
      isNew: true,
      config: templateData.config || {}
    }

    // 在实际应用中，这里应该保存到数据库
    // await db.workflowTemplate.create({ data: newTemplate })

    return NextResponse.json({
      success: true,
      data: newTemplate,
      message: '模板创建成功'
    }, { status: 201 })

  } catch (error) {
    console.error('创建模板API错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
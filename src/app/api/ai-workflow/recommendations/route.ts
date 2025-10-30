import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

interface UserProfile {
  businessType: string
  teamSize: string
  technicalLevel: string
  primaryGoal: string
  currentChallenges: string
}

interface WorkflowRecommendation {
  id: string
  title: string
  description: string
  category: string
  complexity: 'low' | 'medium' | 'high'
  estimatedTime: string
  roi: string
  matchScore: number
  features: string[]
  steps: number
  reasoning: string
}

export async function POST(request: NextRequest) {
  try {
    const profile: UserProfile = await request.json()
    
    // 验证输入
    if (!profile.businessType || !profile.teamSize || !profile.technicalLevel || !profile.primaryGoal) {
      return NextResponse.json(
        { error: '缺少必要的用户信息' },
        { status: 400 }
      )
    }

    let aiRecommendations: WorkflowRecommendation[] = []

    try {
      // 尝试使用Z-AI SDK生成推荐
      const zai = await ZAI.create()
      
      const prompt = `
作为一个工作流自动化专家，基于以下用户画像，推荐最适合的工作流方案：

用户信息：
- 业务类型: ${profile.businessType}
- 团队规模: ${profile.teamSize}
- 技术水平: ${profile.technicalLevel}
- 主要目标: ${profile.primaryGoal}
- 当前挑战: ${profile.currentChallenges}

请生成3-4个工作流推荐，每个推荐包含：
1. 标题和描述
2. 复杂度等级 (low/medium/high)
3. 预计实施时间
4. 预期ROI
5. 匹配度评分 (0-100)
6. 核心功能列表
7. 步骤数量
8. 推荐理由

请以JSON格式返回，格式如下：
{
  "recommendations": [
    {
      "id": "1",
      "title": "推荐标题",
      "description": "详细描述",
      "category": "分类",
      "complexity": "medium",
      "estimatedTime": "2-3天",
      "roi": "300%",
      "matchScore": 95,
      "features": ["功能1", "功能2"],
      "steps": 8,
      "reasoning": "推荐理由"
    }
  ]
}
`

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: '你是一个专业的工作流自动化顾问，擅长根据用户需求推荐最佳解决方案。请始终以JSON格式返回结果。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })

      const aiResponse = completion.choices[0]?.message?.content
      
      if (aiResponse) {
        try {
          // 清理AI响应中的markdown代码块标记
          let cleanedResponse = aiResponse.trim()
          
          // 移除可能的markdown代码块标记
          if (cleanedResponse.startsWith('```json')) {
            cleanedResponse = cleanedResponse.replace(/```json\s*/, '').replace(/```\s*$/, '')
          } else if (cleanedResponse.startsWith('```')) {
            cleanedResponse = cleanedResponse.replace(/```\s*/, '').replace(/```\s*$/, '')
          }
          
          const parsedResponse = JSON.parse(cleanedResponse)
          aiRecommendations = parsedResponse.recommendations || []
        } catch (parseError) {
          console.error('AI响应解析失败:', parseError)
          console.error('原始AI响应:', aiResponse)
        }
      }
    } catch (aiError) {
      console.error('AI服务调用失败:', aiError)
    }

    // 如果AI推荐失败或为空，使用规则引擎作为降级方案
    if (aiRecommendations.length === 0) {
      aiRecommendations = generateRuleBasedRecommendations(profile)
    }

    return NextResponse.json({
      success: true,
      recommendations: aiRecommendations,
      profile: profile,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('工作流推荐API错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

function generateRuleBasedRecommendations(profile: UserProfile): WorkflowRecommendation[] {
  const recommendations: WorkflowRecommendation[] = []

  // 基于业务类型的推荐
  if (profile.businessType === 'trading' || profile.businessType === 'rebate') {
    recommendations.push({
      id: 'rebate-calc',
      title: '智能返佣计算工作流',
      description: '自动化处理多平台返佣计算，支持实时数据同步和智能分润',
      category: '返佣管理',
      complexity: profile.technicalLevel === 'beginner' ? 'low' : 'medium',
      estimatedTime: profile.technicalLevel === 'beginner' ? '3-4天' : '2-3天',
      roi: '300%',
      matchScore: 95,
      features: ['多平台集成', '实时计算', '智能分润', '自动报表'],
      steps: 8,
      reasoning: '根据您的交易平台业务，返佣计算是核心需求，此方案能显著提升效率'
    })
  }

  // 基于目标的推荐
  if (profile.primaryGoal === 'efficiency' || profile.primaryGoal === 'cost') {
    recommendations.push({
      id: 'data-sync',
      title: '数据同步与报表自动化',
      description: '多源数据自动同步，生成可视化报表和业务洞察',
      category: '数据分析',
      complexity: 'low',
      estimatedTime: '1-2天',
      roi: '200%',
      matchScore: 85,
      features: ['数据同步', '自动报表', '可视化图表', '趋势分析'],
      steps: 6,
      reasoning: '自动化数据处理能大幅提升工作效率，降低人工成本'
    })
  }

  // 基于团队规模的推荐
  if (profile.teamSize === '1-5' || profile.teamSize === '6-20') {
    recommendations.push({
      id: 'user-management',
      title: '用户生命周期管理',
      description: '从注册到活跃的全流程自动化，提升用户留存和转化率',
      category: '用户管理',
      complexity: 'medium',
      estimatedTime: '5-7天',
      roi: '250%',
      matchScore: 80,
      features: ['智能画像', '个性化推荐', '自动化营销', '流失预警'],
      steps: 12,
      reasoning: '对于中小团队，自动化用户管理能有效提升运营效率'
    })
  }

  // 基于技术水平的推荐
  if (profile.technicalLevel === 'advanced' || profile.technicalLevel === 'expert') {
    recommendations.push({
      id: 'risk-control',
      title: '风险控制监控系统',
      description: '实时监控交易风险，自动识别异常行为并触发预警机制',
      category: '风险控制',
      complexity: 'high',
      estimatedTime: '7-10天',
      roi: '400%',
      matchScore: 75,
      features: ['实时监控', '智能预警', '自动处置', '风险分析'],
      steps: 15,
      reasoning: '考虑到您的技术水平，复杂的风控系统能够带来更高的业务价值'
    })
  }

  // 确保至少有3个推荐
  if (recommendations.length < 3) {
    recommendations.push({
      id: 'notification',
      title: '智能通知系统',
      description: '多渠道通知发送，支持个性化消息和智能调度',
      category: '通知系统',
      complexity: 'low',
      estimatedTime: '2-3天',
      roi: '180%',
      matchScore: 70,
      features: ['多渠道发送', '个性化消息', '智能调度', '发送统计'],
      steps: 7,
      reasoning: '通知系统是业务自动化的基础组件，适用性广泛'
    })
  }

  return recommendations.slice(0, 4).map((rec, index) => ({
    ...rec,
    id: rec.id || `rule-${index + 1}`,
    matchScore: rec.matchScore - (index * 5) // 略微降低后续推荐的匹配度
  }))
}

export async function GET() {
  return NextResponse.json({
    message: 'AI工作流推荐API运行正常',
    version: '1.0.0',
    endpoints: {
      POST: '/api/ai-workflow/recommendations',
      description: '根据用户画像生成工作流推荐'
    }
  })
}
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Bot, 
  Sparkles, 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Puzzle,
  BarChart3,
  Loader2
} from 'lucide-react'

interface AIRecommendation {
  id: string
  title: string
  description: string
  category: string
  complexity: string
  estimatedTime: string
  roi: string
  matchScore: number
  features: string[]
  steps: number
}

export default function SimpleAIWorkflowDemo() {
  const [profile, setProfile] = useState({
    businessType: '',
    teamSize: '',
    technicalLevel: '',
    primaryGoal: '',
    currentChallenges: ''
  })
  
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const generateRecommendations = async () => {
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/ai-workflow/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.recommendations) {
          setRecommendations(data.recommendations)
        } else {
          setRecommendations(getFallbackRecommendations())
        }
      } else {
        setRecommendations(getFallbackRecommendations())
      }
    } catch (error) {
      console.error('AI推荐失败:', error)
      setRecommendations(getFallbackRecommendations())
    }
    
    setIsGenerating(false)
    setShowResults(true)
  }

  const getFallbackRecommendations = (): AIRecommendation[] => {
    return [
      {
        id: '1',
        title: '智能返佣计算工作流',
        description: '自动化处理多平台返佣计算，支持实时数据同步和智能分润',
        category: '返佣管理',
        complexity: 'medium',
        estimatedTime: '2-3天',
        roi: '300%',
        matchScore: 95,
        features: ['多平台集成', '实时计算', '智能分润', '自动报表'],
        steps: 8
      },
      {
        id: '2',
        title: '用户生命周期管理',
        description: '从注册到活跃的全流程自动化，提升用户留存和转化率',
        category: '用户管理',
        complexity: 'high',
        estimatedTime: '5-7天',
        roi: '250%',
        matchScore: 88,
        features: ['智能画像', '个性化推荐', '自动化营销', '流失预警'],
        steps: 12
      }
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
              <Bot className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            AI增强版可视化工作流构建器
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            通过人工智能技术，将复杂的业务流程转化为可视化的工作流
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：用户画像输入 */}
          <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-500" />
                AI智能推荐
              </CardTitle>
              <CardDescription>
                告诉我们您的需求，AI将为您推荐最适合的工作流方案
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">业务类型</label>
                  <Select value={profile.businessType} onValueChange={(value) => setProfile(prev => ({ ...prev, businessType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择业务类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trading">交易平台</SelectItem>
                      <SelectItem value="rebate">返佣服务</SelectItem>
                      <SelectItem value="fintech">金融科技</SelectItem>
                      <SelectItem value="ecommerce">电商平台</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">团队规模</label>
                  <Select value={profile.teamSize} onValueChange={(value) => setProfile(prev => ({ ...prev, teamSize: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择团队规模" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-5">1-5人</SelectItem>
                      <SelectItem value="6-20">6-20人</SelectItem>
                      <SelectItem value="21-50">21-50人</SelectItem>
                      <SelectItem value="50+">50人以上</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">技术水平</label>
                  <Select value={profile.technicalLevel} onValueChange={(value) => setProfile(prev => ({ ...prev, technicalLevel: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择技术水平" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">初学者</SelectItem>
                      <SelectItem value="intermediate">中级</SelectItem>
                      <SelectItem value="advanced">高级</SelectItem>
                      <SelectItem value="expert">专家</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">主要目标</label>
                  <Select value={profile.primaryGoal} onValueChange={(value) => setProfile(prev => ({ ...prev, primaryGoal: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择主要目标" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="efficiency">提升效率</SelectItem>
                      <SelectItem value="cost">降低成本</SelectItem>
                      <SelectItem value="revenue">增加收入</SelectItem>
                      <SelectItem value="compliance">合规管理</SelectItem>
                      <SelectItem value="scaling">业务扩展</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">当前挑战</label>
                  <Textarea
                    placeholder="请描述您当前面临的主要业务挑战..."
                    value={profile.currentChallenges}
                    onChange={(e) => setProfile(prev => ({ ...prev, currentChallenges: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>

              <Button 
                onClick={generateRecommendations}
                disabled={!profile.businessType || !profile.teamSize || !profile.technicalLevel || !profile.primaryGoal || isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    AI正在分析您的需求...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    获取AI推荐
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* 右侧：推荐结果 */}
          <div className="space-y-6">
            {showResults && recommendations.length > 0 && (
              <>
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">为您推荐的AI工作流方案</h3>
                  <p className="text-muted-foreground">基于您的需求分析，我们为您找到了最佳方案</p>
                </div>

                {recommendations.map((rec) => (
                  <Card key={rec.id} className="bg-white/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{rec.title}</CardTitle>
                          <CardDescription className="text-sm">{rec.category}</CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-semibold text-green-600">{rec.matchScore}%</span>
                          </div>
                          <p className="text-xs text-muted-foreground">匹配度</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <Badge variant="secondary">
                          {rec.complexity === 'low' ? '简单' : rec.complexity === 'medium' ? '中等' : '复杂'}
                        </Badge>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {rec.estimatedTime}
                        </div>
                        <div className="flex items-center gap-1 text-green-600 font-semibold">
                          <TrendingUp className="h-3 w-3" />
                          ROI {rec.roi}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">核心功能</p>
                        <div className="flex flex-wrap gap-1">
                          {rec.features.map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button size="sm" className="w-full">
                        选择此方案
                        <ArrowRight className="ml-2 h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}

            {!showResults && (
              <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Lightbulb className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-600 mb-2">准备获取AI推荐</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    完善左侧信息，AI将为您推荐最适合的工作流方案
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* 底部特性展示 */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-blue-100 rounded-lg w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Bot className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">AI智能推荐</h3>
              <p className="text-sm text-muted-foreground">
                基于用户画像智能推荐最适合的工作流方案
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-green-100 rounded-lg w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Puzzle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">可视化构建</h3>
              <p className="text-sm text-muted-foreground">
                拖拽式界面，无需编程知识即可创建复杂工作流
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-purple-100 rounded-lg w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">丰富模板库</h3>
              <p className="text-sm text-muted-foreground">
                20+预设模板，覆盖常见业务场景，即开即用
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
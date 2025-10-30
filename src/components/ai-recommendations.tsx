'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Bot, 
  Sparkles, 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Zap,
  BarChart3,
  Users,
  Shield,
  DollarSign,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface AIRecommendation {
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
  icon: React.ReactNode
  color: string
}

interface UserProfile {
  businessType: string
  teamSize: string
  technicalLevel: string
  primaryGoal: string
  currentChallenges: string
}

export function AIRecommendations() {
  const [profile, setProfile] = useState<UserProfile>({
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

      if (!response.ok) {
        throw new Error('推荐请求失败')
      }

      const data = await response.json()
      
      if (data.success && data.recommendations) {
        setRecommendations(data.recommendations)
      } else {
        // 使用降级方案
        const fallbackRecommendations = generateFallbackRecommendations()
        setRecommendations(fallbackRecommendations)
      }
    } catch (error) {
      console.error('AI推荐失败:', error)
      // 使用降级方案
      const fallbackRecommendations = generateFallbackRecommendations()
      setRecommendations(fallbackRecommendations)
    }
    
    setIsGenerating(false)
    setShowResults(true)
  }

  const generateFallbackRecommendations = (): AIRecommendation[] => {
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
        steps: 8,
        icon: <DollarSign className="h-5 w-5" />,
        color: 'text-green-600'
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
        steps: 12,
        icon: <Users className="h-5 w-5" />,
        color: 'text-blue-600'
      },
      {
        id: '3',
        title: '风险控制监控系统',
        description: '实时监控交易风险，自动识别异常行为并触发预警机制',
        category: '风险控制',
        complexity: 'high',
        estimatedTime: '7-10天',
        roi: '400%',
        matchScore: 82,
        features: ['实时监控', '智能预警', '自动处置', '风险分析'],
        steps: 15,
        icon: <Shield className="h-5 w-5" />,
        color: 'text-red-600'
      },
      {
        id: '4',
        title: '数据同步与报表自动化',
        description: '多源数据自动同步，生成可视化报表和业务洞察',
        category: '数据分析',
        complexity: 'low',
        estimatedTime: '1-2天',
        roi: '200%',
        matchScore: 78,
        features: ['数据同步', '自动报表', '可视化图表', '趋势分析'],
        steps: 6,
        icon: <BarChart3 className="h-5 w-5" />,
        color: 'text-purple-600'
      }
    ]
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getComplexityText = (complexity: string) => {
    switch (complexity) {
      case 'low': return '简单'
      case 'medium': return '中等'
      case 'high': return '复杂'
      default: return '未知'
    }
  }

  return (
    <div className="space-y-8">
      {/* 用户画像输入 */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      {/* 推荐结果 */}
      {showResults && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">为您推荐的AI工作流方案</h3>
            <p className="text-muted-foreground">基于您的需求分析，我们为您找到了以下最佳方案</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recommendations.map((rec) => (
              <Card key={rec.id} className="bg-white/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-opacity-10 ${rec.color.replace('text', 'bg')}`}>
                        {rec.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{rec.title}</CardTitle>
                        <CardDescription className="text-sm">{rec.category}</CardDescription>
                      </div>
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
                    <div className="flex items-center gap-1">
                      <Badge className={getComplexityColor(rec.complexity)}>
                        {getComplexityText(rec.complexity)}
                      </Badge>
                    </div>
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
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">匹配度</span>
                      <span className="font-semibold">{rec.matchScore}%</span>
                    </div>
                    <Progress value={rec.matchScore} className="h-2" />
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

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {rec.steps} 个步骤
                    </div>
                    <Button size="sm" className="gap-2">
                      选择此方案
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI洞察 */}
          <Card className="bg-gradient-to-r from-purple-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">AI洞察</h4>
                  <p className="text-sm text-purple-100 mb-3">
                    基于您的业务类型和技术水平，我们建议从"智能返佣计算工作流"开始。
                    这个方案匹配度最高，实施难度适中，能够快速为您带来价值。
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      <span>快速见效</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      <span>风险可控</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      <span>易于扩展</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
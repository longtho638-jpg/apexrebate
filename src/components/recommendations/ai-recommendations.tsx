'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Lightbulb, 
  TrendingUp, 
  Star, 
  X, 
  RefreshCw,
  ChevronRight,
  Brain,
  Target,
  Zap
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Recommendation {
  id: string
  type: 'feature' | 'content' | 'trading_pair' | 'strategy' | 'tool'
  title: string
  description: string
  url?: string
  confidence: number
  reason: string
  metadata: Record<string, any>
  createdAt: string
  expiresAt: string
}

interface AIRecommendationsProps {
  userId?: string
  maxItems?: number
  showType?: 'all' | 'feature' | 'content'
  className?: string
}

export default function AIRecommendations({ 
  userId, 
  maxItems = 3, 
  showType = 'all',
  className = ''
}: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const router = useRouter()

  // 获取推荐
  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/recommendations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations')
      }

      const result = await response.json()
      if (result.success) {
        let filteredRecs = result.data.recommendations
        
        // 根据类型过滤
        if (showType !== 'all') {
          filteredRecs = filteredRecs.filter((rec: Recommendation) => rec.type === showType)
        }

        // 过滤已忽略的推荐
        filteredRecs = filteredRecs.filter((rec: Recommendation) => !dismissed.has(rec.id))

        // 限制数量
        setRecommendations(filteredRecs.slice(0, maxItems))
      } else {
        setError(result.error || 'Failed to load recommendations')
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
      setError('Failed to load recommendations')
    } finally {
      setLoading(false)
    }
  }

  // 记录用户行为
  const recordBehavior = async (action: string, target: string, duration?: number) => {
    try {
      await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          target,
          duration,
          metadata: {
            timestamp: new Date().toISOString(),
            source: 'ai_recommendations_component'
          }
        })
      })
    } catch (error) {
      console.error('Error recording behavior:', error)
    }
  }

  // 处理推荐点击
  const handleRecommendationClick = (recommendation: Recommendation) => {
    recordBehavior('click', recommendation.url || recommendation.title)
    
    if (recommendation.url) {
      router.push(recommendation.url)
    }
  }

  // 忽略推荐
  const handleDismiss = (recommendationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    setDismissed(prev => new Set([...prev, recommendationId]))
    setRecommendations(prev => prev.filter(rec => rec.id !== recommendationId))
    
    recordBehavior('dismiss', recommendationId)
  }

  // 刷新推荐
  const handleRefresh = () => {
    recordBehavior('refresh', 'recommendations_panel')
    fetchRecommendations()
  }

  // 获取类型图标
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature':
        return <Zap className="h-4 w-4 text-blue-500" />
      case 'content':
        return <Lightbulb className="h-4 w-4 text-yellow-500" />
      case 'trading_pair':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'strategy':
        return <Target className="h-4 w-4 text-purple-500" />
      case 'tool':
        return <Star className="h-4 w-4 text-orange-500" />
      default:
        return <Brain className="h-4 w-4 text-gray-500" />
    }
  }

  // 获取类型标签
  const getTypeLabel = (type: string) => {
    const labels = {
      feature: '功能',
      content: '内容',
      trading_pair: '交易对',
      strategy: '策略',
      tool: '工具'
    }
    return labels[type as keyof typeof labels] || type
  }

  // 获取置信度颜色
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800'
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-100 text-gray-800'
  }

  // 组件挂载时获取推荐
  useEffect(() => {
    fetchRecommendations()
  }, [showType, maxItems])

  // 定期刷新推荐
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRecommendations()
    }, 5 * 60 * 1000) // 每5分钟刷新一次

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>AI 智能推荐</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(maxItems)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>AI 智能推荐</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-4">
            <p>推荐服务暂时不可用</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="mt-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              重试
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (recommendations.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>AI 智能推荐</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
          <CardDescription>
            基于您的使用习惯智能推荐
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>暂无推荐内容</p>
            <p className="text-sm text-gray-400 mt-2">
              多使用平台功能，我们将为您提供更精准的推荐
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>AI 智能推荐</span>
            <Badge variant="secondary" className="text-xs">
              Beta
            </Badge>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          基于您的使用习惯智能推荐
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
              onClick={() => handleRecommendationClick(recommendation)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(recommendation.type)}
                  <Badge variant="outline" className="text-xs">
                    {getTypeLabel(recommendation.type)}
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getConfidenceColor(recommendation.confidence)}`}
                  >
                    {Math.round(recommendation.confidence * 100)}% 匹配
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleDismiss(recommendation.id, e)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <h3 className="font-semibold text-sm mb-1 group-hover:text-blue-600 transition-colors">
                {recommendation.title}
              </h3>
              
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                {recommendation.description}
              </p>
              
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 italic">
                  {recommendation.reason}
                </p>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>推荐基于AI分析您的使用模式</span>
            <Button 
              variant="link" 
              size="sm" 
              className="text-xs p-0 h-auto"
              onClick={() => recordBehavior('view', 'recommendation_settings')}
            >
              推荐设置
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
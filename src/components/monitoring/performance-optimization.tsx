'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Zap, 
  Database, 
  Globe, 
  Cpu,
  Gauge,
  HardDrive,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Settings,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react'

interface PerformanceMetrics {
  timestamp: string
  database: {
    queryOptimization: number
    indexUsage: number
    cacheHitRate: number
    connectionPool: number
  }
  api: {
    responseTime: number
    throughput: number
    errorRate: number
    compressionRate: number
  }
  frontend: {
    loadTime: number
    firstContentfulPaint: number
    largestContentfulPaint: number
    cumulativeLayoutShift: number
  }
  infrastructure: {
    cpuOptimization: number
    memoryUsage: number
    diskIO: number
    networkLatency: number
  }
}

interface OptimizationRecommendation {
  id: string
  category: 'database' | 'api' | 'frontend' | 'infrastructure'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  expectedImprovement: string
  implementationTime: string
  status: 'pending' | 'in_progress' | 'completed'
}

export default function PerformanceOptimization() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [lastOptimization, setLastOptimization] = useState<Date | null>(null)

  const fetchPerformanceMetrics = async () => {
    try {
      const response = await fetch('/api/monitoring/performance-metrics')
      if (response.ok) {
        const data = await response.json()
        setMetrics(data.data)
      } else {
        // 模拟数据
        const mockMetrics: PerformanceMetrics = {
          timestamp: new Date().toISOString(),
          database: {
            queryOptimization: 75 + Math.random() * 20,
            indexUsage: 80 + Math.random() * 15,
            cacheHitRate: 85 + Math.random() * 10,
            connectionPool: 70 + Math.random() * 25
          },
          api: {
            responseTime: 100 + Math.random() * 200,
            throughput: 500 + Math.random() * 1000,
            errorRate: Math.random() * 2,
            compressionRate: 70 + Math.random() * 25
          },
          frontend: {
            loadTime: 1.5 + Math.random() * 2,
            firstContentfulPaint: 0.8 + Math.random() * 1.2,
            largestContentfulPaint: 2 + Math.random() * 2,
            cumulativeLayoutShift: Math.random() * 0.3
          },
          infrastructure: {
            cpuOptimization: 60 + Math.random() * 30,
            memoryUsage: 50 + Math.random() * 40,
            diskIO: 70 + Math.random() * 20,
            networkLatency: 20 + Math.random() * 60
          }
        }
        setMetrics(mockMetrics)
      }
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/monitoring/performance-recommendations')
      if (response.ok) {
        const data = await response.json()
        setRecommendations(data.data)
      } else {
        // 模拟推荐数据
        const mockRecommendations: OptimizationRecommendation[] = [
          {
            id: '1',
            category: 'database',
            priority: 'high',
            title: '优化数据库查询索引',
            description: '为频繁查询的字段添加复合索引，可以显著提升查询性能',
            expectedImprovement: '查询速度提升40-60%',
            implementationTime: '30分钟',
            status: 'pending'
          },
          {
            id: '2',
            category: 'api',
            priority: 'medium',
            title: '启用API响应压缩',
            description: '启用Gzip压缩可以减少传输数据量，提升响应速度',
            expectedImprovement: '传输时间减少30-50%',
            implementationTime: '15分钟',
            status: 'pending'
          },
          {
            id: '3',
            category: 'frontend',
            priority: 'high',
            title: '优化图片资源加载',
            description: '使用WebP格式和懒加载技术减少页面加载时间',
            expectedImprovement: '页面加载速度提升25-40%',
            implementationTime: '1小时',
            status: 'pending'
          }
        ]
        setRecommendations(mockRecommendations)
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error)
    }
  }

  const runOptimization = async (recommendationId: string) => {
    setIsOptimizing(true)
    try {
      const response = await fetch('/api/monitoring/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recommendationId }),
      })

      if (response.ok) {
        const result = await response.json()
        // 更新推荐状态
        setRecommendations(prev => 
          prev.map(rec => 
            rec.id === recommendationId 
              ? { ...rec, status: 'completed' as const }
              : rec
          )
        )
        setLastOptimization(new Date())
        // 刷新指标
        await fetchPerformanceMetrics()
      }
    } catch (error) {
      console.error('Failed to run optimization:', error)
    } finally {
      setIsOptimizing(false)
    }
  }

  const runAutoOptimization = async () => {
    setIsOptimizing(true)
    try {
      const response = await fetch('/api/monitoring/auto-optimize', {
        method: 'POST',
      })

      if (response.ok) {
        const result = await response.json()
        setLastOptimization(new Date())
        await fetchPerformanceMetrics()
        await fetchRecommendations()
      }
    } catch (error) {
      console.error('Failed to run auto optimization:', error)
    } finally {
      setIsOptimizing(false)
    }
  }

  useEffect(() => {
    fetchPerformanceMetrics()
    fetchRecommendations()
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'in_progress': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
      default: return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">加载性能数据...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 头部控制 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">性能优化</h2>
          <p className="text-muted-foreground">
            监控和优化系统性能，提升用户体验
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {lastOptimization && (
            <span className="text-sm text-muted-foreground">
              最后优化: {lastOptimization.toLocaleTimeString()}
            </span>
          )}
          <Button
            onClick={runAutoOptimization}
            disabled={isOptimizing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isOptimizing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            自动优化
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              fetchPerformanceMetrics()
              fetchRecommendations()
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新数据
          </Button>
        </div>
      </div>

      {/* 性能概览 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">数据库性能</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.database.cacheHitRate.toFixed(1)}%
            </div>
            <Progress value={metrics?.database.cacheHitRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              缓存命中率
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API响应时间</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.api.responseTime.toFixed(0)}ms
            </div>
            <div className="flex items-center mt-2">
              {metrics?.api.responseTime < 200 ? (
                <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <TrendingUp className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span className="text-xs text-muted-foreground">
                {metrics?.api.throughput.toFixed(0)} req/s
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">前端加载时间</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.frontend.loadTime.toFixed(1)}s
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              FCP: {metrics?.frontend.firstContentfulPaint.toFixed(1)}s
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">系统资源</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.infrastructure.cpuOptimization.toFixed(1)}%
            </div>
            <Progress value={metrics?.infrastructure.cpuOptimization} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              CPU优化率
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 详细优化建议 */}
      <Tabs defaultValue="recommendations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recommendations">优化建议</TabsTrigger>
          <TabsTrigger value="database">数据库优化</TabsTrigger>
          <TabsTrigger value="api">API优化</TabsTrigger>
          <TabsTrigger value="frontend">前端优化</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>智能优化建议</CardTitle>
              <CardDescription>
                基于系统性能分析生成的个性化优化建议
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map(recommendation => (
                  <div key={recommendation.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(recommendation.status)}
                          <h3 className="font-semibold">{recommendation.title}</h3>
                          <Badge className={getPriorityColor(recommendation.priority)}>
                            {recommendation.priority}
                          </Badge>
                          <Badge variant="outline">{recommendation.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {recommendation.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>预期提升: {recommendation.expectedImprovement}</span>
                          <span>实施时间: {recommendation.implementationTime}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        {recommendation.status === 'completed' ? (
                          <Badge variant="default">已完成</Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => runOptimization(recommendation.id)}
                            disabled={isOptimizing}
                          >
                            {isOptimizing ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>查询优化</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>查询优化率</span>
                    <span>{metrics?.database.queryOptimization.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics?.database.queryOptimization} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>索引使用率</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>索引使用率</span>
                    <span>{metrics?.database.indexUsage.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics?.database.indexUsage} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>API性能指标</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>吞吐量</span>
                    <span>{metrics?.api.throughput.toFixed(0)} req/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>错误率</span>
                    <span>{metrics?.api.errorRate.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>压缩率</span>
                    <span>{metrics?.api.compressionRate.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="frontend" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>核心Web指标</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>LCP</span>
                    <span>{metrics?.frontend.largestContentfulPaint.toFixed(1)}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CLS</span>
                    <span>{metrics?.frontend.cumulativeLayoutShift.toFixed(3)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Activity, 
  Eye,
  MousePointer,
  Target,
  BarChart3,
  PieChart,
  Download,
  Calendar,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'

interface BusinessMetrics {
  revenue: {
    current: number
    previous: number
    growth: number
    target: number
    achievement: number
  }
  users: {
    total: number
    active: number
    new: number
    retention: number
  }
  conversions: {
    rate: number
    total: number
    value: number
    cost: number
    roi: number
  }
  engagement: {
    pageViews: number
    sessions: number
    bounceRate: number
    avgSessionDuration: number
  }
}

interface Report {
  id: string
  name: string
  type: 'daily' | 'weekly' | 'monthly' | 'custom'
  status: 'generating' | 'completed' | 'failed'
  generatedAt: string
  fileSize: number
  downloadUrl?: string
}

export default function BusinessAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`/api/analytics/business-metrics?period=${selectedPeriod}`)
      if (response.ok) {
        const data = await response.json()
        setMetrics(data.data)
      } else {
        // 模拟数据
        const mockMetrics: BusinessMetrics = {
          revenue: {
            current: 1250000,
            previous: 980000,
            growth: 27.6,
            target: 1500000,
            achievement: 83.3
          },
          users: {
            total: 45230,
            active: 12450,
            new: 3280,
            retention: 78.5
          },
          conversions: {
            rate: 3.8,
            total: 1847,
            value: 675,
            cost: 125,
            roi: 440
          },
          engagement: {
            pageViews: 2850000,
            sessions: 485000,
            bounceRate: 32.4,
            avgSessionDuration: 245
          }
        }
        setMetrics(mockMetrics)
      }
    } catch (error) {
      console.error('Failed to fetch business metrics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/analytics/reports')
      if (response.ok) {
        const data = await response.json()
        setReports(data.data)
      } else {
        // 模拟报告数据
        const mockReports: Report[] = [
          {
            id: '1',
            name: '月度业务报告 - 2024年1月',
            type: 'monthly',
            status: 'completed',
            generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            fileSize: 2.4,
            downloadUrl: '/reports/monthly-2024-01.pdf'
          },
          {
            id: '2',
            name: '周度分析报告 - 第3周',
            type: 'weekly',
            status: 'completed',
            generatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            fileSize: 1.2,
            downloadUrl: '/reports/weekly-w3.pdf'
          },
          {
            id: '3',
            name: '实时数据报告',
            type: 'daily',
            status: 'generating',
            generatedAt: new Date().toISOString(),
            fileSize: 0
          }
        ]
        setReports(mockReports)
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    }
  }

  const generateReport = async (type: string) => {
    setIsGeneratingReport(true)
    try {
      const response = await fetch('/api/analytics/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, period: selectedPeriod })
      })

      if (response.ok) {
        const newReport: Report = {
          id: Date.now().toString(),
          name: `${type === 'daily' ? '日报' : type === 'weekly' ? '周报' : '月报'} - ${new Date().toLocaleDateString()}`,
          type: type as any,
          status: 'generating',
          generatedAt: new Date().toISOString(),
          fileSize: 0
        }

        setReports(prev => [newReport, ...prev])
        
        // 模拟报告生成
        setTimeout(() => {
          setReports(prev => 
            prev.map(report => 
              report.id === newReport.id 
                ? { 
                    ...report, 
                    status: 'completed' as const,
                    fileSize: Math.random() * 3 + 0.5,
                    downloadUrl: `/reports/${report.id}.pdf`
                  }
                : report
            )
          )
          setIsGeneratingReport(false)
        }, 3000)
      }
    } catch (error) {
      console.error('Failed to generate report:', error)
      setIsGeneratingReport(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    fetchReports()
  }, [selectedPeriod])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('zh-CN').format(num)
  }

  const getTrendIcon = (value: number) => {
    return value >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    )
  }

  const getTrendColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'generating': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">加载业务分析数据...</span>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <AlertTriangle className="h-8 w-8 text-red-600" />
        <span className="ml-2">无法加载业务数据</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 头部控制 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">业务分析</h2>
          <p className="text-muted-foreground">
            智能业务数据分析和报告生成
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="7d">最近7天</option>
            <option value="30d">最近30天</option>
            <option value="90d">最近90天</option>
            <option value="1y">最近1年</option>
          </select>
          <Button
            variant="outline"
            onClick={() => {
              fetchMetrics()
              fetchReports()
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新数据
          </Button>
        </div>
      </div>

      {/* 核心业务指标 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">营业收入</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.revenue.current)}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              {getTrendIcon(metrics.revenue.growth)}
              <span className={getTrendColor(metrics.revenue.growth)}>
                {metrics.revenue.growth.toFixed(1)}%
              </span>
              <span>较上期</span>
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>目标达成</span>
                <span>{metrics.revenue.achievement.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.revenue.achievement} className="h-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃用户</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.users.active)}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>新增 {formatNumber(metrics.users.new)}</span>
              <span>•</span>
              <span>留存率 {metrics.users.retention}%</span>
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>总用户</span>
                <span>{formatNumber(metrics.users.total)}</span>
              </div>
              <Progress value={(metrics.users.active / metrics.users.total) * 100} className="h-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">转化率</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.conversions.rate}%</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>{formatNumber(metrics.conversions.total)} 转化</span>
              <span>•</span>
              <span>客单价 {formatCurrency(metrics.conversions.value)}</span>
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>ROI</span>
                <span className="text-green-600">{metrics.conversions.roi}%</span>
              </div>
              <Progress value={Math.min(metrics.conversions.roi, 100)} className="h-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">用户参与度</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.engagement.sessions)}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>{formatNumber(metrics.engagement.pageViews)} 浏览</span>
              <span>•</span>
              <span>跳出率 {metrics.engagement.bounceRate}%</span>
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>平均时长</span>
                <span>{Math.floor(metrics.engagement.avgSessionDuration / 60)}分{metrics.engagement.avgSessionDuration % 60}秒</span>
              </div>
              <Progress value={(metrics.engagement.avgSessionDuration / 300) * 100} className="h-1" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 详细分析标签页 */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">总览</TabsTrigger>
          <TabsTrigger value="revenue">收入分析</TabsTrigger>
          <TabsTrigger value="users">用户分析</TabsTrigger>
          <TabsTrigger value="conversions">转化分析</TabsTrigger>
          <TabsTrigger value="reports">报告管理</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* 收入趋势 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  收入趋势
                </CardTitle>
                <CardDescription>
                  过去30天的收入变化趋势
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">收入趋势图表</p>
                    <p className="text-sm text-gray-400">集成图表库后显示详细趋势</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 用户分布 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  用户分布
                </CardTitle>
                <CardDescription>
                  用户类型和地区分布
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">用户分布图表</p>
                    <p className="text-sm text-gray-400">集成图表库后显示详细分布</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 关键指标 */}
          <Card>
            <CardHeader>
              <CardTitle>关键业务指标</CardTitle>
              <CardDescription>
                深度分析关键业务表现指标
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">¥{formatCurrency(metrics.revenue.current / metrics.users.active).slice(1)}</div>
                  <p className="text-sm text-muted-foreground">ARPU (每用户平均收入)</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{metrics.conversions.value}</div>
                  <p className="text-sm text-muted-foreground">平均订单价值</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{Math.floor(metrics.engagement.avgSessionDuration / 60)}:{(metrics.engagement.avgSessionDuration % 60).toString().padStart(2, '0')}</div>
                  <p className="text-sm text-muted-foreground">平均会话时长</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>收入分析</CardTitle>
              <CardDescription>
                详细的收入来源和趋势分析
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">收入来源</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>订阅收入</span>
                        <span className="font-medium">{formatCurrency(metrics.revenue.current * 0.6)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>一次性购买</span>
                        <span className="font-medium">{formatCurrency(metrics.revenue.current * 0.3)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>增值服务</span>
                        <span className="font-medium">{formatCurrency(metrics.revenue.current * 0.1)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3">收入预测</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>下月预测</span>
                        <span className="font-medium">{formatCurrency(metrics.revenue.current * 1.1)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>季度预测</span>
                        <span className="font-medium">{formatCurrency(metrics.revenue.current * 3.5)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>年度预测</span>
                        <span className="font-medium">{formatCurrency(metrics.revenue.current * 15)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>用户分析</CardTitle>
              <CardDescription>
                用户行为和留存分析
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-semibold mb-3">用户活跃度</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">日活跃用户</span>
                        <span className="text-sm font-medium">{formatNumber(metrics.users.active * 0.4)}</span>
                      </div>
                      <Progress value={40} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">周活跃用户</span>
                        <span className="text-sm font-medium">{formatNumber(metrics.users.active * 0.7)}</span>
                      </div>
                      <Progress value={70} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">月活跃用户</span>
                        <span className="text-sm font-medium">{formatNumber(metrics.users.active)}</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">用户留存</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">次日留存</span>
                      <span className="text-sm font-medium">65%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">7日留存</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">30日留存</span>
                      <span className="text-sm font-medium">{metrics.users.retention}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>转化分析</CardTitle>
              <CardDescription>
                转化漏斗和转化路径分析
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">100%</div>
                    <p className="text-sm text-muted-foreground">访问用户</p>
                    <p className="text-xs">{formatNumber(100000)}</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">45%</div>
                    <p className="text-sm text-muted-foreground">注册用户</p>
                    <p className="text-xs">{formatNumber(45000)}</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">12%</div>
                    <p className="text-sm text-muted-foreground">付费用户</p>
                    <p className="text-xs">{formatNumber(12000)}</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">3.8%</div>
                    <p className="text-sm text-muted-foreground">转化率</p>
                    <p className="text-xs">{formatNumber(metrics.conversions.total)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">报告管理</h3>
              <p className="text-sm text-muted-foreground">生成和下载业务分析报告</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => generateReport('daily')}
                disabled={isGeneratingReport}
                variant="outline"
                size="sm"
              >
                {isGeneratingReport ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Calendar className="h-4 w-4 mr-2" />
                )}
                生成日报
              </Button>
              <Button
                onClick={() => generateReport('weekly')}
                disabled={isGeneratingReport}
                variant="outline"
                size="sm"
              >
                生成周报
              </Button>
              <Button
                onClick={() => generateReport('monthly')}
                disabled={isGeneratingReport}
                size="sm"
              >
                生成月报
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {reports.map(report => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(report.status)}
                  <div>
                    <p className="font-medium">{report.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(report.generatedAt).toLocaleString()} • {report.fileSize > 0 ? `${report.fileSize.toFixed(1)}MB` : '生成中...'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={report.type === 'monthly' ? 'default' : 'secondary'}>
                    {report.type === 'daily' ? '日报' : report.type === 'weekly' ? '周报' : '月报'}
                  </Badge>
                  {report.status === 'completed' && report.downloadUrl && (
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      下载
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
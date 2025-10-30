'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Activity, 
  Target,
  PieChart,
  Download,
  Calendar,
  RefreshCw,
  CheckCircle,
  FileText,
  Eye,
  Settings,
  Zap
} from 'lucide-react'

import BusinessAnalyticsDashboard from '@/components/analytics/business-analytics-dashboard'

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">智能业务分析</h1>
          <p className="text-muted-foreground">
            深度业务数据分析和智能报告生成
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            数据实时
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            分析设置
          </Button>
        </div>
      </div>

      {/* 快速统计 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">月度收入</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥125万</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+27.6%</span> 较上月
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃用户</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,450</div>
            <p className="text-xs text-muted-foreground">
              新增 3,280 本月
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">转化率</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.8%</div>
            <p className="text-xs text-muted-foreground">
              ROI 440%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">用户参与度</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4:05</div>
            <p className="text-xs text-muted-foreground">
              平均会话时长
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容区域 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">分析仪表板</TabsTrigger>
          <TabsTrigger value="reports">智能报告</TabsTrigger>
          <TabsTrigger value="insights">深度洞察</TabsTrigger>
          <TabsTrigger value="predictions">预测分析</TabsTrigger>
          <TabsTrigger value="settings">分析设置</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <BusinessAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* 报告生成 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  智能报告生成
                </CardTitle>
                <CardDescription>
                  AI驱动的业务报告自动生成
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-3">
                    <Button className="w-full justify-start" variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      生成日报
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      生成周报
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <PieChart className="h-4 w-4 mr-2" />
                      生成月报
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      自定义报告
                    </Button>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground mb-2">
                      报告特性:
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• AI智能分析</li>
                      <li>• 多维度数据展示</li>
                      <li>• 趋势预测</li>
                      <li>• 业务建议</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 最近报告 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  最近报告
                </CardTitle>
                <CardDescription>
                  最新生成的业务分析报告
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">月度业务报告</p>
                        <p className="text-xs text-muted-foreground">2天前 • 2.4MB</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      下载
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="font-medium text-sm">周度分析报告</p>
                        <p className="text-xs text-muted-foreground">3天前 • 1.2MB</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      下载
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <RefreshCw className="h-4 w-4 text-yellow-600 animate-spin" />
                      <div>
                        <p className="font-medium text-sm">实时数据报告</p>
                        <p className="text-xs text-muted-foreground">生成中...</p>
                      </div>
                    </div>
                    <Badge variant="secondary">处理中</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 报告模板 */}
          <Card>
            <CardHeader>
              <CardTitle>报告模板库</CardTitle>
              <CardDescription>
                预定义的专业报告模板
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold">执行摘要报告</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    高管级别的业务概览和关键指标
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    使用模板
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <PieChart className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold">用户分析报告</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    详细的用户行为和留存分析
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    使用模板
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold">财务分析报告</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    收入、成本和盈利能力分析
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    使用模板
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI深度洞察</CardTitle>
              <CardDescription>
                基于机器学习的智能业务洞察
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">智能洞察分析</h3>
                <p className="text-gray-500 mb-4">
                  AI驱动的业务洞察和异常检测功能正在开发中
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline">
                    <Zap className="h-4 w-4 mr-2" />
                    启动AI分析
                  </Button>
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    查看洞察
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>预测分析</CardTitle>
              <CardDescription>
                基于历史数据的业务预测和趋势分析
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">预测分析引擎</h3>
                <p className="text-gray-500 mb-4">
                  高级预测分析和趋势预测功能正在开发中
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    生成预测
                  </Button>
                  <Button variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    查看模型
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>分析设置</CardTitle>
              <CardDescription>
                配置业务分析参数和数据源
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">分析配置</h3>
                <p className="text-gray-500 mb-4">
                  完整的分析配置功能正在开发中
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    数据源配置
                  </Button>
                  <Button variant="outline">
                    <Activity className="h-4 w-4 mr-2" />
                    指标设置
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
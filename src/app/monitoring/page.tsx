'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Monitor, 
  Activity, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Settings,
  RefreshCw,
  Bell,
  TrendingUp
} from 'lucide-react'

import SystemMonitoringDashboard from '@/components/monitoring/system-monitoring-dashboard'
import PerformanceOptimization from '@/components/monitoring/performance-optimization'

export default function MonitoringPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">系统监控中心</h1>
          <p className="text-muted-foreground">
            实时监控系统状态，优化性能，确保服务稳定运行
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            系统正常
          </Badge>
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            警报设置
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            配置
          </Button>
        </div>
      </div>

      {/* 快速统计 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">系统状态</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">正常</div>
            <p className="text-xs text-muted-foreground">
              运行时间: 15天 8小时
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃警报</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">2</div>
            <p className="text-xs text-muted-foreground">
              1个严重, 1个警告
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">性能评分</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">85/100</div>
            <p className="text-xs text-muted-foreground">
              较上次提升 3%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">优化建议</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">6</div>
            <p className="text-xs text-muted-foreground">
              2个高优先级
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容区域 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">总览</TabsTrigger>
          <TabsTrigger value="system">系统监控</TabsTrigger>
          <TabsTrigger value="performance">性能优化</TabsTrigger>
          <TabsTrigger value="alerts">警报管理</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* 系统概览 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  系统概览
                </CardTitle>
                <CardDescription>
                  当前系统运行状态和关键指标
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>CPU使用率</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '35%' }}></div>
                      </div>
                      <span className="text-sm">35%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>内存使用</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                      </div>
                      <span className="text-sm">68%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>磁盘使用</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '42%' }}></div>
                      </div>
                      <span className="text-sm">42%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>网络延迟</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">25ms</span>
                      <Badge variant="outline" className="text-green-600">良好</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 最近警报 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  最近警报
                </CardTitle>
                <CardDescription>
                  最新的系统警报和通知
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 border rounded-lg">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">CPU使用率过高</p>
                      <p className="text-xs text-muted-foreground">5分钟前</p>
                    </div>
                    <Badge variant="destructive">严重</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-2 border rounded-lg">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">内存使用率较高</p>
                      <p className="text-xs text-muted-foreground">15分钟前</p>
                    </div>
                    <Badge variant="secondary">警告</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-2 border rounded-lg">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">数据库备份完成</p>
                      <p className="text-xs text-muted-foreground">30分钟前</p>
                    </div>
                    <Badge variant="default">信息</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 性能趋势 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                性能趋势
              </CardTitle>
              <CardDescription>
                过去24小时的系统性能表现
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">性能图表</p>
                  <p className="text-sm text-gray-400">集成图表库后显示详细趋势</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <SystemMonitoringDashboard />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceOptimization />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>警报管理</CardTitle>
              <CardDescription>
                管理系统警报和通知设置
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">警报管理功能</h3>
                <p className="text-gray-500 mb-4">
                  完整的警报管理功能正在开发中，包括警报规则配置、通知渠道设置等
                </p>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  配置警报规则
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
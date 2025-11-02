'use client'

// Avoid static prerendering for this page to prevent next-intl build-time config errors
export const dynamic = 'force-dynamic';

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Rocket, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  GitBranch,
  GitCommit,
  Settings,
  RefreshCw,
  Play,
  History,
  Shield,
  Globe,
  Zap
} from 'lucide-react'

import CICDDashboard from '@/components/cicd/cicd-dashboard'

export default function CICDPage() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CI/CD 管道中心</h1>
          <p className="text-muted-foreground">
            管理持续集成、部署和交付流程
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            管道正常
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            管道设置
          </Button>
        </div>
      </div>

      {/* 快速统计 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃管道</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              2个运行中, 1个暂停
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日部署</CardTitle>
            <Rocket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              7成功, 1失败
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均部署时间</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">6.5分</div>
            <p className="text-xs text-muted-foreground">
              较上周优化 15%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">成功率</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">94.2%</div>
            <p className="text-xs text-muted-foreground">
              最近30天
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容区域 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">管道仪表板</TabsTrigger>
          <TabsTrigger value="deployments">部署管理</TabsTrigger>
          <TabsTrigger value="environments">环境管理</TabsTrigger>
          <TabsTrigger value="monitoring">监控日志</TabsTrigger>
          <TabsTrigger value="settings">设置配置</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <CICDDashboard />
        </TabsContent>

        <TabsContent value="deployments" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* 快速部署 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5" />
                  快速部署
                </CardTitle>
                <CardDescription>
                  选择环境和分支进行快速部署
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">目标环境</label>
                    <select className="w-full mt-1 px-3 py-2 border rounded-md">
                      <option value="development">开发环境</option>
                      <option value="staging">预发布环境</option>
                      <option value="production">生产环境</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">分支</label>
                    <select className="w-full mt-1 px-3 py-2 border rounded-md">
                      <option value="main">main</option>
                      <option value="develop">develop</option>
                      <option value="feature/new-ui">feature/new-ui</option>
                    </select>
                  </div>
                  <Button className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    开始部署
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 最近部署 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  最近部署
                </CardTitle>
                <CardDescription>
                  最新的部署活动记录
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="font-medium text-sm">v2.1.0</p>
                        <p className="text-xs text-muted-foreground">生产环境 • 2小时前</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">成功</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">v2.0.9</p>
                        <p className="text-xs text-muted-foreground">预发布环境 • 15分钟前</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">运行中</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Settings className="h-4 w-4 text-gray-600" />
                      <div>
                        <p className="font-medium text-sm">v2.0.8</p>
                        <p className="text-xs text-muted-foreground">开发环境 • 45分钟前</p>
                      </div>
                    </div>
                    <Badge variant="destructive">失败</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 部署队列 */}
          <Card>
            <CardHeader>
              <CardTitle>部署队列</CardTitle>
              <CardDescription>
                当前等待执行的部署任务
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Rocket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">部署队列</h3>
                <p className="text-gray-500 mb-4">
                  当前没有等待的部署任务
                </p>
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  刷新状态
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environments" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  开发环境
                </CardTitle>
                <CardDescription>
                  用于开发和功能测试
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">状态</span>
                    <Badge className="bg-green-100 text-green-800">运行中</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">当前版本</span>
                    <span className="font-mono text-sm">v2.0.8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">最后部署</span>
                    <span className="text-sm">45分钟前</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">自动部署</span>
                    <Badge variant="outline">启用</Badge>
                  </div>
                  <div className="pt-2 space-y-2">
                    <Button size="sm" className="w-full" variant="outline">
                      <Rocket className="h-4 w-4 mr-2" />
                      部署到开发环境
                    </Button>
                    <Button size="sm" className="w-full" variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      环境设置
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  预发布环境
                </CardTitle>
                <CardDescription>
                  生产前的最终测试环境
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">状态</span>
                    <Badge className="bg-blue-100 text-blue-800">部署中</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">当前版本</span>
                    <span className="font-mono text-sm">v2.0.9</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">最后部署</span>
                    <span className="text-sm">15分钟前</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">自动部署</span>
                    <Badge variant="outline">启用</Badge>
                  </div>
                  <div className="pt-2 space-y-2">
                    <Button size="sm" className="w-full" disabled>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      部署中...
                    </Button>
                    <Button size="sm" className="w-full" variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      环境设置
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  生产环境
                </CardTitle>
                <CardDescription>
                  正式运行的生产环境
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">状态</span>
                    <Badge className="bg-green-100 text-green-800">运行中</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">当前版本</span>
                    <span className="font-mono text-sm">v2.1.0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">最后部署</span>
                    <span className="text-sm">2小时前</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">自动部署</span>
                    <Badge variant="outline">手动</Badge>
                  </div>
                  <div className="pt-2 space-y-2">
                    <Button size="sm" className="w-full">
                      <Rocket className="h-4 w-4 mr-2" />
                      部署到生产环境
                    </Button>
                    <Button size="sm" className="w-full" variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      环境设置
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>监控和日志</CardTitle>
              <CardDescription>
                实时监控部署状态和查看详细日志
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">监控中心</h3>
                <p className="text-gray-500 mb-4">
                  部署监控和日志查看功能正在开发中
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline">
                    <Activity className="h-4 w-4 mr-2" />
                    实时监控
                  </Button>
                  <Button variant="outline">
                    <History className="h-4 w-4 mr-2" />
                    查看日志
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>CI/CD 设置</CardTitle>
              <CardDescription>
                配置管道参数和环境变量
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">配置管理</h3>
                <p className="text-gray-500 mb-4">
                  完整的CI/CD配置功能正在开发中
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline">
                    <GitBranch className="h-4 w-4 mr-2" />
                    管道配置
                  </Button>
                  <Button variant="outline">
                    <GitCommit className="h-4 w-4 mr-2" />
                    环境变量
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
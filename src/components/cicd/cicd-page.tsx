'use client'

export const dynamic = 'force-dynamic'

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
  Zap,
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
          <p className="text-muted-foreground">管理持续集成、部署和交付流程</p>
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
            <p className="text-xs text-muted-foreground">2个运行中, 1个暂停</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日部署</CardTitle>
            <Rocket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">7成功, 1失败</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均部署时间</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">6.5分</div>
            <p className="text-xs text-muted-foreground">较上周优化 15%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">成功率</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">94.2%</div>
            <p className="text-xs text-muted-foreground">最近30天</p>
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
                <CardDescription>选择环境和分支进行快速部署</CardDescription>
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
                <CardDescription>查看最近的部署记录</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map(item => (
                  <div key={item} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">版本 v2.0.{item}</p>
                      <p className="text-sm text-muted-foreground">2小时前 · main 分支</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">成功</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="environments">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  开发环境
                </CardTitle>
                <CardDescription>用于开发和测试的环境</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>状态</span>
                    <Badge className="bg-green-100 text-green-800">运行中</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>当前版本</span>
                    <span>v2.0.8</span>
                  </div>
                  <div className="flex justify-between">
                    <span>最后部署</span>
                    <span>45分钟前</span>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    <Rocket className="h-4 w-4 mr-2" />
                    部署到开发环境
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  预发布环境
                </CardTitle>
                <CardDescription>生产前的最终测试环境</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>状态</span>
                    <Badge className="bg-blue-100 text-blue-800">运行中</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>当前版本</span>
                    <span>v2.0.9</span>
                  </div>
                  <div className="flex justify-between">
                    <span>最后部署</span>
                    <span>30分钟前</span>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    <Rocket className="h-4 w-4 mr-2" />
                    部署到预发布环境
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  生产环境
                </CardTitle>
                <CardDescription>面对用户的生产环境</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>状态</span>
                    <Badge className="bg-green-100 text-green-800">运行中</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>当前版本</span>
                    <span>v2.1.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>最后部署</span>
                    <span>10分钟前</span>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    <Rocket className="h-4 w-4 mr-2" />
                    部署到生产环境
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                部署监控
              </CardTitle>
              <CardDescription>实时监控部署状态和日志</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map(item => (
                  <div key={item} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">部署 #{item}</p>
                      <p className="text-sm text-muted-foreground">2024-05-0{item} 14:3{item}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">成功</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                系统配置
              </CardTitle>
              <CardDescription>配置部署策略、通知和权限</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">部署策略</label>
                <select className="w-full mt-1 px-3 py-2 border rounded-md">
                  <option value="blue-green">蓝绿部署</option>
                  <option value="rolling">滚动更新</option>
                  <option value="canary">金丝雀发布</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">通知设置</label>
                <select className="w-full mt-1 px-3 py-2 border rounded-md">
                  <option value="all">所有通知</option>
                  <option value="failures">仅失败通知</option>
                  <option value="none">关闭通知</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">权限设置</label>
                <div className="space-y-2 mt-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    允许开发者触发部署
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    需要审批才能部署到生产
                  </label>
                </div>
              </div>
              <Button>保存设置</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

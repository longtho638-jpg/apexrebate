'use client'

export const dynamic = 'force-dynamic'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Rocket, Activity, CheckCircle, RefreshCw, History, Shield, Globe, Settings, Zap } from 'lucide-react'

// Giữ component dashboard tách riêng để có thể lazy-load nội bộ
import CICDDashboard from '@/components/cicd/cicd-dashboard'

export default function CICDPage() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="container mx-auto py-6 space-y-6">
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

      {/* Stats giữ nguyên UI Codex */}
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

        {/* Các tab còn lại vẫn giữ layout Codex – có thể thêm dần nội dung nếu cần */}
        <TabsContent value="deployments"><div /></TabsContent>
        <TabsContent value="environments"><div /></TabsContent>
        <TabsContent value="monitoring"><div /></TabsContent>
        <TabsContent value="settings"><div /></TabsContent>
      </Tabs>
    </div>
  )
}

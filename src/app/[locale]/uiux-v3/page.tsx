'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'

// ✅ Lazy import để tránh SSR crash & giảm bundle
const CICDDashboard = dynamic(() => import('@/components/cicd/cicd-dashboard'), {
  ssr: false,
  loading: () => <div className="p-6 text-center text-sm text-muted-foreground">Đang tải dashboard...</div>,
})

export default function CICDPage() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CI/CD Pipeline Dashboard</h1>
          <p className="text-muted-foreground">管理和监控你的持续集成和部署流程</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">Production</Badge>
          <Badge variant="secondary">Auto-Deploy: ON</Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>总部署次数</CardDescription>
            <CardTitle className="text-2xl">1,284</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">+12% 较上月</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>成功率</CardDescription>
            <CardTitle className="text-2xl">98.7%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">+0.3% 较上月</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>平均部署时间</CardDescription>
            <CardTitle className="text-2xl">3.2min</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">-0.5min 较上月</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>活跃环境</CardDescription>
            <CardTitle className="text-2xl">8</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">无变化</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="deployments">部署管理</TabsTrigger>
          <TabsTrigger value="environments">环境管理</TabsTrigger>
          <TabsTrigger value="monitoring">监控日志</TabsTrigger>
          <TabsTrigger value="settings">设置配置</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          {/* ✅ mock data mode để tránh fetch /api lỗi */}
          <CICDDashboard mockMode />
          <div className="mt-4 text-xs text-muted-foreground text-right pr-2">
            Runtime: client-only (mocked data) · Codex UI restored ✅
          </div>
        </TabsContent>

        <TabsContent value="deployments">
          <Card>
            <CardHeader>
              <CardTitle>Recent Deployments</CardTitle>
              <CardDescription>最近的部署记录和状态</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">部署列表将在此显示</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environments">
          <Card>
            <CardHeader>
              <CardTitle>Environment Management</CardTitle>
              <CardDescription>管理不同的部署环境</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">环境配置将在此显示</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle>Logs & Monitoring</CardTitle>
              <CardDescription>实时日志和性能监控</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">监控数据将在此显示</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Settings</CardTitle>
              <CardDescription>配置CI/CD流程参数</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">设置选项将在此显示</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

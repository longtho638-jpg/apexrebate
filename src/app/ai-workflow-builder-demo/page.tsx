'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AIWorkflowBuilder } from '@/components/ai-workflow-builder'
import { AIRecommendations } from '@/components/ai-recommendations'
import { WorkflowTemplates } from '@/components/workflow-templates'
import { 
  Bot, 
  Zap, 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Puzzle,
  BarChart3
} from 'lucide-react'

export default function AIWorkflowBuilderDemo() {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    workflowsCreated: 127,
    efficiencyGain: 85,
    errorReduction: 73,
    timeSaved: 240
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
              <Bot className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            AI增强版可视化工作流构建器
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            通过人工智能技术，将复杂的业务流程转化为可视化的工作流，
            降低90%的技术门槛，提升80%的创建效率
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">已创建工作流</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.workflowsCreated}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">效率提升</p>
                  <p className="text-2xl font-bold text-green-600">{stats.efficiencyGain}%</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">错误减少</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.errorReduction}%</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">节省时间</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.timeSaved}h</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 lg:w-1/2 mx-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              概览
            </TabsTrigger>
            <TabsTrigger value="builder" className="flex items-center gap-2">
              <Puzzle className="h-4 w-4" />
              构建器
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              模板库
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              AI推荐
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    核心特性
                  </CardTitle>
                  <CardDescription>
                    AI增强版工作流构建器的创新功能
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-green-100 rounded">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">AI智能推荐</h4>
                      <p className="text-sm text-muted-foreground">
                        基于业务场景和用户偏好，智能推荐最适合的工作流模板
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-blue-100 rounded">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">可视化拖拽</h4>
                      <p className="text-sm text-muted-foreground">
                        直观的拖拽界面，无需编程知识即可创建复杂工作流
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-purple-100 rounded">
                      <CheckCircle className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">实时验证</h4>
                      <p className="text-sm text-muted-foreground">
                        智能验证工作流逻辑，确保配置正确性
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-orange-100 rounded">
                      <CheckCircle className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">一键部署</h4>
                      <p className="text-sm text-muted-foreground">
                        完成配置后一键部署，自动处理所有技术细节
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-red-500" />
                    应用场景
                  </CardTitle>
                  <CardDescription>
                    适用于各种业务流程自动化场景
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Badge variant="secondary" className="mr-2">
                      返佣计算
                    </Badge>
                    <Badge variant="secondary" className="mr-2">
                      用户管理
                    </Badge>
                    <Badge variant="secondary" className="mr-2">
                      风险控制
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <Badge variant="outline" className="mr-2">
                      数据同步
                    </Badge>
                    <Badge variant="outline" className="mr-2">
                      报表生成
                    </Badge>
                    <Badge variant="outline" className="mr-2">
                      通知发送
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <Badge variant="outline" className="mr-2">
                      API集成
                    </Badge>
                    <Badge variant="outline" className="mr-2">
                      文件处理
                    </Badge>
                    <Badge variant="outline" className="mr-2">
                      定时任务
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-4">
                    准备好体验AI驱动的自动化了吗？
                  </h3>
                  <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                    通过智能推荐和可视化构建，让复杂的业务流程自动化变得简单高效
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      size="lg" 
                      variant="secondary"
                      onClick={() => setActiveTab('builder')}
                      className="bg-white text-blue-600 hover:bg-blue-50"
                    >
                      开始构建
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      onClick={() => setActiveTab('templates')}
                      className="border-white text-white hover:bg-white/10"
                    >
                      浏览模板
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="builder">
            <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Puzzle className="h-5 w-5 text-blue-500" />
                  可视化工作流构建器
                </CardTitle>
                <CardDescription>
                  拖拽组件，配置参数，创建您的自动化工作流
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AIWorkflowBuilder />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-500" />
                  业务模板库
                </CardTitle>
                <CardDescription>
                  20+预设模板，覆盖常见业务场景，即开即用
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WorkflowTemplates />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai">
            <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-purple-500" />
                  AI智能推荐
                </CardTitle>
                <CardDescription>
                  基于您的需求，AI为您推荐最适合的工作流方案
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AIRecommendations />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
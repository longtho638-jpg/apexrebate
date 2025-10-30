'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Play, 
  Pause, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  GitBranch,
  GitCommit,
  GitMerge,
  Rocket,
  Settings,
  Activity,
  History,
  Zap,
  Shield,
  Globe
} from 'lucide-react'

interface Deployment {
  id: string
  version: string
  environment: 'development' | 'staging' | 'production'
  status: 'pending' | 'running' | 'success' | 'failed' | 'rolled_back'
  branch: string
  commit: string
  author: string
  startedAt: string
  completedAt?: string
  duration?: number
  changes: {
    added: number
    modified: number
    deleted: number
  }
  tests: {
    total: number
    passed: number
    failed: number
  }
}

interface Pipeline {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive' | 'paused'
  lastRun: string
  nextRun?: string
  triggers: string[]
  stages: {
    name: string
    status: 'pending' | 'running' | 'success' | 'failed' | 'skipped'
    duration?: number
  }[]
}

export default function CICDDashboard() {
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [pipelines, setPipelines] = useState<Pipeline[]>([])
  const [isDeploying, setIsDeploying] = useState(false)
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('staging')
  const [isLoading, setIsLoading] = useState(true)

  const fetchDeployments = async () => {
    try {
      const response = await fetch('/api/cicd/deployments')
      if (response.ok) {
        const data = await response.json()
        setDeployments(data.data)
      } else {
        // 模拟数据
        const mockDeployments: Deployment[] = [
          {
            id: '1',
            version: 'v2.1.0',
            environment: 'production',
            status: 'success',
            branch: 'main',
            commit: 'a1b2c3d4',
            author: 'John Doe',
            startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            completedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
            duration: 1800,
            changes: { added: 12, modified: 34, deleted: 5 },
            tests: { total: 285, passed: 276, failed: 9 }
          },
          {
            id: '2',
            version: 'v2.0.9',
            environment: 'staging',
            status: 'running',
            branch: 'develop',
            commit: 'e5f6g7h8',
            author: 'Jane Smith',
            startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            changes: { added: 8, modified: 22, deleted: 3 },
            tests: { total: 265, passed: 245, failed: 0 }
          },
          {
            id: '3',
            version: 'v2.0.8',
            environment: 'development',
            status: 'failed',
            branch: 'feature/new-ui',
            commit: 'i9j0k1l2',
            author: 'Bob Johnson',
            startedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
            completedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
            duration: 300,
            changes: { added: 15, modified: 28, deleted: 7 },
            tests: { total: 295, passed: 280, failed: 15 }
          }
        ]
        setDeployments(mockDeployments)
      }
    } catch (error) {
      console.error('Failed to fetch deployments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPipelines = async () => {
    try {
      const response = await fetch('/api/cicd/pipelines')
      if (response.ok) {
        const data = await response.json()
        setPipelines(data.data)
      } else {
        // 模拟数据
        const mockPipelines: Pipeline[] = [
          {
            id: '1',
            name: '主应用部署管道',
            description: '主应用程序的完整CI/CD流程',
            status: 'active',
            lastRun: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            nextRun: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
            triggers: ['push', 'pull_request', 'schedule'],
            stages: [
              { name: '代码检查', status: 'success', duration: 120 },
              { name: '单元测试', status: 'success', duration: 180 },
              { name: '构建镜像', status: 'success', duration: 300 },
              { name: '部署到Staging', status: 'success', duration: 240 },
              { name: '集成测试', status: 'running' },
              { name: '部署到Production', status: 'pending' }
            ]
          },
          {
            id: '2',
            name: '微服务部署管道',
            description: '微服务架构的独立部署流程',
            status: 'active',
            lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            triggers: ['push', 'manual'],
            stages: [
              { name: '服务构建', status: 'success', duration: 200 },
              { name: '容器化', status: 'success', duration: 150 },
              { name: '服务测试', status: 'success', duration: 180 },
              { name: '服务部署', status: 'success', duration: 120 }
            ]
          },
          {
            id: '3',
            name: '数据库迁移管道',
            description: '数据库schema迁移和备份流程',
            status: 'paused',
            lastRun: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            triggers: ['manual'],
            stages: [
              { name: '数据库备份', status: 'success', duration: 300 },
              { name: '迁移脚本', status: 'pending' },
              { name: '数据验证', status: 'pending' },
              { name: '性能测试', status: 'pending' }
            ]
          }
        ]
        setPipelines(mockPipelines)
      }
    } catch (error) {
      console.error('Failed to fetch pipelines:', error)
    }
  }

  const deployToEnvironment = async (environment: string) => {
    setIsDeploying(true)
    try {
      const response = await fetch('/api/cicd/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ environment })
      })

      if (response.ok) {
        // 创建新部署记录
        const newDeployment: Deployment = {
          id: Date.now().toString(),
          version: `v2.1.1-${Date.now()}`,
          environment: environment as any,
          status: 'running',
          branch: 'main',
          commit: 'deploy-' + Date.now().toString(36),
          author: 'Current User',
          startedAt: new Date().toISOString(),
          changes: { added: 0, modified: 0, deleted: 0 },
          tests: { total: 0, passed: 0, failed: 0 }
        }

        setDeployments(prev => [newDeployment, ...prev])
        
        // 模拟部署过程
        setTimeout(() => {
          fetchDeployments()
          setIsDeploying(false)
        }, 5000)
      }
    } catch (error) {
      console.error('Failed to start deployment:', error)
      setIsDeploying(false)
    }
  }

  const rollbackDeployment = async (deploymentId: string) => {
    try {
      const response = await fetch('/api/cicd/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deploymentId })
      })

      if (response.ok) {
        setDeployments(prev => 
          prev.map(deployment => 
            deployment.id === deploymentId 
              ? { ...deployment, status: 'rolled_back' as const }
              : deployment
          )
        )
      }
    } catch (error) {
      console.error('Failed to rollback deployment:', error)
    }
  }

  useEffect(() => {
    fetchDeployments()
    fetchPipelines()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
      case 'rolled_back': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return <Badge className="bg-green-100 text-green-800">成功</Badge>
      case 'failed': return <Badge variant="destructive">失败</Badge>
      case 'running': return <Badge className="bg-blue-100 text-blue-800">运行中</Badge>
      case 'rolled_back': return <Badge variant="secondary">已回滚</Badge>
      default: return <Badge variant="outline">待定</Badge>
    }
  }

  const getEnvironmentIcon = (environment: string) => {
    switch (environment) {
      case 'development': return <Settings className="h-4 w-4" />
      case 'staging': return <Shield className="h-4 w-4" />
      case 'production': return <Globe className="h-4 w-4" />
      default: return <Globe className="h-4 w-4" />
    }
  }

  const getEnvironmentColor = (environment: string) => {
    switch (environment) {
      case 'development': return 'text-gray-600 bg-gray-50'
      case 'staging': return 'text-blue-600 bg-blue-50'
      case 'production': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">加载CI/CD数据...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 头部控制 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">CI/CD 管道</h2>
          <p className="text-muted-foreground">
            管理自动化部署和持续集成流程
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedEnvironment}
            onChange={(e) => setSelectedEnvironment(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="development">开发环境</option>
            <option value="staging">预发布环境</option>
            <option value="production">生产环境</option>
          </select>
          <Button
            onClick={() => deployToEnvironment(selectedEnvironment)}
            disabled={isDeploying}
            className="bg-green-600 hover:bg-green-700"
          >
            {isDeploying ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Rocket className="h-4 w-4 mr-2" />
            )}
            部署到 {selectedEnvironment}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              fetchDeployments()
              fetchPipelines()
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
        </div>
      </div>

      {/* 部署概览统计 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃管道</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pipelines.filter(p => p.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">
              共 {pipelines.length} 个管道
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">成功部署</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {deployments.filter(d => d.status === 'success').length}
            </div>
            <p className="text-xs text-muted-foreground">
              最近24小时
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">运行中</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {deployments.filter(d => d.status === 'running').length}
            </div>
            <p className="text-xs text-muted-foreground">
              正在部署
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">失败部署</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {deployments.filter(d => d.status === 'failed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              需要处理
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容区域 */}
      <Tabs defaultValue="deployments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="deployments">部署历史</TabsTrigger>
          <TabsTrigger value="pipelines">管道管理</TabsTrigger>
          <TabsTrigger value="environments">环境管理</TabsTrigger>
          <TabsTrigger value="settings">设置</TabsTrigger>
        </TabsList>

        <TabsContent value="deployments" className="space-y-4">
          <div className="space-y-4">
            {deployments.map(deployment => (
              <Card key={deployment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getEnvironmentIcon(deployment.environment)}
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {deployment.version}
                          <Badge className={getEnvironmentColor(deployment.environment)}>
                            {deployment.environment}
                          </Badge>
                          {getStatusBadge(deployment.status)}
                        </CardTitle>
                        <CardDescription>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="flex items-center gap-1">
                              <GitBranch className="h-3 w-3" />
                              {deployment.branch}
                            </span>
                            <span className="flex items-center gap-1">
                              <GitCommit className="h-3 w-3" />
                              {deployment.commit.substring(0, 7)}
                            </span>
                            <span>作者: {deployment.author}</span>
                          </div>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {deployment.status === 'failed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rollbackDeployment(deployment.id)}
                        >
                          回滚
                        </Button>
                      )}
                      {getStatusIcon(deployment.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm font-medium">开始时间</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(deployment.startedAt).toLocaleString()}
                      </p>
                    </div>
                    {deployment.completedAt && (
                      <div>
                        <p className="text-sm font-medium">完成时间</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(deployment.completedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {deployment.duration && (
                      <div>
                        <p className="text-sm font-medium">持续时间</p>
                        <p className="text-xs text-muted-foreground">
                          {Math.floor(deployment.duration / 60)}分{deployment.duration % 60}秒
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">代码变更</p>
                      <p className="text-xs text-muted-foreground">
                        +{deployment.changes.added} -{deployment.changes.deleted} ~{deployment.changes.modified}
                      </p>
                    </div>
                  </div>
                  
                  {deployment.tests.total > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">测试结果</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{deployment.tests.passed} 通过</span>
                        </div>
                        {deployment.tests.failed > 0 && (
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="text-sm">{deployment.tests.failed} 失败</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            总计 {deployment.tests.total} 个测试
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pipelines" className="space-y-4">
          <div className="space-y-4">
            {pipelines.map(pipeline => (
              <Card key={pipeline.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {pipeline.name}
                        <Badge variant={pipeline.status === 'active' ? 'default' : 'secondary'}>
                          {pipeline.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{pipeline.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4 mr-1" />
                        运行
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4 mr-1" />
                        配置
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>最后运行: {new Date(pipeline.lastRun).toLocaleString()}</span>
                      {pipeline.nextRun && (
                        <span>下次运行: {new Date(pipeline.nextRun).toLocaleString()}</span>
                      )}
                      <span>触发器: {pipeline.triggers.join(', ')}</span>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-3">管道阶段</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {pipeline.stages.map((stage, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              stage.status === 'success' ? 'bg-green-600' :
                              stage.status === 'failed' ? 'bg-red-600' :
                              stage.status === 'running' ? 'bg-blue-600 animate-pulse' :
                              'bg-gray-400'
                            }`}></div>
                            <span className="text-sm">{stage.name}</span>
                            {stage.duration && (
                              <span className="text-xs text-muted-foreground">
                                ({stage.duration}s)
                              </span>
                            )}
                            {index < pipeline.stages.length - 1 && (
                              <div className="w-4 h-px bg-gray-300"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="environments" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  开发环境
                </CardTitle>
                <CardDescription>
                  用于开发和测试的环境
                </CardDescription>
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
                <CardDescription>
                  生产前的最终测试环境
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>状态</span>
                    <Badge className="bg-blue-100 text-blue-800">部署中</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>当前版本</span>
                    <span>v2.0.9</span>
                  </div>
                  <div className="flex justify-between">
                    <span>最后部署</span>
                    <span>15分钟前</span>
                  </div>
                  <Button className="w-full mt-4" disabled>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    部署中...
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
                <CardDescription>
                  正式运行的生产环境
                </CardDescription>
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
                    <span>2小时前</span>
                  </div>
                  <Button className="w-full mt-4">
                    <Rocket className="h-4 w-4 mr-2" />
                    部署到生产环境
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CI/CD 设置</CardTitle>
              <CardDescription>
                配置持续集成和部署参数
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">配置管理</h3>
                <p className="text-gray-500 mb-4">
                  CI/CD配置功能正在开发中，包括环境变量、部署策略等
                </p>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  配置CI/CD
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Activity, 
  Cpu,
  HardDrive,
  Gauge,
  Network, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  Database,
  Globe
} from 'lucide-react'

interface SystemMetrics {
  timestamp: string
  cpu: {
    usage: number
    cores: number
    temperature?: number
  }
  memory: {
    used: number
    total: number
    percentage: number
  }
  disk: {
    used: number
    total: number
    percentage: number
  }
  network: {
    inbound: number
    outbound: number
    latency: number
  }
  database: {
    connections: number
    queryTime: number
    cacheHit: number
  }
  api: {
    requests: number
    responseTime: number
    errorRate: number
  }
}

interface AlertData {
  id: string
  level: 'critical' | 'warning' | 'info'
  message: string
  timestamp: string
  resolved: boolean
}

export default function SystemMonitoringDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)

  // 模拟获取系统指标
  const fetchSystemMetrics = async () => {
    try {
      const response = await fetch('/api/monitoring/system-metrics')
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      } else {
        // 模拟数据用于演示
        const mockData: SystemMetrics = {
          timestamp: new Date().toISOString(),
          cpu: {
            usage: Math.random() * 100,
            cores: 8,
            temperature: 45 + Math.random() * 30
          },
          memory: {
            used: 6.2 + Math.random() * 2,
            total: 16,
            percentage: (6.2 + Math.random() * 2) / 16 * 100
          },
          disk: {
            used: 120 + Math.random() * 50,
            total: 500,
            percentage: (120 + Math.random() * 50) / 500 * 100
          },
          network: {
            inbound: Math.random() * 1000,
            outbound: Math.random() * 1000,
            latency: 10 + Math.random() * 50
          },
          database: {
            connections: 15 + Math.floor(Math.random() * 20),
            queryTime: 50 + Math.random() * 100,
            cacheHit: 85 + Math.random() * 15
          },
          api: {
            requests: 100 + Math.floor(Math.random() * 500),
            responseTime: 100 + Math.random() * 200,
            errorRate: Math.random() * 5
          }
        }
        setMetrics(mockData)
      }
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Failed to fetch system metrics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 获取警报信息
  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/monitoring/alerts')
      if (response.ok) {
        const data = await response.json()
        setAlerts(data)
      } else {
        // 模拟警报数据
        const mockAlerts: AlertData[] = [
          {
            id: '1',
            level: 'warning',
            message: 'CPU使用率超过80%',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            resolved: false
          },
          {
            id: '2',
            level: 'info',
            message: '数据库备份完成',
            timestamp: new Date(Date.now() - 600000).toISOString(),
            resolved: true
          }
        ]
        setAlerts(mockAlerts)
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
    }
  }

  useEffect(() => {
    fetchSystemMetrics()
    fetchAlerts()

    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchSystemMetrics()
        fetchAlerts()
      }, 30000) // 30秒刷新一次

      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const getStatusBadge = (level: string) => {
    switch (level) {
      case 'critical':
        return <Badge variant="destructive">严重</Badge>
      case 'warning':
        return <Badge variant="secondary">警告</Badge>
      case 'info':
        return <Badge variant="default">信息</Badge>
      default:
        return <Badge variant="outline">未知</Badge>
    }
  }

  const cpuUsage = metrics?.cpu?.usage ?? 0
  const cpuCores = metrics?.cpu?.cores ?? 0
  const memoryPercentage = metrics?.memory?.percentage ?? 0
  const memoryUsed = metrics?.memory?.used ?? 0
  const memoryTotal = metrics?.memory?.total ?? 0
  const diskPercentage = metrics?.disk?.percentage ?? 0
  const diskUsed = metrics?.disk?.used ?? 0
  const diskTotal = metrics?.disk?.total ?? 0
  const networkLatency = metrics?.network?.latency ?? 0
  const networkInbound = metrics?.network?.inbound ?? 0
  const networkOutbound = metrics?.network?.outbound ?? 0
  const databaseConnections = metrics?.database?.connections ?? 0
  const databaseQueryTime = metrics?.database?.queryTime ?? 0
  const databaseCacheHit = metrics?.database?.cacheHit ?? 0
  const apiRequests = metrics?.api?.requests ?? 0
  const apiResponseTime = metrics?.api?.responseTime ?? 0
  const apiErrorRate = metrics?.api?.errorRate ?? 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">加载系统监控数据...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 头部控制 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">系统监控</h2>
          <p className="text-muted-foreground">
            实时监控系统性能和健康状态
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            最后更新: {lastUpdate.toLocaleTimeString()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? '自动刷新' : '手动刷新'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchSystemMetrics()
              fetchAlerts()
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
        </div>
      </div>

      {/* 警报信息 */}
      {alerts.some(alert => !alert.resolved) && (
        <div className="space-y-2">
          {alerts.filter(alert => !alert.resolved).map(alert => (
            <Alert key={alert.id} className={
              alert.level === 'critical' ? 'border-red-200 bg-red-50' :
              alert.level === 'warning' ? 'border-yellow-200 bg-yellow-50' :
              'border-blue-200 bg-blue-50'
            }>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="flex items-center gap-2">
                {getStatusBadge(alert.level)}
                {alert.message}
              </AlertTitle>
              <AlertDescription>
                {new Date(alert.timestamp).toLocaleString()}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* 主要指标卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU使用率</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cpuUsage.toFixed(1)}%
            </div>
            <Progress value={cpuUsage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {cpuCores} 核心
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">内存使用</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {memoryPercentage.toFixed(1)}%
            </div>
            <Progress value={memoryPercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {memoryUsed.toFixed(1)}GB / {memoryTotal}GB
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">磁盘使用</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {diskPercentage.toFixed(1)}%
            </div>
            <Progress value={diskPercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {diskUsed.toFixed(0)}GB / {diskTotal}GB
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">网络延迟</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {networkLatency.toFixed(0)}ms
            </div>
            <div className="flex items-center mt-2">
              {networkLatency < 50 ? (
                <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <TrendingUp className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span className="text-xs text-muted-foreground">
                入站: {networkInbound.toFixed(0)}KB/s
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 详细监控标签页 */}
      <Tabs defaultValue="database" className="space-y-4">
        <TabsList>
          <TabsTrigger value="database">数据库</TabsTrigger>
          <TabsTrigger value="api">API性能</TabsTrigger>
          <TabsTrigger value="network">网络详情</TabsTrigger>
          <TabsTrigger value="alerts">警报历史</TabsTrigger>
        </TabsList>

        <TabsContent value="database" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  数据库连接
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {databaseConnections}
                </div>
                <p className="text-sm text-muted-foreground">
                  活跃连接数
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  查询响应时间
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {databaseQueryTime.toFixed(0)}ms
                </div>
                <p className="text-sm text-muted-foreground">
                  平均查询时间
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  缓存命中率
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {databaseCacheHit.toFixed(1)}%
                </div>
                <Progress value={databaseCacheHit} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  API请求
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {apiRequests}
                </div>
                <p className="text-sm text-muted-foreground">
                  每分钟请求数
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  响应时间
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {apiResponseTime.toFixed(0)}ms
                </div>
                <p className="text-sm text-muted-foreground">
                  平均响应时间
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  错误率
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {apiErrorRate.toFixed(2)}%
                </div>
                <Progress 
                  value={apiErrorRate} 
                  className="mt-2"
                  max={10}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>网络流量详情</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2">入站流量</h4>
                  <div className="text-2xl font-bold">
                    {networkInbound.toFixed(0)} KB/s
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">出站流量</h4>
                  <div className="text-2xl font-bold">
                    {networkOutbound.toFixed(0)} KB/s
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>警报历史</CardTitle>
              <CardDescription>
                系统警报和事件历史记录
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map(alert => (
                  <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {alert.resolved ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium">{alert.message}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(alert.level)}
                      {alert.resolved && (
                        <Badge variant="outline">已解决</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

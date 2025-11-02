'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Globe, 
  Server, 
  Activity, 
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Settings,
  Zap,
  Shield,
  Users,
  Clock,
  MapPin
} from 'lucide-react'

interface Region {
  id: string
  name: string
  code: string
  location: {
    city: string
    country: string
    continent: string
    latitude: number
    longitude: number
  }
  capacity: {
    maxUsers: number
    currentUsers: number
    cpuThreshold: number
    memoryThreshold: number
  }
  status: 'active' | 'maintenance' | 'offline'
  latency: {
    average: number
    p95: number
    p99: number
  }
  infrastructure?: {
    apiEndpoint: string
    cdnEndpoint: string
  }
}

interface HealthCheck {
  regionId: string
  status: 'healthy' | 'unhealthy' | 'degraded'
  responseTime: number
  errorRate: number
  lastCheck: Date
  metrics: {
    cpu: number
    memory: number
    disk: number
    network: number
  }
}

interface RegionStats {
  total: number
  active: number
  healthy: number
  totalUsers: number
  averageLatency: number
}

export default function GlobalDeploymentDashboard() {
  const [regions, setRegions] = useState<Region[]>([])
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([])
  const [regionStats, setRegionStats] = useState<RegionStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // 获取区域数据
  const fetchRegions = async () => {
    try {
      const response = await fetch('/api/infrastructure?action=regions')
      const data = await response.json()
      if (data.success) {
        setRegions(data.data)
      }
    } catch (error) {
      console.error('获取区域数据失败:', error)
    }
  }

  // 获取健康检查数据
  const fetchHealthChecks = async () => {
    try {
      const response = await fetch('/api/infrastructure?action=health')
      const data = await response.json()
      if (data.success) {
        setHealthChecks(data.data)
      }
    } catch (error) {
      console.error('获取健康检查数据失败:', error)
    }
  }

  // 获取区域统计
  const fetchRegionStats = async () => {
    try {
      const response = await fetch('/api/infrastructure?action=stats')
      const data = await response.json()
      if (data.success) {
        setRegionStats(data.data)
      }
    } catch (error) {
      console.error('获取区域统计失败:', error)
    }
  }

  // 刷新所有数据
  const refreshAllData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        fetchRegions(),
        fetchHealthChecks(),
        fetchRegionStats()
      ])
      setLastUpdate(new Date())
    } finally {
      setIsLoading(false)
    }
  }

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'active':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'unhealthy':
      case 'offline':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'degraded':
      case 'maintenance':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    const variants = {
      healthy: 'bg-green-100 text-green-800',
      active: 'bg-green-100 text-green-800',
      unhealthy: 'bg-red-100 text-red-800',
      offline: 'bg-red-100 text-red-800',
      degraded: 'bg-yellow-100 text-yellow-800',
      maintenance: 'bg-yellow-100 text-yellow-800'
    }
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status === 'healthy' ? '健康' : 
         status === 'active' ? '活跃' : 
         status === 'unhealthy' ? '不健康' : 
         status === 'offline' ? '离线' : 
         status === 'degraded' ? '降级' : 
         status === 'maintenance' ? '维护' : '未知'}
      </Badge>
    )
  }

  // 格式化数字
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  // 获取健康检查数据
  const getHealthCheckForRegion = (regionId: string): HealthCheck | undefined => {
    return healthChecks.find(hc => hc.regionId === regionId)
  }

  useEffect(() => {
    refreshAllData()
    
    // 设置自动刷新
    const interval = setInterval(refreshAllData, 30000) // 30秒刷新一次
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">全球部署管理</h2>
          <p className="text-muted-foreground">
            多区域基础设施监控和管理
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            最后更新: {lastUpdate.toLocaleTimeString()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAllData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="regions">区域管理</TabsTrigger>
          <TabsTrigger value="health">健康监控</TabsTrigger>
        </TabsList>

        {/* 概览标签页 */}
        <TabsContent value="overview" className="space-y-6">
          {regionStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">总区域数</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{regionStats.total}</div>
                  <p className="text-xs text-muted-foreground">
                    活跃: {regionStats.active}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">健康区域</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{regionStats.healthy}</div>
                  <p className="text-xs text-muted-foreground">
                    {((regionStats.healthy / regionStats.total) * 100).toFixed(1)}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">总用户数</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(regionStats.totalUsers)}</div>
                  <p className="text-xs text-muted-foreground">
                    全球用户
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">平均延迟</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{regionStats.averageLatency}ms</div>
                  <p className="text-xs text-muted-foreground">
                    全球平均
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 全球区域概览 */}
          <Card>
            <CardHeader>
              <CardTitle>全球部署概览</CardTitle>
              <CardDescription>各区域的运行状态和性能指标</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regions.map((region) => {
                  const healthCheck = getHealthCheckForRegion(region.id)
                  const usagePercentage = (region.capacity.currentUsers / region.capacity.maxUsers) * 100
                  
                  return (
                    <div key={region.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(region.status)}
                          <div>
                            <h3 className="font-semibold">{region.name}</h3>
                            <p className="text-sm text-muted-foreground flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {region.location.city}, {region.location.country}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(region.status)}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>用户容量</span>
                            <span>{usagePercentage.toFixed(1)}%</span>
                          </div>
                          <Progress value={usagePercentage} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            {formatNumber(region.capacity.currentUsers)} / {formatNumber(region.capacity.maxUsers)}
                          </p>
                        </div>

                        {healthCheck && (
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">响应时间:</span>
                              <p className="font-medium">{healthCheck.responseTime}ms</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">错误率:</span>
                              <p className="font-medium">{(healthCheck.errorRate * 100).toFixed(2)}%</p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">延迟:</span>
                          <span>{region.latency.average}ms (平均)</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 区域管理标签页 */}
        <TabsContent value="regions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>区域列表</CardTitle>
              <CardDescription>管理全球各个部署区域</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regions.map((region) => {
                  const healthCheck = getHealthCheckForRegion(region.id)
                  
                  return (
                    <div key={region.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(region.status)}
                          <div>
                            <h3 className="font-semibold">{region.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {region.location.city}, {region.location.country} ({region.code})
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(region.status)}
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-1" />
                            配置
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium mb-1">基础设施</p>
                          <p className="text-xs text-muted-foreground">
                            API: {region.infrastructure?.apiEndpoint.split('/')[2] || 'N/A'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            CDN: {region.infrastructure?.cdnEndpoint.split('/')[2] || 'N/A'}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium mb-1">容量使用</p>
                          <div className="flex justify-between text-xs mb-1">
                            <span>用户</span>
                            <span>{((region.capacity.currentUsers / region.capacity.maxUsers) * 100).toFixed(1)}%</span>
                          </div>
                          <Progress 
                            value={(region.capacity.currentUsers / region.capacity.maxUsers) * 100} 
                            className="h-1" 
                          />
                        </div>

                        {healthCheck && (
                          <div>
                            <p className="text-sm font-medium mb-1">性能指标</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>CPU: {healthCheck.metrics.cpu}%</div>
                              <div>内存: {healthCheck.metrics.memory}%</div>
                              <div>磁盘: {healthCheck.metrics.disk}%</div>
                              <div>网络: {healthCheck.metrics.network}%</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 健康监控标签页 */}
        <TabsContent value="health" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>健康监控</CardTitle>
              <CardDescription>实时监控各区域的健康状态</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {healthChecks.map((healthCheck) => {
                  const region = regions.find(r => r.id === healthCheck.regionId)
                  
                  return (
                    <div key={healthCheck.regionId} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(healthCheck.status)}
                          <div>
                            <h3 className="font-semibold">{region?.name || healthCheck.regionId}</h3>
                            <p className="text-sm text-muted-foreground">
                              最后检查: {healthCheck.lastCheck.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(healthCheck.status)}
                          <span className="text-sm text-muted-foreground">
                            {healthCheck.responseTime}ms
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm font-medium text-green-600">CPU</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={healthCheck.metrics.cpu} className="flex-1 h-2" />
                            <span className="text-xs">{healthCheck.metrics.cpu}%</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-blue-600">内存</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={healthCheck.metrics.memory} className="flex-1 h-2" />
                            <span className="text-xs">{healthCheck.metrics.memory}%</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-orange-600">磁盘</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={healthCheck.metrics.disk} className="flex-1 h-2" />
                            <span className="text-xs">{healthCheck.metrics.disk}%</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-purple-600">网络</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={healthCheck.metrics.network} className="flex-1 h-2" />
                            <span className="text-xs">{healthCheck.metrics.network}%</span>
                          </div>
                        </div>
                      </div>

                      {healthCheck.errorRate > 0 && (
                        <div className="mt-3 p-2 bg-red-50 rounded border border-red-200">
                          <p className="text-sm text-red-600">
                            错误率: {(healthCheck.errorRate * 100).toFixed(2)}%
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
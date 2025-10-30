'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Zap, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  PieChart,
  LineChart,
  Settings,
  RefreshCw,
  Download,
  Calendar,
  Filter
} from 'lucide-react';

interface PerformanceMetrics {
  timestamp: Date;
  systemHealth: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
  workflowMetrics: {
    total: number;
    successful: number;
    failed: number;
    running: number;
    averageDuration: number;
  };
  errorMetrics: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    autoResolved: number;
  };
  recoveryMetrics: {
    active: number;
    success: number;
    failed: number;
    averageTime: number;
  };
}

interface PerformanceTrend {
  metric: string;
  current: number;
  previous: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

interface TopPerformer {
  name: string;
  value: number;
  change: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

export default function AutomationPerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [trends, setTrends] = useState<PerformanceTrend[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadPerformanceData();
    
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(loadPerformanceData, 30000); // 30秒刷新
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeRange, autoRefresh]);

  const loadPerformanceData = async () => {
    try {
      setIsLoading(true);
      
      // 加载性能指标
      const metricsResponse = await fetch('/api/automation/performance/metrics');
      const metricsData = await metricsResponse.json();
      
      // 加载趋势数据
      const trendsResponse = await fetch('/api/automation/performance/trends');
      const trendsData = await trendsResponse.json();
      
      // 加载顶级表现者
      const performersResponse = await fetch('/api/automation/performance/performers');
      const performersData = await performersResponse.json();
      
      setMetrics(metricsData.data);
      setTrends(trendsData.data);
      setTopPerformers(performersData.data);
      
    } catch (error) {
      console.error('Failed to load performance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getHealthColor = (value: number) => {
    if (value < 50) return 'text-green-600';
    if (value < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 控制栏 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">自动化性能监控</h2>
          <div className="flex items-center gap-2">
            <Button
              variant={timeRange === '1h' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('1h')}
            >
              1小时
            </Button>
            <Button
              variant={timeRange === '24h' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('24h')}
            >
              24小时
            </Button>
            <Button
              variant={timeRange === '7d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('7d')}
            >
              7天
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
            自动刷新
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            导出报告
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-1" />
            设置
          </Button>
        </div>
      </div>

      {/* 关键指标概览 */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">系统健康度</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((100 - metrics.systemHealth.cpu - metrics.systemHealth.memory) / 2)}%
              </div>
              <div className="space-y-1 mt-2">
                <div className="flex justify-between text-xs">
                  <span>CPU</span>
                  <span className={getHealthColor(metrics.systemHealth.cpu)}>
                    {metrics.systemHealth.cpu}%
                  </span>
                </div>
                <Progress value={metrics.systemHealth.cpu} className="h-1" />
                <div className="flex justify-between text-xs">
                  <span>内存</span>
                  <span className={getHealthColor(metrics.systemHealth.memory)}>
                    {metrics.systemHealth.memory}%
                  </span>
                </div>
                <Progress value={metrics.systemHealth.memory} className="h-1" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">工作流成功率</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.workflowMetrics.total > 0 
                  ? Math.round((metrics.workflowMetrics.successful / metrics.workflowMetrics.total) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.workflowMetrics.successful}/{metrics.workflowMetrics.total} 成功
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs">运行中: {metrics.workflowMetrics.running}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">错误恢复率</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.errorMetrics.total > 0 
                  ? Math.round((metrics.errorMetrics.autoResolved / metrics.errorMetrics.total) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.errorMetrics.autoResolved}/{metrics.errorMetrics.total} 自动恢复
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-xs">活跃恢复: {metrics.recoveryMetrics.active}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">平均执行时间</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(metrics.workflowMetrics.averageDuration)}s
              </div>
              <p className="text-xs text-muted-foreground">
                恢复时间: {Math.round(metrics.recoveryMetrics.averageTime)}s
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs">效率评分: 85%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">总览</TabsTrigger>
          <TabsTrigger value="trends">趋势分析</TabsTrigger>
          <TabsTrigger value="performers">性能排行</TabsTrigger>
          <TabsTrigger value="alerts">警报中心</TabsTrigger>
        </TabsList>

        {/* 总览 */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  系统资源使用
                </CardTitle>
              </CardHeader>
              <CardContent>
                {metrics && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>CPU 使用率</span>
                        <span>{metrics.systemHealth.cpu}%</span>
                      </div>
                      <Progress value={metrics.systemHealth.cpu} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>内存使用率</span>
                        <span>{metrics.systemHealth.memory}%</span>
                      </div>
                      <Progress value={metrics.systemHealth.memory} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>磁盘使用率</span>
                        <span>{metrics.systemHealth.disk}%</span>
                      </div>
                      <Progress value={metrics.systemHealth.disk} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>网络使用率</span>
                        <span>{metrics.systemHealth.network}%</span>
                      </div>
                      <Progress value={metrics.systemHealth.network} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  错误分布
                </CardTitle>
              </CardHeader>
              <CardContent>
                {metrics && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm">严重错误</span>
                      </div>
                      <Badge variant="destructive">{metrics.errorMetrics.critical}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm">高级错误</span>
                      </div>
                      <Badge variant="secondary">{metrics.errorMetrics.high}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm">中级错误</span>
                      </div>
                      <Badge variant="outline">{metrics.errorMetrics.medium}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">低级错误</span>
                      </div>
                      <Badge variant="outline">{metrics.errorMetrics.low}</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                性能趋势
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <LineChart className="h-12 w-12 mx-auto mb-2" />
                  <p>性能趋势图表</p>
                  <p className="text-sm">显示关键指标的历史变化趋势</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 趋势分析 */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trends.map((trend, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm">{trend.metric}</CardTitle>
                    {getTrendIcon(trend.trend)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">{trend.current}</div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={trend.change > 0 ? 'text-green-600' : 'text-red-600'}>
                        {trend.change > 0 ? '+' : ''}{trend.change}%
                      </span>
                      <span className="text-muted-foreground">vs 上期</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      上期: {trend.previous}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 性能排行 */}
        <TabsContent value="performers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>最佳表现工作流</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {topPerformers.slice(0, 10).map((performer, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{performer.name}</div>
                            <div className="text-sm text-muted-foreground">
                              成功率: {performer.value}%
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${getStatusColor(performer.status)}`}>
                            {performer.change > 0 ? '+' : ''}{performer.change}%
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {performer.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>需要关注的工作流</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {topPerformers
                      .filter(p => p.status === 'warning' || p.status === 'critical')
                      .map((performer, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg border-orange-200 bg-orange-50">
                          <div className="flex items-center gap-3">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            <div>
                              <div className="font-medium">{performer.name}</div>
                              <div className="text-sm text-muted-foreground">
                                成功率: {performer.value}%
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-orange-600">
                              {performer.change < 0 ? '' : '+'}{performer.change}%
                            </div>
                            <Badge variant="destructive" className="text-xs">
                              {performer.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 警报中心 */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                系统检测到 2 个高级警报和 5 个中级警报需要关注
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">严重警报</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                      <div className="flex items-start gap-3">
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-medium text-red-800">CPU 使用率过高</div>
                          <div className="text-sm text-red-600 mt-1">
                            当前 CPU 使用率达到 95%，持续超过 10 分钟
                          </div>
                          <div className="text-xs text-red-500 mt-2">
                            5 分钟前 · 自动恢复已启动
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                      <div className="flex items-start gap-3">
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-medium text-red-800">工作流执行失败</div>
                          <div className="text-sm text-red-600 mt-1">
                            数据备份工作流连续失败 3 次
                          </div>
                          <div className="text-xs text-red-500 mt-2">
                            15 分钟前 · 等待手动干预
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-yellow-600">警告信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-medium text-yellow-800">内存使用率上升</div>
                          <div className="text-sm text-yellow-600 mt-1">
                            内存使用率在过去 1 小时内上升了 20%
                          </div>
                          <div className="text-xs text-yellow-500 mt-2">
                            30 分钟前 · 监控中
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-medium text-yellow-800">响应时间增加</div>
                          <div className="text-sm text-yellow-600 mt-1">
                            API 平均响应时间增加至 2.5 秒
                          </div>
                          <div className="text-xs text-yellow-500 mt-2">
                            45 分钟前 · 性能优化建议
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
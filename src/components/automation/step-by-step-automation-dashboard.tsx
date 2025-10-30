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
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Activity,
  Zap,
  Settings,
  History,
  BarChart3
} from 'lucide-react';

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'archived';
  lastRun?: Date;
  nextRun?: Date;
  steps: number;
  enabled: boolean;
}

interface Execution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  progress: number;
  currentStep?: string;
  completedSteps: number;
  totalSteps: number;
}

interface SystemStatus {
  status: 'running' | 'stopped' | 'error';
  workflows: {
    total: number;
    active: number;
    inactive: number;
  };
  executions: {
    running: number;
    queued: number;
    maxConcurrent: number;
    currentUtilization: number;
  };
  performance: {
    successRate: number;
    averageExecutionTime: number;
    totalExecutions: number;
  };
}

export default function StepByStepAutomationDashboard() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSystemStatus();
    loadWorkflows();
    loadExecutions();
    
    const interval = setInterval(() => {
      loadSystemStatus();
      loadExecutions();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadSystemStatus = async () => {
    try {
      const response = await fetch('/api/automation/system-status');
      const data = await response.json();
      setSystemStatus(data);
    } catch (error) {
      console.error('Failed to load system status:', error);
    }
  };

  const loadWorkflows = async () => {
    try {
      const response = await fetch('/api/automation/workflows');
      const data = await response.json();
      setWorkflows(data);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    }
  };

  const loadExecutions = async () => {
    try {
      const response = await fetch('/api/automation/executions?limit=20');
      const data = await response.json();
      setExecutions(data);
    } catch (error) {
      console.error('Failed to load executions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const executeWorkflow = async (workflowId: string) => {
    try {
      const response = await fetch('/api/automation/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId })
      });
      
      if (response.ok) {
        loadExecutions();
      }
    } catch (error) {
      console.error('Failed to execute workflow:', error);
    }
  };

  const cancelExecution = async (executionId: string) => {
    try {
      const response = await fetch(`/api/automation/executions/${executionId}/cancel`, {
        method: 'POST'
      });
      
      if (response.ok) {
        loadExecutions();
      }
    } catch (error) {
      console.error('Failed to cancel execution:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
      case 'active':
        return <Activity className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-orange-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      running: 'default',
      active: 'default',
      completed: 'secondary',
      failed: 'destructive',
      pending: 'outline',
      paused: 'outline',
      cancelled: 'destructive',
      archived: 'secondary'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status}
      </Badge>
    );
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
      {/* 系统状态概览 */}
      {systemStatus && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">系统状态</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                {getStatusIcon(systemStatus.status)}
                {systemStatus.status}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">活跃工作流</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {systemStatus.workflows.active}/{systemStatus.workflows.total}
              </div>
              <p className="text-xs text-muted-foreground">
                {systemStatus.workflows.inactive} 个非活跃
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">执行队列</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {systemStatus.executions.running}/{systemStatus.executions.maxConcurrent}
              </div>
              <p className="text-xs text-muted-foreground">
                {systemStatus.executions.queued} 个排队中
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">成功率</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {systemStatus.performance.successRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                平均执行时间: {systemStatus.performance.averageExecutionTime.toFixed(1)}s
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflows">工作流</TabsTrigger>
          <TabsTrigger value="executions">执行历史</TabsTrigger>
          <TabsTrigger value="monitoring">实时监控</TabsTrigger>
        </TabsList>

        {/* 工作流管理 */}
        <TabsContent value="workflows" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">工作流管理</h3>
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              配置
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{workflow.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {workflow.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(workflow.status)}
                      {getStatusIcon(workflow.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>步骤数量</span>
                      <span>{workflow.steps}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>最后执行</span>
                      <span>
                        {workflow.lastRun 
                          ? new Date(workflow.lastRun).toLocaleString()
                          : '从未执行'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>下次执行</span>
                      <span>
                        {workflow.nextRun 
                          ? new Date(workflow.nextRun).toLocaleString()
                          : '未计划'
                        }
                      </span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => executeWorkflow(workflow.id)}
                        disabled={!workflow.enabled}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        执行
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedWorkflow(workflow)}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        详情
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 执行历史 */}
        <TabsContent value="executions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">执行历史</h3>
            <Button variant="outline">
              <History className="h-4 w-4 mr-2" />
              清理历史
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="space-y-0">
                  {executions.map((execution) => (
                    <div
                      key={execution.id}
                      className="flex items-center justify-between p-4 border-b hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(execution.status)}
                        <div>
                          <div className="font-medium">{execution.workflowName}</div>
                          <div className="text-sm text-muted-foreground">
                            开始时间: {new Date(execution.startTime).toLocaleString()}
                          </div>
                          {execution.currentStep && (
                            <div className="text-sm text-muted-foreground">
                              当前步骤: {execution.currentStep}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm">
                            {execution.completedSteps}/{execution.totalSteps} 步骤
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {execution.endTime 
                              ? `耗时: ${(new Date(execution.endTime).getTime() - new Date(execution.startTime).getTime()) / 1000}s`
                              : '运行中...'
                            }
                          </div>
                        </div>
                        
                        {execution.status === 'running' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => cancelExecution(execution.id)}
                          >
                            <Square className="h-4 w-4 mr-1" />
                            取消
                          </Button>
                        )}
                        
                        {execution.status === 'failed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => executeWorkflow(execution.workflowId)}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            重试
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 实时监控 */}
        <TabsContent value="monitoring" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">实时监控</h3>
            <Button>
              <Activity className="h-4 w-4 mr-2" />
              刷新
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>系统资源使用</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>CPU 使用率</span>
                      <span>45%</span>
                    </div>
                    <Progress value={45} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>内存使用率</span>
                      <span>62%</span>
                    </div>
                    <Progress value={62} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>磁盘使用率</span>
                      <span>38%</span>
                    </div>
                    <Progress value={38} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>执行队列状态</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemStatus && (
                    <>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>当前利用率</span>
                          <span>{systemStatus.executions.currentUtilization.toFixed(1)}%</span>
                        </div>
                        <Progress value={systemStatus.executions.currentUtilization} />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium">运行中</div>
                          <div className="text-2xl font-bold text-blue-600">
                            {systemStatus.executions.running}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">排队中</div>
                          <div className="text-2xl font-bold text-yellow-600">
                            {systemStatus.executions.queued}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>最近日志</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2 font-mono text-sm">
                  <div className="text-green-600">
                    [2025-01-07 18:50:00] INFO: Workflow "系统健康检查" completed successfully
                  </div>
                  <div className="text-blue-600">
                    [2025-01-07 18:49:30] INFO: Starting workflow "系统健康检查"
                  </div>
                  <div className="text-yellow-600">
                    [2025-01-07 18:49:00] WARN: High CPU usage detected (85%)
                  </div>
                  <div className="text-red-600">
                    [2025-01-07 18:48:45] ERROR: Step "数据库连接检查" failed after 3 retries
                  </div>
                  <div className="text-blue-600">
                    [2025-01-07 18:48:00] INFO: Workflow "性能优化" started automatically
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
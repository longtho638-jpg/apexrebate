'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Globe, 
  Server, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Zap,
  Shield,
  BarChart3,
  Settings,
  RefreshCw,
  Plus,
  Play,
  Pause
} from 'lucide-react';

interface Region {
  id: string;
  name: string;
  code: string;
  endpoint: string;
  status: 'active' | 'inactive' | 'maintenance';
  latency: number;
  load: number;
  lastHealthCheck: Date;
  capabilities: string[];
}

interface Deployment {
  id: string;
  name: string;
  regions: string[];
  strategy: 'round-robin' | 'weighted' | 'geographic' | 'performance';
  failoverEnabled: boolean;
  healthCheckInterval: number;
  createdAt: Date;
  updatedAt: Date;
}

interface GlobalMetrics {
  totalRegions: number;
  activeRegions: number;
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  systemUptime: string;
  averageLatency: number;
  dataSyncStatus: string;
  lastSync: Date;
  alerts: Array<{
    id: string;
    type: string;
    message: string;
    severity: string;
  }>;
}

export default function MultiRegionDeployment() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [globalMetrics, setGlobalMetrics] = useState<GlobalMetrics | null>(null);
  const [regionalMetrics, setRegionalMetrics] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  useEffect(() => {
    fetchMultiRegionData();
    const interval = setInterval(fetchMultiRegionData, 30000); // 每30秒刷新
    return () => clearInterval(interval);
  }, []);

  const fetchMultiRegionData = async () => {
    try {
      const [regionsRes, deploymentsRes, statusRes, metricsRes] = await Promise.all([
        fetch('/api/multi-region?action=regions'),
        fetch('/api/multi-region?action=deployments'),
        fetch('/api/multi-region?action=status'),
        fetch('/api/multi-region?action=metrics')
      ]);

      const regionsData = await regionsRes.json();
      const deploymentsData = await deploymentsRes.json();
      const statusData = await statusRes.json();
      const metricsData = await metricsRes.json();

      setRegions(regionsData.regions || []);
      setDeployments(deploymentsData.deployments || []);
      setGlobalMetrics(statusData);
      setRegionalMetrics(metricsData);
    } catch (error) {
      console.error('Failed to fetch multi-region data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerFailover = async (deploymentId: string, targetRegion: string) => {
    try {
      const response = await fetch('/api/multi-region', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'trigger-failover',
          deploymentId,
          targetRegion
        })
      });

      if (response.ok) {
        fetchMultiRegionData(); // 刷新数据
      }
    } catch (error) {
      console.error('Failed to trigger failover:', error);
    }
  };

  const handleSyncData = async (sourceRegion: string, targetRegion: string) => {
    try {
      const response = await fetch('/api/multi-region', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync-data',
          sourceRegion,
          targetRegion
        })
      });

      if (response.ok) {
        fetchMultiRegionData(); // 刷新数据
      }
    } catch (error) {
      console.error('Failed to sync data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive': return <Pause className="h-4 w-4 text-gray-500" />;
      case 'maintenance': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 全局状态概览 */}
      {globalMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Regions</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{globalMetrics.activeRegions}/{globalMetrics.totalRegions}</div>
              <p className="text-xs text-muted-foreground">
                System uptime: {globalMetrics.systemUptime}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{globalMetrics.activeUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total: {globalMetrics.totalUsers.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{globalMetrics.totalTransactions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                All time total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{globalMetrics.averageLatency}ms</div>
              <p className="text-xs text-muted-foreground">
                Global average
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 警报信息 */}
      {globalMetrics?.alerts && globalMetrics.alerts.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {globalMetrics.alerts.map(alert => (
              <div key={alert.id} className="text-sm">
                <Badge variant={alert.severity === 'warning' ? 'destructive' : 'default'}>
                  {alert.type}
                </Badge>
                {' '}{alert.message}
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="regions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="regions">Regions</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="metrics">Regional Metrics</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
        </TabsList>

        {/* 区域管理 */}
        <TabsContent value="regions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Global Regions</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Region
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {regions.map((region) => (
              <Card key={region.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(region.status)}
                      <CardTitle className="text-lg">{region.name}</CardTitle>
                      <Badge variant="outline">{region.code}</Badge>
                    </div>
                    <div className={`h-2 w-2 rounded-full ${getStatusColor(region.status)}`} />
                  </div>
                  <CardDescription>{region.endpoint}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Latency</span>
                      <span className="text-sm font-medium">{region.latency}ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Load</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={region.load} className="w-16 h-2" />
                        <span className="text-sm font-medium">{region.load}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Capabilities</span>
                      <div className="flex flex-wrap gap-1">
                        {region.capabilities.map((cap) => (
                          <Badge key={cap} variant="secondary" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Last Check</span>
                      <span className="text-xs">
                        {new Date(region.lastHealthCheck).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 部署配置 */}
        <TabsContent value="deployments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Deployment Configurations</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Deployment
            </Button>
          </div>

          <div className="space-y-4">
            {deployments.map((deployment) => (
              <Card key={deployment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{deployment.name}</CardTitle>
                      <CardDescription>
                        Strategy: {deployment.strategy} | Health Check: {deployment.healthCheckInterval}s
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={deployment.failoverEnabled ? 'default' : 'secondary'}>
                        <Shield className="h-3 w-3 mr-1" />
                        Failover {deployment.failoverEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-muted-foreground">Active Regions:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {deployment.regions.map((regionId) => {
                          const region = regions.find(r => r.id === regionId);
                          return region ? (
                            <Badge key={regionId} variant="outline">
                              {region.code}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Created: {new Date(deployment.createdAt).toLocaleDateString()}</span>
                      <span className="text-muted-foreground">Updated: {new Date(deployment.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTriggerFailover(deployment.id, deployment.regions[0])}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Test Failover
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 区域指标 */}
        <TabsContent value="metrics" className="space-y-4">
          <h3 className="text-lg font-semibold">Regional Performance Metrics</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {Object.entries(regionalMetrics).map(([regionId, metrics]: [string, any]) => {
              const region = regions.find(r => r.id === regionId);
              if (!region) return null;

              return (
                <Card key={regionId}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <span>{region.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Users</span>
                          <div className="font-medium">{metrics.users.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Transactions</span>
                          <div className="font-medium">{metrics.transactions.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Revenue</span>
                          <div className="font-medium">${metrics.revenue.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">CPU</span>
                          <div className="flex items-center space-x-1">
                            <Progress value={metrics.cpuUsage} className="w-8 h-2" />
                            <span className="text-xs">{metrics.cpuUsage}%</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Memory</span>
                          <div className="flex items-center space-x-1">
                            <Progress value={metrics.memoryUsage} className="w-8 h-2" />
                            <span className="text-xs">{metrics.memoryUsage}%</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Disk</span>
                          <div className="flex items-center space-x-1">
                            <Progress value={metrics.diskUsage} className="w-8 h-2" />
                            <span className="text-xs">{metrics.diskUsage}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* 操作面板 */}
        <TabsContent value="operations" className="space-y-4">
          <h3 className="text-lg font-semibold">Operations & Management</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 故障转移操作 */}
            <Card>
              <CardHeader>
                <CardTitle>Failover Management</CardTitle>
                <CardDescription>
                  Manually trigger failover between regions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {deployments.map((deployment) => (
                  <div key={deployment.id} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">{deployment.name}</h4>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Select target region for failover:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {deployment.regions.map((regionId) => {
                          const region = regions.find(r => r.id === regionId);
                          return region ? (
                            <Button
                              key={regionId}
                              variant="outline"
                              size="sm"
                              onClick={() => handleTriggerFailover(deployment.id, regionId)}
                              disabled={region.status !== 'active'}
                            >
                              {region.code}
                            </Button>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 数据同步操作 */}
            <Card>
              <CardHeader>
                <CardTitle>Data Synchronization</CardTitle>
                <CardDescription>
                  Sync data between regions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Cross-Region Sync</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Source Region:</p>
                      <div className="flex flex-wrap gap-2">
                        {regions.filter(r => r.status === 'active').map((region) => (
                          <Badge key={region.id} variant="outline">
                            {region.code}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Target Region:</p>
                      <div className="flex flex-wrap gap-2">
                        {regions.filter(r => r.status === 'active').map((region) => (
                          <Badge key={region.id} variant="outline">
                            {region.code}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => handleSyncData('us-east-1', 'eu-west-1')}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Initiate Sync
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
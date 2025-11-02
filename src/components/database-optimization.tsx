'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  TrendingUp, 
  Clock, 
  Zap, 
  AlertTriangle, 
  CheckCircle2,
  BarChart3,
  Settings,
  Play,
  Trash2,
  Plus,
  RefreshCw,
  Search,
  Target,
  Activity,
  HardDrive
} from 'lucide-react';

interface QueryMetrics {
  query: string;
  executionTime: number;
  rowsAffected: number;
  timestamp: Date;
  cacheHit: boolean;
  indexes: string[];
}

interface PerformanceReport {
  totalQueries: number;
  averageExecutionTime: number;
  slowQueries: QueryMetrics[];
  cacheHitRate: number;
  indexUsage: Record<string, number>;
  recommendations: string[];
}

interface IndexAnalysis {
  tableName: string;
  indexName: string;
  columns: string[];
  usage: number;
  efficiency: number;
  recommendation: 'keep' | 'drop' | 'optimize' | 'create';
}

interface OptimizationSuggestion {
  category: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  estimatedImprovement: string;
  implementation: string;
}

export default function DatabaseOptimization() {
  const [performanceReport, setPerformanceReport] = useState<PerformanceReport | null>(null);
  const [indexAnalysis, setIndexAnalysis] = useState<IndexAnalysis[]>([]);
  const [slowQueries, setSlowQueries] = useState<any[]>([]);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuery, setSelectedQuery] = useState<string>('');
  const [queryAnalysis, setQueryAnalysis] = useState<any>(null);

  useEffect(() => {
    fetchDatabaseOptimizationData();
    const interval = setInterval(fetchDatabaseOptimizationData, 60000); // 每分钟刷新
    return () => clearInterval(interval);
  }, []);

  const fetchDatabaseOptimizationData = async () => {
    try {
      const [performanceRes, indexesRes, slowQueriesRes, cacheRes, suggestionsRes] = await Promise.all([
        fetch('/api/database-optimization?action=performance'),
        fetch('/api/database-optimization?action=indexes'),
        fetch('/api/database-optimization?action=slow-queries'),
        fetch('/api/database-optimization?action=cache-stats'),
        fetch('/api/database-optimization?action=optimization-suggestions')
      ]);

      const performanceData = await performanceRes.json();
      const indexesData = await indexesRes.json();
      const slowQueriesData = await slowQueriesRes.json();
      const cacheData = await cacheRes.json();
      const suggestionsData = await suggestionsRes.json();

      setPerformanceReport(performanceData);
      setIndexAnalysis(indexesData.analysis || []);
      setSlowQueries(slowQueriesData.slowQueries || []);
      setCacheStats(cacheData);
      setSuggestions(suggestionsData.suggestions || []);
    } catch (error) {
      console.error('Failed to fetch database optimization data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeTable = async (tableName: string) => {
    try {
      const response = await fetch('/api/database-optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'optimize-table',
          tableName
        })
      });

      if (response.ok) {
        fetchDatabaseOptimizationData();
      }
    } catch (error) {
      console.error('Failed to optimize table:', error);
    }
  };

  const handleCreateIndex = async (indexConfig: any) => {
    try {
      const response = await fetch('/api/database-optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-index',
          indexConfig
        })
      });

      if (response.ok) {
        fetchDatabaseOptimizationData();
      }
    } catch (error) {
      console.error('Failed to create index:', error);
    }
  };

  const handleDropIndex = async (indexName: string) => {
    try {
      const response = await fetch('/api/database-optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'drop-index',
          indexName
        })
      });

      if (response.ok) {
        fetchDatabaseOptimizationData();
      }
    } catch (error) {
      console.error('Failed to drop index:', error);
    }
  };

  const handleAnalyzeQuery = async (query: string) => {
    if (!query.trim()) return;

    try {
      const response = await fetch('/api/database-optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze-query',
          query
        })
      });

      if (response.ok) {
        const data = await response.json();
        setQueryAnalysis(data.analysis);
      }
    } catch (error) {
      console.error('Failed to analyze query:', error);
    }
  };

  const handleClearCache = async () => {
    try {
      const response = await fetch('/api/database-optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'clear-cache'
        })
      });

      if (response.ok) {
        fetchDatabaseOptimizationData();
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'keep': return 'bg-green-100 text-green-800';
      case 'optimize': return 'bg-yellow-100 text-yellow-800';
      case 'drop': return 'bg-red-100 text-red-800';
      case 'create': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
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
      {/* 性能概览 */}
      {performanceReport && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总查询数</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceReport.totalQueries.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                总执行查询
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">平均执行时间</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceReport.averageExecutionTime}ms</div>
              <p className="text-xs text-muted-foreground">
                所有查询平均
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">缓存命中率</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceReport.cacheHitRate}%</div>
              <p className="text-xs text-muted-foreground">
                查询缓存效率
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">慢查询</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceReport.slowQueries.length}</div>
              <p className="text-xs text-muted-foreground">
                需要优化
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">性能概览</TabsTrigger>
          <TabsTrigger value="indexes">索引分析</TabsTrigger>
          <TabsTrigger value="slow-queries">慢查询</TabsTrigger>
          <TabsTrigger value="cache">缓存管理</TabsTrigger>
          <TabsTrigger value="suggestions">优化建议</TabsTrigger>
          <TabsTrigger value="tools">优化工具</TabsTrigger>
        </TabsList>

        {/* 性能概览 */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 性能指标 */}
            <Card>
              <CardHeader>
                <CardTitle>性能指标</CardTitle>
                <CardDescription>数据库查询性能统计</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceReport?.indexUsage && Object.entries(performanceReport.indexUsage).map(([index, usage]) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{index}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={(usage as number) / 50} className="w-20 h-2" />
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {usage as number}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 推荐建议 */}
            <Card>
              <CardHeader>
                <CardTitle>优化建议</CardTitle>
                <CardDescription>基于当前性能的建议</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {performanceReport?.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-sm">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 索引分析 */}
        <TabsContent value="indexes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">索引分析</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              创建索引
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {indexAnalysis.map((index, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{index.indexName}</CardTitle>
                      <CardDescription>{index.tableName}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getRecommendationColor(index.recommendation)}>
                        {index.recommendation}
                      </Badge>
                      {index.recommendation === 'drop' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDropIndex(index.indexName)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      {index.recommendation === 'create' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCreateIndex({
                            tableName: index.tableName,
                            columns: index.columns,
                            indexName: index.indexName
                          })}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-muted-foreground">列:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {index.columns.map((col) => (
                          <Badge key={col} variant="secondary" className="text-xs">
                            {col}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">使用次数:</span>
                        <div className="font-medium">{index.usage}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">效率:</span>
                        <div className="font-medium">{index.efficiency}%</div>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">效率评分:</span>
                      <Progress value={index.efficiency} className="mt-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 慢查询 */}
        <TabsContent value="slow-queries" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">慢查询分析</h3>
            <Badge variant="destructive">
              {slowQueries.filter(q => q.impact === 'high').length} 高影响
            </Badge>
          </div>

          <div className="space-y-4">
            {slowQueries.map((query, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getPriorityColor(query.impact)}>
                          {query.impact}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          执行时间: {query.executionTime}ms
                        </span>
                        <span className="text-sm text-muted-foreground">
                          频率: {query.frequency}次
                        </span>
                      </div>
                      <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                        {query.query}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">建议:</span>
                      <span className="text-sm">{query.suggestion}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      最后出现: {new Date(query.lastSeen).toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 缓存管理 */}
        <TabsContent value="cache" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">缓存管理</h3>
            <Button variant="outline" onClick={handleClearCache}>
              <Trash2 className="h-4 w-4 mr-2" />
              清除缓存
            </Button>
          </div>

          {cacheStats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>查询缓存</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>命中率</span>
                      <span className="font-medium">{cacheStats.queryCache.hitRate}%</span>
                    </div>
                    <Progress value={cacheStats.queryCache.hitRate} />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">缓存大小:</span>
                        <div>{cacheStats.queryCache.size}MB</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">驱逐次数:</span>
                        <div>{cacheStats.queryCache.evictions}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>结果缓存</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>命中率</span>
                      <span className="font-medium">{cacheStats.resultCache.hitRate}%</span>
                    </div>
                    <Progress value={cacheStats.resultCache.hitRate} />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">缓存大小:</span>
                        <div>{cacheStats.resultCache.size}MB</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">驱逐次数:</span>
                        <div>{cacheStats.resultCache.evictions}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* 优化建议 */}
        <TabsContent value="suggestions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">优化建议</h3>
            <Badge>
              {suggestions.filter(s => s.priority === 'high').length} 高优先级
            </Badge>
          </div>

          <div className="space-y-4">
            {suggestions.map((suggestion, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{suggestion.title}</span>
                        <Badge className={getPriorityColor(suggestion.priority)}>
                          {suggestion.priority}
                        </Badge>
                        <Badge variant="outline">
                          {suggestion.estimatedImprovement} 改进
                        </Badge>
                      </CardTitle>
                      <CardDescription>{suggestion.category}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm">{suggestion.description}</p>
                    <div>
                      <span className="text-sm font-medium">实施方法:</span>
                      <p className="text-xs font-mono bg-gray-100 p-2 rounded mt-1">
                        {suggestion.implementation}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 优化工具 */}
        <TabsContent value="tools" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 查询分析器 */}
            <Card>
              <CardHeader>
                <CardTitle>查询分析器</CardTitle>
                <CardDescription>分析SQL查询性能</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="输入SQL查询..."
                      className="flex-1 px-3 py-2 border rounded-md"
                      value={selectedQuery}
                      onChange={(e) => setSelectedQuery(e.target.value)}
                    />
                    <Button onClick={() => handleAnalyzeQuery(selectedQuery)}>
                      <Search className="h-4 w-4 mr-2" />
                      分析
                    </Button>
                  </div>
                  
                  {queryAnalysis && (
                    <div className="space-y-3 p-3 bg-gray-50 rounded">
                      <div>
                        <span className="text-sm font-medium">执行计划成本:</span>
                        <span className="ml-2">{queryAnalysis.executionPlan.cost}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">预估改进:</span>
                        <span className="ml-2">{queryAnalysis.estimatedImprovement}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">建议:</span>
                        <ul className="mt-1 text-sm space-y-1">
                          {queryAnalysis.suggestions.map((suggestion: string, idx: number) => (
                            <li key={idx} className="flex items-center space-x-2">
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 快速操作 */}
            <Card>
              <CardHeader>
                <CardTitle>快速操作</CardTitle>
                <CardDescription>常用优化操作</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    className="w-full justify-start"
                    onClick={() => handleOptimizeTable('users')}
                  >
                    <HardDrive className="h-4 w-4 mr-2" />
                    优化 users 表
                  </Button>
                  <Button 
                    className="w-full justify-start"
                    onClick={() => handleOptimizeTable('payouts')}
                  >
                    <HardDrive className="h-4 w-4 mr-2" />
                    优化 payouts 表
                  </Button>
                  <Button 
                    className="w-full justify-start"
                    onClick={() => handleOptimizeTable('exchange_transactions')}
                  >
                    <HardDrive className="h-4 w-4 mr-2" />
                    优化 exchange_transactions 表
                  </Button>
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                    onClick={handleClearCache}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    清除所有缓存
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
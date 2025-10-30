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
  TrendingUp,
  TrendingDown,
  FileText,
  Code,
  Globe,
  Shield,
  Zap
} from 'lucide-react'

interface TestSuite {
  id: string
  name: string
  type: 'unit' | 'integration' | 'e2e' | 'performance' | 'security' | 'accessibility'
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped'
  duration: number
  tests: {
    total: number
    passed: number
    failed: number
    skipped: number
  }
  coverage?: number
  lastRun: string
}

interface TestResult {
  id: string
  suiteId: string
  testName: string
  status: 'passed' | 'failed' | 'skipped'
  duration: number
  error?: string
  timestamp: string
}

export default function AutomatedTestingDashboard() {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([])
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [selectedSuite, setSelectedSuite] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchTestSuites = async () => {
    try {
      const response = await fetch('/api/testing/suites')
      if (response.ok) {
        const data = await response.json()
        setTestSuites(data.data)
      } else {
        // 模拟数据
        const mockSuites: TestSuite[] = [
          {
            id: '1',
            name: '单元测试套件',
            type: 'unit',
            status: 'passed',
            duration: 120,
            tests: { total: 150, passed: 148, failed: 2, skipped: 0 },
            coverage: 85,
            lastRun: new Date(Date.now() - 10 * 60 * 1000).toISOString()
          },
          {
            id: '2',
            name: '集成测试套件',
            type: 'integration',
            status: 'failed',
            duration: 300,
            tests: { total: 45, passed: 42, failed: 3, skipped: 0 },
            coverage: 72,
            lastRun: new Date(Date.now() - 25 * 60 * 1000).toISOString()
          },
          {
            id: '3',
            name: 'E2E测试套件',
            type: 'e2e',
            status: 'running',
            duration: 0,
            tests: { total: 25, passed: 18, failed: 0, skipped: 0 },
            coverage: 65,
            lastRun: new Date().toISOString()
          },
          {
            id: '4',
            name: '性能测试套件',
            type: 'performance',
            status: 'pending',
            duration: 0,
            tests: { total: 15, passed: 0, failed: 0, skipped: 0 },
            coverage: 0,
            lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '5',
            name: '安全测试套件',
            type: 'security',
            status: 'passed',
            duration: 180,
            tests: { total: 30, passed: 30, failed: 0, skipped: 0 },
            coverage: 78,
            lastRun: new Date(Date.now() - 45 * 60 * 1000).toISOString()
          },
          {
            id: '6',
            name: '可访问性测试套件',
            type: 'accessibility',
            status: 'skipped',
            duration: 0,
            tests: { total: 20, passed: 0, failed: 0, skipped: 20 },
            coverage: 0,
            lastRun: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
          }
        ]
        setTestSuites(mockSuites)
      }
    } catch (error) {
      console.error('Failed to fetch test suites:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTestResults = async (suiteId?: string) => {
    try {
      const url = suiteId ? `/api/testing/results?suiteId=${suiteId}` : '/api/testing/results'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setTestResults(data.data)
      } else {
        // 模拟测试结果
        const mockResults: TestResult[] = [
          {
            id: '1',
            suiteId: '1',
            testName: 'User authentication test',
            status: 'passed',
            duration: 120,
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
          },
          {
            id: '2',
            suiteId: '1',
            testName: 'Data validation test',
            status: 'failed',
            duration: 85,
            error: 'Expected value to be truthy',
            timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString()
          }
        ]
        setTestResults(mockResults)
      }
    } catch (error) {
      console.error('Failed to fetch test results:', error)
    }
  }

  const runTestSuite = async (suiteId: string) => {
    setIsRunning(true)
    try {
      const response = await fetch('/api/testing/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suiteId })
      })

      if (response.ok) {
        // 更新测试套件状态
        setTestSuites(prev => 
          prev.map(suite => 
            suite.id === suiteId 
              ? { ...suite, status: 'running' as const }
              : suite
          )
        )
        
        // 模拟测试运行
        setTimeout(() => {
          fetchTestSuites()
          fetchTestResults(suiteId)
          setIsRunning(false)
        }, 5000)
      }
    } catch (error) {
      console.error('Failed to run test suite:', error)
      setIsRunning(false)
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    try {
      const response = await fetch('/api/testing/run-all', {
        method: 'POST'
      })

      if (response.ok) {
        // 更新所有测试套件状态
        setTestSuites(prev => 
          prev.map(suite => ({ ...suite, status: 'running' as const }))
        )
        
        // 模拟测试运行
        setTimeout(() => {
          fetchTestSuites()
          fetchTestResults()
          setIsRunning(false)
        }, 10000)
      }
    } catch (error) {
      console.error('Failed to run all tests:', error)
      setIsRunning(false)
    }
  }

  useEffect(() => {
    fetchTestSuites()
    fetchTestResults()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
      case 'skipped': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed': return <Badge className="bg-green-100 text-green-800">通过</Badge>
      case 'failed': return <Badge variant="destructive">失败</Badge>
      case 'running': return <Badge className="bg-blue-100 text-blue-800">运行中</Badge>
      case 'skipped': return <Badge variant="secondary">跳过</Badge>
      default: return <Badge variant="outline">待定</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'unit': return <Code className="h-4 w-4" />
      case 'integration': return <Globe className="h-4 w-4" />
      case 'e2e': return <Zap className="h-4 w-4" />
      case 'performance': return <TrendingUp className="h-4 w-4" />
      case 'security': return <Shield className="h-4 w-4" />
      case 'accessibility': return <FileText className="h-4 w-4" />
      default: return <Code className="h-4 w-4" />
    }
  }

  const calculateOverallStats = () => {
    const totalTests = testSuites.reduce((acc, suite) => acc + suite.tests.total, 0)
    const totalPassed = testSuites.reduce((acc, suite) => acc + suite.tests.passed, 0)
    const totalFailed = testSuites.reduce((acc, suite) => acc + suite.tests.failed, 0)
    const totalSkipped = testSuites.reduce((acc, suite) => acc + suite.tests.skipped, 0)
    const avgCoverage = testSuites.reduce((acc, suite) => acc + (suite.coverage || 0), 0) / testSuites.length

    return {
      total: totalTests,
      passed: totalPassed,
      failed: totalFailed,
      skipped: totalSkipped,
      passRate: totalTests > 0 ? (totalPassed / totalTests * 100) : 0,
      avgCoverage: avgCoverage || 0
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">加载测试数据...</span>
      </div>
    )
  }

  const stats = calculateOverallStats()

  return (
    <div className="space-y-6">
      {/* 头部控制 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">自动化测试</h2>
          <p className="text-muted-foreground">
            管理和执行自动化测试，确保代码质量
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={runAllTests}
            disabled={isRunning}
            className="bg-green-600 hover:bg-green-700"
          >
            {isRunning ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            运行所有测试
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              fetchTestSuites()
              fetchTestResults()
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
        </div>
      </div>

      {/* 测试概览统计 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总测试数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.passed} 通过, {stats.failed} 失败
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">通过率</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.passRate.toFixed(1)}%
            </div>
            <Progress value={stats.passRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">代码覆盖率</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.avgCoverage.toFixed(1)}%
            </div>
            <Progress value={stats.avgCoverage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">失败测试</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <p className="text-xs text-muted-foreground">
              需要立即修复
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">跳过测试</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.skipped}</div>
            <p className="text-xs text-muted-foreground">
              暂时跳过
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 测试套件列表 */}
      <Tabs defaultValue="suites" className="space-y-4">
        <TabsList>
          <TabsTrigger value="suites">测试套件</TabsTrigger>
          <TabsTrigger value="results">测试结果</TabsTrigger>
          <TabsTrigger value="coverage">覆盖率报告</TabsTrigger>
          <TabsTrigger value="performance">性能测试</TabsTrigger>
        </TabsList>

        <TabsContent value="suites" className="space-y-4">
          <div className="grid gap-4">
            {testSuites.map(suite => (
              <Card key={suite.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(suite.type)}
                      <div>
                        <CardTitle className="text-lg">{suite.name}</CardTitle>
                        <CardDescription>
                          最后运行: {new Date(suite.lastRun).toLocaleString()}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(suite.status)}
                      <Button
                        size="sm"
                        onClick={() => runTestSuite(suite.id)}
                        disabled={isRunning || suite.status === 'running'}
                      >
                        {suite.status === 'running' ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(suite.status)}
                      <div>
                        <p className="text-sm font-medium">状态</p>
                        <p className="text-xs text-muted-foreground capitalize">{suite.status}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">测试结果</p>
                      <p className="text-xs text-muted-foreground">
                        {suite.tests.passed}/{suite.tests.total} 通过
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">持续时间</p>
                      <p className="text-xs text-muted-foreground">{suite.duration}s</p>
                    </div>
                    {suite.coverage !== undefined && (
                      <div>
                        <p className="text-sm font-medium">覆盖率</p>
                        <div className="flex items-center gap-2">
                          <Progress value={suite.coverage} className="flex-1" />
                          <span className="text-xs">{suite.coverage}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>测试结果详情</CardTitle>
              <CardDescription>
                最新的测试执行结果和错误信息
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.map(result => (
                  <div key={result.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <p className="font-medium">{result.testName}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(result.timestamp).toLocaleString()} • {result.duration}ms
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(result.status)}
                    </div>
                    {result.error && (
                      <Alert className="mt-3">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>测试失败</AlertTitle>
                        <AlertDescription>{result.error}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coverage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>代码覆盖率报告</CardTitle>
              <CardDescription>
                详细的代码覆盖率分析
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">覆盖率报告</h3>
                <p className="text-gray-500 mb-4">
                  详细的代码覆盖率报告功能正在开发中
                </p>
                <div className="grid gap-4 md:grid-cols-3 max-w-2xl mx-auto">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">85%</div>
                    <p className="text-sm text-muted-foreground">行覆盖率</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">72%</div>
                    <p className="text-sm text-muted-foreground">分支覆盖率</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">91%</div>
                    <p className="text-sm text-muted-foreground">函数覆盖率</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>性能测试</CardTitle>
              <CardDescription>
                应用性能和负载测试结果
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">性能测试</h3>
                <p className="text-gray-500 mb-4">
                  性能测试功能正在开发中，包括负载测试、压力测试等
                </p>
                <Button variant="outline">
                  <Play className="h-4 w-4 mr-2" />
                  运行性能测试
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
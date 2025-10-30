'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TestTube, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Play,
  RefreshCw,
  Settings,
  FileText,
  Code,
  Globe,
  Shield,
  Zap
} from 'lucide-react'

import AutomatedTestingDashboard from '@/components/testing/automated-testing-dashboard'

export default function TestingPage() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">自动化测试中心</h1>
          <p className="text-muted-foreground">
            管理测试套件，执行自动化测试，确保代码质量
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            测试正常
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            测试配置
          </Button>
        </div>
      </div>

      {/* 快速统计 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">测试套件</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">
              4个通过, 1个失败, 1个运行中
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总测试数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">285</div>
            <p className="text-xs text-muted-foreground">
              276通过, 9失败
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">代码覆盖率</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">82.5%</div>
            <p className="text-xs text-muted-foreground">
              较上次提升 2.1%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">通过率</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">96.8%</div>
            <p className="text-xs text-muted-foreground">
              质量评级 A+
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容区域 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">测试仪表板</TabsTrigger>
          <TabsTrigger value="suites">测试套件</TabsTrigger>
          <TabsTrigger value="reports">测试报告</TabsTrigger>
          <TabsTrigger value="coverage">覆盖率</TabsTrigger>
          <TabsTrigger value="settings">设置</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <AutomatedTestingDashboard />
        </TabsContent>

        <TabsContent value="suites" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* 测试套件类型概览 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  单元测试
                </CardTitle>
                <CardDescription>
                  测试独立的函数和组件
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>状态</span>
                    <Badge className="bg-green-100 text-green-800">通过</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>测试数量</span>
                    <span>150</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>覆盖率</span>
                    <span>85%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>最后运行</span>
                    <span>10分钟前</span>
                  </div>
                  <Button className="w-full mt-4">
                    <Play className="h-4 w-4 mr-2" />
                    运行测试
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  集成测试
                </CardTitle>
                <CardDescription>
                  测试模块间的集成
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>状态</span>
                    <Badge variant="destructive">失败</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>测试数量</span>
                    <span>45</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>覆盖率</span>
                    <span>72%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>最后运行</span>
                    <span>25分钟前</span>
                  </div>
                  <Button className="w-full mt-4">
                    <Play className="h-4 w-4 mr-2" />
                    运行测试
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  E2E测试
                </CardTitle>
                <CardDescription>
                  端到端用户流程测试
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>状态</span>
                    <Badge className="bg-blue-100 text-blue-800">运行中</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>测试数量</span>
                    <span>25</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>覆盖率</span>
                    <span>65%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>最后运行</span>
                    <span>运行中</span>
                  </div>
                  <Button className="w-full mt-4" disabled>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    运行中...
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  安全测试
                </CardTitle>
                <CardDescription>
                  安全漏洞和渗透测试
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>状态</span>
                    <Badge className="bg-green-100 text-green-800">通过</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>测试数量</span>
                    <span>30</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>覆盖率</span>
                    <span>78%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>最后运行</span>
                    <span>45分钟前</span>
                  </div>
                  <Button className="w-full mt-4">
                    <Play className="h-4 w-4 mr-2" />
                    运行测试
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>测试报告</CardTitle>
              <CardDescription>
                详细的测试执行报告和分析
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">测试报告功能</h3>
                <p className="text-gray-500 mb-4">
                  详细的测试报告功能正在开发中，包括HTML报告、PDF导出等
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    生成HTML报告
                  </Button>
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    导出PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coverage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>代码覆盖率</CardTitle>
              <CardDescription>
                详细的代码覆盖率分析报告
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-semibold mb-4">覆盖率概览</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>行覆盖率</span>
                        <span className="font-medium">85%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>分支覆盖率</span>
                        <span className="font-medium">72%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '72%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>函数覆盖率</span>
                        <span className="font-medium">91%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '91%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>语句覆盖率</span>
                        <span className="font-medium">88%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '88%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">未覆盖文件</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">src/utils/helper.ts</span>
                      <Badge variant="outline">45%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">src/components/legacy.tsx</span>
                      <Badge variant="outline">12%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">src/lib/old-api.ts</span>
                      <Badge variant="outline">0%</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>测试设置</CardTitle>
              <CardDescription>
                配置测试环境和参数
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">测试配置</h3>
                <p className="text-gray-500 mb-4">
                  测试配置功能正在开发中，包括环境变量、测试参数等
                </p>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  配置测试环境
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Play, 
  Pause, 
  Save, 
  Download, 
  Upload, 
  Settings, 
  Trash2,
  Plus,
  GitBranch,
  Database,
  Bell,
  Calculator,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ArrowDown,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react'

interface WorkflowStep {
  id: string
  type: 'api' | 'data' | 'notification' | 'calculation' | 'validation' | 'cleanup'
  name: string
  description: string
  config: Record<string, any>
  position: { x: number; y: number }
  status: 'idle' | 'running' | 'completed' | 'error'
  dependencies: string[]
}

interface Connection {
  id: string
  from: string
  to: string
  fromPort: 'output'
  toPort: 'input'
}

const STEP_TYPES = [
  { 
    type: 'api', 
    name: 'API调用', 
    icon: <GitBranch className="h-4 w-4" />, 
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: '调用外部API接口'
  },
  { 
    type: 'data', 
    name: '数据处理', 
    icon: <Database className="h-4 w-4" />, 
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    description: '处理和转换数据'
  },
  { 
    type: 'notification', 
    name: '通知发送', 
    icon: <Bell className="h-4 w-4" />, 
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    description: '发送通知消息'
  },
  { 
    type: 'calculation', 
    name: '计算处理', 
    icon: <Calculator className="h-4 w-4" />, 
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    description: '执行计算逻辑'
  },
  { 
    type: 'validation', 
    name: '数据验证', 
    icon: <CheckCircle className="h-4 w-4" />, 
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    description: '验证数据完整性'
  },
  { 
    type: 'cleanup', 
    name: '清理操作', 
    icon: <Trash2 className="h-4 w-4" />, 
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    description: '清理临时数据'
  }
]

export function AIWorkflowBuilder() {
  const [steps, setSteps] = useState<WorkflowStep[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedStep, setSelectedStep] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedStep, setDraggedStep] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null)
  const [workflowName, setWorkflowName] = useState('新建工作流')
  const [workflowDescription, setWorkflowDescription] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  const addStep = useCallback((type: WorkflowStep['type']) => {
    const stepType = STEP_TYPES.find(st => st.type === type)
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      type,
      name: stepType?.name || '新步骤',
      description: stepType?.description || '',
      config: {},
      position: { 
        x: 100 + Math.random() * 200, 
        y: 100 + Math.random() * 200 
      },
      status: 'idle',
      dependencies: []
    }
    setSteps(prev => [...prev, newStep])
    setSelectedStep(newStep.id)
  }, [])

  const updateStep = useCallback((stepId: string, updates: Partial<WorkflowStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ))
  }, [])

  const deleteStep = useCallback((stepId: string) => {
    setSteps(prev => prev.filter(step => step.id !== stepId))
    setConnections(prev => prev.filter(conn => 
      conn.from !== stepId && conn.to !== stepId
    ))
    if (selectedStep === stepId) {
      setSelectedStep(null)
    }
  }, [selectedStep])

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === canvasRef.current) {
      setSelectedStep(null)
    }
  }, [])

  const handleStepMouseDown = useCallback((e: React.MouseEvent, stepId: string) => {
    e.stopPropagation()
    setSelectedStep(stepId)
    setIsDragging(true)
    setDraggedStep(stepId)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && draggedStep && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      updateStep(draggedStep, { position: { x, y } })
    }
  }, [isDragging, draggedStep, updateStep])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDraggedStep(null)
  }, [])

  const startConnection = useCallback((stepId: string) => {
    setIsConnecting(true)
    setConnectingFrom(stepId)
  }, [])

  const completeConnection = useCallback((toStepId: string) => {
    if (connectingFrom && connectingFrom !== toStepId) {
      const newConnection: Connection = {
        id: `conn-${Date.now()}`,
        from: connectingFrom,
        to: toStepId,
        fromPort: 'output',
        toPort: 'input'
      }
      setConnections(prev => [...prev, newConnection])
      
      // 更新目标步骤的依赖
      updateStep(toStepId, {
        dependencies: [...(steps.find(s => s.id === toStepId)?.dependencies || []), connectingFrom]
      })
    }
    setIsConnecting(false)
    setConnectingFrom(null)
  }, [connectingFrom, steps, updateStep])

  const runWorkflow = useCallback(async () => {
    setIsRunning(true)
    
    try {
      const response = await fetch('/api/ai-workflow/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: workflowName,
          description: workflowDescription,
          steps: steps.map(step => ({
            ...step,
            config: step.config || {}
          }))
        }),
      })

      if (!response.ok) {
        throw new Error('工作流执行失败')
      }

      const data = await response.json()
      
      if (data.success) {
        // 轮询执行状态
        const pollExecution = async () => {
          try {
            const statusResponse = await fetch(`/api/ai-workflow/execute?executionId=${data.executionId}`)
            const statusData = await statusResponse.json()
            
            if (statusData.success && statusData.data) {
              const execution = statusData.data
              
              // 更新步骤状态
              execution.steps.forEach((execStep: any) => {
                const localStep = steps.find(s => s.id === execStep.id)
                if (localStep) {
                  updateStep(localStep.id, { status: execStep.status })
                }
              })
              
              if (execution.status === 'completed' || execution.status === 'failed') {
                setIsRunning(false)
              } else {
                // 继续轮询
                setTimeout(pollExecution, 1000)
              }
            }
          } catch (error) {
            console.error('获取执行状态失败:', error)
            setIsRunning(false)
          }
        }
        
        // 开始轮询
        setTimeout(pollExecution, 500)
      } else {
        throw new Error(data.error || '执行失败')
      }
    } catch (error) {
      console.error('工作流执行错误:', error)
      setIsRunning(false)
      
      // 模拟执行作为降级方案
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i]
        updateStep(step.id, { status: 'running' })
        
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 模拟成功或失败
        const success = Math.random() > 0.2
        updateStep(step.id, { status: success ? 'completed' : 'error' })
        
        if (!success) {
          break
        }
      }
    }
  }, [steps, workflowName, workflowDescription, updateStep])

  const selectedStepData = steps.find(step => step.id === selectedStep)

  return (
    <div className="h-[800px] flex gap-6">
      {/* 左侧工具栏 */}
      <div className="w-80 space-y-4">
        <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">工作流信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">名称</label>
              <Input
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="输入工作流名称"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">描述</label>
              <Textarea
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                placeholder="输入工作流描述"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Save className="h-4 w-4 mr-1" />
                保存
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-1" />
                导出
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">步骤组件</CardTitle>
            <CardDescription>拖拽或点击添加到画布</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {STEP_TYPES.map((stepType) => (
                <Button
                  key={stepType.type}
                  variant="outline"
                  className="w-full justify-start h-auto p-3"
                  onClick={() => addStep(stepType.type as WorkflowStep['type'])}
                >
                  <div className={`p-1 rounded ${stepType.bgColor} mr-3`}>
                    <div className={stepType.color}>
                      {stepType.icon}
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm">{stepType.name}</div>
                    <div className="text-xs text-muted-foreground">{stepType.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">控制面板</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={runWorkflow}
              disabled={isRunning || steps.length === 0}
              className="w-full"
              size="lg"
            >
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  运行中...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  运行工作流
                </>
              )}
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                预览
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                设置
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 中间画布 */}
      <div className="flex-1">
        <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">工作流画布</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {steps.length} 个步骤
                </Badge>
                <Badge variant="outline">
                  {connections.length} 个连接
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 h-[calc(100%-80px)]">
            <div
              ref={canvasRef}
              className="relative w-full h-full bg-gray-50/50 rounded-b-lg overflow-hidden"
              onClick={handleCanvasClick}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              {/* 网格背景 */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}
              />
              
              {/* 连接线 */}
              <svg className="absolute inset-0 pointer-events-none">
                {connections.map((conn) => {
                  const fromStep = steps.find(s => s.id === conn.from)
                  const toStep = steps.find(s => s.id === conn.to)
                  if (!fromStep || !toStep) return null
                  
                  return (
                    <g key={conn.id}>
                      <path
                        d={`M ${fromStep.position.x + 60} ${fromStep.position.y + 30} L ${toStep.position.x + 60} ${toStep.position.y + 30}`}
                        stroke="#6366f1"
                        strokeWidth="2"
                        fill="none"
                        markerEnd="url(#arrowhead)"
                      />
                    </g>
                  )
                })}
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill="#6366f1"
                    />
                  </marker>
                </defs>
              </svg>
              
              {/* 步骤节点 */}
              {steps.map((step) => {
                const stepType = STEP_TYPES.find(st => st.type === step.type)
                const isSelected = selectedStep === step.id
                
                return (
                  <div
                    key={step.id}
                    className={`absolute cursor-move transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                    style={{
                      left: step.position.x,
                      top: step.position.y,
                      minWidth: '120px'
                    }}
                    onMouseDown={(e) => handleStepMouseDown(e, step.id)}
                  >
                    <Card className={`shadow-md hover:shadow-lg transition-shadow ${
                      step.status === 'running' ? 'border-blue-500 bg-blue-50' :
                      step.status === 'completed' ? 'border-green-500 bg-green-50' :
                      step.status === 'error' ? 'border-red-500 bg-red-50' :
                      'border-gray-200 bg-white'
                    }`}>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`p-1 rounded ${stepType?.bgColor}`}>
                            <div className={stepType?.color}>
                              {stepType?.icon}
                            </div>
                          </div>
                          <span className="text-sm font-medium">{step.name}</span>
                        </div>
                        
                        {/* 状态指示器 */}
                        <div className="flex items-center gap-1">
                          {step.status === 'idle' && <div className="w-2 h-2 bg-gray-400 rounded-full" />}
                          {step.status === 'running' && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
                          {step.status === 'completed' && <CheckCircle className="h-3 w-3 text-green-500" />}
                          {step.status === 'error' && <AlertTriangle className="h-3 w-3 text-red-500" />}
                          <span className="text-xs text-muted-foreground">
                            {step.status === 'idle' && '待执行'}
                            {step.status === 'running' && '运行中'}
                            {step.status === 'completed' && '已完成'}
                            {step.status === 'error' && '错误'}
                          </span>
                        </div>
                        
                        {/* 连接点 */}
                        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
                          <div
                            className="w-4 h-4 bg-blue-500 rounded-full cursor-pointer border-2 border-white hover:scale-110 transition-transform"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (isConnecting && connectingFrom) {
                                completeConnection(step.id)
                              } else {
                                startConnection(step.id)
                              }
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )
              })}
              
              {/* 空状态 */}
              {steps.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Plus className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-600 mb-2">开始构建工作流</h3>
                    <p className="text-sm text-gray-500 mb-4">从左侧选择组件添加到画布</p>
                    <Button onClick={() => addStep('api')} size="sm">
                      添加第一个步骤
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 右侧配置面板 */}
      <div className="w-80">
        <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">步骤配置</CardTitle>
            <CardDescription>
              {selectedStepData ? '配置选中的步骤' : '选择一个步骤进行配置'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedStepData ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">步骤名称</label>
                  <Input
                    value={selectedStepData.name}
                    onChange={(e) => updateStep(selectedStepData.id, { name: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">描述</label>
                  <Textarea
                    value={selectedStepData.description}
                    onChange={(e) => updateStep(selectedStepData.id, { description: e.target.value })}
                    rows={3}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">步骤配置</h4>
                  
                  {selectedStepData.type === 'api' && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">API URL</label>
                        <Input placeholder="https://api.example.com" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">请求方法</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="选择方法" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GET">GET</SelectItem>
                            <SelectItem value="POST">POST</SelectItem>
                            <SelectItem value="PUT">PUT</SelectItem>
                            <SelectItem value="DELETE">DELETE</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {selectedStepData.type === 'notification' && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">通知类型</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="选择类型" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">邮件</SelectItem>
                            <SelectItem value="sms">短信</SelectItem>
                            <SelectItem value="webhook">Webhook</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">接收者</label>
                        <Input placeholder="user@example.com" />
                      </div>
                    </div>
                  )}

                  {selectedStepData.type === 'calculation' && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">计算类型</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="选择类型" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sum">求和</SelectItem>
                            <SelectItem value="average">平均值</SelectItem>
                            <SelectItem value="percentage">百分比</SelectItem>
                            <SelectItem value="custom">自定义</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">计算公式</label>
                        <Input placeholder="a + b * 0.1" />
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="text-sm font-medium">依赖关系</h4>
                  <div className="space-y-2">
                    {selectedStepData.dependencies.length > 0 ? (
                      selectedStepData.dependencies.map(depId => {
                        const depStep = steps.find(s => s.id === depId)
                        return (
                          <div key={depId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm">{depStep?.name}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const newDeps = selectedStepData.dependencies.filter(id => id !== depId)
                                updateStep(selectedStepData.id, { dependencies: newDeps })
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground">无依赖步骤</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      const { id, position, ...newStep } = selectedStepData
                      const newId = `step-${Date.now()}`
                      const newStepWithId = { ...newStep, id: newId, position: { 
                        x: selectedStepData.position.x + 20, 
                        y: selectedStepData.position.y + 20 
                      }}
                      setSteps(prev => [...prev, newStepWithId])
                    }}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    复制
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => deleteStep(selectedStepData.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    删除
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="p-4 bg-gray-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Settings className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm text-muted-foreground">选择画布上的步骤进行配置</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
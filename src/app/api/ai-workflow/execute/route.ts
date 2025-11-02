import { NextRequest, NextResponse } from 'next/server'

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

interface WorkflowExecution {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  status: 'pending' | 'running' | 'completed' | 'failed'
  startTime?: Date
  endTime?: Date
  results: Record<string, any>
  logs: Array<{
    stepId: string
    timestamp: Date
    level: 'info' | 'warn' | 'error'
    message: string
    data?: any
  }>
}

// 存储执行状态（实际应用中应使用数据库）
const executions = new Map<string, WorkflowExecution>()

export async function POST(request: NextRequest) {
  try {
    const workflowData = await request.json()
    
    // 验证工作流数据
    if (!workflowData.name || !workflowData.steps || !Array.isArray(workflowData.steps)) {
      return NextResponse.json(
        { error: '工作流数据无效' },
        { status: 400 }
      )
    }

    // 创建执行实例
    const executionId = `exec-${Date.now()}`
    const execution: WorkflowExecution = {
      id: executionId,
      name: workflowData.name,
      description: workflowData.description || '',
      steps: workflowData.steps,
      status: 'pending',
      results: {},
      logs: []
    }

    executions.set(executionId, execution)

    // 异步执行工作流
    executeWorkflow(executionId)

    return NextResponse.json({
      success: true,
      executionId,
      message: '工作流已开始执行',
      status: 'pending'
    })

  } catch (error) {
    console.error('工作流执行API错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// GET - 获取执行状态
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const executionId = searchParams.get('executionId')

    if (!executionId) {
      return NextResponse.json(
        { error: '缺少执行ID' },
        { status: 400 }
      )
    }

    const execution = executions.get(executionId)
    
    if (!execution) {
      return NextResponse.json(
        { error: '执行记录不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: execution
    })

  } catch (error) {
    console.error('获取执行状态API错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

async function executeWorkflow(executionId: string) {
  const execution = executions.get(executionId)
  if (!execution) return

  try {
    execution.status = 'running'
    execution.startTime = new Date()
    
    addLog(executionId, 'info', '工作流开始执行')

    // 获取执行顺序（基于依赖关系）
    const executionOrder = getExecutionOrder(execution.steps)
    
    // 按顺序执行步骤
    for (const stepId of executionOrder) {
      const step = execution.steps.find(s => s.id === stepId)
      if (!step) continue

      try {
        await executeStep(executionId, step)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        addLog(executionId, 'error', `步骤 ${step.name} 执行失败`, { error: errorMessage })
        step.status = 'error'
        execution.status = 'failed'
        execution.endTime = new Date()
        return
      }
    }

    execution.status = 'completed'
    execution.endTime = new Date()
    addLog(executionId, 'info', '工作流执行完成')

  } catch (error) {
    execution.status = 'failed'
    execution.endTime = new Date()
    const errorMessage = error instanceof Error ? error.message : String(error)
    addLog(executionId, 'error', '工作流执行失败', { error: errorMessage })
  }
}

async function executeStep(executionId: string, step: WorkflowStep) {
  const execution = executions.get(executionId)
  if (!execution) throw new Error('执行记录不存在')

  step.status = 'running'
  addLog(executionId, 'info', `开始执行步骤: ${step.name}`)

  try {
    switch (step.type) {
      case 'api':
        await executeApiStep(executionId, step)
        break
      case 'data':
        await executeDataStep(executionId, step)
        break
      case 'notification':
        await executeNotificationStep(executionId, step)
        break
      case 'calculation':
        await executeCalculationStep(executionId, step)
        break
      case 'validation':
        await executeValidationStep(executionId, step)
        break
      case 'cleanup':
        await executeCleanupStep(executionId, step)
        break
      default:
        throw new Error(`未知的步骤类型: ${step.type}`)
    }

    step.status = 'completed'
    addLog(executionId, 'info', `步骤完成: ${step.name}`)

  } catch (error) {
    step.status = 'error'
    throw error
  }
}

async function executeApiStep(executionId: string, step: WorkflowStep) {
  const { url, method = 'GET', headers = {}, body } = step.config
  
  addLog(executionId, 'info', `调用API: ${method} ${url}`)
  
  // 模拟API调用
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 模拟响应
  const mockResponse = {
    status: 'success',
    data: { message: 'API调用成功', timestamp: new Date().toISOString() }
  }
  
  const execution = executions.get(executionId)
  if (execution) {
    execution.results[step.id] = mockResponse
  }
  
  addLog(executionId, 'info', 'API调用成功', mockResponse)
}

async function executeDataStep(executionId: string, step: WorkflowStep) {
  const { operation, source, target } = step.config
  
  addLog(executionId, 'info', `执行数据操作: ${operation}`)
  
  // 模拟数据处理
  await new Promise(resolve => setTimeout(resolve, 800))
  
  const mockResult = {
    processed: true,
    records: Math.floor(Math.random() * 1000) + 100,
    operation
  }
  
  const execution = executions.get(executionId)
  if (execution) {
    execution.results[step.id] = mockResult
  }
  
  addLog(executionId, 'info', '数据处理完成', mockResult)
}

async function executeNotificationStep(executionId: string, step: WorkflowStep) {
  const { type, recipients, message, template } = step.config
  
  addLog(executionId, 'info', `发送${type}通知给 ${recipients?.length || 0} 个接收者`)
  
  // 模拟通知发送
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const mockResult = {
    sent: true,
    recipients: recipients?.length || 0,
    type,
    messageId: `msg-${Date.now()}`
  }
  
  const execution = executions.get(executionId)
  if (execution) {
    execution.results[step.id] = mockResult
  }
  
  addLog(executionId, 'info', '通知发送成功', mockResult)
}

async function executeCalculationStep(executionId: string, step: WorkflowStep) {
  const { formula, variables } = step.config
  
  addLog(executionId, 'info', `执行计算: ${formula}`)
  
  // 模拟计算
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const mockResult = {
    formula,
    result: Math.floor(Math.random() * 10000) + 1000,
    variables,
    timestamp: new Date().toISOString()
  }
  
  const execution = executions.get(executionId)
  if (execution) {
    execution.results[step.id] = mockResult
  }
  
  addLog(executionId, 'info', '计算完成', mockResult)
}

async function executeValidationStep(executionId: string, step: WorkflowStep) {
  const { rules, data } = step.config
  
  addLog(executionId, 'info', `执行验证: ${rules?.length || 0} 条规则`)
  
  // 模拟验证
  await new Promise(resolve => setTimeout(resolve, 200))
  
  const mockResult = {
    valid: Math.random() > 0.2, // 80% 概率通过
    rules: rules?.length || 0,
    passed: Math.floor(Math.random() * (rules?.length || 5)) + 1,
    failed: Math.random() > 0.8 ? 1 : 0
  }
  
  const execution = executions.get(executionId)
  if (execution) {
    execution.results[step.id] = mockResult
  }
  
  addLog(executionId, 'info', '验证完成', mockResult)
}

async function executeCleanupStep(executionId: string, step: WorkflowStep) {
  const { target, policy } = step.config
  
  addLog(executionId, 'info', `执行清理: ${target}`)
  
  // 模拟清理
  await new Promise(resolve => setTimeout(resolve, 400))
  
  const mockResult = {
    cleaned: true,
    target,
    policy,
    items: Math.floor(Math.random() * 100) + 10,
    space: `${Math.floor(Math.random() * 100) + 10}MB`
  }
  
  const execution = executions.get(executionId)
  if (execution) {
    execution.results[step.id] = mockResult
  }
  
  addLog(executionId, 'info', '清理完成', mockResult)
}

function getExecutionOrder(steps: WorkflowStep[]): string[] {
  const order: string[] = []
  const visited = new Set<string>()
  const visiting = new Set<string>()

  function visit(stepId: string) {
    if (visiting.has(stepId)) {
      throw new Error(`检测到循环依赖: ${stepId}`)
    }
    
    if (visited.has(stepId)) {
      return
    }

    visiting.add(stepId)
    
    const step = steps.find(s => s.id === stepId)
    if (step) {
      for (const depId of step.dependencies) {
        visit(depId)
      }
    }
    
    visiting.delete(stepId)
    visited.add(stepId)
    order.push(stepId)
  }

  for (const step of steps) {
    visit(step.id)
  }

  return order
}

function addLog(executionId: string, level: 'info' | 'warn' | 'error', message: string, data?: any) {
  const execution = executions.get(executionId)
  if (execution) {
    execution.logs.push({
      stepId: 'system',
      timestamp: new Date(),
      level,
      message,
      data
    })
  }
}
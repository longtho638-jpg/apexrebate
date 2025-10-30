'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Upload, 
  Settings,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap
} from 'lucide-react'

interface AutomationControl {
  id: string
  name: string
  description: string
  status: 'running' | 'stopped' | 'error'
  lastRun: string
  nextRun: string
  enabled: boolean
  actions: string[]
}

export default function AutomationControlPanel() {
  const [controls, setControls] = useState<AutomationControl[]>([
    {
      id: 'deploy',
      name: '自动部署',
      description: '零停机部署系统',
      status: 'stopped',
      lastRun: '2025-01-07 06:00:00',
      nextRun: '2025-01-08 06:00:00',
      enabled: true,
      actions: ['deploy', 'rollback', 'status']
    },
    {
      id: 'monitor',
      name: '系统监控',
      description: '实时健康监控',
      status: 'running',
      lastRun: '2025-01-07 18:46:00',
      nextRun: '持续运行',
      enabled: true,
      actions: ['restart', 'configure', 'logs']
    },
    {
      id: 'backup',
      name: '数据备份',
      description: '自动备份到云存储',
      status: 'stopped',
      lastRun: '2025-01-07 02:00:00',
      nextRun: '2025-01-08 02:00:00',
      enabled: true,
      actions: ['backup', 'restore', 'verify']
    },
    {
      id: 'scheduler',
      name: '任务调度',
      description: '自动化任务管理',
      status: 'running',
      lastRun: '2025-01-07 18:45:00',
      nextRun: '持续运行',
      enabled: true,
      actions: ['add-task', 'list-tasks', 'logs']
    },
    {
      id: 'cleanup',
      name: '系统清理',
      description: '日志和缓存清理',
      status: 'stopped',
      lastRun: '2025-01-07 01:00:00',
      nextRun: '2025-01-08 01:00:00',
      enabled: true,
      actions: ['cleanup', 'configure', 'schedule']
    },
    {
      id: 'security',
      name: '安全扫描',
      description: '安全漏洞扫描',
      status: 'stopped',
      lastRun: '2025-01-07 12:00:00',
      nextRun: '2025-01-08 12:00:00',
      enabled: true,
      actions: ['scan', 'report', 'configure']
    }
  ])

  const handleToggle = (id: string) => {
    setControls(prev => prev.map(control => 
      control.id === id 
        ? { ...control, enabled: !control.enabled }
        : control
    ))
  }

  const handleAction = async (id: string, action: string) => {
    console.log(`Executing ${action} on ${id}`)
    
    try {
      if (id === 'security' && action === 'scan') {
        // 执行安全扫描
        const response = await fetch('/api/security/scan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const result = await response.json()
          console.log('Security scan completed:', result.data)
          
          // 更新安全扫描状态
          setControls(prev => prev.map(control => 
            control.id === 'security' 
              ? { 
                  ...control, 
                  status: 'running',
                  lastRun: new Date().toLocaleString('zh-CN'),
                  enabled: true
                }
              : control
          ))
          
          // 模拟扫描完成后更新状态
          setTimeout(() => {
            setControls(prev => prev.map(control => 
              control.id === 'security' 
                ? { 
                    ...control, 
                    status: result.data.totalVulnerabilities > 0 ? 'error' : 'stopped',
                    lastRun: new Date().toLocaleString('zh-CN')
                  }
                : control
            ))
          }, 5000)
        } else {
          console.error('Security scan failed')
          setControls(prev => prev.map(control => 
            control.id === 'security' 
              ? { ...control, status: 'error' }
              : control
          ))
        }
      } else if (id === 'security' && action === 'report') {
        // 获取安全报告
        const response = await fetch('/api/security/scan')
        if (response.ok) {
          const result = await response.json()
          console.log('Security report:', result.data)
        }
      } else if (id === 'backup' && action === 'cleanup') {
        // 执行备份清理
        const response = await fetch('/api/backup/cleanup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            retentionDays: 7,
            dryRun: false
          })
        })
        
        if (response.ok) {
          const result = await response.json()
          console.log('Backup cleanup completed:', result.data)
          
          // 更新备份状态
          setControls(prev => prev.map(control => 
            control.id === 'backup' 
              ? { 
                  ...control, 
                  status: 'stopped',
                  lastRun: new Date().toLocaleString('zh-CN')
                }
              : control
          ))
        } else {
          console.error('Backup cleanup failed')
        }
      } else {
        // 其他操作的默认处理
        console.log(`Action ${action} on ${id} executed`)
      }
    } catch (error) {
      console.error(`Failed to execute ${action} on ${id}:`, error)
      setControls(prev => prev.map(control => 
        control.id === 'security' 
          ? { ...control, status: 'error' }
          : control
      ))
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'stopped':
        return <Clock className="h-4 w-4 text-gray-500" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      running: 'bg-green-100 text-green-800',
      stopped: 'bg-gray-100 text-gray-800',
      error: 'bg-red-100 text-red-800'
    }
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status === 'running' ? '运行中' : 
         status === 'stopped' ? '已停止' : '错误'}
      </Badge>
    )
  }

  const getActionButton = (action: string) => {
    const icons = {
      deploy: <Upload className="h-4 w-4" />,
      rollback: <RotateCcw className="h-4 w-4" />,
      restart: <Play className="h-4 w-4" />,
      backup: <Download className="h-4 w-4" />,
      restore: <Upload className="h-4 w-4" />,
      scan: <Zap className="h-4 w-4" />,
      configure: <Settings className="h-4 w-4" />,
      logs: <Download className="h-4 w-4" />,
      report: <Download className="h-4 w-4" />,
      schedule: <Clock className="h-4 w-4" />,
      cleanup: <RotateCcw className="h-4 w-4" />
    }
    
    const labels = {
      deploy: '部署',
      rollback: '回滚',
      restart: '重启',
      backup: '备份',
      restore: '恢复',
      scan: '扫描',
      configure: '配置',
      logs: '日志',
      report: '报告',
      schedule: '计划',
      cleanup: '清理'
    }

    return (
      <Button
        key={action}
        variant="outline"
        size="sm"
        onClick={() => handleAction(action, action)}
        className="flex items-center space-x-1"
      >
        {icons[action as keyof typeof icons]}
        <span>{labels[action as keyof typeof labels]}</span>
      </Button>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>自动化控制面板</span>
        </CardTitle>
        <CardDescription>
          管理和控制所有自动化任务的运行状态
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {controls.map((control) => (
            <div key={control.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(control.status)}
                  <div>
                    <h3 className="font-semibold">{control.name}</h3>
                    <p className="text-sm text-slate-600">{control.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(control.status)}
                  <Switch
                    checked={control.enabled}
                    onCheckedChange={() => handleToggle(control.id)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3 text-sm text-slate-600">
                <div>
                  <span className="font-medium">上次运行:</span> {control.lastRun}
                </div>
                <div>
                  <span className="font-medium">下次运行:</span> {control.nextRun}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {control.actions.map((action) => getActionButton(action))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
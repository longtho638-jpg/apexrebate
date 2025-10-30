'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Search, 
  Download, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Clock,
  Filter
} from 'lucide-react'

interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'warning' | 'error' | 'success'
  service: string
  message: string
  details?: string
}

export default function SystemLogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [serviceFilter, setServiceFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)

  // 模拟日志数据
  const mockLogs: LogEntry[] = [
    {
      id: '1',
      timestamp: '2025-01-07 18:46:23',
      level: 'success',
      service: 'deploy',
      message: '部署成功完成 - 版本 v2.1.0',
      details: '部署时间: 3分45秒，零停机时间'
    },
    {
      id: '2',
      timestamp: '2025-01-07 18:45:15',
      level: 'info',
      service: 'monitor',
      message: '系统健康检查通过',
      details: 'CPU: 23%, 内存: 67%, 磁盘: 45%'
    },
    {
      id: '3',
      timestamp: '2025-01-07 18:44:02',
      level: 'warning',
      service: 'backup',
      message: '备份存储空间使用率达到 80%',
      details: '建议清理旧备份文件或增加存储空间'
    },
    {
      id: '4',
      timestamp: '2025-01-07 18:43:30',
      level: 'error',
      service: 'security',
      message: '安全扫描服务异常',
      details: '无法连接到安全扫描API，请检查网络连接'
    },
    {
      id: '5',
      timestamp: '2025-01-07 18:42:18',
      level: 'success',
      service: 'scheduler',
      message: '定时任务执行完成',
      details: '15个任务全部执行成功，耗时 2.3秒'
    },
    {
      id: '6',
      timestamp: '2025-01-07 18:41:05',
      level: 'info',
      service: 'performance',
      message: '缓存命中率提升至 87.3%',
      details: '优化了查询缓存策略'
    },
    {
      id: '7',
      timestamp: '2025-01-07 18:40:22',
      level: 'warning',
      service: 'database',
      message: '数据库连接池使用率较高',
      details: '当前使用率: 85%，建议增加连接池大小'
    },
    {
      id: '8',
      timestamp: '2025-01-07 18:39:10',
      level: 'success',
      service: 'api',
      message: 'API响应时间优化完成',
      details: '平均响应时间从 180ms 降至 145ms'
    }
  ]

  useEffect(() => {
    setLogs(mockLogs)
    setFilteredLogs(mockLogs)
  }, [])

  useEffect(() => {
    let filtered = logs

    // 按级别过滤
    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter)
    }

    // 按服务过滤
    if (serviceFilter !== 'all') {
      filtered = filtered.filter(log => log.service === serviceFilter)
    }

    // 按搜索词过滤
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    setFilteredLogs(filtered)
  }, [logs, levelFilter, serviceFilter, searchTerm])

  const handleRefresh = () => {
    setIsLoading(true)
    // 模拟刷新日志
    setTimeout(() => {
      setLogs(mockLogs)
      setIsLoading(false)
    }, 1000)
  }

  const handleExport = () => {
    const csvContent = [
      ['时间', '级别', '服务', '消息', '详情'],
      ...filteredLogs.map(log => [
        log.timestamp,
        log.level,
        log.service,
        log.message,
        log.details || ''
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getLevelBadge = (level: string) => {
    const variants = {
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800'
    }
    return (
      <Badge className={variants[level as keyof typeof variants]}>
        {level === 'success' ? '成功' : 
         level === 'warning' ? '警告' : 
         level === 'error' ? '错误' : '信息'}
      </Badge>
    )
  }

  const services = Array.from(new Set(logs.map(log => log.service)))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>系统日志</span>
        </CardTitle>
        <CardDescription>
          实时查看系统运行日志和事件记录
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 过滤器 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索日志..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="级别" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部级别</SelectItem>
              <SelectItem value="success">成功</SelectItem>
              <SelectItem value="info">信息</SelectItem>
              <SelectItem value="warning">警告</SelectItem>
              <SelectItem value="error">错误</SelectItem>
            </SelectContent>
          </Select>
          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="服务" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部服务</SelectItem>
              {services.map(service => (
                <SelectItem key={service} value={service}>
                  {service}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
            >
              <Download className="h-4 w-4 mr-1" />
              导出
            </Button>
          </div>
        </div>

        {/* 日志列表 */}
        <ScrollArea className="h-[400px] border rounded-lg">
          <div className="p-4 space-y-3">
            {filteredLogs.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>没有找到匹配的日志</p>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="border-l-2 border-gray-200 pl-4 py-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getLevelIcon(log.level)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">{log.service}</span>
                          {getLevelBadge(log.level)}
                          <span className="text-xs text-gray-500">{log.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-900">{log.message}</p>
                        {log.details && (
                          <p className="text-xs text-gray-600 mt-1">{log.details}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* 统计信息 */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div>
            显示 {filteredLogs.length} / {logs.length} 条日志
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>成功: {logs.filter(l => l.level === 'success').length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>信息: {logs.filter(l => l.level === 'info').length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <span>警告: {logs.filter(l => l.level === 'warning').length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span>错误: {logs.filter(l => l.level === 'error').length}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
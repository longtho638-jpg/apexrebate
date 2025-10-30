'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign, 
  Globe, 
  Settings,
  RefreshCw,
  Plus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react'

interface Exchange {
  name: string
  status: 'online' | 'offline' | 'error'
  lastUpdate: number
  responseTime: number
  tickersCount: number
  pairsCount: number
  errorCount: number
}

interface Ticker {
  symbol: string
  exchanges: Array<{
    name: string
    price: number
    volume24h: number
    change24h: number
  }>
  averagePrice: number
  totalVolume24h: number
  bestPrice: number
  bestExchange: string
  priceSpread: number
}

interface FeeStructure {
  maker: number
  taker: number
  levels: Array<{
    volume30d: number
    maker: number
    taker: number
  }>
}

export default function ExchangeDashboard() {
  const [exchanges, setExchanges] = useState<Exchange[]>([])
  const [tickers, setTickers] = useState<Ticker[]>([])
  const [feeStructures, setFeeStructures] = useState<Record<string, FeeStructure>>({})
  const [selectedExchange, setSelectedExchange] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // 获取交易所指标
  const fetchExchangeMetrics = async () => {
    try {
      const response = await fetch('/api/exchanges?action=metrics')
      const data = await response.json()
      if (data.success) {
        setExchanges(data.data)
      }
    } catch (error) {
      console.error('获取交易所指标失败:', error)
    }
  }

  // 获取聚合价格数据
  const fetchTickers = async () => {
    try {
      const response = await fetch('/api/exchanges?action=tickers')
      const data = await response.json()
      if (data.success) {
        setTickers(data.data)
      }
    } catch (error) {
      console.error('获取价格数据失败:', error)
    }
  }

  // 获取费率结构
  const fetchFeeStructures = async () => {
    try {
      const response = await fetch('/api/exchanges?action=fees')
      const data = await response.json()
      if (data.success) {
        setFeeStructures(data.data)
      }
    } catch (error) {
      console.error('获取费率结构失败:', error)
    }
  }

  // 刷新所有数据
  const refreshAllData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        fetchExchangeMetrics(),
        fetchTickers(),
        fetchFeeStructures()
      ])
      setLastUpdate(new Date())
    } finally {
      setIsLoading(false)
    }
  }

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'offline':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    const variants = {
      online: 'bg-green-100 text-green-800',
      offline: 'bg-red-100 text-red-800',
      error: 'bg-yellow-100 text-yellow-800'
    }
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status === 'online' ? '在线' : 
         status === 'offline' ? '离线' : '错误'}
      </Badge>
    )
  }

  // 格式化数字
  const formatNumber = (num: number, decimals: number = 2): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num)
  }

  // 格式化百分比
  const formatPercentage = (num: number): string => {
    return `${num >= 0 ? '+' : ''}${formatNumber(num * 100, 2)}%`
  }

  // 格式化时间
  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString()
  }

  useEffect(() => {
    refreshAllData()
    
    // 设置自动刷新
    const interval = setInterval(refreshAllData, 30000) // 30秒刷新一次
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">多交易所集成</h2>
          <p className="text-muted-foreground">
            实时监控和管理多个交易平台
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            最后更新: {lastUpdate.toLocaleTimeString()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAllData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="tickers">价格监控</TabsTrigger>
          <TabsTrigger value="fees">费率对比</TabsTrigger>
          <TabsTrigger value="settings">设置</TabsTrigger>
        </TabsList>

        {/* 概览标签页 */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">在线交易所</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {exchanges.filter(e => e.status === 'online').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  总计 {exchanges.length} 个交易所
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">监控交易对</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {exchanges.reduce((sum, e) => sum + e.tickersCount, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  实时价格监控
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">平均响应时间</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {exchanges.length > 0 
                    ? formatNumber(exchanges.reduce((sum, e) => sum + e.responseTime, 0) / exchanges.length, 0)
                    : '0'
                  }ms
                </div>
                <p className="text-xs text-muted-foreground">
                  API响应性能
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">错误次数</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {exchanges.reduce((sum, e) => sum + e.errorCount, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  24小时内
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 交易所状态列表 */}
          <Card>
            <CardHeader>
              <CardTitle>交易所状态</CardTitle>
              <CardDescription>各交易所的实时运行状态</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {exchanges.map((exchange) => (
                  <div key={exchange.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(exchange.status)}
                      <div>
                        <h3 className="font-semibold">{exchange.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          响应时间: {exchange.responseTime}ms | 
                          交易对: {exchange.tickersCount} | 
                          错误: {exchange.errorCount}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(exchange.status)}
                      <span className="text-xs text-muted-foreground">
                        {formatTime(exchange.lastUpdate)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 价格监控标签页 */}
        <TabsContent value="tickers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>聚合价格监控</CardTitle>
              <CardDescription>多交易所价格对比和最优价格推荐</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {tickers.slice(0, 20).map((ticker) => (
                    <div key={ticker.symbol} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-lg">{ticker.symbol}</h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            平均价格: ${formatNumber(ticker.averagePrice)}
                          </span>
                          <Badge variant="outline">
                            {ticker.bestExchange}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium text-green-600">
                            最优价格: ${formatNumber(ticker.bestPrice)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {ticker.bestExchange}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            总交易量: ${formatNumber(ticker.totalVolume24h)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            24小时
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-orange-600">
                            价差: ${formatNumber(ticker.priceSpread)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatNumber((ticker.priceSpread / ticker.averagePrice) * 100, 2)}%
                          </p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground mb-2">各交易所价格:</p>
                        <div className="flex flex-wrap gap-2">
                          {ticker.exchanges.map((ex) => (
                            <Badge key={ex.name} variant="outline" className="text-xs">
                              {ex.name}: ${formatNumber(ex.price)}
                              {ex.change24h !== 0 && (
                                <span className={ex.change24h > 0 ? 'text-green-600' : 'text-red-600'}>
                                  {formatPercentage(ex.change24h)}
                                </span>
                              )}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 费率对比标签页 */}
        <TabsContent value="fees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>费率结构对比</CardTitle>
              <CardDescription>各交易所的手续费率和返利政策</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(feeStructures).map(([exchange, fees]) => (
                  <div key={exchange} className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-3">{exchange}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Maker费率</p>
                        <p className="text-lg text-green-600">
                          {formatPercentage(fees.maker)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Taker费率</p>
                        <p className="text-lg text-red-600">
                          {formatPercentage(fees.taker)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground mb-2">阶梯费率 (30日交易量):</p>
                      <div className="space-y-1">
                        {fees.levels.slice(0, 3).map((level, index) => (
                          <div key={index} className="flex justify-between text-xs">
                            <span>${formatNumber(level.volume30d)}</span>
                            <span>
                              Maker: {formatPercentage(level.maker)} | 
                              Taker: {formatPercentage(level.taker)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 设置标签页 */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>交易所设置</CardTitle>
              <CardDescription>配置和管理交易所连接</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">自动更新</h3>
                    <p className="text-sm text-muted-foreground">
                      每30秒自动刷新价格数据
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-1" />
                    配置
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">添加交易所</h3>
                    <p className="text-sm text-muted-foreground">
                      集成新的交易平台
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    添加
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">API配置</h3>
                    <p className="text-sm text-muted-foreground">
                      管理API密钥和权限
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-1" />
                    管理
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
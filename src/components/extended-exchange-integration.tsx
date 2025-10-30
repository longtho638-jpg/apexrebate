'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  Activity, 
  Globe, 
  Zap, 
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Settings,
  BarChart3,
  DollarSign,
  Clock,
  Star,
  Link,
  Database,
  Shield,
  Eye,
  Play
} from 'lucide-react';

interface Exchange {
  id: string;
  name: string;
  displayName: string;
  logo: string;
  status: 'active' | 'inactive' | 'maintenance';
  type: 'spot' | 'futures' | 'options' | 'defi';
  supportedPairs: number;
  volume24h: number;
  feeStructure: {
    maker: number;
    taker: number;
    affiliate: number;
  };
  features: string[];
  apiStatus: 'connected' | 'disconnected' | 'error';
  lastSync: Date;
  reliability: number;
}

interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  exchanges: string[];
  spread: number;
  liquidity: number;
}

interface TradingPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  exchanges: string[];
  avgPrice: number;
  totalVolume: number;
  bestBid: number;
  bestAsk: number;
}

export default function ExtendedExchangeIntegration() {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [tradingPairs, setTradingPairs] = useState<TradingPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExchange, setSelectedExchange] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTC/USDT');

  useEffect(() => {
    fetchExtendedExchangeData();
    const interval = setInterval(fetchExtendedExchangeData, 30000); // 每30秒刷新
    return () => clearInterval(interval);
  }, []);

  const fetchExtendedExchangeData = async () => {
    try {
      const [exchangesRes, marketRes, pairsRes] = await Promise.all([
        fetch('/api/exchanges?action=extended-exchanges'),
        fetch('/api/exchanges?action=tickers&symbols=BTC/USDT,ETH/USDT'),
        fetch('/api/exchanges?action=pairs')
      ]);

      const exchangesData = await exchangesRes.json();
      const marketDataRes = await marketRes.json();
      const pairsData = await pairsRes.json();

      setExchanges(exchangesData.data || []);
      setMarketData(marketDataRes.data || []);
      setTradingPairs(pairsData.data || []);
    } catch (error) {
      console.error('Failed to fetch extended exchange data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectExchange = async (exchangeId: string) => {
    try {
      const response = await fetch('/api/exchanges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          config: {
            id: exchangeId,
            apiKey: 'demo_key',
            secret: 'demo_secret',
            testMode: true
          }
        })
      });

      if (response.ok) {
        fetchExtendedExchangeData();
      }
    } catch (error) {
      console.error('Failed to connect exchange:', error);
    }
  };

  const handleDisconnectExchange = async (exchangeId: string) => {
    try {
      const response = await fetch('/api/exchanges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove',
          exchange: exchangeId
        })
      });

      if (response.ok) {
        fetchExtendedExchangeData();
      }
    } catch (error) {
      console.error('Failed to disconnect exchange:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'connected': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'disconnected': return 'bg-gray-100 text-gray-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'spot': return 'bg-blue-100 text-blue-800';
      case 'futures': return 'bg-purple-100 text-purple-800';
      case 'options': return 'bg-orange-100 text-orange-800';
      case 'defi': return 'bg-green-100 text-green-800';
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
      {/* 概览统计 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">连接交易所</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {exchanges.filter(e => e.apiStatus === 'connected').length}
            </div>
            <p className="text-xs text-muted-foreground">
              总计: {exchanges.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">支持交易对</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tradingPairs.length.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              跨平台聚合
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h交易量</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(exchanges.reduce((sum, e) => sum + e.volume24h, 0) / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">
              总交易量
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均可靠性</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(exchanges.reduce((sum, e) => sum + e.reliability, 0) / exchanges.length).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              系统稳定性
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="exchanges" className="space-y-4">
        <TabsList>
          <TabsTrigger value="exchanges">交易所管理</TabsTrigger>
          <TabsTrigger value="market-data">市场数据</TabsTrigger>
          <TabsTrigger value="trading-pairs">交易对</TabsTrigger>
          <TabsTrigger value="analytics">数据分析</TabsTrigger>
          <TabsTrigger value="settings">集成设置</TabsTrigger>
        </TabsList>

        {/* 交易所管理 */}
        <TabsContent value="exchanges" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">第三方交易平台</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              添加交易所
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {exchanges.map((exchange) => (
              <Card key={exchange.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Globe className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{exchange.displayName}</CardTitle>
                        <CardDescription>{exchange.name}</CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <Badge className={getStatusColor(exchange.status)}>
                        {exchange.status}
                      </Badge>
                      <Badge className={getStatusColor(exchange.apiStatus)} variant="outline">
                        {exchange.apiStatus}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">类型:</span>
                      <Badge className={getTypeColor(exchange.type)}>
                        {exchange.type}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">交易对:</span>
                      <span className="text-sm font-medium">{exchange.supportedPairs.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">24h交易量:</span>
                      <span className="text-sm font-medium">
                        ${(exchange.volume24h / 1000000).toFixed(1)}M
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">可靠性:</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={exchange.reliability} className="w-16 h-2" />
                        <span className="text-sm">{exchange.reliability}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">最后同步:</span>
                      <span className="text-xs">
                        {new Date(exchange.lastSync).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {exchange.features.slice(0, 3).map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {exchange.features.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{exchange.features.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex space-x-2 pt-2">
                      {exchange.apiStatus === 'connected' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDisconnectExchange(exchange.id)}
                          className="flex-1"
                        >
                          断开连接
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleConnectExchange(exchange.id)}
                          className="flex-1"
                        >
                          连接
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 市场数据 */}
        <TabsContent value="market-data" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">实时市场数据</h3>
            <div className="flex items-center space-x-2">
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="BTC/USDT">BTC/USDT</option>
                <option value="ETH/USDT">ETH/USDT</option>
                <option value="BNB/USDT">BNB/USDT</option>
              </select>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 价格数据 */}
            <Card>
              <CardHeader>
                <CardTitle>价格聚合</CardTitle>
                <CardDescription>跨交易所价格对比</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketData.slice(0, 5).map((data) => (
                    <div key={data.symbol} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{data.symbol}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold">${data.price.toLocaleString()}</span>
                          <Badge className={data.change24h >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {data.change24h >= 0 ? '+' : ''}{data.change24h.toFixed(2)}%
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">24h交易量:</span>
                          <div>${(data.volume24h / 1000000).toFixed(1)}M</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">价差:</span>
                          <div>${data.spread.toFixed(2)}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 mt-2">
                        <span className="text-xs text-muted-foreground">交易所:</span>
                        {data.exchanges.map((exchange) => (
                          <Badge key={exchange} variant="secondary" className="text-xs">
                            {exchange}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 流动性分析 */}
            <Card>
              <CardHeader>
                <CardTitle>流动性分析</CardTitle>
                <CardDescription>市场深度和流动性指标</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketData.slice(0, 5).map((data) => (
                    <div key={data.symbol} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{data.symbol}</span>
                        <span className="text-sm">流动性评分</span>
                      </div>
                      <Progress value={data.liquidity} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>低</span>
                        <span>{data.liquidity}%</span>
                        <span>高</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 交易对 */}
        <TabsContent value="trading-pairs" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">交易对管理</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              添加交易对
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {tradingPairs.slice(0, 9).map((pair) => (
              <Card key={pair.symbol}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{pair.symbol}</CardTitle>
                    <Badge variant="outline">
                      {pair.exchanges.length} 交易所
                    </Badge>
                  </div>
                  <CardDescription>
                    {pair.baseAsset}/{pair.quoteAsset}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">平均价格:</span>
                      <span className="font-medium">${pair.avgPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">最佳买价:</span>
                      <span className="font-medium text-green-600">${pair.bestBid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">最佳卖价:</span>
                      <span className="font-medium text-red-600">${pair.bestAsk.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">24h交易量:</span>
                      <span className="font-medium">
                        ${(pair.totalVolume / 1000000).toFixed(1)}M
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {pair.exchanges.map((exchange) => (
                        <Badge key={exchange} variant="secondary" className="text-xs">
                          {exchange}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 数据分析 */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 交易量分析 */}
            <Card>
              <CardHeader>
                <CardTitle>交易量分布</CardTitle>
                <CardDescription>各交易所交易量占比</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exchanges.map((exchange) => {
                    const totalVolume = exchanges.reduce((sum, e) => sum + e.volume24h, 0);
                    const percentage = (exchange.volume24h / totalVolume) * 100;
                    
                    return (
                      <div key={exchange.id} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{exchange.displayName}</span>
                          <span className="text-sm">{percentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        <div className="text-xs text-muted-foreground">
                          ${(exchange.volume24h / 1000000).toFixed(1)}M
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 费率对比 */}
            <Card>
              <CardHeader>
                <CardTitle>费率对比</CardTitle>
                <CardDescription>各交易所费率结构</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exchanges.map((exchange) => (
                    <div key={exchange.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{exchange.displayName}</span>
                        <Badge className={getStatusColor(exchange.apiStatus)}>
                          {exchange.apiStatus}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Maker:</span>
                          <div className="font-medium">{(exchange.feeStructure.maker * 100).toFixed(3)}%</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Taker:</span>
                          <div className="font-medium">{(exchange.feeStructure.taker * 100).toFixed(3)}%</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">返利:</span>
                          <div className="font-medium text-green-600">
                            {(exchange.feeStructure.affiliate * 100).toFixed(3)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 集成设置 */}
        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* API配置 */}
            <Card>
              <CardHeader>
                <CardTitle>API配置</CardTitle>
                <CardDescription>第三方平台API集成设置</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      所有API密钥都经过加密存储，确保安全性。建议使用测试模式进行初始配置。
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-3">
                    <Button className="w-full justify-start">
                      <Plus className="h-4 w-4 mr-2" />
                      添加新的API密钥
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      配置API权限
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      测试API连接
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 同步设置 */}
            <Card>
              <CardHeader>
                <CardTitle>同步设置</CardTitle>
                <CardDescription>数据同步和更新频率配置</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">自动更新频率</label>
                    <select className="w-full px-3 py-2 border rounded-md">
                      <option>每30秒</option>
                      <option>每1分钟</option>
                      <option>每5分钟</option>
                      <option>每15分钟</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">数据保留期</label>
                    <select className="w-full px-3 py-2 border rounded-md">
                      <option>7天</option>
                      <option>30天</option>
                      <option>90天</option>
                      <option>永久</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <Button className="w-full justify-start">
                      <Play className="h-4 w-4 mr-2" />
                      启动自动同步
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Clock className="h-4 w-4 mr-2" />
                      查看同步历史
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
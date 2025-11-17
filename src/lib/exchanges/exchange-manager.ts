import { BaseExchange, ExchangeCredentials, TradingPair, Ticker, FeeStructure, AffiliateInfo, Transaction, Balance } from './base-exchange'
import { BinanceExchange } from './binance'
import { BybitExchange } from './bybit'
import { CoinbaseExchange } from './coinbase'
import { KrakenExchange } from './kraken'
import { KuCoinExchange } from './kucoin'

export interface ExchangeConfig {
  name: string
  enabled: boolean
  credentials: ExchangeCredentials
  priority: number
  supportedPairs: string[]
}

export interface ExchangeMetrics {
  name: string
  status: 'online' | 'offline' | 'error'
  lastUpdate: number
  responseTime: number
  tickersCount: number
  pairsCount: number
  errorCount: number
}

export interface AggregatedTicker {
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

export class ExchangeManager {
  private exchanges: Map<string, BaseExchange> = new Map()
  private configs: Map<string, ExchangeConfig> = new Map()
  private metrics: Map<string, ExchangeMetrics> = new Map()
  private updateInterval: NodeJS.Timeout | null = null

  constructor() {
    this.initializeDefaultExchanges()
  }

  private initializeDefaultExchanges(): void {
    // 初始化默认交易所配置
    const defaultConfigs: ExchangeConfig[] = [
      {
        name: 'Binance',
        enabled: true,
        credentials: {
          apiKey: process.env.BINANCE_API_KEY || '',
          secret: process.env.BINANCE_SECRET || '',
          sandbox: process.env.NODE_ENV === 'development'
        },
        priority: 1,
        supportedPairs: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT']
      },
      {
        name: 'Bybit',
        enabled: true,
        credentials: {
          apiKey: process.env.BYBIT_API_KEY || '',
          secret: process.env.BYBIT_SECRET || '',
          sandbox: process.env.NODE_ENV === 'development'
        },
        priority: 2,
        supportedPairs: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT']
      },
      {
        name: 'Coinbase',
        enabled: true,
        credentials: {
          apiKey: process.env.COINBASE_API_KEY || '',
          secret: process.env.COINBASE_SECRET || '',
          passphrase: process.env.COINBASE_PASSPHRASE || '',
          sandbox: process.env.NODE_ENV === 'development'
        },
        priority: 3,
        supportedPairs: ['BTC-USD', 'ETH-USD', 'SOL-USD']
      },
      {
        name: 'Kraken',
        enabled: true,
        credentials: {
          apiKey: process.env.KRAKEN_API_KEY || '',
          secret: process.env.KRAKEN_SECRET || '',
          sandbox: process.env.NODE_ENV === 'development'
        },
        priority: 4,
        supportedPairs: ['XXBTZUSD', 'XETHZUSD', 'SOLUSD']
      },
      {
        name: 'KuCoin',
        enabled: true,
        credentials: {
          apiKey: process.env.KUCOIN_API_KEY || '',
          secret: process.env.KUCOIN_SECRET || '',
          passphrase: process.env.KUCOIN_PASSPHRASE || '',
          sandbox: process.env.NODE_ENV === 'development'
        },
        priority: 5,
        supportedPairs: ['BTC-USDT', 'ETH-USDT', 'SOL-USDT']
      }
    ]

    defaultConfigs.forEach(config => {
      this.configs.set(config.name, config)
      if (config.enabled) {
        this.initializeExchange(config)
      }
    })
  }

  private initializeExchange(config: ExchangeConfig): void {
    try {
      let exchange: BaseExchange

      switch (config.name) {
        case 'Binance':
          exchange = new BinanceExchange(config.credentials)
          break
        case 'Bybit':
          exchange = new BybitExchange(config.credentials)
          break
        case 'Coinbase':
          exchange = new CoinbaseExchange(config.credentials)
          break
        case 'Kraken':
          exchange = new KrakenExchange(config.credentials)
          break
        case 'KuCoin':
          exchange = new KuCoinExchange(config.credentials)
          break
        default:
          console.warn(`交易所 ${config.name} 尚未实现`)
          return
      }

      this.exchanges.set(config.name, exchange)
      this.metrics.set(config.name, {
        name: config.name,
        status: 'online',
        lastUpdate: Date.now(),
        responseTime: 0,
        tickersCount: 0,
        pairsCount: 0,
        errorCount: 0
      })

      console.log(`交易所 ${config.name} 初始化成功`)
    } catch (error) {
      console.error(`交易所 ${config.name} 初始化失败:`, error)
      this.updateMetrics(config.name, 'error', 0, 0, 0)
    }
  }

  // 添加新交易所
  async addExchange(config: ExchangeConfig): Promise<boolean> {
    try {
      this.configs.set(config.name, config)
      
      if (config.enabled) {
        this.initializeExchange(config)
        
        // 验证凭证
        const exchange = this.exchanges.get(config.name)
        if (exchange) {
          const isValid = await exchange.validateCredentials()
          if (!isValid) {
            throw new Error('凭证验证失败')
          }
        }
      }
      
      return true
    } catch (error) {
      console.error(`添加交易所 ${config.name} 失败:`, error)
      return false
    }
  }

  // 移除交易所
  removeExchange(name: string): boolean {
    try {
      this.exchanges.delete(name)
      this.configs.delete(name)
      this.metrics.delete(name)
      return true
    } catch (error) {
      console.error(`移除交易所 ${name} 失败:`, error)
      return false
    }
  }

  // 获取所有交易所
  getExchanges(): BaseExchange[] {
    return Array.from(this.exchanges.values())
  }

  // 获取指定交易所
  getExchange(name: string): BaseExchange | undefined {
    return this.exchanges.get(name)
  }

  // 获取所有交易对
  async getAllTradingPairs(): Promise<TradingPair[]> {
    const allPairs: TradingPair[] = []
    
    for (const [name, exchange] of this.exchanges) {
      try {
        const pairs = await exchange.getTradingPairs()
        allPairs.push(...pairs.map(pair => ({ ...pair, exchange: name })))
      } catch (error) {
        console.error(`获取 ${name} 交易对失败:`, error)
        this.updateMetrics(name, 'error', 0, 0, 0)
      }
    }
    
    return allPairs
  }

  // 获取聚合价格数据
  async getAggregatedTickers(symbols?: string[]): Promise<AggregatedTicker[]> {
    const tickerMap = new Map<string, AggregatedTicker>()
    
    for (const [name, exchange] of this.exchanges) {
      try {
        const startTime = Date.now()
        const tickers = symbols ? 
          await Promise.all(symbols.map(symbol => exchange.getTicker(symbol))) :
          await exchange.getTickers()
        const responseTime = Date.now() - startTime
        
        tickers.forEach(ticker => {
          const existing = tickerMap.get(ticker.symbol) || {
            symbol: ticker.symbol,
            exchanges: [],
            averagePrice: 0,
            totalVolume24h: 0,
            bestPrice: 0,
            bestExchange: '',
            priceSpread: 0
          }
          
          existing.exchanges.push({
            name,
            price: ticker.price,
            volume24h: ticker.volume24h,
            change24h: ticker.change24h
          })
          
          tickerMap.set(ticker.symbol, existing)
        })
        
        this.updateMetrics(name, 'online', responseTime, tickers.length, 0)
      } catch (error) {
        console.error(`获取 ${name} 价格数据失败:`, error)
        this.updateMetrics(name, 'error', 0, 0, 1)
      }
    }
    
    // 计算聚合数据
    const aggregatedTickers: AggregatedTicker[] = []
    
    for (const [symbol, data] of tickerMap) {
      const prices = data.exchanges.map(e => e.price)
      const volumes = data.exchanges.map(e => e.volume24h)
      
      const bestPrice = Math.max(...prices)
      const bestExchange = data.exchanges.find(e => e.price === bestPrice)?.name || ''
      const priceSpread = Math.max(...prices) - Math.min(...prices)
      const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length
      const totalVolume24h = volumes.reduce((sum, volume) => sum + volume, 0)
      
      aggregatedTickers.push({
        ...data,
        averagePrice,
        totalVolume24h,
        bestPrice,
        bestExchange,
        priceSpread
      })
    }
    
    return aggregatedTickers
  }

  // 获取所有交易所的费率结构
  async getAllFeeStructures(): Promise<Map<string, FeeStructure>> {
    const feeStructures = new Map<string, FeeStructure>()
    
    for (const [name, exchange] of this.exchanges) {
      try {
        const fees = await exchange.getFeeStructure()
        feeStructures.set(name, fees)
      } catch (error) {
        console.error(`获取 ${name} 费率结构失败:`, error)
      }
    }
    
    return feeStructures
  }

  // 获取所有交易所的联盟信息
  async getAllAffiliateInfo(): Promise<Map<string, AffiliateInfo>> {
    const affiliateInfo = new Map<string, AffiliateInfo>()
    
    for (const [name, exchange] of this.exchanges) {
      try {
        const info = await exchange.getAffiliateInfo()
        affiliateInfo.set(name, info)
      } catch (error) {
        console.error(`获取 ${name} 联盟信息失败:`, error)
      }
    }
    
    return affiliateInfo
  }

  // 获取交易所指标
  getExchangeMetrics(): ExchangeMetrics[] {
    return Array.from(this.metrics.values())
  }

  // 更新交易所指标
  private updateMetrics(
    name: string, 
    status: 'online' | 'offline' | 'error',
    responseTime: number,
    tickersCount: number,
    errorCount: number
  ): void {
    const existing = this.metrics.get(name)
    if (existing) {
      this.metrics.set(name, {
        ...existing,
        status,
        lastUpdate: Date.now(),
        responseTime,
        tickersCount,
        errorCount: existing.errorCount + errorCount
      })
    }
  }

  // 启动自动更新
  startAutoUpdate(intervalMs: number = 60000): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }
    
    this.updateInterval = setInterval(async () => {
      await this.updateAllMetrics()
    }, intervalMs)
    
    console.log('交易所自动更新已启动')
  }

  // 停止自动更新
  stopAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
      console.log('交易所自动更新已停止')
    }
  }

  // 更新所有指标
  private async updateAllMetrics(): Promise<void> {
    for (const [name, exchange] of this.exchanges) {
      try {
        const startTime = Date.now()
        await exchange.getTickers()
        const responseTime = Date.now() - startTime
        
        this.updateMetrics(name, 'online', responseTime, 0, 0)
      } catch (error) {
        console.error(`更新 ${name} 指标失败:`, error)
        this.updateMetrics(name, 'error', 0, 0, 1)
      }
    }
  }

  // 健康检查
  async healthCheck(): Promise<Map<string, boolean>> {
    const healthStatus = new Map<string, boolean>()
    
    for (const [name, exchange] of this.exchanges) {
      try {
        const isHealthy = await exchange.validateCredentials()
        healthStatus.set(name, isHealthy)
      } catch (error) {
        healthStatus.set(name, false)
      }
    }
    
    return healthStatus
  }

  // 获取配置
  getConfigs(): ExchangeConfig[] {
    return Array.from(this.configs.values())
  }

  // 更新配置
  updateConfig(name: string, config: Partial<ExchangeConfig>): boolean {
    try {
      const existing = this.configs.get(name)
      if (existing) {
        const updated = { ...existing, ...config }
        this.configs.set(name, updated)
        
        if (updated.enabled && !this.exchanges.has(name)) {
          this.initializeExchange(updated)
        } else if (!updated.enabled && this.exchanges.has(name)) {
          this.exchanges.delete(name)
        }
        
        return true
      }
      return false
    } catch (error) {
      console.error(`更新 ${name} 配置失败:`, error)
      return false
    }
  }
}
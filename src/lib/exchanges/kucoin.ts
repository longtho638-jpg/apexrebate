import { BaseExchange, ExchangeCredentials, TradingPair, Ticker, FeeStructure, AffiliateInfo, Transaction, Balance } from './base-exchange'
import * as crypto from 'crypto'

export class KuCoinExchange extends BaseExchange {
  private readonly apiVersion = 'v1'
  private passphrase: string
  private apiKeyVersion: string = '2'

  constructor(credentials: ExchangeCredentials) {
    const baseUrl = credentials.sandbox 
      ? 'https://openapi-sandbox.kucoin.com'
      : 'https://api.kucoin.com'
    
    super('KuCoin', baseUrl, credentials)
    this.passphrase = credentials.passphrase || ''
  }

  async validateCredentials(): Promise<boolean> {
    try {
      await this.makeAuthenticatedRequest('GET', '/api/v1/accounts')
      return true
    } catch (error) {
      console.error('KuCoin凭证验证失败:', error)
      return false
    }
  }

  async getTradingPairs(): Promise<TradingPair[]> {
    try {
      const response = await this.makeRequest('/api/v1/symbols')
      return response.data.map((symbol: any) => ({
        symbol: symbol.symbol,
        baseAsset: symbol.baseCurrency,
        quoteAsset: symbol.quoteCurrency,
        status: symbol.enableTrading ? 'active' : 'inactive'
      }))
    } catch (error) {
      this.handleError(error)
    }
  }

  async getTicker(symbol: string): Promise<Ticker> {
    try {
      const response = await this.makeRequest(`/api/v1/market/orderbook/level1?symbol=${symbol}`)
      
      return {
        symbol,
        price: parseFloat(response.data.price),
        change24h: parseFloat(response.data.changeRate || '0'),
        volume24h: parseFloat(response.data.vol || '0'),
        high24h: parseFloat(response.data.high || '0'),
        low24h: parseFloat(response.data.low || '0'),
        timestamp: parseInt(response.data.time)
      }
    } catch (error) {
      this.handleError(error)
    }
  }

  async getTickers(): Promise<Ticker[]> {
    try {
      const response = await this.makeRequest('/api/v1/market/allTickers')
      
      return response.data.ticker
        .filter((ticker: any) => ticker.symbol.includes('-')) // 只显示现货交易对
        .slice(0, 100) // 限制数量
        .map((ticker: any) => ({
          symbol: ticker.symbol,
          price: parseFloat(ticker.last || '0'),
          change24h: parseFloat(ticker.changeRate || '0'),
          volume24h: parseFloat(ticker.vol || '0'),
          high24h: parseFloat(ticker.high || '0'),
          low24h: parseFloat(ticker.low || '0'),
          timestamp: Date.now()
        }))
    } catch (error) {
      this.handleError(error)
    }
  }

  async getFeeStructure(): Promise<FeeStructure> {
    try {
      // KuCoin费率结构
      return {
        maker: 0.001, // 0.1%
        taker: 0.001, // 0.1%
        levels: [
          { volume30d: 0, maker: 0.001, taker: 0.001 },
          { volume30d: 1000, maker: 0.0009, taker: 0.001 },
          { volume30d: 10000, maker: 0.0008, taker: 0.001 },
          { volume30d: 50000, maker: 0.0007, taker: 0.001 },
          { volume30d: 100000, maker: 0.0006, taker: 0.001 },
          { volume30d: 500000, maker: 0.0005, taker: 0.001 },
          { volume30d: 1000000, maker: 0.0004, taker: 0.001 },
          { volume30d: 2000000, maker: 0.0003, taker: 0.001 },
          { volume30d: 5000000, maker: 0.0002, taker: 0.001 },
          { volume30d: 10000000, maker: 0.0001, taker: 0.001 }
        ]
      }
    } catch (error) {
      this.handleError(error)
    }
  }

  async getAffiliateInfo(): Promise<AffiliateInfo> {
    try {
      return {
        affiliateCode: 'APEXREBATE',
        commissionRate: 0.4, // 40%返利
        rebateRate: 0.0004, // 0.04%实际返利
        status: 'active'
      }
    } catch (error) {
      this.handleError(error)
    }
  }

  async getTransactionHistory(startDate: Date, endDate: Date): Promise<Transaction[]> {
    try {
      const response = await this.makeAuthenticatedRequest('GET', '/api/v1/fills', {
        startAt: Math.floor(startDate.getTime() / 1000),
        endAt: Math.floor(endDate.getTime() / 1000)
      })
      
      return response.data.items.map((fill: any) => ({
        id: fill.id,
        symbol: fill.symbol,
        side: fill.side as 'buy' | 'sell',
        amount: parseFloat(fill.size),
        price: parseFloat(fill.price),
        fee: parseFloat(fill.fee),
        timestamp: parseInt(fill.createdAt),
        orderId: fill.orderId
      }))
    } catch (error) {
      this.handleError(error)
    }
  }

  async getBalances(): Promise<Balance[]> {
    try {
      const response = await this.makeAuthenticatedRequest('GET', '/api/v1/accounts')
      
      return response.data
        .filter((account: any) => account.type === 'trade' && parseFloat(account.balance) > 0)
        .map((account: any) => ({
          asset: account.currency,
          free: parseFloat(account.available),
          locked: parseFloat(account.holds),
          total: parseFloat(account.balance)
        }))
    } catch (error) {
      this.handleError(error)
    }
  }

  // KuCoin特定的认证方法
  private async makeAuthenticatedRequest(method: string, endpoint: string, params?: any): Promise<any> {
    const timestamp = Date.now().toString()
    const queryString = params ? new URLSearchParams(params).toString() : ''
    const signatureString = timestamp + method + endpoint + queryString
    
    const signature = this.generateSignature(signatureString, this.credentials.secret)
    
    const headers = {
      'KC-API-KEY': this.credentials.apiKey,
      'KC-API-SIGN': signature,
      'KC-API-TIMESTAMP': timestamp,
      'KC-API-PASSPHRASE': this.encryptPassphrase(),
      'KC-API-KEY-VERSION': this.apiKeyVersion,
      'Content-Type': 'application/json'
    }
    
    const url = queryString ? `${endpoint}?${queryString}` : endpoint
    return this.makeRequest(url, method, undefined, headers)
  }

  // 加密passphrase
  private encryptPassphrase(): string {
    return crypto.createHmac('sha256', this.credentials.secret)
      .update(this.passphrase)
      .digest('base64')
  }

  // 获取24小时统计
  async get24hrStats(symbol: string): Promise<any> {
    try {
      return await this.makeRequest(`/api/v1/market/stats?symbol=${symbol}`)
    } catch (error) {
      this.handleError(error)
    }
  }

  // 获取订单历史
  async getOrderHistory(options?: { symbol?: string; status?: string; page?: number }): Promise<any> {
    try {
      const params: any = {}
      if (options?.symbol) params.symbol = options.symbol
      if (options?.status) params.status = options.status
      if (options?.page) params.currentPage = options.page
      
      return await this.makeAuthenticatedRequest('GET', '/api/v1/orders', params)
    } catch (error) {
      this.handleError(error)
    }
  }

  // 获取最近成交
  async getRecentTrades(symbol: string): Promise<any> {
    try {
      return await this.makeRequest(`/api/v1/market/histories?symbol=${symbol}`)
    } catch (error) {
      this.handleError(error)
    }
  }

  // 获取K线数据
  async getKlines(symbol: string, type: string = '1min'): Promise<any> {
    try {
      return await this.makeRequest(`/api/v1/market/candles?type=${type}&symbol=${symbol}`)
    } catch (error) {
      this.handleError(error)
    }
  }

  // 重写速率限制处理
  protected async handleRateLimit(): Promise<void> {
    // KuCoin的API限制为每秒20个请求
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  // 获取服务器时间
  async getServerTime(): Promise<number> {
    try {
      const response = await this.makeRequest('/api/v1/timestamp')
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  // 获取系统状态
  async getSystemStatus(): Promise<any> {
    try {
      return await this.makeRequest('/api/v1/status')
    } catch (error) {
      this.handleError(error)
    }
  }
}
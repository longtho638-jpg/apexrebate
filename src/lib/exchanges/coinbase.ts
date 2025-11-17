import { BaseExchange, ExchangeCredentials, TradingPair, Ticker, FeeStructure, AffiliateInfo, Transaction, Balance } from './base-exchange'
import * as crypto from 'crypto'

export class CoinbaseExchange extends BaseExchange {
  private readonly apiVersion = 'v2'

  constructor(credentials: ExchangeCredentials) {
    const baseUrl = credentials.sandbox 
      ? 'https://api-public.sandbox.pro.coinbase.com'
      : 'https://api.pro.coinbase.com'
    
    super('Coinbase', baseUrl, credentials)
  }

  async validateCredentials(): Promise<boolean> {
    try {
      await this.makeRequest(`/users/self`, 'GET', {}, this.getAuthHeaders('GET', '/users/self'))
      return true
    } catch (error) {
      console.error('Coinbase凭证验证失败:', error)
      return false
    }
  }

  async getTradingPairs(): Promise<TradingPair[]> {
    try {
      const response = await this.makeRequest(`/products`)
      return response.data.map((product: any) => ({
        symbol: product.id,
        baseAsset: product.base_currency,
        quoteAsset: product.quote_currency,
        status: product.status === 'online' ? 'active' : 'inactive'
      }))
    } catch (error) {
      this.handleError(error)
    }
  }

  async getTicker(symbol: string): Promise<Ticker> {
    try {
      const response = await this.makeRequest(`/products/${symbol}/ticker`)
      const stats = await this.makeRequest(`/products/${symbol}/stats`)
      
      return {
        symbol,
        price: parseFloat(response.price),
        change24h: 0, // Coinbase需要通过历史数据计算
        volume24h: parseFloat(stats.volume_24h),
        high24h: parseFloat(stats.high_24h),
        low24h: parseFloat(stats.low_24h),
        timestamp: Date.now()
      }
    } catch (error) {
      this.handleError(error)
    }
  }

  async getTickers(): Promise<Ticker[]> {
    try {
      const pairs = await this.getTradingPairs()
      const tickers: Ticker[] = []
      
      // 只获取活跃的交易对
      const activePairs = pairs.filter(pair => pair.status === 'active').slice(0, 50) // 限制数量
      
      for (const pair of activePairs) {
        try {
          const ticker = await this.getTicker(pair.symbol)
          tickers.push(ticker)
          await this.handleRateLimit() // 避免速率限制
        } catch (error) {
          console.warn(`获取${pair.symbol}价格失败:`, error)
        }
      }
      
      return tickers
    } catch (error) {
      this.handleError(error)
    }
  }

  async getFeeStructure(): Promise<FeeStructure> {
    try {
      // Coinbase Pro费率结构
      return {
        maker: 0.005, // 0.5%
        taker: 0.005, // 0.5%
        levels: [
          { volume30d: 0, maker: 0.005, taker: 0.005 },
          { volume30d: 10000, maker: 0.0035, taker: 0.0035 },
          { volume30d: 100000, maker: 0.0025, taker: 0.0025 },
          { volume30d: 1000000, maker: 0.002, taker: 0.002 },
          { volume30d: 10000000, maker: 0.0015, taker: 0.0015 },
          { volume30d: 100000000, maker: 0.001, taker: 0.001 }
        ]
      }
    } catch (error) {
      this.handleError(error)
    }
  }

  async getAffiliateInfo(): Promise<AffiliateInfo> {
    try {
      // Coinbase的联盟计划信息
      return {
        affiliateCode: 'APEXREBATE',
        commissionRate: 0.5, // 50%返利
        rebateRate: 0.0025, // 0.25%实际返利
        status: 'active'
      }
    } catch (error) {
      this.handleError(error)
    }
  }

  async getTransactionHistory(startDate: Date, endDate: Date): Promise<Transaction[]> {
    try {
      const response = await this.makeRequest(
        `/fills?order_id=all&product_id=all&after=${startDate.toISOString()}&before=${endDate.toISOString()}`,
        'GET',
        {},
        this.getAuthHeaders('GET', `/fills?order_id=all&product_id=all&after=${startDate.toISOString()}&before=${endDate.toISOString()}`)
      )

      return response.data.map((fill: any) => ({
        id: fill.trade_id,
        symbol: fill.product_id,
        side: fill.side as 'buy' | 'sell',
        amount: parseFloat(fill.size),
        price: parseFloat(fill.price),
        fee: parseFloat(fill.fee),
        timestamp: new Date(fill.created_at).getTime(),
        orderId: fill.order_id
      }))
    } catch (error) {
      this.handleError(error)
    }
  }

  async getBalances(): Promise<Balance[]> {
    try {
      const response = await this.makeRequest('/accounts', 'GET', {}, this.getAuthHeaders('GET', '/accounts'))
      
      return response.data
        .filter((account: any) => parseFloat(account.balance) > 0)
        .map((account: any) => ({
          asset: account.currency,
          free: parseFloat(account.available),
          locked: parseFloat(account.hold),
          total: parseFloat(account.balance)
        }))
    } catch (error) {
      this.handleError(error)
    }
  }

  // Coinbase特定的认证方法
  private getAuthHeaders(method: string, requestPath: string, body?: string): Record<string, string> {
    const timestamp = Math.floor(Date.now() / 1000)
    const message = timestamp + method + requestPath + (body || '')
    const signature = this.generateSignature(message, this.credentials.secret)

    return {
      'CB-ACCESS-KEY': this.credentials.apiKey,
      'CB-ACCESS-SIGN': signature,
      'CB-ACCESS-TIMESTAMP': timestamp.toString(),
      'CB-ACCESS-PASSPHRASE': this.credentials.passphrase || ''
    }
  }

  // 获取账户历史记录
  async getAccountHistory(accountId: string): Promise<any[]> {
    try {
      const response = await this.makeRequest(
        `/accounts/${accountId}/ledger`,
        'GET',
        {},
        this.getAuthHeaders('GET', `/accounts/${accountId}/ledger`)
      )
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  // 获取订单历史
  async getOrderHistory(status?: string): Promise<any[]> {
    try {
      let endpoint = '/orders'
      if (status) {
        endpoint += `?status=${status}`
      }
      
      const response = await this.makeRequest(
        endpoint,
        'GET',
        {},
        this.getAuthHeaders('GET', endpoint)
      )
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  // Generate signature for API requests
  private generateSignature(message: string, secret: string): string {
    return crypto.createHmac('sha256', Buffer.from(secret, 'base64')).update(message).digest('base64')
  }

  // 重写速率限制处理
  protected async handleRateLimit(): Promise<void> {
    // Coinbase Pro的公开API限制为每秒3个请求
    await new Promise(resolve => setTimeout(resolve, 350))
  }
}
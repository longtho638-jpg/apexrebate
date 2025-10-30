import { BaseExchange, ExchangeCredentials, TradingPair, Ticker, FeeStructure, AffiliateInfo, Transaction, Balance } from './base-exchange'
import * as crypto from 'crypto'

export class KrakenExchange extends BaseExchange {
  constructor(credentials: ExchangeCredentials) {
    const baseUrl = credentials.sandbox 
      ? 'https://api.kraken.com/0'
      : 'https://api.kraken.com/0'
    
    super('Kraken', baseUrl, credentials)
  }

  async validateCredentials(): Promise<boolean> {
    try {
      const response = await this.makeAuthenticatedRequest('Balance')
      return response.error.length === 0
    } catch (error) {
      console.error('Kraken凭证验证失败:', error)
      return false
    }
  }

  async getTradingPairs(): Promise<TradingPair[]> {
    try {
      const response = await this.makeRequest('/public/AssetPairs')
      const pairs: TradingPair[] = []
      
      Object.entries(response.result).forEach(([key, pair]: [string, any]) => {
        if (!key.endsWith('.d')) { // 跳过暗池交易对
          pairs.push({
            symbol: key,
            baseAsset: pair.base,
            quoteAsset: pair.quote,
            status: 'active' // Kraken不提供状态信息，假设都是活跃的
          })
        }
      })
      
      return pairs
    } catch (error) {
      this.handleError(error)
    }
  }

  async getTicker(symbol: string): Promise<Ticker> {
    try {
      const response = await this.makeRequest(`/public/Ticker?pair=${symbol}`)
      const data = response.result[symbol]
      
      if (!data) {
        throw new Error(`找不到交易对 ${symbol} 的价格数据`)
      }
      
      const [price, , low24h, high24h, , volume] = data.c || [0, 0, 0, 0, 0, 0]
      
      return {
        symbol,
        price: parseFloat(price),
        change24h: 0, // Kraken需要通过历史数据计算
        volume24h: parseFloat(volume || '0'),
        high24h: parseFloat(high24h || '0'),
        low24h: parseFloat(low24h || '0'),
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
      
      // 只获取主要的交易对
      const majorPairs = pairs.filter(pair => 
        pair.quoteAsset === 'USD' || 
        pair.quoteAsset === 'EUR' || 
        pair.quoteAsset === 'BTC' || 
        pair.quoteAsset === 'ETH'
      ).slice(0, 50)
      
      // 批量获取价格数据
      const symbols = majorPairs.map(pair => pair.symbol).join(',')
      const response = await this.makeRequest(`/public/Ticker?pair=${symbols}`)
      
      Object.entries(response.result).forEach(([symbol, data]: [string, any]) => {
        const [price, , low24h, high24h, , volume] = data.c || [0, 0, 0, 0, 0, 0]
        
        tickers.push({
          symbol,
          price: parseFloat(price),
          change24h: 0,
          volume24h: parseFloat(volume || '0'),
          high24h: parseFloat(high24h || '0'),
          low24h: parseFloat(low24h || '0'),
          timestamp: Date.now()
        })
      })
      
      return tickers
    } catch (error) {
      this.handleError(error)
    }
  }

  async getFeeStructure(): Promise<FeeStructure> {
    try {
      // Kraken费率结构（基于交易量）
      return {
        maker: 0.0016, // 0.16%
        taker: 0.0026, // 0.26%
        levels: [
          { volume30d: 0, maker: 0.0016, taker: 0.0026 },
          { volume30d: 50000, maker: 0.0014, taker: 0.0024 },
          { volume30d: 100000, maker: 0.0012, taker: 0.0022 },
          { volume30d: 250000, maker: 0.0010, taker: 0.0020 },
          { volume30d: 500000, maker: 0.0008, taker: 0.0018 },
          { volume30d: 1000000, maker: 0.0006, taker: 0.0016 },
          { volume30d: 2500000, maker: 0.0004, taker: 0.0014 },
          { volume30d: 5000000, maker: 0.0002, taker: 0.0012 },
          { volume30d: 10000000, maker: 0.0000, taker: 0.0010 }
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
        commissionRate: 0.2, // 20%返利
        rebateRate: 0.00052, // 0.052%实际返利
        status: 'active'
      }
    } catch (error) {
      this.handleError(error)
    }
  }

  async getTransactionHistory(startDate: Date, endDate: Date): Promise<Transaction[]> {
    try {
      const response = await this.makeAuthenticatedRequest('TradesHistory', {
        start: Math.floor(startDate.getTime() / 1000),
        end: Math.floor(endDate.getTime() / 1000)
      })
      
      const transactions: Transaction[] = []
      
      if (response.result && response.result.trades) {
        Object.entries(response.result.trades).forEach(([tradeId, trade]: [string, any]) => {
          transactions.push({
            id: tradeId,
            symbol: trade.pair,
            side: trade.type as 'buy' | 'sell',
            amount: parseFloat(trade.vol),
            price: parseFloat(trade.price),
            fee: parseFloat(trade.fee),
            timestamp: parseInt(trade.time) * 1000,
            orderId: trade.ordertxid || tradeId
          })
        })
      }
      
      return transactions
    } catch (error) {
      this.handleError(error)
    }
  }

  async getBalances(): Promise<Balance[]> {
    try {
      const response = await this.makeAuthenticatedRequest('Balance')
      const balances: Balance[] = []
      
      if (response.result) {
        Object.entries(response.result).forEach(([asset, balance]) => {
          const balanceValue = parseFloat(balance as string)
          if (balanceValue > 0) {
            balances.push({
              asset,
              free: balanceValue,
              locked: 0, // Kraken不提供锁定余额信息
              total: balanceValue
            })
          }
        })
      }
      
      return balances
    } catch (error) {
      this.handleError(error)
    }
  }

  // Kraken特定的认证方法
  private async makeAuthenticatedRequest(method: string, params?: any): Promise<any> {
    const nonce = Date.now().toString()
    const postData = params ? new URLSearchParams({ ...params, nonce }).toString() : `nonce=${nonce}`
    
    const message = nonce + postData
    const signature = this.generateSignature(message, this.credentials.secret)
    
    const headers = {
      'API-Key': this.credentials.apiKey,
      'API-Sign': signature,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
    
    return this.makeRequest(`/private/${method}`, 'POST', postData, headers)
  }

  // 获取账户余额详情
  async getBalanceDetails(): Promise<any> {
    try {
      return await this.makeAuthenticatedRequest('Balance')
    } catch (error) {
      this.handleError(error)
    }
  }

  // 获取交易历史
  async getTradeHistory(options?: { start?: Date; end?: Date; offset?: number }): Promise<any> {
    try {
      const params: any = {}
      if (options?.start) params.start = Math.floor(options.start.getTime() / 1000)
      if (options?.end) params.end = Math.floor(options.end.getTime() / 1000)
      if (options?.offset) params.offset = options.offset
      
      return await this.makeAuthenticatedRequest('TradesHistory', params)
    } catch (error) {
      this.handleError(error)
    }
  }

  // 获取订单历史
  async getOrderHistory(options?: { start?: Date; end?: Date; offset?: number }): Promise<any> {
    try {
      const params: any = {}
      if (options?.start) params.start = Math.floor(options.start.getTime() / 1000)
      if (options?.end) params.end = Math.floor(options.end.getTime() / 1000)
      if (options?.offset) params.offset = options.offset
      
      return await this.makeAuthenticatedRequest('ClosedOrders', params)
    } catch (error) {
      this.handleError(error)
    }
  }

  // 重写签名生成方法（Kraken使用SHA512）
  protected generateSignature(payload: string, secret: string): string {
    return crypto.createHmac('sha512', Buffer.from(secret, 'base64'))
      .update(payload)
      .digest('base64')
  }

  // 重写速率限制处理
  protected async handleRateLimit(): Promise<void> {
    // Kraken的私有API限制为每秒1个请求
    await new Promise(resolve => setTimeout(resolve, 1100))
  }
}
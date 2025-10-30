/**
 * 基础交易所接口
 * 定义所有交易所必须实现的标准方法
 */

import * as crypto from 'crypto'

export interface ExchangeCredentials {
  apiKey: string
  secret: string
  passphrase?: string
  sandbox?: boolean
}

export interface TradingPair {
  symbol: string
  baseAsset: string
  quoteAsset: string
  status: 'active' | 'inactive' | 'suspended'
}

export interface Ticker {
  symbol: string
  price: number
  change24h: number
  volume24h: number
  high24h: number
  low24h: number
  timestamp: number
}

export interface FeeStructure {
  maker: number
  taker: number
  levels: Array<{
    volume30d: number
    maker: number
    taker: number
  }>
}

export interface AffiliateInfo {
  affiliateCode: string
  commissionRate: number
  rebateRate: number
  status: 'active' | 'pending' | 'suspended'
}

export interface Transaction {
  id: string
  symbol: string
  side: 'buy' | 'sell'
  amount: number
  price: number
  fee: number
  timestamp: number
  orderId: string
}

export interface Balance {
  asset: string
  free: number
  locked: number
  total: number
}

export abstract class BaseExchange {
  protected credentials: ExchangeCredentials
  protected name: string
  protected baseUrl: string
  protected isSandbox: boolean

  constructor(name: string, baseUrl: string, credentials: ExchangeCredentials) {
    this.name = name
    this.baseUrl = baseUrl
    this.credentials = credentials
    this.isSandbox = credentials.sandbox || false
  }

  // 抽象方法 - 子类必须实现
  abstract getTradingPairs(): Promise<TradingPair[]>
  abstract getTicker(symbol: string): Promise<Ticker>
  abstract getTickers(): Promise<Ticker[]>
  abstract getFeeStructure(): Promise<FeeStructure>
  abstract getAffiliateInfo(): Promise<AffiliateInfo>
  abstract getTransactionHistory(startDate: Date, endDate: Date): Promise<Transaction[]>
  abstract getBalances(): Promise<Balance[]>
  abstract validateCredentials(): Promise<boolean>

  // 通用方法
  getName(): string {
    return this.name
  }

  isTestMode(): boolean {
    return this.isSandbox
  }

  // 标准化交易对格式
  protected normalizeSymbol(symbol: string): string {
    return symbol.toUpperCase().replace('-', '/')
  }

  // 计算返利金额
  calculateRebate(transaction: Transaction, feeStructure: FeeStructure): number {
    const fee = transaction.fee
    const rebateRate = feeStructure.maker * 0.3 // 假设返利30%的手续费
    return fee * rebateRate
  }

  // 生成签名 (通用实现)
  protected generateSignature(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex')
  }

  // API请求封装
  protected async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    params?: any,
    headers?: any
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ApexRebate/1.0',
        ...headers
      }
    }

    if (params && method !== 'GET') {
      config.body = JSON.stringify(params)
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`${this.name} API请求错误:`, error)
      throw error
    }
  }

  // 错误处理
  protected handleError(error: any): never {
    const message = error.response?.data?.message || error.message || '未知错误'
    throw new Error(`${this.name} API错误: ${message}`)
  }

  // 速率限制处理
  protected async handleRateLimit(): Promise<void> {
    // 基础实现，子类可以重写
    await new Promise(resolve => setTimeout(resolve, 100))
  }
}
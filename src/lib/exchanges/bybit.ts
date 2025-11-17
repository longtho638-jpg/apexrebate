/**
 * Bybit Exchange Integration
 * Implements the BaseExchange interface for Bybit API
 */

import * as crypto from 'crypto'
import {
  BaseExchange,
  ExchangeCredentials,
  TradingPair,
  Ticker,
  FeeStructure,
  AffiliateInfo,
  Transaction,
  Balance,
} from './base-exchange'

export class BybitExchange extends BaseExchange {
  constructor(credentials: ExchangeCredentials) {
    const baseUrl = credentials.sandbox
      ? 'https://api-testnet.bybit.com'
      : 'https://api.bybit.com'
    super('Bybit', baseUrl, credentials)
  }

  async getTradingPairs(): Promise<TradingPair[]> {
    try {
      const response = await fetch(`${this.baseUrl}/v5/market/instruments-info?category=spot`)
      const data = await response.json()

      if (data.retCode !== 0) {
        throw new Error(`Bybit API error: ${data.retMsg}`)
      }

      return data.result.list.map((instrument: any) => ({
        symbol: this.formatSymbol(instrument.symbol),
        baseAsset: instrument.baseCoin,
        quoteAsset: instrument.quoteCoin,
        status: instrument.status === '1' ? 'active' : 'inactive',
      }))
    } catch (error) {
      console.error('Bybit getTradingPairs error:', error)
      return []
    }
  }

  async getTicker(symbol: string): Promise<Ticker> {
    try {
      const normalizedSymbol = symbol.replace('/', '')
      const response = await fetch(
        `${this.baseUrl}/v5/market/tickers?category=spot&symbol=${normalizedSymbol}`
      )
      const data = await response.json()

      if (data.retCode !== 0 || !data.result?.list?.[0]) {
        throw new Error(`Bybit API error: ${data.retMsg}`)
      }

      const ticker = data.result.list[0]

      return {
        symbol: symbol,
        price: parseFloat(ticker.lastPrice),
        change24h: parseFloat(ticker.price24hPcnt) * 100, // Convert to percentage
        volume24h: parseFloat(ticker.volume24h),
        high24h: parseFloat(ticker.highPrice24h),
        low24h: parseFloat(ticker.lowPrice24h),
        timestamp: Date.now(),
      }
    } catch (error) {
      console.error(`Bybit getTicker error for ${symbol}:`, error)
      throw error
    }
  }

  async getTickers(): Promise<Ticker[]> {
    try {
      const response = await fetch(`${this.baseUrl}/v5/market/tickers?category=spot`)
      const data = await response.json()

      if (data.retCode !== 0) {
        throw new Error(`Bybit API error: ${data.retMsg}`)
      }

      return data.result.list.slice(0, 50).map((ticker: any) => ({
        symbol: this.formatSymbol(ticker.symbol),
        price: parseFloat(ticker.lastPrice),
        change24h: parseFloat(ticker.price24hPcnt) * 100,
        volume24h: parseFloat(ticker.volume24h),
        high24h: parseFloat(ticker.highPrice24h),
        low24h: parseFloat(ticker.lowPrice24h),
        timestamp: Date.now(),
      }))
    } catch (error) {
      console.error('Bybit getTickers error:', error)
      return []
    }
  }

  async getFeeStructure(): Promise<FeeStructure> {
    // Bybit standard fees
    return {
      maker: 0.001, // 0.1%
      taker: 0.001, // 0.1%
      levels: [
        { volume30d: 0, maker: 0.001, taker: 0.001 }, // Regular
        { volume30d: 500, maker: 0.0008, taker: 0.001 }, // VIP 1
        { volume30d: 2500, maker: 0.0006, taker: 0.0009 }, // VIP 2
        { volume30d: 7500, maker: 0.0005, taker: 0.0008 }, // VIP 3
        { volume30d: 25000, maker: 0.0004, taker: 0.0007 }, // VIP 4
        { volume30d: 75000, maker: 0.0003, taker: 0.0006 }, // VIP 5
        { volume30d: 150000, maker: 0.0002, taker: 0.0005 }, // Pro 1
        { volume30d: 300000, maker: 0.00015, taker: 0.0004 }, // Pro 2
        { volume30d: 600000, maker: 0.0001, taker: 0.0003 }, // Pro 3
        { volume30d: 1000000, maker: 0.00005, taker: 0.0002 }, // Pro 4
      ],
    }
  }

  async getAffiliateInfo(): Promise<AffiliateInfo> {
    // Return default affiliate info
    // In production, this should fetch from Bybit Affiliate API
    return {
      affiliateCode: process.env.BYBIT_AFFILIATE_CODE || 'APEXREBATE',
      commissionRate: 0.4, // 40% commission
      rebateRate: 0.2, // 20% rebate to users
      status: 'active',
    }
  }

  async getTransactionHistory(startDate: Date, endDate: Date): Promise<Transaction[]> {
    // This requires authenticated API call
    // For now, return empty array
    console.log('Bybit getTransactionHistory not implemented - requires authentication')
    return []
  }

  async getBalances(): Promise<Balance[]> {
    // This requires authenticated API call
    // For now, return empty array
    console.log('Bybit getBalances not implemented - requires authentication')
    return []
  }

  async validateCredentials(): Promise<boolean> {
    // If no API key provided, consider valid (public endpoints only)
    if (!this.credentials.apiKey || !this.credentials.secret) {
      return true
    }

    try {
      // Try to fetch account information
      const timestamp = Date.now()
      const params = `api_key=${this.credentials.apiKey}&timestamp=${timestamp}`
      const signature = this.generateSignature(params)

      const response = await fetch(`${this.baseUrl}/v5/account/wallet-balance?${params}&sign=${signature}`, {
        headers: {
          'X-BAPI-API-KEY': this.credentials.apiKey,
          'X-BAPI-TIMESTAMP': timestamp.toString(),
          'X-BAPI-SIGN': signature,
        },
      })

      const data = await response.json()
      return data.retCode === 0
    } catch (error) {
      console.error('Bybit credential validation error:', error)
      return false
    }
  }

  // Helper methods
  private formatSymbol(bybitSymbol: string): string {
    // Convert BTCUSDT to BTC/USDT
    if (bybitSymbol.includes('USDT')) {
      return bybitSymbol.replace('USDT', '/USDT')
    }
    if (bybitSymbol.includes('BTC')) {
      return bybitSymbol.replace('BTC', '/BTC')
    }
    if (bybitSymbol.includes('ETH')) {
      return bybitSymbol.replace('ETH', '/ETH')
    }
    return bybitSymbol
  }

  private generateSignature(params: string): string {
    return crypto.createHmac('sha256', this.credentials.secret).update(params).digest('hex')
  }
}

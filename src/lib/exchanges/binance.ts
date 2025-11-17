/**
 * Binance Exchange Integration
 * Implements the BaseExchange interface for Binance API
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

export class BinanceExchange extends BaseExchange {
  constructor(credentials: ExchangeCredentials) {
    const baseUrl = credentials.sandbox
      ? 'https://testnet.binance.vision'
      : 'https://api.binance.com'
    super('Binance', baseUrl, credentials)
  }

  async getTradingPairs(): Promise<TradingPair[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v3/exchangeInfo`)
      const data = await response.json()

      return data.symbols.map((symbol: any) => ({
        symbol: symbol.symbol,
        baseAsset: symbol.baseAsset,
        quoteAsset: symbol.quoteAsset,
        status: symbol.status.toLowerCase() === 'trading' ? 'active' : 'inactive',
      }))
    } catch (error) {
      console.error('Binance getTradingPairs error:', error)
      return []
    }
  }

  async getTicker(symbol: string): Promise<Ticker> {
    try {
      const normalizedSymbol = symbol.replace('/', '')
      const response = await fetch(`${this.baseUrl}/api/v3/ticker/24hr?symbol=${normalizedSymbol}`)
      const data = await response.json()

      return {
        symbol: symbol,
        price: parseFloat(data.lastPrice),
        change24h: parseFloat(data.priceChangePercent),
        volume24h: parseFloat(data.volume),
        high24h: parseFloat(data.highPrice),
        low24h: parseFloat(data.lowPrice),
        timestamp: data.closeTime,
      }
    } catch (error) {
      console.error(`Binance getTicker error for ${symbol}:`, error)
      throw error
    }
  }

  async getTickers(): Promise<Ticker[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v3/ticker/24hr`)
      const data = await response.json()

      return data.slice(0, 50).map((ticker: any) => ({
        symbol: this.formatSymbol(ticker.symbol),
        price: parseFloat(ticker.lastPrice),
        change24h: parseFloat(ticker.priceChangePercent),
        volume24h: parseFloat(ticker.volume),
        high24h: parseFloat(ticker.highPrice),
        low24h: parseFloat(ticker.lowPrice),
        timestamp: ticker.closeTime,
      }))
    } catch (error) {
      console.error('Binance getTickers error:', error)
      return []
    }
  }

  async getFeeStructure(): Promise<FeeStructure> {
    // Binance standard fees (can be customized based on VIP level)
    return {
      maker: 0.001, // 0.1%
      taker: 0.001, // 0.1%
      levels: [
        { volume30d: 0, maker: 0.001, taker: 0.001 }, // VIP 0
        { volume30d: 50, maker: 0.0009, taker: 0.001 }, // VIP 1
        { volume30d: 500, maker: 0.0008, taker: 0.001 }, // VIP 2
        { volume30d: 1500, maker: 0.0007, taker: 0.0009 }, // VIP 3
        { volume30d: 4500, maker: 0.0007, taker: 0.0008 }, // VIP 4
        { volume30d: 10000, maker: 0.0006, taker: 0.0007 }, // VIP 5
        { volume30d: 20000, maker: 0.0005, taker: 0.0006 }, // VIP 6
        { volume30d: 40000, maker: 0.0004, taker: 0.0005 }, // VIP 7
        { volume30d: 80000, maker: 0.0003, taker: 0.0004 }, // VIP 8
        { volume30d: 150000, maker: 0.0002, taker: 0.0003 }, // VIP 9
      ],
    }
  }

  async getAffiliateInfo(): Promise<AffiliateInfo> {
    // Return default affiliate info
    // In production, this should fetch from Binance Affiliate API
    return {
      affiliateCode: process.env.BINANCE_AFFILIATE_CODE || 'APEXREBATE',
      commissionRate: 0.4, // 40% commission
      rebateRate: 0.2, // 20% rebate to users
      status: 'active',
    }
  }

  async getTransactionHistory(startDate: Date, endDate: Date): Promise<Transaction[]> {
    // This requires authenticated API call
    // For now, return empty array
    console.log('Binance getTransactionHistory not implemented - requires authentication')
    return []
  }

  async getBalances(): Promise<Balance[]> {
    // This requires authenticated API call
    // For now, return empty array
    console.log('Binance getBalances not implemented - requires authentication')
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
      const signature = this.generateSignature(`timestamp=${timestamp}`)

      const response = await fetch(
        `${this.baseUrl}/api/v3/account?timestamp=${timestamp}&signature=${signature}`,
        {
          headers: {
            'X-MBX-APIKEY': this.credentials.apiKey,
          },
        }
      )

      return response.ok
    } catch (error) {
      console.error('Binance credential validation error:', error)
      return false
    }
  }

  // Helper methods
  private formatSymbol(binanceSymbol: string): string {
    // Convert BTCUSDT to BTC/USDT
    if (binanceSymbol.includes('USDT')) {
      return binanceSymbol.replace('USDT', '/USDT')
    }
    if (binanceSymbol.includes('BTC')) {
      return binanceSymbol.replace('BTC', '/BTC')
    }
    if (binanceSymbol.includes('ETH')) {
      return binanceSymbol.replace('ETH', '/ETH')
    }
    return binanceSymbol
  }

  private generateSignature(queryString: string): string {
    return crypto.createHmac('sha256', this.credentials.secret).update(queryString).digest('hex')
  }
}

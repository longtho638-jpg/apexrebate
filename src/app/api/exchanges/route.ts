import { NextRequest, NextResponse } from 'next/server'
import { ExchangeManager } from '@/lib/exchanges/exchange-manager'

// 全局交易所管理器实例
const exchangeManager = new ExchangeManager()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const exchange = searchParams.get('exchange')
    const symbol = searchParams.get('symbol')
    const symbols = searchParams.get('symbols')?.split(',')

    switch (action) {
      case 'exchanges':
        // 获取所有交易所列表
        const exchanges = exchangeManager.getExchanges()
        return NextResponse.json({
          success: true,
          data: exchanges.map(ex => ({
            name: ex.getName(),
            testMode: ex.isTestMode()
          }))
        })

      case 'extended-exchanges':
        // 获取扩展的交易所列表（包含新的第三方平台）
        const extendedExchanges = exchangeManager.getExtendedExchanges()
        return NextResponse.json({
          success: true,
          data: extendedExchanges
        })

      case 'metrics':
        // 获取交易所指标
        const metrics = exchangeManager.getExchangeMetrics()
        return NextResponse.json({
          success: true,
          data: metrics
        })

      case 'tickers':
        // 获取聚合价格数据
        const tickers = await exchangeManager.getAggregatedTickers(symbols)
        return NextResponse.json({
          success: true,
          data: tickers
        })

      case 'pairs':
        // 获取所有交易对
        const pairs = await exchangeManager.getAllTradingPairs()
        return NextResponse.json({
          success: true,
          data: pairs
        })

      case 'fees':
        // 获取所有费率结构
        const fees = await exchangeManager.getAllFeeStructures()
        return NextResponse.json({
          success: true,
          data: Object.fromEntries(fees)
        })

      case 'affiliate':
        // 获取联盟信息
        const affiliate = await exchangeManager.getAllAffiliateInfo()
        return NextResponse.json({
          success: true,
          data: Object.fromEntries(affiliate)
        })

      case 'health':
        // 健康检查
        const health = await exchangeManager.healthCheck()
        return NextResponse.json({
          success: true,
          data: Object.fromEntries(health)
        })

      case 'configs':
        // 获取配置信息
        const configs = exchangeManager.getConfigs()
        return NextResponse.json({
          success: true,
          data: configs
        })

      case 'market-data':
        // 获取市场深度数据
        if (!exchange || !symbol) {
          return NextResponse.json({
            success: false,
            error: '缺少交易所或交易对参数'
          }, { status: 400 })
        }
        const orderBook = await exchangeManager.getOrderBook(exchange, symbol)
        return NextResponse.json({
          success: true,
          data: orderBook
        })

      case 'trading-history':
        // 获取交易历史
        if (!exchange || !symbol) {
          return NextResponse.json({
            success: false,
            error: '缺少交易所或交易对参数'
          }, { status: 400 })
        }
        const trades = await exchangeManager.getRecentTrades(exchange, symbol)
        return NextResponse.json({
          success: true,
          data: trades
        })

      case 'market-stats':
        // 获取市场统计
        if (!exchange || !symbol) {
          return NextResponse.json({
            success: false,
            error: '缺少交易所或交易对参数'
          }, { status: 400 })
        }
        const stats = await exchangeManager.getMarketStats(exchange, symbol)
        return NextResponse.json({
          success: true,
          data: stats
        })

      default:
        if (exchange && symbol) {
          // 获取特定交易所的特定交易对价格
          const exchangeInstance = exchangeManager.getExchange(exchange)
          if (!exchangeInstance) {
            return NextResponse.json({
              success: false,
              error: '交易所不存在'
            }, { status: 404 })
          }

          const ticker = await exchangeInstance.getTicker(symbol)
          return NextResponse.json({
            success: true,
            data: ticker
          })
        } else if (exchange) {
          // 获取特定交易所的所有价格
          const exchangeInstance = exchangeManager.getExchange(exchange)
          if (!exchangeInstance) {
            return NextResponse.json({
              success: false,
              error: '交易所不存在'
            }, { status: 404 })
          }

          const exchangeTickers = await exchangeInstance.getTickers()
          return NextResponse.json({
            success: true,
            data: exchangeTickers
          })
        } else {
          return NextResponse.json({
            success: false,
            error: '请指定action参数'
          }, { status: 400 })
        }
    }
  } catch (error) {
    console.error('交易所API错误:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '服务器内部错误'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, exchange, config } = body

    switch (action) {
      case 'add':
        // 添加新交易所
        if (!config) {
          return NextResponse.json({
            success: false,
            error: '缺少配置信息'
          }, { status: 400 })
        }

        const added = await exchangeManager.addExchange(config)
        return NextResponse.json({
          success: added,
          message: added ? '交易所添加成功' : '交易所添加失败'
        })

      case 'remove':
        // 移除交易所
        if (!exchange) {
          return NextResponse.json({
            success: false,
            error: '缺少交易所名称'
          }, { status: 400 })
        }

        const removed = exchangeManager.removeExchange(exchange)
        return NextResponse.json({
          success: removed,
          message: removed ? '交易所移除成功' : '交易所移除失败'
        })

      case 'update':
        // 更新交易所配置
        if (!exchange || !config) {
          return NextResponse.json({
            success: false,
            error: '缺少交易所名称或配置信息'
          }, { status: 400 })
        }

        const updated = exchangeManager.updateConfig(exchange, config)
        return NextResponse.json({
          success: updated,
          message: updated ? '配置更新成功' : '配置更新失败'
        })

      case 'start-auto-update':
        // 启动自动更新
        const interval = body.interval || 60000
        exchangeManager.startAutoUpdate(interval)
        return NextResponse.json({
          success: true,
          message: '自动更新已启动'
        })

      case 'stop-auto-update':
        // 停止自动更新
        exchangeManager.stopAutoUpdate()
        return NextResponse.json({
          success: true,
          message: '自动更新已停止'
        })

      default:
        return NextResponse.json({
          success: false,
          error: '未知操作'
        }, { status: 400 })
    }
  } catch (error) {
    console.error('交易所API错误:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '服务器内部错误'
    }, { status: 500 })
  }
}
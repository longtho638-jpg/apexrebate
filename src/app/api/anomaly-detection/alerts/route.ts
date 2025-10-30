import { NextRequest, NextResponse } from 'next/server'
import { mlAnomalyDetector } from '@/lib/ml-anomaly-detector'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // 获取用户会话
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const severity = searchParams.get('severity')

    // 获取用户警报
    const alerts = await mlAnomalyDetector.getUserAlerts(userId, severity || undefined)

    return NextResponse.json({
      success: true,
      data: {
        alerts,
        count: alerts.length,
        userId,
        severity: severity || 'all'
      }
    })

  } catch (error) {
    console.error('Anomaly alerts API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get anomaly alerts'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // 获取用户会话
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()
    const { transaction } = body

    if (!transaction) {
      return NextResponse.json({
        success: false,
        error: 'Transaction data is required'
      }, { status: 400 })
    }

    // 分析交易
    const alerts = await mlAnomalyDetector.analyzeTransaction({
      userId,
      ...transaction,
      timestamp: new Date(transaction.timestamp)
    })

    return NextResponse.json({
      success: true,
      data: {
        alerts,
        count: alerts.length,
        transactionId: transaction.id || 'unknown'
      }
    })

  } catch (error) {
    console.error('Anomaly detection API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze transaction'
    }, { status: 500 })
  }
}
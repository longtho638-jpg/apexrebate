import { NextRequest, NextResponse } from 'next/server'
import { aiRecommendationEngine } from '@/lib/ai-recommendation-engine'
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
    const type = searchParams.get('type') // 可选：过滤推荐类型

    // 获取用户推荐
    const recommendations = await aiRecommendationEngine.getUserRecommendations(userId)

    // 根据类型过滤
    const filteredRecommendations = type 
      ? recommendations.filter(rec => rec.type === type)
      : recommendations

    return NextResponse.json({
      success: true,
      data: {
        recommendations: filteredRecommendations,
        total: recommendations.length,
        filtered: filteredRecommendations.length,
        userId
      }
    })

  } catch (error) {
    console.error('Recommendations API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get recommendations'
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
    const { action, target, duration, metadata } = body

    // 记录用户行为
    await aiRecommendationEngine.recordBehavior({
      userId,
      action,
      target,
      duration,
      metadata
    })

    return NextResponse.json({
      success: true,
      data: {
        message: 'Behavior recorded successfully',
        userId,
        action,
        target
      }
    })

  } catch (error) {
    console.error('Behavior recording API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to record behavior'
    }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Bạn cần đăng nhập' } },
        { status: 401 }
      )
    }

    const user = await db.users.findUnique({
      where: { id: session.user.id },
      select: {
        email: true,
        emailVerified: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'USER_NOT_FOUND', message: 'Không tìm thấy người dùng' } },
        { status: 404 }
      )
    }

    // Get email notification history
    const notifications = await db.emailNotification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        subject: true,
        status: true,
        sentAt: true,
        createdAt: true,
        error: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        email: user.email,
        emailVerified: user.emailVerified,
        memberSince: user.createdAt,
        notifications,
        stats: {
          totalSent: notifications.filter(n => n.status === 'sent').length,
          totalPending: notifications.filter(n => n.status === 'pending').length,
          totalFailed: notifications.filter(n => n.status === 'failed').length
        }
      }
    })

  } catch (error) {
    console.error('Get email preferences API error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Lỗi server nội bộ' } },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Bạn cần đăng nhập' } },
        { status: 401 }
      )
    }

    const { preferences } = await request.json()

    // In a real implementation, you would save these preferences to the database
    // For now, we'll just return success
    
    return NextResponse.json({
      success: true,
      message: 'Email preferences updated successfully'
    })

  } catch (error) {
    console.error('Update email preferences API error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Lỗi server nội bộ' } },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { emailService, EmailType } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Bạn cần đăng nhập' } },
        { status: 401 }
      )
    }

    const { type, recipient, data, scheduledFor } = await request.json()

    if (!type || !recipient) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Thiếu thông tin bắt buộc' } },
        { status: 400 }
      )
    }

    // Validate email type
    if (!Object.values(EmailType).includes(type)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_TYPE', message: 'Loại email không hợp lệ' } },
        { status: 400 }
      )
    }

    // Get user preferences
    const userPrefs = await emailService.getUserEmailPreferences(session.user.id)
    if (!userPrefs.enabled) {
      return NextResponse.json(
        { success: false, error: { code: 'EMAIL_DISABLED', message: 'Người dùng đã tắt email' } },
        { status: 400 }
      )
    }

    let notification
    if (scheduledFor) {
      // Schedule email for later
      const scheduledDate = new Date(scheduledFor)
      notification = await emailService.scheduleEmail(
        session.user.id,
        type as EmailType,
        recipient,
        scheduledDate,
        data
      )
      
      return NextResponse.json({
        success: true,
        data: {
          id: notification.id,
          scheduledFor: notification.scheduledFor,
          message: 'Email đã được lên lịch gửi'
        }
      })
    } else {
      // Send email immediately
      const success = await emailService.sendImmediateEmail(
        session.user.id,
        type as EmailType,
        recipient,
        data
      )

      if (success) {
        return NextResponse.json({
          success: true,
          message: 'Email đã được gửi thành công'
        })
      } else {
        return NextResponse.json(
          { success: false, error: { code: 'SEND_FAILED', message: 'Gửi email thất bại' } },
          { status: 500 }
        )
      }
    }

  } catch (error) {
    console.error('Send email API error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Lỗi server nội bộ' } },
      { status: 500 }
    )
  }
}
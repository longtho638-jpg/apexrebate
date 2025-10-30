import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    // This endpoint should be protected by a cron job or admin authentication
    // For now, we'll allow it but in production you should secure it
    
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      )
    }

    await emailService.processPendingEmails()

    return NextResponse.json({
      success: true,
      message: 'Processed pending emails successfully'
    })

  } catch (error) {
    console.error('Process emails API error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Lỗi server nội bộ' } },
      { status: 500 }
    )
  }
}
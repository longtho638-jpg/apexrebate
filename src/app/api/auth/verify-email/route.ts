import { NextRequest, NextResponse } from 'next/server'
import { verifyEmail } from '@/lib/auth-enhanced'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(
        new URL('/auth/verify-request?error=invalid', request.url)
      )
    }

    const result = await verifyEmail(token)

    if (result.success) {
      return NextResponse.redirect(
        new URL('/auth/verify-request?success=true', request.url)
      )
    } else {
      return NextResponse.redirect(
        new URL(`/auth/verify-request?error=${encodeURIComponent(result.error || 'verification_failed')}`, request.url)
      )
    }

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.redirect(
      new URL('/auth/verify-request?error=server_error', request.url)
    )
  }
}
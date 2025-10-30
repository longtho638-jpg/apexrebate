import { NextRequest, NextResponse } from 'next/server'
import { checkPasswordStrength } from '@/lib/auth-enhanced'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    const strength = await checkPasswordStrength(password)

    return NextResponse.json(strength)

  } catch (error) {
    console.error('Password strength check error:', error)
    return NextResponse.json(
      { error: 'Failed to check password strength' },
      { status: 500 }
    )
  }
}
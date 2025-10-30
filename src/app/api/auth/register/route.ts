import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import { db } from '@/lib/db'
import { sendVerificationEmail } from '@/lib/auth-enhanced'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, experience, preferredBroker, referralCode } = await request.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate referral code
    const userReferralCode = nanoid(8).toUpperCase()

    // Handle referral logic
    let referredBy = null
    if (referralCode) {
      const referrer = await db.user.findUnique({
        where: { referralCode }
      })
      if (referrer) {
        referredBy = referrer.id
      }
    }

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        experience,
        preferredBroker,
        referralCode: userReferralCode,
        referredBy,
        role: 'USER'
      }
    })

    // Send verification email
    await sendVerificationEmail(email)

    // Create welcome activity
    await db.userActivity.create({
      data: {
        userId: user.id,
        type: 'LOGIN',
        description: 'Account created',
        points: 10
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please check your email to verify your account.'
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, experience, monthlyVolume, reason } = body

    // Validation
    if (!name || !email || !experience || !monthlyVolume || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create join request (upsert to avoid duplicates)
    const joinRequest = await db.hangSoiJoinRequest.upsert({
      where: { email },
      update: {
        name,
        experience,
        monthlyVolume: parseInt(monthlyVolume),
        reason,
        updatedAt: new Date()
      },
      create: {
        name,
        email,
        experience,
        monthlyVolume: parseInt(monthlyVolume),
        reason,
        status: 'PENDING'
      }
    })

    // TODO: Send email notification to admin
    // await sendAdminNotification(joinRequest)

    return NextResponse.json(
      { success: true, message: 'Join request submitted successfully', id: joinRequest.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Join request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

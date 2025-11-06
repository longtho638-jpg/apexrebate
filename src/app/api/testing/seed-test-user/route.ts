export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'

/**
 * POST /api/testing/seed-test-user
 * Body (optional): { email?: string, password?: string }
 * Auth: Authorization: Bearer {SEED_SECRET_KEY}
 *
 * Tạo hoặc cập nhật tài khoản TEST_USER để phục vụ E2E login.
 */
export async function POST(req: NextRequest) {
  try {
    const hdrs = await headers()
    const auth = hdrs.get('authorization')
    const expected = `Bearer ${process.env.SEED_SECRET_KEY}`

    if (!process.env.SEED_SECRET_KEY || auth !== expected) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const email = (body.email as string) || process.env.TEST_USER_EMAIL || 'ci.e2e.tester@apexrebate.com'
    const password = (body.password as string) || process.env.TEST_USER_PASSWORD || 'Password123!'

    const hashed = await bcrypt.hash(password, 12)

    const existing = await db.users.findUnique({ where: { email } })

    let user
    let created = false
    if (existing) {
      user = await db.users.update({
        where: { id: existing.id },
        data: {
          password: hashed,
          name: existing.name || 'E2E Tester',
          role: existing.role || 'USER',
          emailVerified: existing.emailVerified ?? new Date(),
          preferredBroker: existing.preferredBroker ?? 'binance',
          experience: existing.experience ?? 'intermediate',
          updatedAt: new Date(),
        },
      })
    } else {
      user = await db.users.create({
        data: {
          id: uuidv4(),
          email,
          name: 'E2E Tester',
          password: hashed,
          role: 'USER',
          emailVerified: new Date(),
          tradingVolume: 1000000,
          preferredBroker: 'binance',
          experience: 'intermediate',
          updatedAt: new Date(),
        },
      })
      created = true
    }

    return NextResponse.json({
      success: true,
      created,
      userId: user.id,
      email,
    })
  } catch (error: any) {
    console.error('[SEED TEST USER] Error:', error)
    return NextResponse.json({ error: 'Internal server error', message: error?.message }, { status: 500 })
  }
}

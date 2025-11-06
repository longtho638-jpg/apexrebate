export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'

type SeedBody = {
  email?: string
  password?: string
  payouts?: number
  startMonthsAgo?: number
  brokers?: string[]
  clean?: boolean
  referralsCount?: number
  grantAchievements?: boolean
}

/**
 * POST /api/testing/seed-test-data
 * Body (optional): {
 *   email?: string,
 *   password?: string,
 *   payouts?: number,           // số bản ghi payout muốn tạo (mặc định 6)
 *   startMonthsAgo?: number,    // tạo dữ liệu lùi về trước N tháng (mặc định 5)
 *   brokers?: string[],         // danh sách broker xoay vòng (binance/bybit/okx)
 *   clean?: boolean             // xoá dữ liệu cũ của user trước khi seed (mặc định true)
 * }
 * Auth: Authorization: Bearer {SEED_SECRET_KEY}
 *
 * Tạo dữ liệu payouts và activity cơ bản cho TEST_USER để E2E thấy biểu đồ/bảng phong phú hơn.
 */
export async function POST(req: NextRequest) {
  try {
    const hdrs = await headers()
    const auth = hdrs.get('authorization')
    const expected = `Bearer ${process.env.SEED_SECRET_KEY}`

    if (!process.env.SEED_SECRET_KEY || auth !== expected) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await req.json().catch(() => ({}))) as SeedBody
    const email = body.email || process.env.TEST_USER_EMAIL || 'ci.e2e.tester@apexrebate.com'
    const password = body.password || process.env.TEST_USER_PASSWORD || 'Password123!'
    const payoutsCount = Math.max(1, Math.min(24, body.payouts ?? 6))
    const startMonthsAgo = Math.max(0, Math.min(24, body.startMonthsAgo ?? 5))
    const brokers = (body.brokers && body.brokers.length > 0 ? body.brokers : ['binance', 'bybit', 'okx']).map(b => b.toLowerCase())
    const clean = body.clean ?? true
    const referralsCount = Math.max(0, Math.min(10, body.referralsCount ?? 2))
    const grantAchievements = body.grantAchievements ?? true

    // Đảm bảo user tồn tại
    let user = await db.users.findUnique({ where: { email } })
    if (!user) {
      const hashed = await bcrypt.hash(password, 12)
      user = await db.users.create({
        data: {
          id: uuidv4(),
          email,
          name: 'E2E Tester',
          password: hashed,
          role: 'USER',
          emailVerified: new Date(),
          preferredBroker: 'binance',
          experience: 'intermediate',
          updatedAt: new Date(),
        },
      })
    }

    // Xoá dữ liệu cũ nếu yêu cầu
    if (clean) {
      await db.$transaction([
        db.payouts.deleteMany({ where: { userId: user.id } }),
        db.user_activities.deleteMany({ where: { userId: user.id } }),
        db.user_achievements.deleteMany({ where: { userId: user.id } }),
      ])
    }

    // Helper tính khoảng thời gian kỳ trả
    function getPeriodRange(date: Date) {
      const start = new Date(date)
      start.setDate(start.getDate() - 6)
      const toISO = (d: Date) => d.toISOString().slice(0, 10)
      return `${toISO(start)} to ${toISO(date)}`
    }

    // Tạo payouts rải đều theo tháng
    const now = new Date()
    const payoutsData: Parameters<typeof db.payouts.create>[0]['data'][] = []
    let totalTradingVolume = 0
    let totalAmount = 0

    for (let i = 0; i < payoutsCount; i++) {
      const monthOffset = startMonthsAgo - Math.floor((i * startMonthsAgo) / Math.max(1, payoutsCount - 1))
      const createdAt = new Date(now)
      createdAt.setMonth(now.getMonth() - monthOffset)
      // Dàn ngày vào giữa tháng cho đẹp số liệu
      createdAt.setDate(14 + ((i * 3) % 10))

      const processedAt = new Date(createdAt)
      processedAt.setDate(processedAt.getDate() + 1)

      const broker = brokers[i % brokers.length]
      const tradingVolume = 1_200_000 + (i * 150_000) // tăng dần
      const feeRate = 0.001 // 0.1%
      const totalFees = tradingVolume * feeRate
      const brokerRebate = totalFees * 0.4 // 40% của phí
      const apexRebate = brokerRebate * 0.1 // 10% hoa hồng
      const bonus = 50 + (i * 5)
      const amount = Math.round((apexRebate + bonus) * 100) / 100

      totalTradingVolume += tradingVolume
      totalAmount += amount

      payoutsData.push({
        id: uuidv4(),
        userId: user.id,
        amount,
        currency: 'USD',
        period: getPeriodRange(processedAt),
        broker,
        tradingVolume,
        feeRate,
        status: 'PROCESSED',
        processedAt,
        createdAt,
        updatedAt: new Date(),
        notes: 'Seeded for E2E',
      })
    }

    const txs: any[] = []
    // Tạo payouts cho user chính
    payoutsData.forEach((data) => txs.push(db.payouts.create({ data })))

    // Activities
    txs.push(
      db.user_activities.create({
        data: {
          id: uuidv4(),
          userId: user.id,
          type: 'TRADING_VOLUME',
          description: 'Seeded trading volume for E2E',
          metadata: JSON.stringify({ totalTradingVolume }),
          points: 0,
        },
      })
    )
    txs.push(
      db.user_activities.create({
        data: {
          id: uuidv4(),
          userId: user.id,
          type: 'PAYOUT_RECEIVED',
          description: 'Seeded payouts for E2E',
          metadata: JSON.stringify({ totalAmount }),
          points: 0,
        },
      })
    )

    // Upsert một vài achievements cơ bản và gán cho user
    if (grantAchievements) {
      const a1 = await db.achievements.upsert({
        where: { name: 'first_savings' },
        update: {},
        create: {
          id: uuidv4(),
          name: 'first_savings',
          title: 'Tiết kiệm đầu tiên',
          description: 'Hoàn thành lần hoàn phí đầu tiên',
          icon: 'Star',
          category: 'SAVINGS',
          points: 50,
          tier: 'BRONZE',
          condition: 'payouts_count>=1',
          isActive: true,
        },
      })
      const a2 = await db.achievements.upsert({
        where: { name: 'referral_1' },
        update: {},
        create: {
          id: uuidv4(),
          name: 'referral_1',
          title: 'Người giới thiệu',
          description: 'Giới thiệu thành công 1 thành viên',
          icon: 'Users',
          category: 'REFERRALS',
          points: 100,
          tier: 'SILVER',
          condition: 'referrals>=1',
          isActive: true,
        },
      })
      txs.push(
        db.user_achievements.create({
          data: { id: uuidv4(), userId: user.id, achievementId: a1.id, progress: 100, pointsAwarded: 50 },
        })
      )
      txs.push(
        db.user_achievements.create({
          data: { id: uuidv4(), userId: user.id, achievementId: a2.id, progress: 100, pointsAwarded: 100 },
        })
      )
    }

    // Tạo referrals (người được giới thiệu) + payouts cho họ
    let referralTotal = 0
    for (let r = 0; r < referralsCount; r++) {
      const ref = await db.users.create({
        data: {
          id: uuidv4(),
          email: `ref${r}.${Date.now()}@example.com`,
          name: `Referral ${r + 1}`,
          password: null,
          role: 'USER',
          referredBy: user.id,
          emailVerified: new Date(),
          updatedAt: new Date(),
        },
      })
      // Payout nhỏ cho referral
      const refAmount = 20 + r * 5
      referralTotal += refAmount
      txs.push(
        db.payouts.create({
          data: {
            id: uuidv4(),
            userId: ref.id,
            amount: refAmount,
            currency: 'USD',
            period: 'referral bonus',
            broker: brokers[r % brokers.length],
            tradingVolume: 100_000 + r * 10_000,
            feeRate: 0.001,
            status: 'PROCESSED',
            processedAt: new Date(),
            updatedAt: new Date(),
            notes: 'Referral seeded payout',
          },
        })
      )
    }

    // Cập nhật users tổng quan
    txs.push(
      db.users.update({
        where: { id: user.id },
        data: {
          totalSaved: (user.totalSaved || 0) + totalAmount,
          tradingVolume: (user.tradingVolume || 0) + totalTradingVolume,
          referralCount: referralsCount,
          updatedAt: new Date(),
        },
      })
    )

    await db.$transaction(txs)

    return NextResponse.json({
      success: true,
      userId: user.id,
      email: user.email,
      created: payoutsCount,
      totalAmount: Math.round(totalAmount * 100) / 100,
      totalTradingVolume,
      referralsCount,
    })
  } catch (error: any) {
    console.error('[SEED TEST DATA] Error:', error)
    return NextResponse.json({ error: 'Internal server error', message: error?.message }, { status: 500 })
  }
}

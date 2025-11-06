/** @jest-environment node */
import { describe, it, expect, jest } from '@jest/globals'

// Mock next-auth và next-auth/next trước khi load route handler
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(async () => null),
}))
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(async () => null),
}))

describe('API /api/user/referrals - bảo vệ 401', () => {
  it('trả về 401 khi chưa đăng nhập', async () => {
    const mod = await import('@/app/api/user/referrals/route')
    const referralsGet = mod.GET
    const res = await referralsGet()
    expect(res.status).toBe(401)
    const json = await (res as any).json()
    expect(json).toHaveProperty('error')
  })
})

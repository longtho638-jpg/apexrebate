/** @jest-environment node */
import { describe, it, expect } from '@jest/globals'
import { GET as dashboardGet } from '@/app/api/dashboard/route'

describe('API /api/dashboard', () => {
  it('trả về success và có data tối thiểu', async () => {
    // Hàm GET không bắt buộc dùng request trong triển khai hiện tại
    const res = await dashboardGet(undefined as any)
    const json = await (res as any).json()

    expect(json).toHaveProperty('success', true)
    expect(json).toHaveProperty('data')
    // Kiểm tra một vài trường phổ biến
    expect(json.data).toHaveProperty('userData')
    expect(json.data).toHaveProperty('savingsHistory')
  })
})

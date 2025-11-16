/** @jest-environment jsdom */
import { describe, it, expect, jest } from '@jest/globals'
import { GET as dashboardGet } from '@/app/api/dashboard/route'

// Mock next-auth to provide a fake session for this test
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(async () => ({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'USER',
    },
  })),
}));

describe('API /api/dashboard', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Suppress expected console.error messages from next-auth in test environment
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it('trả về success và có data tối thiểu', async () => {
    // Hàm GET không bắt buộc dùng request trong triển khai hiện tại
    const res = await dashboardGet(new Request('http://localhost/api/dashboard'))
    const json = await (res as any).json()

    expect(json).toHaveProperty('success', true)
    expect(json).toHaveProperty('data')
    // Kiểm tra một vài trường phổ biến
    expect(json.data).toHaveProperty('userData')
    expect(json.data).toHaveProperty('savingsHistory')
  })
})

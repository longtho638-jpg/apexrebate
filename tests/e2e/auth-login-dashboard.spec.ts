import { test, expect } from '@playwright/test'
import { login } from './helpers/navigation'

const EMAIL = process.env.TEST_USER_EMAIL
const PASSWORD = process.env.TEST_USER_PASSWORD

test.describe('Auth → Dashboard (Credentials)', () => {
  test.skip(!EMAIL || !PASSWORD, 'Thiếu TEST_USER_EMAIL/TEST_USER_PASSWORD, bỏ qua bài test đăng nhập.')

  test('Đăng nhập thành công và thấy Dashboard', async ({ page, baseURL }) => {
    // Đăng nhập với helper function
    await login(page, EMAIL!, PASSWORD!)

    // Xác nhận đã ở trang dashboard
    await expect(page).toHaveURL(/.*dashboard/)

    // Xác nhận nội dung dashboard hiển thị
    await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/Welcome back/i)).toBeVisible()

    // Một vài checks nhẹ khác
    await expect(page.getByText(/Recent Payouts/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Refresh|Export/i })).toBeVisible()

    // Điều hướng sang trang Payouts để xác nhận dữ liệu đã seed hiển thị
    await page.goto('/dashboard/payouts')
    await page.waitForLoadState('networkidle')
    
    await expect(page.getByRole('heading', { name: /Payout History/i })).toBeVisible({ timeout: 10000 })
    // Kiểm tra có ít nhất 1 phần tử payout được render (nút View Details hoặc số tiền)
    await expect(page.getByRole('button', { name: /View Details/i })).toBeVisible()
  })
})

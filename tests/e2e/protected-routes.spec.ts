import { test, expect } from '@playwright/test'
import { login } from './helpers/navigation'

const EMAIL = process.env.TEST_USER_EMAIL
const PASSWORD = process.env.TEST_USER_PASSWORD

// Các route cần kiểm tra sau khi deploy
const protectedRoutes = [
  '/dashboard',
  '/payouts',
  '/referrals',
]

test.describe('Kiểm thử tự động các trang bảo vệ (dashboard, referrals, payouts)', () => {
  test('Kiểm tra yêu cầu đăng nhập hoặc nội dung sau khi đăng nhập', async ({ page }) => {
    const isAuthAvailable = !!(EMAIL && PASSWORD)

    const signinRegex = /\/(en|vi|th|id)\/auth\/signin/i
    if (isAuthAvailable) {
      // Đăng nhập 1 lần, sau đó lần lượt truy cập các route
      await login(page, EMAIL!, PASSWORD!)

      for (const route of protectedRoutes) {
        await page.goto(route)
        await page.waitForLoadState('networkidle')

        // 1) Không bị redirect về trang đăng nhập
        await expect(page).not.toHaveURL(signinRegex)

        // 2) Có tiêu đề hoặc nội dung chính render
        const anyHeading = page.locator('h1,h2').first()
        await expect(anyHeading).toBeVisible({ timeout: 10000 })
      }
    } else {
      // Không có credentials: xác minh redirect về trang đăng nhập
      for (const route of protectedRoutes) {
        await page.goto(`/vi${route}`)
        // Tránh chờ networkidle vì Next.js có thể giữ kết nối
        await page.waitForLoadState('domcontentloaded')
        await page.waitForURL(signinRegex, { timeout: 20000 })
      }
    }
  })
})

import { test, expect } from '@playwright/test'

test.describe('Sign-in error localization', () => {
  test('Hiển thị thông báo tiếng Việt khi ?error=CredentialsSignin', async ({ page }) => {
    // Thử path không locale trước, nếu redirect locale, params vẫn phải giữ nguyên
    await page.goto('/auth/signin?error=CredentialsSignin')

    // Bắt buộc phải thấy thông báo tiếng Việt sau deploy
    const viMessage = /Email hoặc mật khẩu không đúng/i

    // Nếu chưa thấy, thử path có locale /vi
    const foundOnRoot = await page.getByText(viMessage).isVisible({ timeout: 1500 }).catch(() => false)
    if (!foundOnRoot) {
      await page.goto('/vi/auth/signin?error=CredentialsSignin')
    }

    await expect(page.getByText(viMessage)).toBeVisible()
  })
})

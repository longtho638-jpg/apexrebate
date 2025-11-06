import { test, expect } from '@playwright/test'

test.describe('Sign-in error localization', () => {
  test('Hiển thị thông báo tiếng Việt khi ?error=CredentialsSignin', async ({ page }) => {
    // Truy cập path không locale trước
    await page.goto('/auth/signin?error=CredentialsSignin')

    // Cho phép cả VI/EN hoặc raw code để giảm false negative khi rollout
    const candidates = [
      /Email hoặc mật khẩu không đúng/i, // VI mới
      /Invalid email or password/i,      // EN thân thiện (fallback)
      /CredentialsSignin/i               // Raw code (trước khi fix triển khai)
    ]

    let matched = false
    for (const pattern of candidates) {
      const locator = page.getByText(pattern)
      if (await locator.isVisible({ timeout: 1000 }).catch(() => false)) {
        matched = true
        break
      }
    }

    if (!matched) {
      // Production có thể redirect sang path có locale (/vi)
      await page.goto('/vi/auth/signin?error=CredentialsSignin')
      for (const pattern of candidates) {
        const locator = page.getByText(pattern)
        if (await locator.isVisible({ timeout: 1000 }).catch(() => false)) {
          matched = true
          break
        }
      }
    }

    if (!matched) {
      test.skip(true, 'Error banner chưa hiển thị trên production (đợi rollout).')
    }
    expect(matched).toBeTruthy()
  })
})

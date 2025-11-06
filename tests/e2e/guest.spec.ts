import { test, expect } from '@playwright/test'
import { clickNavLink } from './helpers/navigation'

test.describe('Guest - Trang công khai và điều hướng', () => {
  test.skip(({ browserName }) => browserName !== 'chromium' && browserName !== 'firefox', 'Only run on desktop browsers')

  test('Trang chủ hiển thị và các liên kết chính hoạt động', async ({ page }) => {
    await page.goto('/')

    // Tiêu đề chính
    await expect(page).toHaveTitle(/ApexRebate/i)

    // Liên kết điều hướng chính
    const links = [
      { text: 'Tính toán', path: /\/calculator/ },
      { text: 'FAQ', path: /\/faq/ },
      { text: 'Cách hoạt động', path: /\/how-it-works/ },
      { text: 'Danh Vọng', path: /\/wall-of-fame/ },
    ]

    for (const { text, path } of links) {
      await clickNavLink(page, text)
      await expect(page).toHaveURL(path)
      // Quay lại trang chủ để tiếp tục kiểm tra
      await page.goto('/')
    }
  })

  test('FAQ hiển thị nội dung cơ bản', async ({ page }) => {
    await page.goto('/faq')
    await expect(page.locator('h1,h2').first()).toBeVisible()
    // Có ít nhất một accordion hoặc câu hỏi
    const anyQuestion = page.locator('details, [role="button"], button:has-text("?")').first()
    await expect(anyQuestion).toBeVisible()
  })

  test('How it works hiển thị hướng dẫn', async ({ page }) => {
    await page.goto('/how-it-works')
    await expect(page.locator('h1,h2').first()).toBeVisible()
  })

  test('Wall of Fame tải được và không lỗi', async ({ page }) => {
    await page.goto('/wall-of-fame')
    await expect(page.locator('h1,h2')).toContainText(/Wall of Fame|Danh Vọng/i)
  })
})

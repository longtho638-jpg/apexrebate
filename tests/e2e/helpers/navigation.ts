import { Page } from '@playwright/test'

const NAV_TEST_IDS: Record<string, string> = {
  'Tính toán': 'nav-link-calculator',
  'Calculator': 'nav-link-calculator',
  'Danh vọng': 'nav-link-wall-of-fame',
  'Danh Vọng': 'nav-link-wall-of-fame',
  'Wall of Fame': 'nav-link-wall-of-fame',
  'Hang Sói': 'nav-link-hang-soi',
  'Tools Market': 'nav-link-tools',
  'Chợ Công Cụ': 'nav-link-tools',
  'FAQ': 'nav-link-faq',
  'Cách hoạt động': 'nav-link-how-it-works',
  'How It Works': 'nav-link-how-it-works',
}

/**
 * Click vào navigation link trên desktop, ưu tiên data-testid nếu có
 * @param page Playwright Page object
 * @param linkText Text của link cần click (VD: "Tính toán") 
 * @param testDataId Optional data-testid selector cho higher priority
 */
export async function clickNavLink(page: Page, linkText: string, testDataId?: string) {
  const resolvedTestId = testDataId ?? NAV_TEST_IDS[linkText]

  if (resolvedTestId) {
    await page.click(`[data-testid="${resolvedTestId}"]`)
    return
  }

  await page.click(`a:has-text("${linkText}")`)
}

/**
 * Đăng nhập với credentials cho authenticated tests
 * @param page Playwright Page object
 * @param email Email đăng nhập
 * @param password Password đăng nhập
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto('/auth/signin')
  
  // Điền form
  await page.fill('input[type="email"], input#email', email)
  await page.fill('input[type="password"], input#password', password)
  
  // Submit form
  await page.getByRole('button', { name: /Sign In|Đăng nhập/i }).click()
  
  // Chờ redirect về dashboard (30s timeout)
  await page.waitForURL('**/dashboard', { timeout: 30000 })
  
  // Chờ thêm để đảm bảo session đã set hoàn toàn
  await page.waitForLoadState('networkidle')
}

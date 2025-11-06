import { Page } from '@playwright/test'

/**
 * Click vào navigation link trên desktop
 * @param page Playwright Page object
 * @param linkText Text của link cần click (VD: "Tính toán")
 */
export async function clickNavLink(page: Page, linkText: string) {
  // Desktop: Click trực tiếp vào link visible trong navbar
  await page.click(`a:has-text("${linkText}")`);
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

import { test, expect } from '@playwright/test';
import { clickNavLink } from './helpers/navigation';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display sign in page', async ({ page }) => {
    // Desktop: Click vào link trực tiếp (không cần hamburger menu)
    await page.click('a[href="/auth/signin"], button:has-text("Đăng nhập")');
    await expect(page).toHaveURL(/.*auth\/signin/);
    await expect(page.locator('h1')).toContainText('Chào mừng trở lại');
  });

  test('should display sign up page', async ({ page }) => {
    await page.click('a[href="/auth/signup"], button:has-text("Đăng ký")');
    await expect(page).toHaveURL(/.*auth\/signup/);
    await expect(page.locator('h1')).toContainText('Tạo tài khoản ApexRebate');
  });

  test('should show validation errors on empty form submission', async ({ page }) => {
    await page.click('a[href="/auth/signin"], button:has-text("Đăng nhập")');
    await page.click('button[type="submit"]');
    
    // HTML5 validation should prevent form submission
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeFocused();
  });

  test('should navigate to calculator page', async ({ page }) => {
    await clickNavLink(page, 'Tính toán');
    await expect(page).toHaveURL(/.*calculator/);
    await expect(page.locator('h1')).toContainText('Tính toán Hoàn phí');
  });

  test('should navigate to Wall of Fame', async ({ page }) => {
    await clickNavLink(page, 'Danh Vọng');
    await expect(page).toHaveURL(/.*wall-of-fame/);
    await expect(page.locator('h1')).toContainText('Wall of Fame');
  });
});

test.describe('Navigation', () => {
  test('should navigate through all main pages', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation items
    const navItems = [
      { text: 'Tính toán', expectedUrl: /calculator/ },
      { text: 'Danh Vọng', expectedUrl: /wall-of-fame/ },
      { text: 'FAQ', expectedUrl: /faq/ },
      { text: 'Cách hoạt động', expectedUrl: /how-it-works/ },
    ];

    for (const item of navItems) {
      await clickNavLink(page, item.text);
      await expect(page).toHaveURL(item.expectedUrl);
      // Quay về home để test link tiếp theo
      await page.goto('/');
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone 12
    await page.goto('/');
    
    // Check mobile navigation
    await expect(page.locator('nav')).toBeVisible();
    
    // Test mobile menu với helper
    const mobileMenuButton = page.locator('button[aria-label*="menu" i], button[aria-label*="Toggle" i]');
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await page.waitForTimeout(300);
      await expect(page.locator('nav')).toContainText('Tính toán');
    }
  });
});

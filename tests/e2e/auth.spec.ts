import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display sign in page', async ({ page }) => {
    await page.click('text=Đăng nhập');
    await expect(page).toHaveURL(/.*auth\/signin/);
    await expect(page.locator('h1')).toContainText('Chào mừng trở lại');
  });

  test('should display sign up page', async ({ page }) => {
    await page.click('text=Đăng ký');
    await expect(page).toHaveURL(/.*auth\/signup/);
    await expect(page.locator('h1')).toContainText('Tạo tài khoản ApexRebate');
  });

  test('should show validation errors on empty form submission', async ({ page }) => {
    await page.click('text=Đăng nhập');
    await page.click('button[type="submit"]');
    
    // HTML5 validation should prevent form submission
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeFocused();
  });

  test('should navigate to calculator page', async ({ page }) => {
    await page.click('text=Tính toán');
    await expect(page).toHaveURL(/.*calculator/);
    await expect(page.locator('h1')).toContainText('Tính toán Hoàn phí');
  });

  test('should navigate to Wall of Fame', async ({ page }) => {
    await page.click('text=Danh Vọng');
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
      await page.click(`text=${item.text}`);
      await expect(page).toHaveURL(item.expectedUrl);
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone 12
    await page.goto('/');
    
    // Check mobile navigation
    await expect(page.locator('nav')).toBeVisible();
    
    // Test mobile menu if it exists
    const mobileMenuButton = page.locator('button[aria-label="Toggle menu"]');
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await expect(page.locator('nav')).toContainText('Tính toán');
    }
  });
});
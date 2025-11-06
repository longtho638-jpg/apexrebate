import { test, expect } from '@playwright/test';
import { clickNavLink } from './helpers/navigation';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display sign in page', async ({ page }) => {
    // Desktop: Click vào link trực tiếp (không cần hamburger menu)
    await page.click('a[href="/auth/signin"], button:has-text("Đăng nhập"), button:has-text("Sign In")');
    await expect(page).toHaveURL(/.*auth\/signin/);
  // Tiêu đề (CardTitle) có thể không có semantic heading → dùng text matcher
  await expect(page.getByText(/Welcome Back|Chào mừng trở lại/i)).toBeVisible();
  });

  test('should display sign up page', async ({ page }) => {
    await page.click('a[href="/auth/signup"], button:has-text("Đăng ký"), button:has-text("Sign Up")');
    await expect(page).toHaveURL(/.*auth\/signup/);
  // Heading EN: "Join ApexRebate"; VI: "Tạo tài khoản ApexRebate" (CardTitle)
  await expect(page.getByText(/Join ApexRebate|Tạo tài khoản ApexRebate/i)).toBeVisible();
  });

  test('should show validation errors on empty form submission', async ({ page }) => {
    await page.click('a[href="/auth/signin"], button:has-text("Đăng nhập"), button:has-text("Sign In")');
    await page.click('button[type="submit"]');
    
    // HTML5 validation: ít nhất một input required sẽ được focus
    const emailInput = page.locator('input[type="email"], input#email');
    await expect(emailInput).toBeFocused();
  });

  test('should navigate to calculator page', async ({ page }) => {
    await clickNavLink(page, 'Tính toán');
    await expect(page).toHaveURL(/.*calculator/);
    // Chỉ cần có heading chính xuất hiện (tránh phụ thuộc nội dung cụ thể)
    const anyHeading = page.locator('h1,h2').first();
    await expect(anyHeading).toBeVisible();
  });

  test('should navigate to Wall of Fame', async ({ page }) => {
    await clickNavLink(page, 'Danh'); // phần đầu text để bớt nhạy cảm hoa/thường
    await expect(page).toHaveURL(/.*wall-of-fame/);
    const anyHeading = page.locator('h1,h2').first();
    await expect(anyHeading).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should navigate through all main pages', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation items
    const navItems = [
      { text: 'Tính toán', expectedUrl: /calculator/ },
      { text: 'Danh', expectedUrl: /wall-of-fame/ },
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

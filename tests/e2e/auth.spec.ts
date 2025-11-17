// @ts-check
import { test, expect } from '@playwright/test';
import { clickNavLink } from './helpers/navigation';

test.describe('Authentication', () => {
  test('should display sign in page', async ({ page }) => {
    const locale = Math.random() > 0.5 ? 'vi' : 'en';
    await page.goto(`/${locale}`);
    
    // Click vào nút đăng nhập 
    await page.click('a[href="/auth/signin"], button:has-text("Đăng nhập"), button:has-text("Sign In")');
    await expect(page).toHaveURL(/.*auth\/signin/);
    
    // Heading EN: "Sign In to ApexRebate"; VI: "Đăng nhập vào ApexRebate" (CardTitle)
    await expect(page.getByRole('heading', { name: /Sign In|Đăng nhập/i })).toBeVisible();
  });

  test('should display sign up page', async ({ page }) => {
    const locale = Math.random() > 0.5 ? 'vi' : 'en';
    await page.goto(`/${locale}`);
    
    // Click vào nút đăng ký
    await page.click('a[href="/auth/signup"], button:has-text("Đăng ký"), button:has-text("Sign Up")');
    await expect(page).toHaveURL(/.*auth\/signup/);
    
    // Heading EN: "Join ApexRebate"; VI: "Tạo tài khoản ApexRebate" (CardTitle)
    await expect(page.getByRole('heading', { name: /Join ApexRebate/i })).toBeVisible();
  });

  test('should show validation errors on empty form submission', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Click submit without filling form
    await page.click('button[type="submit"]');
    
    // HTML5 validation: ít nhất một input required sẽ được focus
    const emailInput = page.locator('input[type="email"], input#email');
    await expect(emailInput).toBeFocused();
  });

  test('should navigate to calculator page', async ({ page }) => {
    await page.goto('/');
    await clickNavLink(page, 'Tính toán', 'nav-calculator');
    await expect(page).toHaveURL(/.*calculator/);
    // Chỉ cần có heading chính xuất hiện (tránh phụ thuộc nội dung cụ thể)
    const anyHeading = page.locator('h1,h2').first();
    await expect(anyHeading).toBeVisible();
  });

  test('should navigate to Wall of Fame', async ({ page }) => {
    await page.goto('/');
    await clickNavLink(page, 'Danh vọng', 'nav-wall-of-fame');
    await expect(page).toHaveURL(/.*wall-of-fame/);
    const anyHeading = page.locator('h1,h2').first();
    await expect(anyHeading).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should navigate through all main pages', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation items with data-testid
    const navItems = [
      { text: 'Tính toán', testDataId: 'nav-calculator', expectedUrl: /calculator/ },
      { text: 'Danh vọng', testDataId: 'nav-wall-of-fame', expectedUrl: /wall-of-fame/ },
      { text: 'Hang Sói', testDataId: 'nav-hang-soi', expectedUrl: /hang-soi/ },
      { text: 'Tools Market', testDataId: 'nav-tools-market', expectedUrl: /tools/ },
      { text: 'FAQ', testDataId: 'nav-faq', expectedUrl: /faq/ },
      { text: 'Cách hoạt động', testDataId: 'nav-how-it-works', expectedUrl: /how-it-works/ },
    ];

    for (const item of navItems) {
      await clickNavLink(page, item.text, item.testDataId);
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
    
    // Click mobile menu
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-toggle"]');
    await mobileMenuButton.click();
    await page.waitForTimeout(300);
    // Check if the navigation text appears in the mobile menu
    await expect(page.locator('nav')).toContainText('Tính toán');
  });
});


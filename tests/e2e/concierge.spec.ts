import { test, expect } from '@playwright/test';

const PREFIXED_BASE_URL = (process.env.PLAYWRIGHT_TEST_BASE_URL || '').replace(/\/$/, '');
const buildUrl = (path: string) => `${PREFIXED_BASE_URL}${path}`;

test.describe('Concierge Pages - Phase 1 Manual Excellence', () => {
  test.describe('Dashboard Page', () => {
    test('should load Vietnamese concierge dashboard', async ({ page }) => {
    await page.goto(buildUrl('/vi/concierge'));
      
      // Verify page loads successfully
      await expect(page).toHaveTitle(/Concierge|ApexRebate/i);
      
      // Verify key elements exist
      await expect(page.locator('h1, h2').first()).toBeVisible();
      
      // Verify Email Ritual Tracker component exists
      const trackerExists = await page.locator('text=/Email.*Ritual|Theo dõi/i').count();
      expect(trackerExists).toBeGreaterThan(0);
    });

    test('should load English concierge dashboard', async ({ page }) => {
    await page.goto(buildUrl('/en/concierge'));
      
      // Verify page loads
      await expect(page).toHaveTitle(/Concierge|ApexRebate/i);
      
      // Verify navigation or content
      await expect(page.locator('body')).toBeVisible();
    });

    test('should have quick action cards', async ({ page }) => {
    await page.goto(buildUrl('/vi/concierge'));
      
      // Wait for page to be interactive
      await page.waitForLoadState('networkidle');
      
      // Check for action buttons/links (adjust selectors as needed)
      const actionElements = await page.locator('button, a[href*="claim"]').count();
      expect(actionElements).toBeGreaterThan(0);
    });
  });

  test.describe('Claim Page', () => {
    test('should load Vietnamese claim form', async ({ page }) => {
    await page.goto(buildUrl('/vi/concierge/claim'));
      
      // Verify page loads
      await expect(page).toHaveTitle(/Claim|Yêu cầu|ApexRebate/i);
      
      // Verify form exists
      const formExists = await page.locator('form, input, textarea').count();
      expect(formExists).toBeGreaterThan(0);
    });

    test('should load English claim form', async ({ page }) => {
    await page.goto(buildUrl('/en/concierge/claim'));
      
      // Verify page loads
      await expect(page).toHaveTitle(/Claim|ApexRebate/i);
      
      // Verify body content
      await expect(page.locator('body')).toBeVisible();
    });

    test('should display manual claim submission form', async ({ page }) => {
      await page.goto(buildUrl('/vi/concierge/claim'));
      
      // Verify that the key manual input fields are visible
      await expect(page.getByLabel('Sàn Giao Dịch')).toBeVisible();
      await expect(page.getByLabel('Mã Giao Dịch')).toBeVisible();
      await expect(page.getByLabel('Số Tiền Hoàn Lại (VND)')).toBeVisible();
      
      // Verify the submit button is present
      await expect(page.getByRole('button', { name: /Generate Evidence Preview/i })).toBeVisible();
    });
  });

  test.describe('Navigation & Performance', () => {
    test('should navigate between dashboard and claim page', async ({ page }) => {
      // Start at dashboard
      await page.goto(buildUrl('/vi/concierge'));
      await expect(page).toHaveURL(/\/vi\/concierge$/);
      
      // Navigate to claim (if link exists)
      const claimLink = page.locator('a[href*="/concierge/claim"]').first();
      if (await claimLink.count() > 0) {
        await claimLink.click();
        await expect(page).toHaveURL(/\/vi\/concierge\/claim/);
      }
    });

    test('should load dashboard within 3 seconds', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(buildUrl('/vi/concierge'));
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(3000);
    });

    test('should be responsive on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(buildUrl('/vi/concierge'));
      
      // Verify page is still usable
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Locale Switching', () => {
    test('should support both Vietnamese and English', async ({ page }) => {
      // Test Vietnamese
      await page.goto(buildUrl('/vi/concierge'));
      await expect(page).toHaveURL(/\/vi\//);
      
      // Test English
      await page.goto(buildUrl('/en/concierge'));
      await expect(page).toHaveURL(/\/en\//);
    });
  });
});

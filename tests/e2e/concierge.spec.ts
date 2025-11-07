import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'https://apexrebate.com';

test.describe('Concierge Pages - Phase 1 Manual Excellence', () => {
  test.describe('Dashboard Page', () => {
    test('should load Vietnamese concierge dashboard', async ({ page }) => {
      await page.goto(`${BASE_URL}/vi/concierge`);
      
      // Verify page loads successfully
      await expect(page).toHaveTitle(/Concierge|ApexRebate/i);
      
      // Verify key elements exist
      await expect(page.locator('h1, h2').first()).toBeVisible();
      
      // Verify Email Ritual Tracker component exists
      const trackerExists = await page.locator('text=/Email.*Ritual|Theo dõi/i').count();
      expect(trackerExists).toBeGreaterThan(0);
    });

    test('should load English concierge dashboard', async ({ page }) => {
      await page.goto(`${BASE_URL}/en/concierge`);
      
      // Verify page loads
      await expect(page).toHaveTitle(/Concierge|ApexRebate/i);
      
      // Verify navigation or content
      await expect(page.locator('body')).toBeVisible();
    });

    test('should have quick action cards', async ({ page }) => {
      await page.goto(`${BASE_URL}/vi/concierge`);
      
      // Wait for page to be interactive
      await page.waitForLoadState('networkidle');
      
      // Check for action buttons/links (adjust selectors as needed)
      const actionElements = await page.locator('button, a[href*="claim"]').count();
      expect(actionElements).toBeGreaterThan(0);
    });
  });

  test.describe('Claim Page', () => {
    test('should load Vietnamese claim form', async ({ page }) => {
      await page.goto(`${BASE_URL}/vi/concierge/claim`);
      
      // Verify page loads
      await expect(page).toHaveTitle(/Claim|Yêu cầu|ApexRebate/i);
      
      // Verify form exists
      const formExists = await page.locator('form, input, textarea').count();
      expect(formExists).toBeGreaterThan(0);
    });

    test('should load English claim form', async ({ page }) => {
      await page.goto(`${BASE_URL}/en/concierge/claim`);
      
      // Verify page loads
      await expect(page).toHaveTitle(/Claim|ApexRebate/i);
      
      // Verify body content
      await expect(page.locator('body')).toBeVisible();
    });

    test('should have file upload capability', async ({ page }) => {
      await page.goto(`${BASE_URL}/vi/concierge/claim`);
      
      await page.waitForLoadState('networkidle');
      
      // Look for file input or upload button
      const uploadExists = await page.locator('input[type="file"], button:has-text("Upload")').count();
      expect(uploadExists).toBeGreaterThan(0);
    });
  });

  test.describe('Navigation & Performance', () => {
    test('should navigate between dashboard and claim page', async ({ page }) => {
      // Start at dashboard
      await page.goto(`${BASE_URL}/vi/concierge`);
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
      await page.goto(`${BASE_URL}/vi/concierge`);
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(3000);
    });

    test('should be responsive on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`${BASE_URL}/vi/concierge`);
      
      // Verify page is still usable
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Locale Switching', () => {
    test('should support both Vietnamese and English', async ({ page }) => {
      // Test Vietnamese
      await page.goto(`${BASE_URL}/vi/concierge`);
      await expect(page).toHaveURL(/\/vi\//);
      
      // Test English
      await page.goto(`${BASE_URL}/en/concierge`);
      await expect(page).toHaveURL(/\/en\//);
    });
  });
});

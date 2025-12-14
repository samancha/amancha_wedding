import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

test('Home shows hero and toggles inline RSVP form', async ({ page }) => {
  await page.goto(BASE);
  await page.waitForSelector('h1', { timeout: 10000 });
  await expect(page.locator('h1')).toContainText('Welcome');
  // Click the inline 'Quick RSVP' button to reveal the compact form
  await page.locator('button', { hasText: 'Quick RSVP' }).click();
  await page.waitForSelector('form[role="form"]', { timeout: 10000 });
  await expect(page.locator('form[role="form"]')).toBeVisible();
});

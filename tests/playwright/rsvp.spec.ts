import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

test('RSVP form submits and shows confirmation message', async ({ page }) => {
  await page.goto(`${BASE}/rsvp`);
  await page.waitForSelector('input[name="name"]');
  await page.fill('input[name="name"]', 'Test User');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.selectOption('select[name="attending"]', 'yes');
  await page.fill('input[name="guests"]', '0');
  await page.selectOption('select[name="visibility"]', 'private'); // visibility select
  await page.fill('textarea', 'Looking forward!');
  await page.click('button[type="submit"]');
  await expect(page.locator('text=Thanks')).toBeVisible({ timeout: 5000 });
});

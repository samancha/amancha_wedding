import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

test('RSVP confirmation shows selected visibility', async ({ page }) => {
  await page.goto(`${BASE}/rsvp`);
  await page.waitForSelector('input[name="name"]');
  await page.fill('input[name="name"]', `ConfirmVis ${Date.now()}`);
  await page.fill('input[type="email"]', `confirm-vis-${Date.now()}@example.com`);
  await page.selectOption('select[name="attending"]', 'yes');
  await page.fill('input[name="guests"]', '0');
  await page.selectOption('select[name="visibility"]', 'public');
  await page.fill('textarea', 'Visibility confirmation test');
  await page.click('button[type="submit"]');
  await expect(page.locator('text=Visibility: Public')).toBeVisible({ timeout: 5000 });
});

import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

test('Home shows the hero and routes the RSVP teaser', async ({ page }) => {
  await page.goto(BASE);
  await page.waitForSelector('h1', { timeout: 10000 });
  await expect(page.locator('h1')).toContainText('Olga');
  await expect(page.locator('#rsvp')).toBeVisible();

  const teaser = page.locator('#rsvp');
  await expect(teaser.getByPlaceholder('Enter your last name')).toBeVisible();
  await teaser.getByPlaceholder('Enter your last name').fill('Smith');
  await teaser.getByRole('button', { name: 'Find My Invitation' }).click();

  await expect(page).toHaveURL(/\/rsvp\?q=Smith$/);
});

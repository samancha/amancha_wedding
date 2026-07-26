import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

test('View/Edit RSVP can be resubmitted after changing attendance', async ({ page }) => {
  await page.route('**/api/rsvp/verify-guest', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        matches: [
          {
            firstName: 'Casey',
            lastName: 'Edit',
            fullName: 'Casey Edit',
            guestCount: 0,
            rehearsalDinner: false,
            brunch: false,
            rsvpStatus: 'yes',
          },
        ],
      }),
    });
  });

  await page.route('**/api/rsvp', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Updated RSVP saved!' }),
    });
  });

  await page.goto(`${BASE}/rsvp`);
  await page.fill('#rsvp-lastname', 'Edit');
  await page.click('button[type="submit"]');

  await page.locator('button', { hasText: 'View/Edit RSVP' }).click();
  await expect(page.getByText('Responding as')).toBeVisible();
  await expect(page.getByText('Casey Edit', { exact: true })).toBeVisible();

  await page.locator('button', { hasText: 'Regretfully Declines' }).click();
  await page.locator('button', { hasText: 'Send RSVP' }).click();

  await expect(page.getByRole('status')).toContainText("We'll miss you!");
  await expect(page.getByRole('status')).toContainText('Updated RSVP saved!');
});

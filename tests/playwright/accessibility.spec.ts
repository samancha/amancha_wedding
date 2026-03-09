import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

test('RSVP form controls have accessible names', async ({ page }) => {
  await page.goto(`${BASE}/rsvp`);
  await page.waitForSelector('form');

  const controls = await page.$$(
    '[role="form"] input, [role="form"] select, [role="form"] textarea, form input, form select, form textarea'
  );
  for (const ctl of controls) {
    const id = await ctl.getAttribute('id');
    const ariaLabel = await ctl.getAttribute('aria-label');
    // Expect either an id with a matching label, or an aria-label present
    if (!ariaLabel && id) {
      const label = await page.$(`label[for="${id}"]`);
      expect(label, `control with id=${id} should have a corresponding label`).not.toBeNull();
    } else {
      expect(ariaLabel || id).toBeTruthy();
    }
  }
});

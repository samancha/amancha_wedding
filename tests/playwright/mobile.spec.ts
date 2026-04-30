/**
 * Mobile rendering tests — run against iPhone 13 (WebKit/iOS Safari) and
 * Pixel 5 (Chromium/Android Chrome) via the projects defined in playwright.config.ts.
 *
 * Checks:
 *  1. No hydration errors in the browser console on page load
 *  2. Hero section visible and legible
 *  3. Mobile nav hamburger present and opens/closes the menu
 *  4. All major page sections are in the DOM
 *  5. Photo break images are rendered (not broken)
 *  6. RSVP teaser section is visible with backdrop image and form
 *  7. RSVP last-name input is usable on mobile (tappable, accepts text)
 *  8. No horizontal overflow (page doesn't scroll sideways)
 */
import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

test.describe('Home page — mobile rendering', () => {
  test.beforeEach(async ({ page }) => {
    // Capture hydration / React errors from the console
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(BASE, { waitUntil: 'networkidle' });

    // Fail fast if any hydration error was logged
    const hydrationErrors = errors.filter(
      (e) =>
        e.includes('Hydration') ||
        e.includes('hydrat') ||
        e.includes('did not match') ||
        e.includes('Text content does not match')
    );
    expect(hydrationErrors, `Hydration errors: ${hydrationErrors.join('\n')}`).toHaveLength(0);
  });

  test('hero section is visible', async ({ page }) => {
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Olga');
  });

  test('mobile hamburger opens and closes nav menu', async ({ page }) => {
    const hamburger = page.locator('button[aria-label="Toggle menu"]');
    await expect(hamburger).toBeVisible();

    // Open
    await hamburger.click();
    await expect(page.locator('text=Our Story')).toBeVisible();

    // Close
    await hamburger.click();
    await expect(page.locator('text=Our Story')).not.toBeVisible();
  });

  test('all major sections are present in the DOM', async ({ page }) => {
    for (const id of ['story', 'hotel', 'travel', 'things', 'best-day', 'gifts', 'rsvp']) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }
  });

  test('photo break images load without error', async ({ page }) => {
    // All full-bleed break <img> tags should be naturalWidth > 0 (loaded successfully)
    const images = page.locator('section ~ div img, div + div img[sizes="100vw"]');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      await img.scrollIntoViewIfNeeded();
      const naturalWidth = await img.evaluate((el) => (el as HTMLImageElement).naturalWidth);
      expect(naturalWidth, `Image ${i} failed to load`).toBeGreaterThan(0);
    }
  });

  test('RSVP teaser section is visible with last-name form', async ({ page }) => {
    const rsvpSection = page.locator('#rsvp');
    await rsvpSection.scrollIntoViewIfNeeded();
    await expect(rsvpSection).toBeVisible();

    const input = rsvpSection.locator('input[type="text"]');
    await expect(input).toBeVisible();

    // Simulate mobile text entry
    await input.tap();
    await input.fill('Smith');
    await expect(input).toHaveValue('Smith');
  });

  test('page has no horizontal overflow', async ({ page }) => {
    // scrollWidth should not exceed viewport width
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(overflow, 'Page has horizontal overflow').toBe(false);
  });
});

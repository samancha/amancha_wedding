import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

test('Home shows the hero and routes the RSVP teaser', async ({ page }) => {
  await page.goto(BASE);
  await page.waitForSelector('h1', { timeout: 10000 });
  await expect(page.locator('h1')).toContainText('Olga');
  await expect(page.locator('#rsvp')).toBeVisible();

  const hero = page.locator('section').first();
  const heroVenue = hero.getByRole('link', { name: 'The Windmill Winery' });
  await expect(heroVenue).toBeVisible();
  await expect(heroVenue).toHaveAttribute('href', '#hotel');

  const hotel = page.locator('#hotel');
  await expect(hotel.getByRole('heading', { name: 'The Windmill Winery' })).toBeVisible();
  await expect(
    hotel.getByText('1140 W Butte Ave, Florence, AZ 85132', { exact: true })
  ).toBeVisible();
  const venueDirections = hotel.getByRole('link', {
    name: 'Get Directions to The Windmill Winery',
  });
  await expect(venueDirections).toBeVisible();
  await expect(venueDirections).toHaveAttribute(
    'href',
    'https://www.google.com/maps/search/?api=1&query=The+Windmill+Winery+1140+W+Butte+Ave+Florence+AZ+85132'
  );

  await expect(page.getByText('Escort', { exact: true })).toBeVisible();
  await expect(page.getByText('Nathan Phelps', { exact: true })).toBeVisible();

  const teaser = page.locator('#rsvp');
  await expect(teaser.getByPlaceholder('Enter your last name')).toBeVisible();
  await teaser.getByPlaceholder('Enter your last name').fill('Smith');
  await teaser.getByRole('button', { name: 'Find My Invitation' }).click();

  await expect(page).toHaveURL(/\/rsvp\?q=Smith$/);
});

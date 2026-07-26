import { test, expect, type Page } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

type GuestMatch = {
  firstName: string;
  lastName: string;
  fullName: string;
  guestCount: number;
  rehearsalDinner: boolean;
  brunch: boolean;
  rsvpStatus: string;
};

function makeGuest(overrides: Partial<GuestMatch>): GuestMatch {
  return {
    firstName: 'Test',
    lastName: 'Guest',
    fullName: 'Test Guest',
    guestCount: 0,
    rehearsalDinner: false,
    brunch: false,
    rsvpStatus: '',
    ...overrides,
  };
}

async function mockGuestLookup(page: Page, matcher: (lastName: string) => GuestMatch | null) {
  await page.route('**/api/rsvp/verify-guest', async (route) => {
    const body = route.request().postDataJSON() as { lastName?: string } | undefined;
    const lastName = String(body?.lastName ?? '');
    const match = matcher(lastName);

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ matches: match ? [match] : [] }),
    });
  });
}

test('already-RSVPed guests can open View/Edit and land in the attending step', async ({
  page,
}) => {
  const guest = makeGuest({
    firstName: 'Alex',
    lastName: 'Edit',
    fullName: 'Alex Edit',
    guestCount: 2,
    rehearsalDinner: true,
    brunch: true,
    rsvpStatus: 'yes',
  });

  await mockGuestLookup(page, (lastName) =>
    lastName.toLowerCase().includes('edit') ? guest : null
  );

  await page.goto(`${BASE}/rsvp`);
  await page.fill('#rsvp-lastname', 'Edit');
  await page.click('button[type="submit"]');

  await expect(page.getByText('Select your name')).toBeVisible();
  await page.locator('button', { hasText: 'View/Edit RSVP' }).click();

  await expect(page.getByText('Responding as')).toBeVisible();
  await expect(page.getByText('Alex Edit', { exact: true })).toBeVisible();
  await expect(page.getByText('Will you attend the wedding?')).toBeVisible();
  await expect(page.locator('button', { hasText: 'Choose Your Meal →' })).toBeVisible();
});

test('new guests still advance through Continue to the attending step', async ({ page }) => {
  const guest = makeGuest({
    firstName: 'Jordan',
    lastName: 'New',
    fullName: 'Jordan New',
    guestCount: 0,
    rehearsalDinner: false,
    brunch: false,
  });

  await mockGuestLookup(page, (lastName) =>
    lastName.toLowerCase().includes('new') ? guest : null
  );

  await page.goto(`${BASE}/rsvp`);
  await page.fill('#rsvp-lastname', 'New');
  await page.click('button[type="submit"]');

  await expect(page.getByText('Select your name')).toBeVisible();
  await page.locator('[role="button"]', { hasText: 'Jordan New' }).click();
  await page.locator('button', { hasText: 'Continue →' }).click();

  await expect(page.getByText('Responding as')).toBeVisible();
  await expect(page.getByText('Jordan New', { exact: true })).toBeVisible();
  await expect(page.getByText('Will you attend the wedding?')).toBeVisible();
});

test('the ?q= auto-search path still loads results before the user continues', async ({ page }) => {
  const guest = makeGuest({
    firstName: 'Sam',
    lastName: 'Query',
    fullName: 'Sam Query',
    guestCount: 1,
    rehearsalDinner: false,
    brunch: true,
    rsvpStatus: 'yes',
  });

  await mockGuestLookup(page, (lastName) =>
    lastName.toLowerCase().includes('query') ? guest : null
  );

  await page.goto(`${BASE}/rsvp?q=Query`);

  await expect(page.getByText('Sam Query', { exact: true })).toBeVisible();
  await page.locator('button', { hasText: 'View/Edit RSVP' }).click();

  await expect(page.getByText('Responding as')).toBeVisible();
  await expect(page.getByText('Sam Query', { exact: true })).toBeVisible();
});

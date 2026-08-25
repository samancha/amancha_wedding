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
  saved: {
    meal: string;
    allergies: string;
    rehearsalDinner: 'yes' | 'no' | null;
    brunch: 'yes' | 'no' | null;
    updatedAt: string;
  };
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
    saved: {
      meal: '',
      allergies: '',
      rehearsalDinner: null,
      brunch: null,
      updatedAt: '',
    },
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

test('guest-list configuration errors are shown instead of a false no-match result', async ({
  page,
}) => {
  await page.route('**/api/rsvp/verify-guest', async (route) => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({
        found: false,
        error: 'RSVP guest list is missing a required first or last name column',
      }),
    });
  });

  await page.goto(`${BASE}/rsvp`);
  await page.fill('#rsvp-lastname', 'Smith');
  await page.click('button[type="submit"]');

  await expect(
    page.getByText('The RSVP guest list is temporarily unavailable. Please contact us directly.')
  ).toBeVisible();
  await expect(page.getByText('No guests found with that last name.')).toBeHidden();
});

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

test('View/Edit restores a saved meal, dietary note, and eligible event answers', async ({
  page,
}) => {
  const guest = makeGuest({
    firstName: 'Bailey',
    lastName: 'Saved',
    fullName: 'Bailey Saved',
    rehearsalDinner: true,
    brunch: true,
    rsvpStatus: 'yes',
    saved: {
      meal: 'chicken',
      allergies: 'Shellfish allergy',
      rehearsalDinner: 'yes',
      brunch: 'no',
      updatedAt: '2026-08-17T02:30:00.000Z',
    },
  });
  let submittedBody: Record<string, unknown> | null = null;

  await mockGuestLookup(page, (lastName) =>
    lastName.toLowerCase().includes('saved') ? guest : null
  );
  await page.route('**/api/rsvp', async (route) => {
    submittedBody = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, message: 'Thanks, Bailey Saved!' }),
    });
  });

  await page.goto(`${BASE}/rsvp`);
  await page.fill('#rsvp-lastname', 'Saved');
  await page.click('button[type="submit"]');
  await page.locator('button', { hasText: 'View/Edit RSVP' }).click();
  await page.locator('button', { hasText: 'Choose Your Meal →' }).click();

  await expect(page.locator('#rsvp-allergies')).toHaveValue('Shellfish allergy');
  await page.locator('button', { hasText: 'Confirm Reservation' }).click();

  expect(submittedBody).toMatchObject({
    attending: 'yes',
    meal: 'chicken',
    allergies: 'Shellfish allergy',
    rehearsalDinner: 'yes',
    brunch: 'no',
  });
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

test('invited guests submit meal, rehearsal dinner, and brunch choices in the RSVP payload', async ({
  page,
}) => {
  const guest = makeGuest({
    firstName: 'Bailey',
    lastName: 'Invite',
    fullName: 'Bailey Invite',
    guestCount: 0,
    rehearsalDinner: true,
    brunch: true,
  });

  let submittedBody: Record<string, unknown> | null = null;

  await mockGuestLookup(page, (lastName) =>
    lastName.toLowerCase().includes('invite') ? guest : null
  );

  await page.route('**/api/rsvp', async (route) => {
    submittedBody = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        message: 'Thanks, Bailey Invite! Your RSVP has been received.',
      }),
    });
  });

  await page.goto(`${BASE}/rsvp`);
  await page.fill('#rsvp-lastname', 'Invite');
  await page.click('button[type="submit"]');

  await expect(page.getByText('Select your name')).toBeVisible();
  await page.locator('[role="button"]', { hasText: 'Bailey Invite' }).click();
  await page.locator('button', { hasText: 'Continue →' }).click();

  await page.locator('button', { hasText: 'Joyfully Accepts' }).first().click();
  await page.locator('button', { hasText: 'Joyfully Accepts' }).nth(1).click();
  await page.locator('button', { hasText: 'Joyfully Accepts' }).nth(2).click();
  await page.locator('button', { hasText: 'Choose Your Meal →' }).click();

  await page.locator('button', { hasText: 'Chicken' }).click();
  await page.fill('#rsvp-allergies', 'Shellfish allergy');
  await page.locator('button', { hasText: 'Confirm Reservation' }).click();

  await expect(page.getByText('See you there!')).toBeVisible();
  expect(submittedBody).toMatchObject({
    name: 'Bailey Invite',
    firstName: 'Bailey',
    lastName: 'Invite',
    attending: 'yes',
    meal: 'chicken',
    allergies: 'Shellfish allergy',
    rehearsalDinner: 'yes',
    brunch: 'yes',
  });
});

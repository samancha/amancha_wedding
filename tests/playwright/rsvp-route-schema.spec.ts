import { test, expect } from '@playwright/test';
import { rsvpSchema } from '../../src/lib/rsvpSchema';
import { buildRsvpRows } from '../../src/lib/googleSheets';

test('the RSVP route schema preserves rehearsal dinner and brunch choices', () => {
  const parsed = rsvpSchema.parse({
    name: 'Bailey Invite',
    firstName: 'Bailey',
    lastName: 'Invite',
    attending: 'yes',
    meal: 'chicken',
    allergies: 'Shellfish allergy',
    rehearsalDinner: 'yes',
    brunch: 'yes',
  });

  expect(parsed).toMatchObject({
    meal: 'chicken',
    allergies: 'Shellfish allergy',
    rehearsalDinner: 'yes',
    brunch: 'yes',
  });
});

test('the response row maps meal, allergies, rehearsal dinner, and brunch to E/F/G/H', () => {
  const [primaryRow] = buildRsvpRows(
    {
      name: 'Bailey Invite',
      lastName: 'Invite',
      attending: 'yes',
      meal: 'chicken',
      allergies: 'Shellfish allergy',
      rehearsalDinner: 'yes',
      brunch: 'yes',
    },
    '2026-08-15T00:00:00.000Z'
  );

  // Columns: A timestamp, B name, C lastName, D attending, E meal, F allergies, G rehearsalDinner, H brunch
  expect(primaryRow[4]).toBe('chicken');
  expect(primaryRow[5]).toBe('Shellfish allergy');
  expect(primaryRow[6]).toBe('yes');
  expect(primaryRow[7]).toBe('yes');
});

test('omitted optional event choices remain blank rather than invented', () => {
  const [primaryRow] = buildRsvpRows(
    {
      name: 'No Choices',
      lastName: 'Guest',
      attending: 'yes',
    },
    '2026-08-15T00:00:00.000Z'
  );

  expect(primaryRow[4]).toBe('');
  expect(primaryRow[5]).toBe('');
  expect(primaryRow[6]).toBe('');
  expect(primaryRow[7]).toBe('');
});

test('additional-guest rows keep meal/allergies but leave rehearsal dinner and brunch blank', () => {
  const [, additionalRow] = buildRsvpRows(
    {
      name: 'Bailey Invite',
      lastName: 'Invite',
      attending: 'yes',
      additionalGuests: [
        { firstName: 'Casey', lastName: 'Plusone', meal: 'fish', allergies: 'none' },
      ],
    },
    '2026-08-15T00:00:00.000Z'
  );

  expect(additionalRow[4]).toBe('fish');
  expect(additionalRow[5]).toBe('none');
  expect(additionalRow[6]).toBe('');
  expect(additionalRow[7]).toBe('');
});

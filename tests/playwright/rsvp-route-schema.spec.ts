import { test, expect } from '@playwright/test';
import { rsvpSchema } from '../../src/lib/rsvpSchema';
import {
  buildGuestSnapshotWrite,
  buildRsvpRows,
  findNextRsvpRow,
  resolveGuestListColumns,
} from '../../src/lib/googleSheets';

const guestListHeaders = [
  'First Name',
  'Last Name',
  'Guest Count',
  'RSVP Status',
  'Table #',
  'Street Address',
  'Apt/Unit #',
  'City',
  'State',
  'Zip Code',
  'Rehearsal Dinner',
  'Brunch',
  'RSVP Meal',
  'RSVP Dietary Restrictions',
  'RSVP Rehearsal Dinner',
  'RSVP Brunch',
  'RSVP Updated At',
];

function guestListRows() {
  return [
    guestListHeaders,
    ['Bailey', 'Invite', '', '', '', '', '', '', '', '', 'yes', 'yes', '', '', '', ''],
  ];
}

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

test('the next RSVP row ignores analysis cells and malformed rows below the data', () => {
  const rows = [
    ['Timestamp', 'Full Name', 'Last Name'],
    ['2026-08-15T00:00:00.000Z', 'First Guest', 'Guest'],
    ['2026-08-15T00:01:00.000Z', 'Second Guest', 'Guest'],
    [],
    [],
    ['Duplicates', '', 'Count yes', '95', '', 'Beef'],
    ['', '', '17'],
    ['', '', '2026-08-16T22:31:01.041Z', 'Misaligned Guest'],
  ];

  expect(findNextRsvpRow(rows)).toBe(4);
});

test('guest-list header matching keeps saved answers distinct from invitation eligibility', () => {
  const columns = resolveGuestListColumns([
    'First Name',
    'Last Name',
    'RSVP Rehearsal Dinner',
    'Rehearsal Dinner',
    'Brunch',
    'RSVP Status',
  ]);

  expect(columns.rehearsalDinner).toBe(3);
  expect(columns.rsvpRehearsalDinner).toBe(2);
  expect(columns.rsvpStatus).toBe(5);
});

test('an accepted RSVP writes status and the complete M:Q-style saved snapshot', () => {
  const write = buildGuestSnapshotWrite(
    guestListRows(),
    'Bailey',
    'Invite',
    {
      attending: 'yes',
      meal: 'chicken',
      allergies: 'Shellfish allergy',
      rehearsalDinner: 'yes',
      brunch: 'no',
    },
    '2026-08-17T02:30:00.000Z'
  );

  expect(write).toEqual({
    data: [
      { range: 'D2', values: [['yes']] },
      {
        range: 'M2:Q2',
        values: [['chicken', 'Shellfish allergy', 'yes', 'no', '2026-08-17T02:30:00.000Z']],
      },
    ],
  });
});

test('a declined RSVP clears saved acceptance data and retains an update timestamp', () => {
  const write = buildGuestSnapshotWrite(
    guestListRows(),
    'Bailey',
    'Invite',
    { attending: 'no' },
    '2026-08-17T02:30:00.000Z'
  );

  expect(write?.data[0].values).toEqual([['no']]);
  expect(write?.data[1].values).toEqual([['', '', '', '', '2026-08-17T02:30:00.000Z']]);
});

test('an accepted RSVP leaves answers blank when that event was not offered', () => {
  const write = buildGuestSnapshotWrite(
    guestListRows(),
    'Bailey',
    'Invite',
    { attending: 'yes', meal: 'beef' },
    '2026-08-17T02:30:00.000Z'
  );

  expect(write?.data[1].values).toEqual([['beef', '', '', '', '2026-08-17T02:30:00.000Z']]);
});

test('a missing saved-state header skips the guest-list write without throwing', () => {
  const rows = guestListRows();
  rows[0] = rows[0].filter((header) => header !== 'RSVP Brunch');

  expect(() =>
    buildGuestSnapshotWrite(
      rows,
      'Bailey',
      'Invite',
      { attending: 'yes' },
      '2026-08-17T02:30:00.000Z'
    )
  ).not.toThrow();
  expect(
    buildGuestSnapshotWrite(
      rows,
      'Bailey',
      'Invite',
      { attending: 'yes' },
      '2026-08-17T02:30:00.000Z'
    )
  ).toBeNull();
});

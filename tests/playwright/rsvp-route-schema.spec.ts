import { test, expect } from '@playwright/test';
import { rsvpSchema } from '../../src/lib/rsvpSchema';
import {
  buildGuestSnapshotWrite,
  buildRsvpRows,
  findNextRsvpRow,
  resolveGuestListColumns,
} from '../../src/lib/googleSheets';
import { buildGuestSnapshotBackfill } from '../../src/lib/guestSnapshotBackfill';
import { createRsvpPostHandler } from '../../src/app/api/rsvp/route';

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

test('the response full-name column prefers explicit first and last names', () => {
  const [primaryRow] = buildRsvpRows(
    {
      name: 'Invite',
      firstName: 'Bailey',
      lastName: 'Invite',
    },
    '2026-08-15T00:00:00.000Z'
  );

  expect(primaryRow[1]).toBe('Bailey Invite');
  expect(primaryRow[2]).toBe('Invite');
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

test('guest-list lookup still resolves abbreviated first and last headers', () => {
  const columns = resolveGuestListColumns(['First', 'Last', 'Guest Count', 'RSVP Status']);

  expect(columns.firstName).toBe(0);
  expect(columns.lastName).toBe(1);
  expect(columns.guestCount).toBe(2);
  expect(columns.rsvpStatus).toBe(3);
});

test('guest-list lookup does not mistake Last Updated for Last Name', () => {
  const columns = resolveGuestListColumns(['First', 'Last Updated', 'Guest Count']);

  expect(columns.firstName).toBe(0);
  expect(columns.lastName).toBe(-1);
});

test('the RSVP route normalizes names before writing the response and guest snapshot', async () => {
  const appended: unknown[] = [];
  const snapshots: unknown[][] = [];
  const post = createRsvpPostHandler({
    appendToGoogleSheet: async (rsvp) => {
      appended.push(rsvp);
    },
    updateGuestRsvpSnapshot: async (...args) => {
      snapshots.push(args);
    },
  });

  const response = await post(
    new Request('http://localhost/api/rsvp', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Invite',
        firstName: 'Bailey',
        lastName: 'Invite',
        attending: 'yes',
        meal: 'chicken',
        allergies: 'Shellfish allergy',
        rehearsalDinner: 'yes',
        brunch: 'no',
      }),
    })
  );

  expect(response.status).toBe(201);
  expect(appended).toEqual([
    expect.objectContaining({ name: 'Bailey Invite', firstName: 'Bailey', lastName: 'Invite' }),
  ]);
  expect(snapshots).toEqual([
    [
      'Bailey',
      'Invite',
      {
        attending: 'yes',
        meal: 'chicken',
        allergies: 'Shellfish allergy',
        rehearsalDinner: 'yes',
        brunch: 'no',
      },
    ],
  ]);
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

test('backfill clears stale meal data for declined responses', () => {
  const plan = buildGuestSnapshotBackfill(
    [
      ['Timestamp', 'First Name', 'Last Name', 'Attending', 'Meal'],
      ['2026-08-20T00:00:00.000Z', 'Bailey Invite', 'Invite', 'no', 'beef'],
    ],
    guestListRows()
  );

  expect(plan.writes).toEqual([
    expect.objectContaining({
      range: 'M2:Q2',
      values: ['', '', '', '', '2026-08-20T00:00:00.000Z'],
    }),
  ]);
});

test('backfill skips a guest row whose live snapshot is already set', () => {
  const guests = guestListRows();
  guests[1][16] = '2026-08-21T00:00:00.000Z';
  const plan = buildGuestSnapshotBackfill(
    [
      ['Timestamp', 'First Name', 'Last Name', 'Attending'],
      ['2026-08-20T00:00:00.000Z', 'Bailey Invite', 'Invite', 'yes'],
    ],
    guests
  );

  expect(plan.writes).toEqual([]);
  expect(plan.skipped).toEqual([
    expect.objectContaining({ reason: 'guest snapshot already set', guestRow: 2 }),
  ]);
});

test('backfill does not write to ambiguous duplicate guest-list names', () => {
  const guests = guestListRows();
  guests.push([...guests[1]]);
  const plan = buildGuestSnapshotBackfill(
    [
      ['Timestamp', 'First Name', 'Last Name', 'Attending', 'Meal'],
      ['2026-08-20T00:00:00.000Z', 'Bailey Invite', 'Invite', 'yes', 'beef'],
    ],
    guests
  );

  expect(plan.writes).toEqual([]);
  expect(plan.conflicts).toEqual([
    expect.objectContaining({
      reason: 'duplicate guest-list name',
      guestRow: 3,
      firstName: 'bailey',
      lastName: 'invite',
    }),
  ]);
});

test('backfill ignores response-sheet helper cells without RSVP timestamps', () => {
  const plan = buildGuestSnapshotBackfill(
    [
      ['Timestamp', 'First Name', 'Last Name', 'Attending'],
      ['Duplicates', '', 'Count yes', '100'],
      ['', '', 'Beef', '18'],
    ],
    guestListRows()
  );

  expect(plan).toMatchObject({ writes: [], skipped: [], unmatched: [], conflicts: [] });
});

test('backfill resolves the snapshot range from headers after an inserted column', () => {
  const shiftedHeaders = [
    ...guestListHeaders.slice(0, 12),
    'New Column',
    ...guestListHeaders.slice(12),
  ];
  const plan = buildGuestSnapshotBackfill(
    [
      ['Timestamp', 'First Name', 'Last Name', 'Attending', 'Meal'],
      ['2026-08-20T00:00:00.000Z', 'Bailey Invite', 'Invite', 'yes', 'chicken'],
    ],
    [shiftedHeaders, ['Bailey', 'Invite']]
  );

  expect(plan.writes).toEqual([
    expect.objectContaining({
      range: 'N2:R2',
      values: ['chicken', '', '', '', '2026-08-20T00:00:00.000Z'],
    }),
  ]);
});

test('backfill reports unmatched responses without fuzzy matching', () => {
  const plan = buildGuestSnapshotBackfill(
    [
      ['Timestamp', 'First Name', 'Last Name', 'Attending'],
      ['2026-08-20T00:00:00.000Z', 'Juan Sotelo', 'Sotelo', 'yes'],
    ],
    guestListRows()
  );

  expect(plan.writes).toEqual([]);
  expect(plan.unmatched).toEqual([
    expect.objectContaining({ responseRow: 2, firstName: 'juan', lastName: 'sotelo' }),
  ]);
});

test('backfill selects the latest response for duplicate historical submissions', () => {
  const plan = buildGuestSnapshotBackfill(
    [
      ['Timestamp', 'First Name', 'Last Name', 'Attending', 'Meal'],
      ['2026-08-20T00:00:00.000Z', 'Bailey Invite', 'Invite', 'yes', 'beef'],
      ['2026-08-21T00:00:00.000Z', 'Bailey Invite', 'Invite', 'yes', 'chicken'],
    ],
    guestListRows()
  );

  expect(plan.writes).toEqual([
    expect.objectContaining({
      responseRow: 3,
      values: ['chicken', '', '', '', '2026-08-21T00:00:00.000Z'],
    }),
  ]);
  expect(plan.conflicts).toEqual([
    expect.objectContaining({ reason: 'multiple responses for guest; latest timestamp selected' }),
  ]);
});

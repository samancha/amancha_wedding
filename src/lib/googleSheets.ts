import { google } from 'googleapis';

const sheets = google.sheets('v4');

// Initialize auth using service account from environment
function getAuthClient() {
  console.log('getAuthClient: Initializing...');
  console.log('GOOGLE_SHEETS_CREDENTIALS env var exists:', !!process.env.GOOGLE_SHEETS_CREDENTIALS);

  const credentials = process.env.GOOGLE_SHEETS_CREDENTIALS
    ? JSON.parse(Buffer.from(process.env.GOOGLE_SHEETS_CREDENTIALS, 'base64').toString())
    : null;

  if (!credentials) {
    throw new Error('GOOGLE_SHEETS_CREDENTIALS not configured');
  }

  console.log('Credentials decoded successfully. Email:', credentials.client_email);

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  console.log('GoogleAuth client created successfully');
  return auth;
}

const GUEST_LIST_SHEET_ID = process.env.GOOGLE_GUEST_LIST_SHEET_ID!;

export type GuestMatch = {
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

type AdditionalGuestData = {
  firstName: string;
  lastName: string;
  meal?: string;
  allergies?: string;
};

export type RsvpData = {
  name: string;
  lastName: string;
  attending?: string;
  meal?: string;
  allergies?: string;
  rehearsalDinner?: string;
  brunch?: string;
  additionalGuests?: AdditionalGuestData[];
};

export type GuestRsvpSnapshot = {
  attending: 'yes' | 'no';
  meal?: string;
  allergies?: string;
  rehearsalDinner?: 'yes' | 'no';
  brunch?: 'yes' | 'no';
};

type GuestListColumns = {
  firstName: number;
  lastName: number;
  guestCount: number;
  rehearsalDinner: number;
  brunch: number;
  rsvpStatus: number;
  rsvpMeal: number;
  rsvpDietaryRestrictions: number;
  rsvpRehearsalDinner: number;
  rsvpBrunch: number;
  rsvpUpdatedAt: number;
};

type GuestSnapshotWrite = {
  data: Array<{ range: string; values: string[][] }>;
};

function normalizeHeader(value: unknown): string {
  return String(value).trim().toLowerCase().replace(/\s+/g, ' ');
}

function columnToA1(columnIndex: number): string {
  let result = '';
  let value = columnIndex + 1;

  while (value > 0) {
    const remainder = (value - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    value = Math.floor((value - 1) / 26);
  }

  return result;
}

/**
 * Resolves guest-list columns by their complete, normalized header text.
 * Keeping invitation eligibility and saved RSVP answers distinct prevents a
 * reordered column from silently changing what is read or written.
 */
export function resolveGuestListColumns(headers: readonly unknown[]): GuestListColumns {
  const indexOf = (header: string) =>
    headers.findIndex((value) => normalizeHeader(value) === header);

  return {
    firstName: indexOf('first name'),
    lastName: indexOf('last name'),
    guestCount: indexOf('guest count'),
    rehearsalDinner: indexOf('rehearsal dinner'),
    brunch: indexOf('brunch'),
    rsvpStatus: indexOf('rsvp status'),
    rsvpMeal: indexOf('rsvp meal'),
    rsvpDietaryRestrictions: indexOf('rsvp dietary restrictions'),
    rsvpRehearsalDinner: indexOf('rsvp rehearsal dinner'),
    rsvpBrunch: indexOf('rsvp brunch'),
    rsvpUpdatedAt: indexOf('rsvp updated at'),
  };
}

function responseChoice(value: unknown): 'yes' | 'no' | null {
  const normalized = String(value || '')
    .trim()
    .toLowerCase();
  return normalized === 'yes' || normalized === 'no' ? normalized : null;
}

function columnValue(row: readonly unknown[], column: number): string {
  // eslint-disable-next-line security/detect-object-injection
  return column >= 0 ? String(row[column] || '').trim() : '';
}

/**
 * Produces the two guest-list ranges for an RSVP state snapshot. Returning
 * null makes a partially configured guest list non-fatal to an RSVP submit.
 */
export function buildGuestSnapshotWrite(
  rows: readonly (readonly unknown[])[],
  firstName: string,
  lastName: string,
  snapshot: GuestRsvpSnapshot,
  updatedAt: string
): GuestSnapshotWrite | null {
  if (rows.length === 0) return null;

  const columns = resolveGuestListColumns(rows[0]);
  const requiredColumns = [
    columns.firstName,
    columns.lastName,
    columns.rsvpStatus,
    columns.rsvpMeal,
    columns.rsvpDietaryRestrictions,
    columns.rsvpRehearsalDinner,
    columns.rsvpBrunch,
    columns.rsvpUpdatedAt,
  ];

  if (requiredColumns.some((column) => column < 0)) return null;

  const snapshotColumns = [
    columns.rsvpMeal,
    columns.rsvpDietaryRestrictions,
    columns.rsvpRehearsalDinner,
    columns.rsvpBrunch,
    columns.rsvpUpdatedAt,
  ];
  if (!snapshotColumns.every((column, index) => column === snapshotColumns[0] + index)) {
    return null;
  }

  const normalizedFirst = firstName.toLowerCase().trim();
  const normalizedLast = lastName.toLowerCase().trim();
  const rowIndex = rows.findIndex((row, index) => {
    if (index === 0) return false;
    return (
      columnValue(row, columns.firstName).toLowerCase() === normalizedFirst &&
      columnValue(row, columns.lastName).toLowerCase() === normalizedLast
    );
  });

  if (rowIndex < 0) return null;

  const values =
    snapshot.attending === 'yes'
      ? [
          snapshot.meal || '',
          snapshot.allergies || '',
          snapshot.rehearsalDinner || '',
          snapshot.brunch || '',
          updatedAt,
        ]
      : ['', '', '', '', updatedAt];
  const sheetRow = rowIndex + 1;

  return {
    data: [
      {
        range: `${columnToA1(columns.rsvpStatus)}${sheetRow}`,
        values: [[snapshot.attending]],
      },
      {
        range: `${columnToA1(snapshotColumns[0])}${sheetRow}:${columnToA1(snapshotColumns[4])}${sheetRow}`,
        values: [values],
      },
    ],
  };
}

/**
 * Searches the guest list sheet for all rows whose Last Name cell
 * contains the search term (or vice-versa), so compound / hyphenated
 * names (e.g. "Garcia-Lopez") are found whether the guest types
 * "Garcia", "Lopez", or the full compound name.
 */
export async function verifyGuestLastName(lastName: string): Promise<{ matches: GuestMatch[] }> {
  try {
    const auth = getAuthClient();

    const response = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId: GUEST_LIST_SHEET_ID,
      range: 'A:Z',
    });

    const rows = response.data.values || [];
    if (rows.length === 0) return { matches: [] };

    const normalized = lastName.toLowerCase().trim();

    // Locate column indices from header row
    const columns = resolveGuestListColumns(rows[0]);
    const {
      lastName: lastNameCol,
      firstName: firstNameCol,
      guestCount: guestCountCol,
      rehearsalDinner: rehearsalDinnerCol,
      brunch: brunchCol,
      rsvpStatus: rsvpStatusCol,
    } = columns;

    if (lastNameCol < 0) {
      console.warn('verifyGuestLastName: could not find a "Last Name" header column');
      return { matches: [] };
    }

    const dataRows = rows.slice(1);
    const matched: GuestMatch[] = dataRows
      .filter((row) => {
        // eslint-disable-next-line security/detect-object-injection
        const cell = String(row[lastNameCol] || '')
          .toLowerCase()
          .trim();
        return cell.length > 0 && (cell.includes(normalized) || normalized.includes(cell));
      })
      .map((row) => {
        // eslint-disable-next-line security/detect-object-injection
        const first = firstNameCol >= 0 ? String(row[firstNameCol] || '').trim() : '';
        // eslint-disable-next-line security/detect-object-injection
        const last = String(row[lastNameCol] || '').trim();
        // eslint-disable-next-line security/detect-object-injection
        const count = guestCountCol >= 0 ? parseInt(String(row[guestCountCol] || '0'), 10) || 0 : 0;
        const rehearsalDinner =
          rehearsalDinnerCol >= 0
            ? // eslint-disable-next-line security/detect-object-injection
              String(row[rehearsalDinnerCol] || '').toLowerCase() === 'yes'
            : false;
        const brunch =
          brunchCol >= 0
            ? // eslint-disable-next-line security/detect-object-injection
              String(row[brunchCol] || '').toLowerCase() === 'yes'
            : false;
        // eslint-disable-next-line security/detect-object-injection
        const rsvpStatus = rsvpStatusCol >= 0 ? String(row[rsvpStatusCol] || '').trim() : '';
        return {
          firstName: first,
          lastName: last,
          fullName: [first, last].filter(Boolean).join(' '),
          guestCount: count,
          rehearsalDinner,
          brunch,
          rsvpStatus,
          saved: {
            meal: columnValue(row, columns.rsvpMeal),
            allergies: columnValue(row, columns.rsvpDietaryRestrictions),
            rehearsalDinner: responseChoice(columnValue(row, columns.rsvpRehearsalDinner)),
            brunch: responseChoice(columnValue(row, columns.rsvpBrunch)),
            updatedAt: columnValue(row, columns.rsvpUpdatedAt),
          },
        };
      });

    return { matches: matched };
  } catch (err) {
    console.error('Guest list lookup error:', err);
    throw err;
  }
}

/**
 * Updates the RSVP status and saved answer snapshot for the matching guest.
 */
export async function updateGuestRsvpSnapshot(
  firstName: string,
  lastName: string,
  snapshot: GuestRsvpSnapshot
): Promise<void> {
  try {
    const auth = getAuthClient();

    const response = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId: GUEST_LIST_SHEET_ID,
      range: 'A:Z',
    });

    const write = buildGuestSnapshotWrite(
      response.data.values || [],
      firstName,
      lastName,
      snapshot,
      new Date().toISOString()
    );
    if (!write) {
      console.warn(
        `updateGuestRsvpSnapshot: expected headers or guest row missing for ${firstName} ${lastName}`
      );
      return;
    }

    await sheets.spreadsheets.values.batchUpdate({
      auth,
      spreadsheetId: GUEST_LIST_SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        ...write,
      },
    });

    console.log(`updateGuestRsvpSnapshot: saved RSVP snapshot for ${firstName} ${lastName}`);
  } catch (err) {
    console.error('updateGuestRsvpSnapshot error:', err);
    throw err;
  }
}

/**
 * Builds the response-sheet rows for a primary guest and any additional
 * guests. Pure and credential-free so the E/F/G/H column contract
 * (meal, dietary restrictions, rehearsal dinner, brunch) can be
 * regression-tested without a live Google Sheets call.
 */
export function buildRsvpRows(rsvp: RsvpData, timestamp: string): string[][] {
  return [
    [
      timestamp,
      rsvp.name, // B: Full Name
      rsvp.lastName, // C: Last Name
      rsvp.attending || '', // D: Attending
      rsvp.meal || '', // E: Meal
      rsvp.allergies || '', // F: Dietary Restrictions
      rsvp.rehearsalDinner || '', // G: Rehearsal Dinner
      rsvp.brunch || '', // H: Brunch
    ],
    ...(rsvp.additionalGuests || []).map((g) => [
      timestamp,
      `${g.firstName} ${g.lastName}`.trim(),
      g.lastName,
      rsvp.attending || '',
      g.meal || '',
      g.allergies || '',
      '', // rehearsalDinner placeholder for additional guest
      '', // brunch placeholder for additional guest
    ]),
  ];
}

function isRsvpTimestamp(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T/.test(value) &&
    !Number.isNaN(Date.parse(value))
  );
}

/**
 * Finds the first row after the RSVP data, ignoring analysis cells and
 * malformed rows that do not have the response timestamp in column A.
 * The returned row is 1-indexed, matching Google Sheets A1 notation.
 */
export function findNextRsvpRow(rows: readonly (readonly unknown[])[]): number {
  let lastRsvpRow = 1; // Header row.

  rows.forEach((row, index) => {
    if (isRsvpTimestamp(row[0]) && String(row[1] || '').trim() && String(row[2] || '').trim()) {
      lastRsvpRow = index + 1;
    }
  });

  return lastRsvpRow + 1;
}

export async function appendToGoogleSheet(rsvp: RsvpData) {
  try {
    console.log('appendToGoogleSheet called with:', rsvp);

    const auth = getAuthClient();
    console.log('Auth client obtained');

    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    console.log('Spreadsheet ID:', spreadsheetId);

    if (!spreadsheetId) {
      throw new Error('GOOGLE_SHEETS_ID not configured');
    }

    const timestamp = new Date().toISOString();
    const values = buildRsvpRows(rsvp, timestamp);

    const existing = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: 'Sheet1!A:H',
    });
    const startRow = findNextRsvpRow(existing.data.values || []);
    const endRow = startRow + values.length - 1;

    console.log(`Writing RSVP rows ${startRow}-${endRow} to Google Sheet:`, values);

    const response = await sheets.spreadsheets.values.update({
      auth,
      spreadsheetId,
      range: `Sheet1!A${startRow}:H${endRow}`,
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });

    console.log('RSVP appended to Google Sheet:', response.data);
    return response.data;
  } catch (err) {
    console.error('Google Sheets append error:', err);
    console.error('Error type:', err instanceof Error ? err.constructor.name : typeof err);
    if (err instanceof Error) {
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
    }
    throw err;
  }
}

export async function searchGoogleSheet(name: string, birthday: string) {
  try {
    const auth = getAuthClient();
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

    if (!spreadsheetId) {
      throw new Error('GOOGLE_SHEETS_ID not configured');
    }

    const response = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: 'Sheet1!A:I',
    });

    const rows = response.data.values || [];
    // Skip header row (if any) and search
    const matches = rows.slice(1).filter((row) => {
      const rowName = (row[1] || '').toLowerCase().trim();
      const rowBirthday = (row[3] || '').trim();
      return rowName === name.toLowerCase().trim() && rowBirthday === birthday.trim();
    });

    if (matches.length === 0) {
      return null;
    }

    const match = matches[0];
    return {
      name: match[1],
      email: match[2],
      birthday: match[3],
      attending: match[4],
      guests: parseInt(match[5]) || 0,
      maxGuests: parseInt(match[8]) || 1,
      message: match[6],
      visibility: match[7],
      timestamp: match[0],
    };
  } catch (err) {
    console.error('Google Sheets search error:', err);
    throw err;
  }
}

export async function updateGuestCountInGoogleSheet(
  name: string,
  birthday: string,
  guests: number
) {
  try {
    const auth = getAuthClient();
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

    if (!spreadsheetId) {
      throw new Error('GOOGLE_SHEETS_ID not configured');
    }

    // First, get all rows to find the matching one
    const response = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: 'Sheet1!A:I',
    });

    const rows = response.data.values || [];
    // headerRow removed (unused)

    // Find the matching row
    let matchingRowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      // eslint-disable-next-line security/detect-object-injection
      const row = rows[i];
      const rowName = (row[1] || '').toLowerCase().trim();
      const rowBirthday = (row[3] || '').trim();
      if (rowName === name.toLowerCase().trim() && rowBirthday === birthday.trim()) {
        matchingRowIndex = i + 1; // +1 because sheets are 1-indexed
        break;
      }
    }

    if (matchingRowIndex === -1) {
      throw new Error('RSVP not found');
    }

    // Update the guests column (column F, which is column 6)
    const updateResponse = await sheets.spreadsheets.values.update({
      auth,
      spreadsheetId,
      range: `Sheet1!F${matchingRowIndex}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[guests]],
      },
    });

    console.log('Guest count updated:', updateResponse.data);
    return updateResponse.data;
  } catch (err) {
    console.error('Google Sheets update error:', err);
    throw err;
  }
}

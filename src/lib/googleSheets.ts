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

export type GuestMatch = { firstName: string; lastName: string; fullName: string; guestCount: number };

type AdditionalGuestData = { firstName: string; lastName: string; meal?: string; allergies?: string };

type RsvpData = {
  name: string;
  lastName: string;
  attending?: string;
  meal?: string;
  allergies?: string;
  additionalGuests?: AdditionalGuestData[];
};

/**
 * Searches the guest list sheet for all rows whose Last Name cell
 * contains the search term (or vice-versa), so compound / hyphenated
 * names (e.g. "Garcia-Lopez") are found whether the guest types
 * "Garcia", "Lopez", or the full compound name.
 */
export async function verifyGuestLastName(
  lastName: string
): Promise<{ matches: GuestMatch[] }> {
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
    const headers = rows[0].map((c: unknown) => String(c).toLowerCase().trim());
    const lastNameCol = headers.findIndex((h) => h.includes('last'));
    const firstNameCol = headers.findIndex((h) => h.includes('first'));
    const guestCountCol = headers.findIndex((h) => h.includes('guest') && h.includes('count'));

    if (lastNameCol < 0) {
      console.warn('verifyGuestLastName: could not find a "Last Name" header column');
      return { matches: [] };
    }

    const dataRows = rows.slice(1);
    const matched: GuestMatch[] = dataRows
      .filter((row) => {
        const cell = String(row[lastNameCol] || '').toLowerCase().trim();
        return cell.length > 0 && (cell.includes(normalized) || normalized.includes(cell));
      })
      .map((row) => {
        const first = firstNameCol >= 0 ? String(row[firstNameCol] || '').trim() : '';
        const last = String(row[lastNameCol] || '').trim();
        const count = guestCountCol >= 0 ? parseInt(String(row[guestCountCol] || '0'), 10) || 0 : 0;
        return {
          firstName: first,
          lastName: last,
          fullName: [first, last].filter(Boolean).join(' '),
          guestCount: count,
        };
      });

    return { matches: matched };
  } catch (err) {
    console.error('Guest list lookup error:', err);
    throw err;
  }
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
    const values: string[][] = [
      [
        timestamp,
        rsvp.name,            // B: Full Name
        rsvp.lastName,        // C: Last Name
        rsvp.attending || '', // D: Attending
        rsvp.meal || '',      // E: Meal
        rsvp.allergies || '', // F: Dietary Restrictions
      ],
      ...(rsvp.additionalGuests || []).map((g) => [
        timestamp,
        `${g.firstName} ${g.lastName}`.trim(),
        g.lastName,
        rsvp.attending || '',
        g.meal || '',
        g.allergies || '',
      ]),
    ];

    console.log('Appending values to Google Sheet:', values);

    const response = await sheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: 'Sheet1!A:F',
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

export async function updateGuestCountInGoogleSheet(name: string, birthday: string, guests: number) {
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
    const headerRow = rows[0];
    
    // Find the matching row
    let matchingRowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
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

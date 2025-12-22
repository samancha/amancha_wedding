import { google } from 'googleapis';

const sheets = google.sheets('v4');

// Initialize auth using service account from environment
function getAuthClient() {
  const credentials = process.env.GOOGLE_SHEETS_CREDENTIALS
    ? JSON.parse(Buffer.from(process.env.GOOGLE_SHEETS_CREDENTIALS, 'base64').toString())
    : null;

  if (!credentials) {
    throw new Error('GOOGLE_SHEETS_CREDENTIALS not configured');
  }

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

type RsvpData = {
  name: string;
  email: string;
  birthday: string;
  attending?: string;
  guests?: number;
  message?: string;
  visibility?: string;
};

export async function appendToGoogleSheet(rsvp: RsvpData) {
  try {
    const auth = getAuthClient();
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

    if (!spreadsheetId) {
      throw new Error('GOOGLE_SHEETS_ID not configured');
    }

    const values = [
      [
        new Date().toISOString(),
        rsvp.name,
        rsvp.email,
        rsvp.birthday,
        rsvp.attending || '',
        rsvp.guests || 0,
        rsvp.message || '',
        rsvp.visibility || 'private',
      ],
    ];

    const response = await sheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: 'Sheet1!A:H',
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });

    console.log('RSVP appended to Google Sheet:', response.data);
    return response.data;
  } catch (err) {
    console.error('Google Sheets append error:', err);
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
      range: 'Sheet1!A:H',
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
      message: match[6],
      visibility: match[7],
      timestamp: match[0],
    };
  } catch (err) {
    console.error('Google Sheets search error:', err);
    throw err;
  }
}

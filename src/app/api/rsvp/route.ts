import { NextResponse } from 'next/server';
import type { GuestRsvpSnapshot, RsvpData } from '../../../lib/googleSheets';
import { rsvpSchema } from '../../../lib/rsvpSchema';

type RsvpPersistence = {
  appendToGoogleSheet: (rsvp: RsvpData) => Promise<unknown>;
  updateGuestRsvpSnapshot: (
    firstName: string,
    lastName: string,
    snapshot: GuestRsvpSnapshot
  ) => Promise<void>;
};

export function createRsvpPostHandler({
  appendToGoogleSheet,
  updateGuestRsvpSnapshot,
}: RsvpPersistence) {
  return async function POST(request: Request) {
    try {
      console.log('=== RSVP POST Request ===');

      const body = await request.json();
      console.log('Request body:', JSON.stringify(body, null, 2));

      const parsedData = rsvpSchema.parse(body);
      const data = {
        ...parsedData,
        name:
          [parsedData.firstName, parsedData.lastName].filter(Boolean).join(' ').trim() ||
          parsedData.name,
      };
      console.log('Validation passed:', JSON.stringify(data, null, 2));

      try {
        console.log('Calling appendToGoogleSheet with:', JSON.stringify(data, null, 2));
        await appendToGoogleSheet(data);
        console.log('RSVP successfully saved to Google Sheets');

        // Update RSVP status and answers in the guest list sheet.
        if (data.firstName && data.attending) {
          await updateGuestRsvpSnapshot(data.firstName, data.lastName, {
            attending: data.attending,
            meal: data.meal,
            allergies: data.allergies,
            rehearsalDinner: data.rehearsalDinner,
            brunch: data.brunch,
          });
        }
      } catch (err) {
        console.error('Google Sheets save error:', err);
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error('Error details:', errorMsg);
        console.error('Full error object:', JSON.stringify(err, null, 2));
        return NextResponse.json(
          { ok: false, error: 'Failed to save RSVP: ' + errorMsg },
          { status: 500 }
        );
      }

      const message = `Thanks, ${data.name}! Your RSVP has been received.`;

      console.log('RSVP successful, returning 201 response');
      return NextResponse.json({ ok: true, data, message }, { status: 201 });
    } catch (err) {
      console.error('=== RSVP Request Failed ===');
      console.error('Error type:', err instanceof Error ? err.constructor.name : typeof err);
      console.error('Error message:', err instanceof Error ? err.message : String(err));
      console.error('Full error:', JSON.stringify(err, null, 2));
      if (err instanceof Error && err.stack) {
        console.error('Stack trace:', err.stack);
      }
      return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 400 });
    }
  };
}

export async function POST(request: Request) {
  const sheets = await import('../../../../src/lib/googleSheets');
  return createRsvpPostHandler(sheets)(request);
}

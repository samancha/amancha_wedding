import { NextResponse } from 'next/server';
import { z } from 'zod';

const rsvpSchema = z.object({
  name: z.string().min(1),
  lastName: z.string().min(1),
  attending: z.enum(['yes', 'no']).optional(),
  meal: z.string().optional(),
  allergies: z.string().optional(),
  additionalGuests: z.array(z.object({
    firstName: z.string(),
    lastName: z.string(),
    meal: z.string().optional(),
    allergies: z.string().optional(),
  })).optional(),
});

export async function POST(request: Request) {
  try {
    console.log('=== RSVP POST Request ===');
    
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const data = rsvpSchema.parse(body);
    console.log('Validation passed:', JSON.stringify(data, null, 2));

    // Save to Google Sheets
    try {
      console.log('Importing googleSheets module...');
      const { appendToGoogleSheet } = await import('../../../../src/lib/googleSheets');
      console.log('Calling appendToGoogleSheet with:', JSON.stringify(data, null, 2));
      await appendToGoogleSheet(data as any);
      console.log('RSVP successfully saved to Google Sheets');
    } catch (err) {
      console.error('Google Sheets save error:', err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('Error details:', errorMsg);
      console.error('Full error object:', JSON.stringify(err, null, 2));
      return NextResponse.json({ ok: false, error: 'Failed to save RSVP: ' + errorMsg }, { status: 500 });
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
}

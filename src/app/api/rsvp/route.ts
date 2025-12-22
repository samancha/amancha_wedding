import { NextResponse } from 'next/server';
import { z } from 'zod';

const rsvpSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  birthday: z.string().min(1),
  attending: z.enum(['yes', 'no']).optional(),
  guests: z.number().int().nonnegative().optional(),
  message: z.string().optional(),
  visibility: z.enum(['public', 'private']).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = rsvpSchema.parse(body);

    console.log('New RSVP received:', data);

    // Save to Google Sheets
    try {
      const { appendToGoogleSheet } = await import('../../../../src/lib/googleSheets');
      await appendToGoogleSheet(data as any);
    } catch (err) {
      console.error('Google Sheets save error', err);
      return NextResponse.json({ ok: false, error: 'Failed to save RSVP' }, { status: 500 });
    }

    const confirmTemplate = process.env.RSVP_CONFIRM_MESSAGE ?? 'Thanks! RSVP received. Use your name and birthday to check your status anytime.';
    const message = confirmTemplate.replace('{name}', data.name ?? '').replace('{attending}', data.attending ?? '');

    return NextResponse.json({ ok: true, data, message }, { status: 201 });
  } catch (err) {
    console.error('RSVP error', err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 400 });
  }
}

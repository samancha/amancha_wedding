import { NextResponse } from 'next/server';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().min(1),
  birthday: z.string().min(1),
  guests: z.number().int().nonnegative(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = updateSchema.parse(body);

    console.log('Updating guest count:', data);

    // Update in Google Sheets
    try {
      const { updateGuestCountInGoogleSheet } = await import('../../../../../src/lib/googleSheets');
      await updateGuestCountInGoogleSheet(data.name, data.birthday, data.guests);
    } catch (err) {
      console.error('Google Sheets update error', err);
      return NextResponse.json({ ok: false, error: 'Failed to update RSVP' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data }, { status: 200 });
  } catch (err) {
    console.error('Update guest count error', err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 400 });
  }
}

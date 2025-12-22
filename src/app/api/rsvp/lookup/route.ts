import { NextResponse } from 'next/server';
import { z } from 'zod';

const lookupSchema = z.object({
  name: z.string().min(1),
  birthday: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, birthday } = lookupSchema.parse(body);

    const { searchGoogleSheet } = await import('../../../../../src/lib/googleSheets');
    const result = await searchGoogleSheet(name, birthday);

    if (!result) {
      return NextResponse.json({ ok: false, error: 'RSVP not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: result }, { status: 200 });
  } catch (err) {
    console.error('Lookup error', err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 400 });
  }
}

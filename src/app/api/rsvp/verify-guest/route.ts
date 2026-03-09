import { NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({ lastName: z.string().min(1) });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lastName } = schema.parse(body);

    const { verifyGuestLastName } = await import(
      '../../../../../src/lib/googleSheets'
    );
    const { matches } = await verifyGuestLastName(lastName);
    return NextResponse.json({ matches });
  } catch (err) {
    console.error('verify-guest error:', err);
    return NextResponse.json(
      { found: false, error: (err as Error).message },
      { status: 400 }
    );
  }
}

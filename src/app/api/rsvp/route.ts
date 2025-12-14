import { NextResponse } from 'next/server';
import { z } from 'zod';

const rsvpSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  attending: z.enum(['yes', 'no']).optional(),
  guests: z.number().int().nonnegative().optional(),
  message: z.string().optional(),
  visibility: z.enum(['public', 'private']).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = rsvpSchema.parse(body);

    // For the POC: write to console, persist to DB, and send notification if configured.
    console.log('New RSVP received:', data);

    try {
      const { prisma } = await import('../../../../src/lib/prisma');
      const dbData: any = { ...data, guests: data.guests ?? 0 };
      if (data.visibility) dbData.visibility = data.visibility === 'public' ? 'PUBLIC' : 'PRIVATE';
      const r = await prisma.rsvp.create({ data: dbData });
      // do not expose db internals to the public response beyond confirmation
      console.log('Persisted RSVP id:', r.id);
    } catch (err) {
      console.error('DB persist error', err);
    }

    try {
      const { sendRsvpNotification } = await import('../../../../src/lib/email');
      // fire and forget - don't fail the endpoint if email fails
      sendRsvpNotification(data as any).catch((err) => console.error('Email send failed', err));
    } catch (err) {
      console.error('Email module error', err);
    }

    const confirmTemplate = process.env.RSVP_CONFIRM_MESSAGE ?? 'Thanks! RSVP received.';
    // simple token replacement
    const message = confirmTemplate.replace('{name}', data.name ?? '').replace('{attending}', data.attending ?? '');

    return NextResponse.json({ ok: true, data, message }, { status: 201 });
  } catch (err) {
    console.error('RSVP error', err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 400 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function checkAuth(req: Request) {
  const token = req.headers.get('x-admin-token');
  return token && token === process.env.ADMIN_TOKEN;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!checkAuth(request)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const id = params?.id;
  console.log('PATCH admin rsvp id:', id, 'url:', request.url);
  if (!id) return NextResponse.json({ ok: false, error: 'missing id param' }, { status: 400 });

  try {
    const data = await request.json();
    console.log('PATCH payload:', data);
    const updateData: any = {};
    if (data.confirmed !== undefined) updateData.confirmed = Boolean(data.confirmed);
    if (data.visibility !== undefined) {
      // accept either 'public'/'private' or 'PUBLIC'/'PRIVATE'
      const v = String(data.visibility).toLowerCase();
      updateData.visibility = v === 'public' ? 'PUBLIC' : 'PRIVATE';
    }
    if (Object.keys(updateData).length === 0) return NextResponse.json({ ok: false, error: 'no updatable fields' }, { status: 400 });
    const updated = await prisma.rsvp.update({ where: { id }, data: updateData });
    return NextResponse.json({ ok: true, data: updated });
  } catch (err) {
    console.error('PATCH admin rsvps error:', err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 400 });
  }
}

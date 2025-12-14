import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function checkAuth(req: Request) {
  const token = req.headers.get('x-admin-token');
  return token && token === process.env.ADMIN_TOKEN;
}

export async function GET(request: Request) {
  if (!checkAuth(request)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const items = await prisma.rsvp.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ ok: true, data: items });
}

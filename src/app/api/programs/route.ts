import { NextRequest, NextResponse } from 'next/server';
import { getProgramsByLocale } from '@/entities/program/lib/load-programs';
import { authenticateRequest, resolveLocale } from '@/shared/lib';

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const programs = await getProgramsByLocale(resolveLocale(req.nextUrl.searchParams.get('locale')));
    return NextResponse.json({ ok: true, programs });
  } catch (error) {
    console.error('[GET /api/programs]', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to load programs' },
      { status: 503 },
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getProgramsByLocale } from '@/entities/program/lib/load-programs';
import { parseRequestLocale } from '@/app/api/_lib/parse-request-locale';
import { requireAuthFromRequest, unauthorizedResponse } from '@/app/api/_lib/require-auth';

export async function GET(req: NextRequest) {
  const user = await requireAuthFromRequest(req);
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const programs = await getProgramsByLocale(parseRequestLocale(req));
    return NextResponse.json({ ok: true, programs });
  } catch (error) {
    console.error('[GET /api/programs]', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to load programs' },
      { status: 503 },
    );
  }
}

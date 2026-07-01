import { NextRequest, NextResponse } from 'next/server';
import { getPrograms } from '@/entities/program/api';
import { parseLocale, requireAuth } from '@/shared/lib';

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const programs = await getPrograms(parseLocale(req));
    return NextResponse.json(programs);
  } catch (error) {
    console.error('[GET /api/programs]', error);
    return NextResponse.json({ error: 'Failed to load programs' }, { status: 503 });
  }
}
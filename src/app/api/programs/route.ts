import { NextRequest, NextResponse } from 'next/server';
import { getPrograms } from '@/entities/program/api';
import { parseLocale, requireAuthFromRequest, unauthorizedResponse } from '@/shared/lib';

export async function GET(req: NextRequest) {
  const user = await requireAuthFromRequest(req);
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const programs = await getPrograms(parseLocale(req));
    return NextResponse.json(programs);
  } catch (error) {
    console.error('[GET /api/programs]', error);
    return NextResponse.json({ error: 'Failed to load programs' }, { status: 503 });
  }
}

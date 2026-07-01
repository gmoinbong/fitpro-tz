import type { NextRequest } from 'next/server';
import { resolveLocale } from '@/shared/lib';

export function parseRequestLocale(req: NextRequest) {
  return resolveLocale(req.nextUrl.searchParams.get('locale'));
}

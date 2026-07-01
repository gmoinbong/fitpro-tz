import type { NextRequest } from 'next/server';
import { validateAuthToken, type AuthUser } from '@/shared/lib/firebase-auth';

export function requireAuthFromRequest(
  req: NextRequest | Request,
): Promise<AuthUser | null> {
  return validateAuthToken(req.headers.get('authorization'));
}

export function unauthorizedResponse() {
  return Response.json(
    { ok: false, error: 'Unauthorized' },
    { status: 401 },
  );
}

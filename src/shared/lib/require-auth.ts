import { NextRequest } from 'next/server';
import { validateAuthToken, type AuthUser } from './firebase-auth';

export function requireAuthFromRequest(
  req: NextRequest | Request,
): Promise<AuthUser | null> {
  return validateAuthToken(req.headers.get('authorization'));
}

export function unauthorizedResponse() {
  return Response.json(
    { error: 'Unauthorized' },
    { status: 401 },
  );
}
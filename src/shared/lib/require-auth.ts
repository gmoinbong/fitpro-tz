import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, type AuthUser } from './firebase-auth';

export async function requireAuth(req: NextRequest): Promise<AuthUser | null> {
  return validateAuthToken(req.headers.get('Authorization'));
}

export function unauthorizedResponse(): NextResponse {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

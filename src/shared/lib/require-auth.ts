import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, type AuthUser } from './firebase-auth';

export async function requireAuth(
  req: NextRequest
): Promise<AuthUser | NextResponse> {
  const user = await validateAuthToken(req.headers.get('Authorization'));

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return user;
}

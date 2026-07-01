import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Mock Firebase Auth validator.
 * In production this would verify a real Firebase ID token.
 * For this test, any non-empty Bearer token is considered valid.
 */

export interface AuthUser {
  uid: string;
  email: string;
}

type AuthResult =
  | { ok: true; user: AuthUser }
  | { ok: false; response: NextResponse };

export async function authenticateRequest(req: NextRequest): Promise<AuthResult> {
  const user = await validateAuthToken(req.headers.get('authorization'));

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 }),
    };
  }

  return { ok: true, user };
}

export async function validateAuthToken(
  authHeader: string | null
): Promise<AuthUser | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7).trim();

  if (!token || token === 'invalid') {
    return null;
  }

  // Simulate token decode delay
  await new Promise((resolve) => setTimeout(resolve, 10));

  return {
    uid: 'user_' + token.slice(0, 8),
    email: 'user@example.com',
  };
}

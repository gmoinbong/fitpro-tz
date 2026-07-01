/**
 * Mock Firebase Auth validator.
 * In production this would verify a real Firebase ID token.
 * For this test, any non-empty Bearer token is considered valid.
 */

export interface AuthUser {
  uid: string;
  email: string;
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

const AUTH_TOKEN_KEY = 'fitplan_auth_token';
const CLIENT_FALLBACK_TOKEN = 'dev-client-token';

export function getClientAuthToken(): string {
  if (typeof window === 'undefined') {
    return CLIENT_FALLBACK_TOKEN;
  }

  return localStorage.getItem(AUTH_TOKEN_KEY) ?? CLIENT_FALLBACK_TOKEN;
}

export function getServerAuthToken(): string {
  return process.env.PROGRAMS_SSR_TOKEN ?? 'dev-ssr-token';
}

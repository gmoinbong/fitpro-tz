import type { Program, ProgramsResponse, Result } from '../model/types';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

function mapError(status: number, body: unknown): string {
  if (status === 401) return 'Unauthorized. Check your auth token.';
  if (status === 503) return 'Service unavailable. Try again later.';
  if (
    typeof body === 'object' &&
    body !== null &&
    'error' in body &&
    typeof (body as { error: unknown }).error === 'string'
  ) {
    return (body as { error: string }).error;
  }
  return 'Something went wrong';
}

export async function fetchPrograms(
  locale: string,
  headers: Record<string, string>,
): Promise<Result<Program[]>> {
  try {
    const res = await fetch(`${baseUrl}/api/programs?locale=${locale}`, {
      cache: 'no-store',
      headers,
    });
    const body = (await res.json()) as ProgramsResponse;

    if (!res.ok || !body.ok) {
      return { ok: false, error: mapError(res.status, body) };
    }

    return { ok: true, data: body.programs };
  } catch {
    return { ok: false, error: 'Network error' };
  }
}

import { headers } from 'next/headers';
import type { Program } from '@/entities/program/model';
import type { SupportedLocale } from '@/shared/lib';

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  const headersList = headers();
  const host = headersList.get('x-forwarded-host') ?? headersList.get('host') ?? 'localhost:3000';
  const protocol = headersList.get('x-forwarded-proto') ?? 'http';

  return `${protocol}://${host}`;
}

export type FetchProgramsResult =
  | { ok: true; programs: Program[] }
  | { ok: false; status: number; error: string };

export async function fetchPrograms(locale: SupportedLocale): Promise<FetchProgramsResult> {
  const headersList = headers();
  const authorization = headersList.get('authorization');

  const response = await fetch(`${getBaseUrl()}/api/programs?locale=${locale}`, {
    headers: authorization ? { Authorization: authorization } : {},
    cache: 'no-store',
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    return {
      ok: false,
      status: response.status,
      error: body?.error ?? 'Failed to load programs',
    };
  }

  const programs = (await response.json()) as Program[];
  return { ok: true, programs };
}

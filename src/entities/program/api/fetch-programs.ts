import { headers } from 'next/headers';
import { getPrograms } from './get-programs';
import type { Program } from '@/entities/program/model';
import { validateAuthToken } from '@/shared/lib';
import type { SupportedLocale } from '@/shared/lib';

export type ProgramsResult =
  | { ok: true; programs: Program[] }
  | { ok: false; error: string };

export async function fetchPrograms(locale: SupportedLocale): Promise<ProgramsResult> {
  const user = await validateAuthToken(headers().get('authorization'));

  if (!user) {
    return {
      ok: false,
      error: 'Unauthorized. Please provide a valid token.',
    };
  }

  try {
    const programs = await getPrograms(locale);
    return { ok: true, programs };
  } catch {
    return {
      ok: false,
      error: 'Programs are temporarily unavailable. Please try again later.',
    };
  }
}

export async function getProgramsPageModel(locale: SupportedLocale): Promise<ProgramsResult> {
  return fetchPrograms(locale);
}

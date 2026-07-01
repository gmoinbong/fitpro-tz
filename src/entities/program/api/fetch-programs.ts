import { getPrograms } from './get-programs';
import type { Program } from '@/entities/program/model';
import type { SupportedLocale } from '@/shared/lib';

export type ProgramsResult =
  | { ok: true; programs: Program[] }
  | { ok: false; error: string };

export async function fetchPrograms(locale: SupportedLocale): Promise<ProgramsResult> {
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

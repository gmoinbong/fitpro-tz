import type { Program } from '@/entities/program/model/types';
import { getProgramsByLocale } from '@/entities/program/lib/load-programs';
import type { SupportedLocale } from '@/shared/lib';

export async function getPrograms(locale: SupportedLocale): Promise<Program[]> {
  return getProgramsByLocale(locale);
}

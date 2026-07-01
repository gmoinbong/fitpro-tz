import { fetchProgramsFromCms } from './cms-mock';
import { mapProgramsFromCms } from './mapper';
import type { SupportedLocale } from '@/shared/lib';

export async function loadFromCms(locale: SupportedLocale) {
  const data = await fetchProgramsFromCms(locale);
  return mapProgramsFromCms(data);
}

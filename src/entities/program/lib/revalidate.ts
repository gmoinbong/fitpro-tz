import { setCachedPrograms } from './cache';
import { loadFromCms } from './cms-client';
import { dedupe } from './inflight';
import type { SupportedLocale } from '@/shared/lib';

export function revalidate(locale: SupportedLocale): void {
  void dedupe(locale, async () => {
    try {
      const programs = await loadFromCms(locale);
      setCachedPrograms(locale, programs);
      return programs;
    } catch {
      return [];
    }
  });
}

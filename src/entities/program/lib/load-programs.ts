import { getCacheEntry, setCachedPrograms } from './cache';
import { loadFromCms } from './cms-client';
import { dedupe } from './inflight';
import { loadLocal } from './local-loader';
import { revalidate } from './revalidate';
import type { Program } from '@/entities/program/model';
import type { SupportedLocale } from '@/shared/lib';

export async function getProgramsByLocale(locale: SupportedLocale): Promise<Program[]> {
  const cache = getCacheEntry(locale);

  if (cache?.data && !cache.isStale) {
    return cache.data;
  }

  if (cache?.isStale) {
    revalidate(locale);
    return cache.data;
  }

  const local = await loadLocal(locale);
  if (local) {
    setCachedPrograms(locale, local);
    revalidate(locale);
    return local;
  }

  try {
    const cms = await dedupe(locale, () => loadFromCms(locale));
    setCachedPrograms(locale, cms);
    return cms;
  } catch {
    const fallback = await loadLocal('en');
    if (fallback) {
      setCachedPrograms(locale, fallback);
      return fallback;
    }

    throw new Error('Failed to load programs');
  }
}

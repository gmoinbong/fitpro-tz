import type { Program } from '@/entities/program/model';

interface CacheEntry {
  data: Program[];
  fetchedAt: number;
}

export const FRESH_TTL_MS = 5 * 60 * 1000;
export const STALE_TTL_MS = 60 * 60 * 1000;

const programCache = new Map<string, CacheEntry>();

export interface CacheLookup {
  data: Program[];
  isStale: boolean;
}

export function getCacheEntry(locale: string): CacheLookup | null {
  const cached = programCache.get(locale);
  if (!cached) {
    return null;
  }

  const age = Date.now() - cached.fetchedAt;

  if (age > STALE_TTL_MS) {
    programCache.delete(locale);
    return null;
  }

  return {
    data: cached.data,
    isStale: age > FRESH_TTL_MS,
  };
}

export function setCachedPrograms(locale: string, data: Program[]): void {
  programCache.set(locale, {
    data,
    fetchedAt: Date.now(),
  });
}

export function clearProgramCache(): void {
  programCache.clear();
}

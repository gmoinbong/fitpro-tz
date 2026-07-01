import type { Program } from '@/entities/program/model';

interface CacheEntry {
  data: Program[];
  expiresAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000;
const programCache = new Map<string, CacheEntry>();

export function getCachedPrograms(locale: string): Program[] | null {
  const cached = programCache.get(locale);
  if (!cached) {
    return null;
  }

  if (cached.expiresAt <= Date.now()) {
    programCache.delete(locale);
    return null;
  }

  return cached.data;
}

export function setCachedPrograms(locale: string, data: Program[]): void {
  programCache.set(locale, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearProgramCache,
  FRESH_TTL_MS,
  getCacheEntry,
  setCachedPrograms,
  STALE_TTL_MS,
} from './cache';
import type { Program } from '@/entities/program/model';

const samplePrograms: Program[] = [
  {
    id: 1,
    title: 'Cached',
    description: '',
    category: 'Strength',
    daysCount: 1,
    enrolledCount: 0,
    coverImageUrl: '',
    days: [],
  },
];

describe('cache', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    clearProgramCache();
  });

  afterEach(() => {
    vi.useRealTimers();
    clearProgramCache();
  });

  it('returns fresh entry immediately after set', () => {
    setCachedPrograms('en', samplePrograms);

    const entry = getCacheEntry('en');
    expect(entry).not.toBeNull();
    expect(entry?.isStale).toBe(false);
    expect(entry?.data).toEqual(samplePrograms);
  });

  it('returns stale entry after fresh TTL expires', () => {
    setCachedPrograms('en', samplePrograms);
    vi.advanceTimersByTime(FRESH_TTL_MS + 1);

    const entry = getCacheEntry('en');
    expect(entry).not.toBeNull();
    expect(entry?.isStale).toBe(true);
    expect(entry?.data).toEqual(samplePrograms);
  });

  it('returns null after stale TTL expires', () => {
    setCachedPrograms('en', samplePrograms);
    vi.advanceTimersByTime(STALE_TTL_MS + 1);

    expect(getCacheEntry('en')).toBeNull();
  });
});

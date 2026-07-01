import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'fs/promises';
import { clearProgramCache, FRESH_TTL_MS, setCachedPrograms } from './cache';
import { fetchProgramsFromCms } from '../cms/cms-sdk';
import { clearInflight } from './inflight';
import { getProgramsByLocale } from './load-programs';
import type { Program } from '@/entities/program/model';

vi.mock('../cms/cms-sdk', () => ({
  fetchProgramsFromCms: vi.fn(),
}));

const mockedFetch = vi.mocked(fetchProgramsFromCms);

const cmsRow = {
  id: 99,
  title: 'CMS Program',
  description: 'From CMS',
  category: 'HIIT',
  days_count: 1,
  enrolled_count: 10,
  cover_image_url: '',
  days: [
    {
      day_number: 1,
      title: 'CMS Day',
      video_url: 'https://example.com/cms.mp4',
      exercise_description: 'CMS exercise',
      coach_tip: 'CMS tip',
    },
  ],
};

describe('getProgramsByLocale', () => {
  beforeEach(() => {
    clearProgramCache();
    clearInflight();
    vi.clearAllMocks();
  });

  afterEach(() => {
    clearProgramCache();
    clearInflight();
    vi.restoreAllMocks();
  });

  it('returns camelCase programs from local JSON when CMS fails', async () => {
    mockedFetch.mockRejectedValue(new Error('CMS unavailable'));

    const programs = await getProgramsByLocale('en');

    expect(programs.length).toBeGreaterThan(0);
    expect(programs[0]).toHaveProperty('daysCount');
    expect(programs[0].days[0]).toHaveProperty('dayNumber');
    expect(programs[0].days[0]).toHaveProperty('videoUrl');
    expect(programs[0].days[0]).not.toHaveProperty('day_number');
  });

  it('falls back to English local JSON without a second CMS call', async () => {
    mockedFetch.mockRejectedValue(new Error('CMS unavailable'));

    const readFile = vi.spyOn(fs, 'readFile');
    readFile.mockImplementation(async (filePath, encoding) => {
      const actualFs = await vi.importActual<typeof import('fs/promises')>('fs/promises');
      if (String(filePath).includes('programs-es.json')) {
        throw new Error('not found');
      }
      return actualFs.readFile(filePath, encoding as BufferEncoding);
    });

    const programs = await getProgramsByLocale('es');

    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(programs.length).toBeGreaterThan(0);
    expect(programs[0]).toHaveProperty('daysCount');
  });

  it('returns stale cache immediately and triggers background revalidation', async () => {
    const stalePrograms: Program[] = [
      {
        id: 1,
        title: 'Stale',
        description: '',
        category: 'Yoga',
        daysCount: 1,
        enrolledCount: 0,
        coverImageUrl: '',
        days: [],
      },
    ];

    vi.useFakeTimers();
    setCachedPrograms('en', stalePrograms);
    vi.advanceTimersByTime(FRESH_TTL_MS + 1);

    mockedFetch.mockResolvedValue([cmsRow]);

    const result = await getProgramsByLocale('en');

    expect(result).toEqual(stalePrograms);
    expect(mockedFetch).toHaveBeenCalledTimes(1);

    await vi.runAllTimersAsync();
    vi.useRealTimers();
  });

  it('serves local JSON on cold start without waiting for CMS', async () => {
    let resolveCms!: (value: typeof cmsRow[]) => void;
    const cmsPromise = new Promise<typeof cmsRow[]>((resolve) => {
      resolveCms = resolve;
    });
    mockedFetch.mockReturnValue(cmsPromise as ReturnType<typeof fetchProgramsFromCms>);

    const result = await getProgramsByLocale('en');

    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('daysCount');
    expect(mockedFetch).toHaveBeenCalledTimes(1);

    resolveCms([cmsRow]);
    await cmsPromise;
  });
});

/**
 * Program cache with a fallback loading strategy:
 *   1. Try CMS API
 *   2. Fall back to local JSON file
 *   3. If locale is not 'en', fall back to English (local file only)
 *
 * Caches results in memory. Fresh for 5 min, stale up to 60 min
 * (stale entries are still served while CMS refreshes in the background).
 *
 * Fixed version of the template file — see comments below for what was broken.
 * The live endpoint uses the same logic split across src/entities/program/lib/.
 */

import fs from 'fs/promises';
import path from 'path';

import { fetchProgramsFromCms } from '@/entities/program/lib/cms-mock';
import type { CmsProgram, CmsProgramDay } from '@/entities/program/lib/cms-types';
import type { Program, ProgramDay } from '@/entities/program/model';

interface CacheEntry {
  data: Program[];
  fetchedAt: number;
}

const FRESH_TTL_MS = 5 * 60 * 1000;
const STALE_TTL_MS = 60 * 60 * 1000;
const cache = new Map<string, CacheEntry>();

// share one in-flight CMS request per locale
const inflight = new Map<string, Promise<Program[]>>();

function mapDay(raw: CmsProgramDay): ProgramDay {
  return {
    dayNumber: raw.day_number ?? 0,
    title: raw.title ?? '',
    // was `video` — type wants videoUrl, videos were always undefined
    videoUrl: raw.video_url ?? '',
    exerciseDescription: raw.exercise_description ?? '',
    coachTip: raw.coach_tip ?? '',
  };
}

function mapProgram(raw: CmsProgram): Program {
  return {
    id: raw.id,
    title: raw.title ?? '',
    description: raw.description ?? '',
    category: raw.category ?? 'General',
    daysCount: raw.days_count ?? 0,
    enrolledCount: raw.enrolled_count ?? 0,
    coverImageUrl: raw.cover_image_url ?? '',
    days: (raw.days ?? []).map(mapDay),
  };
}

function getCacheEntry(locale: string): { data: Program[]; isStale: boolean } | null {
  const cached = cache.get(locale);
  if (!cached) {
    return null;
  }

  const age = Date.now() - cached.fetchedAt;

  if (age > STALE_TTL_MS) {
    cache.delete(locale);
    return null;
  }

  return {
    data: cached.data,
    // old code deleted the entry at 5 min and blocked on CMS every time
    isStale: age > FRESH_TTL_MS,
  };
}

function setCachedPrograms(locale: string, data: Program[]): void {
  cache.set(locale, { data, fetchedAt: Date.now() });
}

function dedupe(locale: string, fn: () => Promise<Program[]>): Promise<Program[]> {
  const existing = inflight.get(locale);
  if (existing) {
    return existing;
  }

  const promise = fn().finally(() => inflight.delete(locale));
  inflight.set(locale, promise);
  return promise;
}

function revalidate(locale: string): void {
  void dedupe(locale, async () => {
    try {
      const cmsData = await fetchProgramsFromCms(locale);
      setCachedPrograms(locale, cmsData.map(mapProgram));
      return cmsData.map(mapProgram);
    } catch {
      return [];
    }
  });
}

export async function getPrograms(locale: string = 'en'): Promise<Program[]> {
  const entry = getCacheEntry(locale);

  if (entry && !entry.isStale) {
    return entry.data;
  }

  if (entry?.isStale) {
    revalidate(locale);
    return entry.data;
  }

  const programs = await loadPrograms(locale);
  setCachedPrograms(locale, programs);
  return programs;
}

async function loadLocal(locale: string): Promise<Program[] | null> {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', `programs-${locale}.json`);
    const raw = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(raw) as CmsProgram[];
    return data.map(mapProgram);
  } catch {
    return null;
  }
}

async function loadFromCms(locale: string): Promise<Program[]> {
  const cmsData = await fetchProgramsFromCms(locale);
  return cmsData.map(mapProgram);
}

async function loadPrograms(locale: string): Promise<Program[]> {
  try {
    return await dedupe(locale, () => loadFromCms(locale));
  } catch (err) {
    console.warn(`CMS failed for locale "${locale}":`, (err as Error).message);
  }

  const local = await loadLocal(locale);
  if (local) {
    return local;
  }

  if (locale !== 'en') {
    console.log(`Falling back to English for locale "${locale}"`);
    // don't call loadPrograms('en') — that hits CMS again for no reason
    const english = await loadLocal('en');
    if (english) {
      return english;
    }
  }

  // old code had `return loadPrograms('en')` here when locale was already 'en'
  // → infinite loop if programs-en.json is missing
  throw new Error(`Failed to load programs for locale "${locale}"`);
}

// fixes at a glance:
// - video → videoUrl in mapDay
// - no more infinite recursion on en fallback
// - english fallback reads local json, doesn't re-enter CMS
// - stale cache kept around instead of nuking at 5 min
// - concurrent requests share one CMS fetch

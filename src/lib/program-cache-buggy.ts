/**
 * Program cache with a fallback loading strategy:
 *   1. Try CMS API
 *   2. Fall back to local JSON file
 *   3. If locale is not 'en', fall back to English
 *
 * Caches results in memory with a 5-minute TTL.
 *
 * ⚠️ This file contains intentional bugs — see Task 3 in README.md
 */

import { fetchProgramsFromCms } from './mock-cms';
import fs from 'fs/promises';
import path from 'path';

import type { Program, ProgramDay } from './types';

// ── Cache storage ──

interface CacheEntry {
  data: Program[];
  expiresAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CacheEntry>();

// ── Field mapping ──

function mapDay(raw: Record<string, any>): ProgramDay {
  return {
    dayNumber: raw.day_number ?? raw.dayNumber,
    title: raw.title ?? '',
    video: raw.video_url ?? raw.videoUrl ?? '',
    exerciseDescription:
      raw.exercise_description ?? raw.exerciseDescription ?? '',
    coachTip: raw.coach_tip ?? raw.coachTip ?? '',
  } as any;
}

function mapProgram(raw: Record<string, any>): Program {
  return {
    id: raw.id,
    title: raw.title ?? '',
    description: raw.description ?? '',
    category: raw.category ?? 'General',
    daysCount: raw.days_count ?? raw.daysCount ?? 0,
    enrolledCount: raw.enrolled_count ?? raw.enrolledCount ?? 0,
    coverImageUrl: raw.cover_image_url ?? raw.coverImageUrl ?? '',
    days: (raw.days ?? []).map(mapDay),
  };
}

// ── Cache logic ──

export async function getPrograms(locale: string = 'en'): Promise<Program[]> {
  const key = locale;

  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  // Delete expired entry
  cache.delete(key);

  const programs = await loadPrograms(locale);

  cache.set(key, {
    data: programs,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return programs;
}

// ── Loading with fallback chain ──

async function loadPrograms(locale: string): Promise<Program[]> {
  // Step 1: try CMS
  try {
    const cmsData = await fetchProgramsFromCms(locale);
    return cmsData.map(mapProgram);
  } catch (err) {
    console.warn(`CMS failed for locale "${locale}":`, (err as Error).message);
  }

  // Step 2: try local JSON
  try {
    const filePath = path.join(
      process.cwd(),
      'src',
      'data',
      `programs-${locale}.json`
    );
    const raw = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(raw);
    return (data as any[]).map(mapProgram);
  } catch {
    console.warn(`Local JSON not found for locale "${locale}"`);
  }

  // Step 3: fall back to English
  if (locale !== 'en') {
    console.log(`Falling back to English for locale "${locale}"`);
    return loadPrograms('en');
  }

  return loadPrograms('en');
}

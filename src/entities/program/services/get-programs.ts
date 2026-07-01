import fs from 'fs/promises';
import path from 'path';
import {
  fetchProgramsFromCms,
  getCachedPrograms,
  mapProgramsFromCms,
  setCachedPrograms,
} from '@/entities/program/lib';
import type { Program } from '@/entities/program/model';
import type { SupportedLocale } from '@/shared/lib';

async function loadLocalPrograms(locale: SupportedLocale): Promise<Program[] | null> {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', `programs-${locale}.json`);
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw) as Program[];
  } catch {
    return null;
  }
}

async function loadPrograms(locale: SupportedLocale): Promise<Program[]> {
  try {
    const cmsPrograms = await fetchProgramsFromCms(locale);
    return mapProgramsFromCms(cmsPrograms);
  } catch {
    const localPrograms = await loadLocalPrograms(locale);
    if (localPrograms) {
      return localPrograms;
    }

    if (locale !== 'en') {
      return loadPrograms('en');
    }

    throw new Error('Failed to load programs');
  }
}

export async function getProgramsByLocale(locale: SupportedLocale): Promise<Program[]> {
  const cached = getCachedPrograms(locale);
  if (cached) {
    return cached;
  }

  const programs = await loadPrograms(locale);
  setCachedPrograms(locale, programs);
  return programs;
}

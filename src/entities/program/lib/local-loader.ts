import fs from 'fs/promises';
import path from 'path';
import type { CmsProgram } from './cms-sdk';
import { mapProgramsFromCms } from './mapper';
import type { Program } from '@/entities/program/model';
import type { SupportedLocale } from '@/shared/lib';

export async function loadLocal(locale: SupportedLocale): Promise<Program[] | null> {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', `programs-${locale}.json`);
    const raw = await fs.readFile(filePath, 'utf-8');
    return mapProgramsFromCms(JSON.parse(raw) as CmsProgram[]);
  } catch {
    return null;
  }
}

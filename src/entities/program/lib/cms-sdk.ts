import fs from 'fs/promises';
import path from 'path';

export interface CmsProgram {
  id: number;
  title: string;
  description: string;
  category: string;
  days_count: number;
  enrolled_count: number;
  cover_image_url: string;
  days: CmsProgramDay[];
}

export interface CmsProgramDay {
  day_number: number;
  title: string;
  video_url: string;
  exercise_description: string;
  coach_tip: string;
}

export async function fetchProgramsFromCms(
  locale: string = 'en'
): Promise<CmsProgram[]> {
  await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 300));

  if (Math.random() < 0.2) {
    throw new Error('CMS unavailable (simulated downtime)');
  }

  const filePath = path.join(
    process.cwd(),
    'src',
    'data',
    `programs-${locale}.json`
  );

  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw) as CmsProgram[];
  } catch {
    throw new Error(`CMS: locale "${locale}" not found`);
  }
}

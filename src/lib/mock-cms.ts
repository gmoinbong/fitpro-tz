/**
 * Mock CMS client — simulates a remote headless CMS API.
 * Returns programs in snake_case format (as a real CMS would).
 * Randomly fails ~20% of the time to simulate downtime.
 */

import fs from 'fs/promises';
import path from 'path';

interface CmsProgram {
  id: number;
  title: string;
  description: string;
  category: string;
  days_count: number;
  enrolled_count: number;
  cover_image_url: string;
  days: CmsProgramDay[];
}

interface CmsProgramDay {
  day_number: number;
  title: string;
  video_url: string;
  exercise_description: string;
  coach_tip: string;
}

export async function fetchProgramsFromCms(
  locale: string = 'en'
): Promise<CmsProgram[]> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 300));

  // Simulate ~20% failure rate
  if (Math.random() < 0.2) {
    throw new Error(`CMS unavailable (simulated downtime)`);
  }

  const filePath = path.join(
    process.cwd(),
    'src',
    'data',
    `programs-${locale}.json`
  );

  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    const programs: CmsProgram[] = JSON.parse(raw);

    // CMS returns snake_case fields (simulate real CMS behavior)
    return programs.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      category: p.category,
      days_count: p.days_count ?? (p as any).daysCount,
      enrolled_count: p.enrolled_count ?? (p as any).enrolledCount ?? 0,
      cover_image_url:
        p.cover_image_url ?? (p as any).coverImageUrl ?? '',
      days: (p.days ?? []).map((d) => ({
        day_number: d.day_number ?? (d as any).dayNumber,
        title: d.title,
        video_url: d.video_url ?? (d as any).videoUrl ?? '',
        exercise_description:
          d.exercise_description ?? (d as any).exerciseDescription,
        coach_tip: d.coach_tip ?? (d as any).coachTip,
      })),
    }));
  } catch {
    throw new Error(`CMS: locale "${locale}" not found`);
  }
}

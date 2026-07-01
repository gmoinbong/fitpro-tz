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
    const programs: CmsProgram[] = JSON.parse(raw);

    return programs.map((program) => ({
      id: program.id,
      title: program.title,
      description: program.description,
      category: program.category,
      days_count: program.days_count ?? (program as { daysCount?: number }).daysCount ?? 0,
      enrolled_count:
        program.enrolled_count ?? (program as { enrolledCount?: number }).enrolledCount ?? 0,
      cover_image_url:
        program.cover_image_url ?? (program as { coverImageUrl?: string }).coverImageUrl ?? '',
      days: (program.days ?? []).map((day) => ({
        day_number: day.day_number ?? (day as { dayNumber?: number }).dayNumber ?? 0,
        title: day.title,
        video_url: day.video_url ?? (day as { videoUrl?: string }).videoUrl ?? '',
        exercise_description:
          day.exercise_description ??
          (day as { exerciseDescription?: string }).exerciseDescription ??
          '',
        coach_tip: day.coach_tip ?? (day as { coachTip?: string }).coachTip ?? '',
      })),
    }));
  } catch {
    throw new Error(`CMS: locale "${locale}" not found`);
  }
}

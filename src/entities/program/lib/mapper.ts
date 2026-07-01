import type { CmsProgram } from '@/entities/program/lib/cms-sdk';
import type { Program } from '@/entities/program/model';

export function mapProgramsFromCms(rows: CmsProgram[]): Program[] {
  return rows.map((row) => ({
    id: row.id,
    title: row.title ?? '',
    description: row.description ?? '',
    category: row.category ?? 'General',
    daysCount: row.days_count ?? 0,
    enrolledCount: row.enrolled_count ?? 0,
    coverImageUrl: row.cover_image_url ?? '',
    days: (row.days ?? []).map((day) => ({
      dayNumber: day.day_number ?? 0,
      title: day.title ?? '',
      videoUrl: day.video_url ?? '',
      exerciseDescription: day.exercise_description ?? '',
      coachTip: day.coach_tip ?? '',
    })),
  }));
}

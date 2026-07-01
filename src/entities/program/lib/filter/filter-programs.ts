import type { Program } from '@/entities/program/model';

export const PROGRAM_CATEGORIES = [
  'All',
  'Strength',
  'Cardio',
  'Yoga',
  'HIIT',
  'Flexibility',
] as const;

export type ProgramCategory = (typeof PROGRAM_CATEGORIES)[number];

export interface FilterProgramsOptions {
  query?: string;
  category?: ProgramCategory;
}

export function filterPrograms(
  programs: Program[],
  { query = '', category = 'All' }: FilterProgramsOptions = {},
): Program[] {
  const normalizedQuery = query.trim().toLowerCase();

  return programs.filter((program) => {
    const matchesCategory = category === 'All' || program.category === category;
    if (!matchesCategory) return false;

    if (!normalizedQuery) return true;

    const haystack = `${program.title} ${program.description}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}

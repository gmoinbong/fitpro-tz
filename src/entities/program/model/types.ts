export interface Program {
  id: number;
  title: string;
  description: string;
  category: string;
  daysCount: number;
  enrolledCount: number;
  coverImageUrl: string;
  days: ProgramDay[];
}

export interface ProgramDay {
  dayNumber: number;
  title: string;
  videoUrl: string;
  exerciseDescription: string;
  coachTip: string;
}

export type ProgramsResponse =
  | { ok: true; programs: Program[] }
  | { ok: false; error: string };
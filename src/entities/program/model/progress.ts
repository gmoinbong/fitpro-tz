export interface ProgramEnrollment {
  programId: number;
  enrolledAt: string;
  currentDay: number;
}

export interface UserProgress {
  version: 1;
  enrollments: Record<number, ProgramEnrollment>;
}

export const EMPTY_PROGRESS: UserProgress = {
  version: 1,
  enrollments: {},
};

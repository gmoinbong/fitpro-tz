import {
  EMPTY_PROGRESS,
  type ProgramEnrollment,
  type UserProgress,
} from '@/entities/program/model/progress';

const STORAGE_KEY = 'fitplan_program_progress';

function canUseStorage(): boolean {
  return typeof localStorage !== 'undefined';
}

function isEnrollment(value: unknown): value is ProgramEnrollment {
  if (!value || typeof value !== 'object') return false;
  const e = value as Record<string, unknown>;
  return (
    typeof e.programId === 'number' &&
    typeof e.enrolledAt === 'string' &&
    typeof e.currentDay === 'number'
  );
}

function isUserProgress(value: unknown): value is UserProgress {
  if (!value || typeof value !== 'object') return false;
  const p = value as Record<string, unknown>;
  if (p.version !== 1 || !p.enrollments || typeof p.enrollments !== 'object') {
    return false;
  }
  return Object.values(p.enrollments as Record<string, unknown>).every(isEnrollment);
}

export function loadProgress(): UserProgress {
  if (!canUseStorage()) {
    return EMPTY_PROGRESS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_PROGRESS;

    const parsed: unknown = JSON.parse(raw);
    if (!isUserProgress(parsed)) {
      console.warn('[progress-storage] corrupted data, resetting');
      localStorage.removeItem(STORAGE_KEY);
      return EMPTY_PROGRESS;
    }

    return parsed;
  } catch {
    console.warn('[progress-storage] failed to parse, resetting');
    localStorage.removeItem(STORAGE_KEY);
    return EMPTY_PROGRESS;
  }
}

export function saveProgress(progress: UserProgress): void {
  if (!canUseStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function getEnrollment(programId: number): ProgramEnrollment | null {
  return loadProgress().enrollments[programId] ?? null;
}

export function enroll(programId: number): ProgramEnrollment {
  const progress = loadProgress();
  const existing = progress.enrollments[programId];

  if (existing) {
    return existing;
  }

  const enrollment: ProgramEnrollment = {
    programId,
    enrolledAt: new Date().toISOString(),
    currentDay: 1,
  };

  saveProgress({
    ...progress,
    enrollments: { ...progress.enrollments, [programId]: enrollment },
  });

  return enrollment;
}

export function setCurrentDay(programId: number, day: number): ProgramEnrollment | null {
  const progress = loadProgress();
  const existing = progress.enrollments[programId];
  if (!existing) return null;

  const updated: ProgramEnrollment = { ...existing, currentDay: day };
  saveProgress({
    ...progress,
    enrollments: { ...progress.enrollments, [programId]: updated },
  });

  return updated;
}

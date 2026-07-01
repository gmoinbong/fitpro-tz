import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  enroll,
  getEnrollment,
  loadProgress,
  saveProgress,
  setCurrentDay,
} from './progress-storage';
import { EMPTY_PROGRESS } from '@/entities/program/model/progress';

const STORAGE_KEY = 'fitplan_program_progress';

function createStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    key(index: number) {
      return [...store.keys()][index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
  };
}

describe('progress-storage', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: createStorage(),
      configurable: true,
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('returns empty progress when key is missing', () => {
    expect(loadProgress()).toEqual(EMPTY_PROGRESS);
  });

  it('enrolls a program with day 1', () => {
    const enrollment = enroll(1);
    expect(enrollment.programId).toBe(1);
    expect(enrollment.currentDay).toBe(1);
    expect(enrollment.enrolledAt).toBeTruthy();
    expect(getEnrollment(1)).toEqual(enrollment);
  });

  it('does not duplicate enrollment', () => {
    const first = enroll(2);
    const second = enroll(2);
    expect(second).toEqual(first);
  });

  it('updates current day for enrolled program', () => {
    enroll(3);
    const updated = setCurrentDay(3, 4);
    expect(updated?.currentDay).toBe(4);
    expect(getEnrollment(3)?.currentDay).toBe(4);
  });

  it('returns null when setting day for unenrolled program', () => {
    expect(setCurrentDay(99, 2)).toBeNull();
  });

  it('resets on corrupted JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not-json');
    expect(loadProgress()).toEqual(EMPTY_PROGRESS);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('resets on invalid shape', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, enrollments: {} }));
    expect(loadProgress()).toEqual(EMPTY_PROGRESS);
  });

  it('persists via saveProgress', () => {
    const custom = {
      version: 1 as const,
      enrollments: {
        5: { programId: 5, enrolledAt: '2024-01-01', currentDay: 2 },
      },
    };
    saveProgress(custom);
    expect(loadProgress()).toEqual(custom);
  });
});

import { describe, expect, it } from 'vitest';
import { filterPrograms } from './filter-programs';
import type { Program } from '@/entities/program/model';

const programs: Program[] = [
  {
    id: 1,
    title: 'Strength Foundation',
    description: 'Build strength base',
    category: 'Strength',
    daysCount: 7,
    enrolledCount: 100,
    coverImageUrl: '',
    days: [],
  },
  {
    id: 2,
    title: 'Morning Yoga',
    description: 'Flexibility and calm',
    category: 'Yoga',
    daysCount: 5,
    enrolledCount: 50,
    coverImageUrl: '',
    days: [],
  },
  {
    id: 3,
    title: 'HIIT Blast',
    description: 'High intensity intervals',
    category: 'HIIT',
    daysCount: 4,
    enrolledCount: 200,
    coverImageUrl: '',
    days: [],
  },
];

describe('filterPrograms', () => {
  it('returns all programs for empty query and All category', () => {
    expect(filterPrograms(programs)).toHaveLength(3);
  });

  it('filters by search query in title', () => {
    expect(filterPrograms(programs, { query: 'yoga' })).toHaveLength(1);
    expect(filterPrograms(programs, { query: 'yoga' })[0]?.id).toBe(2);
  });

  it('filters by search query in description', () => {
    expect(filterPrograms(programs, { query: 'intervals' })).toHaveLength(1);
  });

  it('filters by category', () => {
    expect(filterPrograms(programs, { category: 'HIIT' })).toHaveLength(1);
    expect(filterPrograms(programs, { category: 'Strength' })[0]?.id).toBe(1);
  });

  it('combines query and category', () => {
    expect(
      filterPrograms(programs, { query: 'strength', category: 'Strength' }),
    ).toHaveLength(1);
    expect(
      filterPrograms(programs, { query: 'yoga', category: 'HIIT' }),
    ).toHaveLength(0);
  });
});

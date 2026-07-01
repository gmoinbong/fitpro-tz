import { describe, expect, it } from 'vitest';
import { mapProgramsFromCms } from './mapper';
import type { CmsProgram } from './cms-types';

const sampleCmsProgram: CmsProgram = {
  id: 1,
  title: 'Test Program',
  description: 'Desc',
  category: 'Strength',
  days_count: 2,
  enrolled_count: 100,
  cover_image_url: 'https://example.com/cover.jpg',
  days: [
    {
      day_number: 1,
      title: 'Day 1',
      video_url: 'https://example.com/v1.mp4',
      exercise_description: 'Do squats',
      coach_tip: 'Keep form tight',
    },
  ],
};

describe('mapProgramsFromCms', () => {
  it('maps snake_case CMS fields to camelCase Program shape', () => {
    const [program] = mapProgramsFromCms([sampleCmsProgram]);

    expect(program).toEqual({
      id: 1,
      title: 'Test Program',
      description: 'Desc',
      category: 'Strength',
      daysCount: 2,
      enrolledCount: 100,
      coverImageUrl: 'https://example.com/cover.jpg',
      days: [
        {
          dayNumber: 1,
          title: 'Day 1',
          videoUrl: 'https://example.com/v1.mp4',
          exerciseDescription: 'Do squats',
          coachTip: 'Keep form tight',
        },
      ],
    });
  });
});

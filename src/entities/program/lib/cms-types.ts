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

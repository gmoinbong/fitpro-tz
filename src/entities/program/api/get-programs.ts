import type { Program } from '@/entities/program/model/types';
import type { SupportedLocale } from '@/shared/lib/parse-locale';

type GetProgramsParams = {
  locale: SupportedLocale;
  auth: string;
};

export async function getPrograms({
  locale,
  auth,
}: GetProgramsParams): Promise<Program[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/programs?locale=${locale}`, {
    headers: {
      Authorization: auth,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to load programs (${response.status})`);
  }

  return response.json();
}

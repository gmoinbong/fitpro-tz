import type { Program } from '@/entities/program/model';
import { resolveLocale } from '@/shared/lib';

type PageProps = {
  searchParams: {
    locale?: string;
  };
};

type ProgramsResponse =
  | { ok: true; programs: Program[] }
  | { ok: false; error: string };

export default async function ProgramsPage({ searchParams }: PageProps) {
  const locale = resolveLocale(searchParams.locale);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/programs?locale=${locale}`,
    {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${process.env.PROGRAMS_SSR_TOKEN ?? 'dev-ssr-token'}`,
      },
    },
  );

  const result = (await res.json()) as ProgramsResponse;

  if (!res.ok || !result.ok) {
    return (
      <main>
        <h1>Programs</h1>
        <p>{'error' in result ? result.error : 'Failed to load programs'}</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Programs</h1>

      {result.programs.length === 0 ? (
        <p>No programs available</p>
      ) : (
        <ul>
          {result.programs.map((program) => (
            <li key={program.id}>{program.title}</li>
          ))}
        </ul>
      )}
    </main>
  );
}

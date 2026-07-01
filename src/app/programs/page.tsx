import { fetchPrograms } from '@/entities/program/api';
import { resolveLocale } from '@/shared/lib';

type PageProps = {
  searchParams: {
    locale?: string;
  };
};

export default async function ProgramsPage({ searchParams }: PageProps) {
  const locale = resolveLocale(searchParams.locale);
  const result = await fetchPrograms(locale);

  if (!result.ok) {
    return (
      <main>
        <h1>Programs</h1>
        <p>{result.error}</p>
      </main>
    );
  }

  if (result.programs.length === 0) {
    return (
      <main>
        <h1>Programs</h1>
        <p>No programs available</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Programs</h1>
      <ul>
        {result.programs.map((program) => (
          <li key={program.id}>{program.title}</li>
        ))}
      </ul>
    </main>
  );
}

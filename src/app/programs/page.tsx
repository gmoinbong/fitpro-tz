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
        <p>
          {result.status === 401
            ? 'Unauthorized. Send Authorization: Bearer <token> to access the catalog.'
            : result.error}
        </p>
      </main>
    );
  }

  return (
    <main>
      <ul>
        {result.programs.map((program) => (
          <li key={program.id}>{program.title}</li>
        ))}
      </ul>
    </main>
  );
}

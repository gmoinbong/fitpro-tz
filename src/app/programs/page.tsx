import { resolveLocale } from '@/shared/lib';
import { getPrograms } from '@/entities/program/api';

type PageProps = {
  searchParams: {
    locale?: string;
  };
};

export default async function ProgramsPage({ searchParams }: PageProps) {
  const locale = resolveLocale(searchParams.locale);
  const programs = await getPrograms(locale);

  return (
    <main>
      <ul>
        {programs.map((program) => (
          <li key={program.id}>{program.title}</li>
        ))}
      </ul>
    </main>
  );
}
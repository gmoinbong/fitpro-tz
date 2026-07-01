import { headers } from 'next/headers';
import { resolveLocale, validateAuthToken } from '@/shared/lib';
import { getPrograms } from '@/entities/program/api';

type PageProps = {
  searchParams: {
    locale?: string;
  };
};

export default async function ProgramsPage({ searchParams }: PageProps) {
  const locale = resolveLocale(searchParams.locale);
  const authHeader = (await headers()).get('authorization');
  const user = await validateAuthToken(authHeader);

  if (!user || !authHeader) {
    return (
      <main>
        <p>Please sign in.</p>
      </main>
    );
  }

  const programs = await getPrograms({ locale, auth: authHeader });

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
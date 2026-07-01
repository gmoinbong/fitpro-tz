import { notFound } from 'next/navigation';
import { fetchPrograms, ProgramDetail } from '@/entities/program';
import { getServerAuthToken, PAGE_STYLE, resolveLocale } from '@/shared/lib';
import { ErrorMessage } from '@/shared/ui';

type PageProps = {
  params: {
    programId: string;
  };
  searchParams: {
    locale?: string;
    day?: string;
  };
};

export default async function ProgramDetailPage({ params, searchParams }: PageProps) {
  const programId = Number.parseInt(params.programId, 10);
  if (Number.isNaN(programId)) {
    notFound();
  }

  const locale = resolveLocale(searchParams.locale);

  const result = await fetchPrograms(locale, {
    Authorization: `Bearer ${getServerAuthToken()}`,
  });

  if (!result.ok) {
    return (
      <main style={PAGE_STYLE}>
        <ErrorMessage message={result.error} />
      </main>
    );
  }

  const program = result.data.find((p) => p.id === programId);
  if (!program) {
    notFound();
  }

  return (
    <main style={PAGE_STYLE}>
      <ProgramDetail program={program} initialDay={searchParams.day} />
    </main>
  );
}

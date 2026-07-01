import { notFound } from 'next/navigation';
import { ProgramDetail, ProgramsResponse } from '@/entities/program';
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

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/programs?locale=${locale}`,
    {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${getServerAuthToken()}` },
    },
  );

  const result = (await res.json()) as ProgramsResponse;

  if (!res.ok || !result.ok) {
    const message =
      'error' in result ? result.error : 'Failed to load program';

    return (
      <main style={PAGE_STYLE}>
        <ErrorMessage message={message} />
      </main>
    );
  }

  const program = result.programs.find((p) => p.id === programId);
  if (!program) {
    notFound();
  }

  return (
    <main style={PAGE_STYLE}>
      <ProgramDetail program={program} initialDay={searchParams.day} />
    </main>
  );
}

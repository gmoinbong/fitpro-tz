import Link from 'next/link';
import { ProgramCatalog, ProgramsResponse } from '@/entities/program';
import { EmptyState, ErrorMessage } from '@/shared/ui';
import { getServerAuthToken, PAGE_STYLE, resolveLocale } from '@/shared/lib';

type PageProps = {
  searchParams: {
    locale?: string;
  };
};

export default async function ProgramsPage({ searchParams }: PageProps) {
  const locale = resolveLocale(searchParams.locale);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/programs?locale=${locale}`,
    {
      cache: 'no-store',
      headers: { Authorization:
        //  `        Bearer ${getServerAuthToken()}`
       
      },
    },
  );

  const result = (await res.json()) as ProgramsResponse;

  if (!res.ok || !result.ok) {
    const message =
      res.status === 401
        ? 'Unauthorized. Check your auth token.'
        : 'error' in result
          ? result.error
          : 'Failed to load programs';

    return (
      <main style={PAGE_STYLE}>
        <h1 style={{ margin: '0 0 16px', fontSize: 28 }}>Programs</h1>
        <ErrorMessage message={message} />
      </main>
    );
  }

  return (
    <main style={PAGE_STYLE}>
      <Link href="/" style={{ fontSize: 14, color: '#2563eb', textDecoration: 'none' }}>
        ← Home
      </Link>
      <h1 style={{ margin: '16px 0 8px', fontSize: 28 }}>Programs</h1>
      <p style={{ margin: '0 0 24px', color: '#666' }}>
        Browse workout programs and track your progress.
      </p>

      {result.programs.length === 0 ? (
        <EmptyState message="No programs available." />
      ) : (
        <ProgramCatalog programs={result.programs} />
      )}
    </main>
  );
}

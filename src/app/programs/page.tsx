import Link from 'next/link';
import { cookies } from 'next/headers';
import { fetchPrograms, ProgramCatalog } from '@/entities/program';
import { EmptyState, ErrorMessage } from '@/shared/ui';
import { getServerAuthToken, PAGE_STYLE, resolveLocale } from '@/shared/lib';
import { AuthTokenTestControls } from './auth-token-test-controls';

type PageProps = {
  searchParams: {
    locale?: string;
  };
};

export default async function ProgramsPage({ searchParams }: PageProps) {
  const locale = resolveLocale(searchParams.locale);
  const testToken = cookies().get('fitplan_auth_token')?.value;
  const headers: Record<string, string> =
    testToken !== undefined
      ? testToken === ''
        ? {}
        : { Authorization: `Bearer ${testToken}` }
      : { Authorization: `Bearer ${getServerAuthToken()}` };

  const result = await fetchPrograms(locale, headers);

  if (!result.ok) {
    return (
      <main style={PAGE_STYLE}>
        <AuthTokenTestControls />
        <h1 style={{ margin: '0 0 16px', fontSize: 28 }}>Programs</h1>
        <ErrorMessage message={result.error} />
      </main>
    );
  }

  return (
    <main style={PAGE_STYLE}>
      <AuthTokenTestControls />

      <Link href="/" style={{ fontSize: 14, color: '#2563eb', textDecoration: 'none' }}>
        ← Home
      </Link>
      <h1 style={{ margin: '16px 0 8px', fontSize: 28 }}>Programs</h1>
      <p style={{ margin: '0 0 24px', color: '#666' }}>
        Browse workout programs and track your progress.
      </p>

      {result.data.length === 0 ? (
        <EmptyState message="No programs available." />
      ) : (
        <ProgramCatalog programs={result.data} />
      )}
    </main>
  );
}

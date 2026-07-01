import { resolveLocale } from '@/shared/lib';

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
    },
  );

  const result = await res.json();

  if (!res.ok || !result.ok) {
    return (
      <main>
        <h1>Programs</h1>
        <p>{result?.error ?? 'Failed to load programs'}</p>
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
          {result.programs.map((p: any) => (
            <li key={p.id}>{p.title}</li>
          ))}
        </ul>
      )}
    </main>
  );
}
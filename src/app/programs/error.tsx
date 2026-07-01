'use client';

import { ErrorMessage } from '@/shared/ui';
import { PAGE_STYLE } from '@/shared/lib';

export default function ProgramsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main style={PAGE_STYLE}>
      <ErrorMessage
        message={error.message || 'Something went wrong'}
        onRetry={reset}
      />
    </main>
  );
}

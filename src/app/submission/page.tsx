import Link from 'next/link';

const page = { maxWidth: 720, margin: '40px auto', padding: '0 20px', lineHeight: 1.7, color: '#1f2937' };
const h2 = { margin: '32px 0 12px', fontSize: 24 };
const h3 = { margin: '24px 0 8px', fontSize: 20 };
const h4 = { margin: '16px 0 6px', fontSize: 16 };
const p = { margin: '0 0 12px' };
const ul = { margin: '0 0 16px', paddingLeft: 24 };
const hr = { margin: '24px 0', border: 0, borderTop: '1px solid #e5e7eb' };
const code = { padding: '2px 6px', borderRadius: 4, background: '#f3f4f6', fontSize: '0.9em' };
const pre = {
  margin: '0 0 16px',
  padding: '12px 16px',
  borderRadius: 6,
  background: '#f3f4f6',
  fontSize: '0.85em',
  overflowX: 'auto' as const,
  lineHeight: 1.5,
};

export default function SubmissionPage() {
  return (
    <main style={page}>
      <Link href="/" style={{ fontSize: 14, color: '#2563eb', textDecoration: 'none' }}>
        ← Home
      </Link>

      <h1 style={{ margin: '24px 0 16px', fontSize: 32 }}>FitPlan Test Assignment — Submission</h1>

      <h2 style={h2}>Tasks Completed</h2>
      <p style={p}>
        I completed <strong>Tasks 1, 2, and 3</strong> (Backend API, Frontend catalog &amp; day viewer,
        and Cache debugging).
      </p>
      <p style={p}>
        I left <strong>Task 4</strong> (payment webhooks) out of scope to stay within the suggested time
        budget. The first three tasks form a complete vertical slice covering the backend API, caching
        strategy, and frontend experience.
      </p>

      <hr style={hr} />

      <h2 style={h2}>Task 1 — Program Catalog API</h2>

      <h3 style={h3}>Key decisions</h3>

      <h4 style={h4}>Local-first on cold start</h4>
      <p style={p}>
        The assignment describes this endpoint as being on a hot path where users should not feel CMS
        latency or outages. Instead of blocking on the CMS and only falling back on failure,{' '}
        <code style={code}>getProgramsByLocale</code> serves the bundled local catalog immediately on a
        cache miss and triggers a background CMS revalidation.
      </p>
      <p style={p}>
        This allows the first request to avoid waiting for the CMS while subsequent requests benefit from
        refreshed CMS data whenever it becomes available.
      </p>

      <h4 style={h4}>Stale-while-revalidate</h4>
      <p style={p}>
        Cache entries remain <strong>fresh for 5 minutes</strong> and <strong>stale for up to 60 minutes</strong>.
      </p>
      <p style={p}>
        After the fresh window expires, cached data is still returned immediately while a background refresh
        updates the cache. This avoids forcing users to wait for the CMS every time the TTL expires.
      </p>

      <h4 style={h4}>In-flight deduplication</h4>
      <p style={p}>
        Concurrent requests for the same locale share a single CMS request through{' '}
        <code style={code}>dedupe()</code> in <code style={code}>inflight.ts</code>, preventing unnecessary
        duplicate work and reducing load during traffic bursts.
      </p>

      <h4 style={h4}>Fallback chain</h4>
      <p style={p}>The loading strategy is:</p>
      <pre style={pre}>{`CMS
    ↓
Local JSON (requested locale)
    ↓
English local JSON`}</pre>
      <p style={p}>
        The English fallback reads the local file directly without re-entering the CMS.
      </p>

      <h4 style={h4}>Authentication</h4>
      <p style={p}>
        <code style={code}>Authorization: Bearer &lt;token&gt;</code> is validated through{' '}
        <code style={code}>authenticateRequest()</code> in{' '}
        <code style={code}>shared/lib/firebase-auth.ts</code>.
      </p>

      <h4 style={h4}>CMS adapter</h4>
      <p style={p}>
        The CMS integration is isolated behind a small adapter, allowing the loading strategy to remain
        independent of the underlying CMS implementation.
      </p>

      <h3 style={h3}>Trade-offs</h3>
      <ul style={ul}>
        <li>
          Production code is organized into focused modules under{' '}
          <code style={code}>entities/program/lib/</code> instead of a single implementation file. This
          increases the number of files but keeps each responsibility independently testable.
        </li>
        <li>
          The API returns a consistent response shape (
          <code style={code}>{'{ ok: true, programs }'}</code> /{' '}
          <code style={code}>{'{ ok: false, error }'}</code>) instead of a bare array, simplifying frontend
          error handling.
        </li>
      </ul>

      <hr style={hr} />

      <h2 style={h2}>Task 2 — Program Catalog &amp; Day Viewer</h2>

      <h3 style={h3}>What was built</h3>
      <ul style={ul}>
        <li>
          <code style={code}>/programs</code>
          <ul style={ul}>
            <li>searchable catalog</li>
            <li>category filtering</li>
            <li>enrollment badges (<code style={code}>Continue · Day N</code>)</li>
          </ul>
        </li>
        <li>
          <code style={code}>/programs/[programId]</code>
          <ul style={ul}>
            <li>day-by-day viewer</li>
            <li>previous / next navigation</li>
            <li>day picker</li>
            <li>exercise description</li>
            <li>coach tip</li>
            <li>embedded video (or placeholder)</li>
          </ul>
        </li>
        <li>
          Enrollment and current progress persist in <code style={code}>localStorage</code> (
          <code style={code}>fitplan_program_progress</code>) and survive page reloads.
        </li>
        <li>
          API failures render <code style={code}>ErrorMessage</code>, while unexpected rendering errors are
          handled through <code style={code}>error.tsx</code>.
        </li>
        <li>Empty states are shown for missing search results.</li>
        <li>
          <code style={code}>AuthTokenTestControls</code> allow switching between valid, invalid, and missing
          authentication tokens during development.
        </li>
      </ul>
      <p style={p}>
        The catalog supports search and category filtering, while the day viewer keeps the selected day
        synchronized with the URL (<code style={code}>?day=</code>), allowing refreshes and deep links to
        preserve the current position.
      </p>

      <h3 style={h3}>Trade-offs</h3>
      <ul style={ul}>
        <li>
          The frontend consumes the public API instead of importing JSON directly, exercising the same
          authentication, caching, and response flow as a real client.
        </li>
        <li>
          Progress is only persisted after enrollment. Browsing program days before enrolling updates the
          URL but does not modify stored progress.
        </li>
        <li>
          Locale support exists on the API (<code style={code}>?locale=es</code>), although the UI currently
          does not expose a locale switcher.
        </li>
      </ul>

      <h3 style={h3}>With more time</h3>
      <ul style={ul}>
        <li>Add a locale switcher.</li>
        <li>Reduce the remaining duplication around authentication and locale handling across program pages.</li>
        <li>Add <code style={code}>loading.tsx</code> for streaming/Suspense.</li>
        <li>Improve client-side navigation to avoid full page reloads where appropriate.</li>
      </ul>

      <hr style={hr} />

      <h2 style={h2}>Task 3 — Cache Bug Fixes</h2>
      <p style={p}>
        The template in <code style={code}>src/lib/program-cache-buggy.ts</code> contained five intentional
        bugs.
      </p>
      <p style={p}>
        Below is what each bug affected and how it was fixed. The production implementation follows the
        corrected logic inside <code style={code}>entities/program/lib/</code>.
      </p>

      <h3 style={h3}>Bug 1 — Wrong field mapping</h3>
      <p style={p}><strong>Problem</strong></p>
      <p style={p}>
        <code style={code}>video_url</code> was mapped to <code style={code}>video</code> instead of{' '}
        <code style={code}>videoUrl</code>.
      </p>
      <p style={p}><strong>Impact</strong></p>
      <p style={p}>Videos were always missing from the API response.</p>
      <p style={p}><strong>Fix</strong></p>
      <p style={p}>Map the CMS field to:</p>
      <pre style={pre}>videoUrl: raw.video_url ?? &apos;&apos;</pre>

      <h3 style={h3}>Bug 2 — Cache removed after fresh TTL</h3>
      <p style={p}><strong>Problem</strong></p>
      <p style={p}>Cache entries were deleted after five minutes.</p>
      <p style={p}><strong>Impact</strong></p>
      <p style={p}>Every request after the fresh TTL waited for the CMS, defeating the purpose of caching.</p>
      <p style={p}><strong>Fix</strong></p>
      <p style={p}>
        Cache entries remain available for a stale period. Stale data is returned immediately while
        background revalidation refreshes the cache.
      </p>

      <h3 style={h3}>Bug 3 — Infinite recursion on English fallback</h3>
      <p style={p}><strong>Problem</strong></p>
      <p style={p}>
        When every loader failed for the English locale, the code called{' '}
        <code style={code}>loadPrograms(&apos;en&apos;)</code> again.
      </p>
      <p style={p}><strong>Impact</strong></p>
      <p style={p}>Potential stack overflow if the English catalog was unavailable.</p>
      <p style={p}><strong>Fix</strong></p>
      <p style={p}>
        Throw an error once every source has been exhausted, allowing the API route to return an appropriate
        failure response.
      </p>

      <h3 style={h3}>Bug 4 — English fallback re-entered the CMS</h3>
      <p style={p}><strong>Problem</strong></p>
      <p style={p}>
        The English fallback called <code style={code}>loadPrograms(&apos;en&apos;)</code>, causing another CMS
        request.
      </p>
      <p style={p}><strong>Impact</strong></p>
      <p style={p}>
        Extra latency and another chance of CMS failure when a local file was already available.
      </p>
      <p style={p}><strong>Fix</strong></p>
      <p style={p}>Load the English JSON directly without contacting the CMS again.</p>

      <h3 style={h3}>Bug 5 — Missing in-flight deduplication</h3>
      <p style={p}><strong>Problem</strong></p>
      <p style={p}>Concurrent requests for the same locale each triggered their own CMS request.</p>
      <p style={p}><strong>Impact</strong></p>
      <p style={p}>Unnecessary CMS load and thundering herd behaviour under burst traffic.</p>
      <p style={p}><strong>Fix</strong></p>
      <p style={p}>
        Share a single in-flight promise per locale using{' '}
        <code style={code}>dedupe(locale, fn)</code>.
      </p>

      <h3 style={h3}>Maintainability</h3>
      <p style={p}>The production implementation separates:</p>
      <ul style={ul}>
        <li>cache management</li>
        <li>loading strategy</li>
        <li>CMS integration</li>
        <li>background revalidation</li>
      </ul>
      <p style={p}>
        into focused modules. This keeps each responsibility independently testable while avoiding one large
        orchestration file.
      </p>
      <p style={p}>
        The loading strategy intentionally serves local data before contacting the CMS on a cold cache,
        followed by background revalidation. This prioritizes response time while still allowing the cache to
        converge toward fresh CMS data.
      </p>

      <hr style={hr} />

      <h2 style={h2}>Testing</h2>
      <p style={p}>Run:</p>
      <pre style={pre}>npm test</pre>
      <p style={p}>Tests cover:</p>
      <ul style={ul}>
        <li>authentication</li>
        <li>cache expiration</li>
        <li>stale-while-revalidate</li>
        <li>fallback behaviour</li>
        <li>CMS mapping</li>
        <li>client-side progress persistence</li>
      </ul>

      <hr style={hr} />

      <h2 style={h2}>What I&apos;d improve with more time</h2>
      <ul style={ul}>
        <li>
          Refine the shared data-fetching layer to eliminate the remaining duplication around authentication
          and locale handling.
        </li>
        <li>Add integration tests that exercise the real API routes without mocks.</li>
        <li>Add structured logging and metrics for cache hit/miss ratios and CMS failures.</li>
        <li>
          Implement <strong>Task 4</strong> (webhook signature verification and subscription state machine).
        </li>
      </ul>

      <hr style={hr} />

      <h2 style={h2}>Architecture</h2>
      <p style={p}>
        I intentionally kept the architecture lightweight and focused on the scope of the assignment.
      </p>
      <p style={p}>
        The project is organized around the <code style={code}>program</code> entity, separating API access,
        caching, CMS integration, persistence, and UI without introducing additional layers such as repositories
        or use cases.
      </p>
      <p style={p}>
        Throughout the implementation I preferred straightforward solutions over additional abstraction. New
        modules were introduced only when they removed duplicated responsibility or improved testability, rather
        than to satisfy a particular architectural pattern. This keeps the codebase easy to navigate while
        allowing each responsibility to evolve independently.
      </p>
    </main>
  );
}

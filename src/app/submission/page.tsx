import Link from 'next/link';

const page = { maxWidth: 720, margin: '40px auto', padding: '0 20px', lineHeight: 1.7, color: '#1f2937' };
const h2 = { margin: '32px 0 12px', fontSize: 24 };
const h3 = { margin: '20px 0 8px', fontSize: 18 };
const p = { margin: '0 0 12px' };
const ul = { margin: '0 0 16px', paddingLeft: 24 };
const hr = { margin: '24px 0', border: 0, borderTop: '1px solid #e5e7eb' };
const code = { padding: '2px 6px', borderRadius: 4, background: '#f3f4f6', fontSize: '0.9em' };

export default function SubmissionPage() {
  return (
    <main style={page}>
      <Link href="/" style={{ fontSize: 14, color: '#2563eb', textDecoration: 'none' }}>
        ← Home
      </Link>

      <h1 style={{ margin: '24px 0 16px', fontSize: 32 }}>FitPlan Test Assignment — Submission</h1>

      <h2 style={h2}>Tasks Completed</h2>
      <p style={p}>
        I completed Tasks 1, 2, and 3 (Backend API, Frontend catalog &amp; day viewer, and Cache
        debugging).
      </p>
      <p style={p}>
        I left Task 4 (payment webhooks) out of scope to stay within the suggested time budget. The
        first three tasks form a complete vertical slice covering the backend API, caching strategy,
        and frontend experience.
      </p>

      <hr style={hr} />

      <h2 style={h2}>Task 1 — Program Catalog API</h2>

      <h3 style={h3}>Key decisions</h3>
      <p style={p}>
        <strong>Local-first on cold start.</strong> The brief says the endpoint is on a hot path and
        users should not feel CMS latency or outages. Instead of blocking on CMS and falling back only
        on failure, <code style={code}>getProgramsByLocale</code> serves local JSON immediately on a
        cache miss, then triggers a background CMS revalidation.
      </p>
      <p style={p}>
        <strong>Stale-while-revalidate.</strong> Cache entries stay valid for 5 minutes (fresh) and up
        to 60 minutes (stale). After the fresh window, the API returns cached data instantly and
        refreshes from CMS in the background.
      </p>
      <p style={p}>
        <strong>In-flight deduplication.</strong> Concurrent requests for the same locale share one CMS
        fetch via <code style={code}>dedupe()</code> in <code style={code}>inflight.ts</code>.
      </p>
      <p style={p}>
        <strong>Fallback chain.</strong> CMS → local JSON for requested locale → English local JSON.
        English fallback reads the file directly without re-entering CMS.
      </p>
      <p style={p}>
        <strong>Auth.</strong> <code style={code}>Authorization: Bearer &lt;token&gt;</code> is
        validated through <code style={code}>authenticateRequest</code> in{' '}
        <code style={code}>shared/lib/firebase-auth.ts</code>.
      </p>
      <p style={p}>
        <strong>CMS adapter.</strong> The CMS integration was isolated behind a small adapter to keep
        the loading strategy independent from the underlying CMS implementation.
      </p>

      <h3 style={h3}>Trade-offs</h3>
      <ul style={ul}>
        <li>Production code lives in <code style={code}>entities/program/lib/</code> rather than a single file.</li>
        <li>Response shape uses <code style={code}>{'{ ok: true, programs: [...] }'}</code> for consistent error handling.</li>
      </ul>

      <hr style={hr} />

      <h2 style={h2}>Task 2 — Program Catalog &amp; Day Viewer</h2>

      <h3 style={h3}>What was built</h3>
      <ul style={ul}>
        <li><code style={code}>/programs</code> — searchable, filterable catalog with enrollment badges.</li>
        <li><code style={code}>/programs/[programId]</code> — day-by-day viewer with navigation, video, exercise, coach tip.</li>
        <li>Enrollment and current day persist in <code style={code}>localStorage</code> and survive reload.</li>
        <li>Error states, empty states, and auth token test controls on the catalog page.</li>
      </ul>
      <p style={p}>
        The catalog supports search and category filtering, while the day viewer keeps the current day
        synchronized with the URL so it survives refreshes and deep links.
      </p>

      <h3 style={h3}>Trade-offs</h3>
      <ul style={ul}>
        <li>
          The frontend consumes the public API instead of importing JSON directly, exercising the same
          authentication, caching, and response flow as a real client.
        </li>
        <li>Progress is saved only after enrollment.</li>
        <li>Locale support exists on the API (<code style={code}>?locale=es</code>) but no locale switcher in the UI yet.</li>
      </ul>

      <h3 style={h3}>With more time</h3>
      <ul style={ul}>
        <li>Locale switcher in the header.</li>
        <li>Unified auth token handling across catalog and detail pages.</li>
        <li><code style={code}>loading.tsx</code> for SSR suspense.</li>
      </ul>

      <hr style={hr} />

      <h2 style={h2}>Task 3 — Cache Bug Fixes</h2>
      <p style={p}>
        The template in <code style={code}>src/lib/program-cache-buggy.ts</code> had five intentional
        bugs. The same logic is implemented in <code style={code}>entities/program/lib/</code> for
        the live endpoint.
      </p>

      <h3 style={h3}>Bug 1 — Wrong field name in mapDay</h3>
      <p style={p}><strong>Problem:</strong> Mapped <code style={code}>video</code> instead of <code style={code}>videoUrl</code>.</p>
      <p style={p}><strong>Impact:</strong> Videos were always undefined in the API response.</p>
      <p style={p}><strong>Fix:</strong> Map to <code style={code}>videoUrl: raw.video_url ?? ''</code>.</p>

      <h3 style={h3}>Bug 2 — Cache deleted at fresh TTL</h3>
      <p style={p}><strong>Problem:</strong> Entry removed after 5 minutes, forcing every request to wait for CMS.</p>
      <p style={p}><strong>Impact:</strong> Users felt CMS latency on every request after 5 minutes.</p>
      <p style={p}><strong>Fix:</strong> Stale-while-revalidate — serve stale data, refresh in background.</p>

      <h3 style={h3}>Bug 3 — Infinite recursion on English fallback</h3>
      <p style={p}><strong>Problem:</strong> <code style={code}>return loadPrograms('en')</code> when locale was already en.</p>
      <p style={p}><strong>Impact:</strong> Stack overflow if <code style={code}>programs-en.json</code> was missing.</p>
      <p style={p}><strong>Fix:</strong> Throw an error when every source is exhausted.</p>

      <h3 style={h3}>Bug 4 — English fallback re-entered CMS</h3>
      <p style={p}><strong>Problem:</strong> Fallback called <code style={code}>loadPrograms('en')</code>, hitting CMS again.</p>
      <p style={p}><strong>Impact:</strong> Extra latency and another chance of CMS failure.</p>
      <p style={p}><strong>Fix:</strong> Call <code style={code}>loadLocal('en')</code> directly.</p>

      <h3 style={h3}>Bug 5 — Missing in-flight deduplication</h3>
      <p style={p}><strong>Problem:</strong> Concurrent requests triggered multiple CMS fetches for the same locale.</p>
      <p style={p}><strong>Impact:</strong> Unnecessary load and thundering herd under burst traffic.</p>
      <p style={p}><strong>Fix:</strong> Share a single in-flight promise per locale via <code style={code}>dedupe(locale, fn)</code>.</p>

      <hr style={hr} />

      <h2 style={h2}>Testing</h2>
      <p style={p}>
        Run <code style={code}>npm test</code> — tests cover authentication, cache expiration, fallback
        behavior, stale-while-revalidate, CMS mapping, and client-side progress persistence.
      </p>

      <hr style={hr} />

      <h2 style={h2}>What I&apos;d improve with more time</h2>
      <ol style={{ ...ul, listStyle: 'decimal' }}>
        <li>
          Refine the shared data-fetching layer to eliminate the remaining duplication around
          authentication and locale handling across program pages.
        </li>
        <li>Add integration tests that hit the real route without mocks.</li>
        <li>Structured logging and metrics for cache hit/miss and CMS failure rates.</li>
        <li>Task 4 — webhook signature verification and subscription state machine.</li>
      </ol>

      <hr style={hr} />

      <h2 style={h2}>Architecture</h2>
      <p style={p}>
        I kept the architecture intentionally lightweight. The project is organized around the program
        entity, separating API access, caching, CMS integration, persistence, and UI without introducing
        additional layers such as repositories or use cases. My goal was to keep responsibilities clear
        while avoiding unnecessary abstraction for a project of this size.
      </p>
    </main>
  );
}

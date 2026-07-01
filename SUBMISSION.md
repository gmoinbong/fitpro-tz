# FitPlan Test Assignment — Submission

## Tasks Completed

I completed **Tasks 1, 2, and 3** (Backend API, Frontend catalog, Cache debug).

Task 4 (payment webhooks) was left out of scope to stay within the suggested time budget and because the first three tasks form a coherent vertical slice: API → caching → UI with progress tracking.

---

## Task 1 — Program Catalog API

### Key decisions

**Local-first on cold start.** The brief says the endpoint is on a hot path and users should not feel CMS latency or outages. Instead of blocking on CMS and falling back only on failure, `getProgramsByLocale` serves local JSON immediately on a cache miss, then triggers a background CMS revalidation. First request is fast; subsequent requests benefit from fresh CMS data when it succeeds.

**Stale-while-revalidate.** Cache entries stay valid for 5 minutes (fresh) and up to 60 minutes (stale). After the fresh window, the API returns cached data instantly and refreshes from CMS in the background. This avoids blocking users on every TTL expiry.

**In-flight deduplication.** Concurrent requests for the same locale share one CMS fetch via `dedupe()` in `inflight.ts`, preventing thundering herd under load.

**Fallback chain.** CMS → local JSON for requested locale → English local JSON. English fallback reads the file directly without re-entering CMS.

**Auth.** `Authorization: Bearer <token>` is validated through `authenticateRequest` in `shared/lib/firebase-auth.ts` (moved from the template path for FSD-style layout).

### Trade-offs

- Production code lives in `entities/program/lib/` rather than a single file. More files, but each concern (cache, CMS, local loader, revalidation) is testable in isolation.
- `cms-sdk.ts` replaces the original `mock-cms.ts` filename; behavior is the same (200–500 ms delay, ~20% failure rate).
- Response shape uses `{ ok: true, programs: [...] }` instead of a bare array — makes error handling consistent on the frontend.

---

## Task 2 — Program Catalog & Day Viewer

### What was built

- `/programs` — searchable, filterable catalog with enrollment badges ("Continue · Day N").
- `/programs/[programId]` — day-by-day viewer with prev/next navigation, day picker, video, exercise description, and coach tip.
- Enrollment and current day persist in `localStorage` (`fitplan_program_progress`) and survive reload.
- Error states: API failures show `ErrorMessage`, `error.tsx` boundary with retry, empty states for no results.
- `AuthTokenTestControls` on the catalog page to manually test valid / invalid / missing tokens.

### Trade-offs

- Frontend fetches from `GET /api/programs` rather than importing JSON directly. This exercises the full stack and respects auth, but the UI depends on the API being up.
- Progress is saved only after enrollment; day navigation before enrolling updates the URL (`?day=`) but not storage.
- Locale support exists on the API (`?locale=es`) but there is no locale switcher in the UI yet.
- Program detail page uses the server-side SSR token; test cookie controls are only on the catalog page.

### With more time

- Locale switcher in the header.
- Unified auth token handling across catalog and detail pages.
- `loading.tsx` for SSR suspense.
- Client-side navigation without full page reload where possible.

---

## Task 3 — Cache Bug Fixes

The template in `src/lib/program-cache-buggy.ts` had five intentional bugs. Below is what each one broke and how it was fixed. The same logic is implemented in `entities/program/lib/` for the live endpoint.

### Bug 1 — Wrong field name in `mapDay`

**What was wrong:** Mapped `video: raw.video_url` instead of `videoUrl`.

**What it broke:** `ProgramDay` expects `videoUrl`. Videos were always `undefined` in the API response even when CMS/local JSON had `video_url`.

**Fix:** Map to `videoUrl: raw.video_url ?? ''`. Matches the contract in `entities/program/model/types.ts`.

### Bug 2 — Cache deleted at fresh TTL instead of going stale

**What was wrong:** `getCacheEntry` removed the entry when age exceeded 5 minutes, forcing every request to wait for CMS.

**What it broke:** Defeated the purpose of caching on a hot path. Users felt CMS latency on every request after 5 minutes.

**Fix:** Keep the entry until 60 minutes (stale TTL). Return `isStale: true` after 5 minutes. Serve stale data immediately and call `revalidate()` in the background.

### Bug 3 — Infinite recursion on English fallback

**What was wrong:** When all loaders failed for `locale === 'en'`, the code called `return loadPrograms('en')` again.

**What it broke:** Stack overflow / infinite loop if `programs-en.json` was missing or corrupt.

**Fix:** Throw `new Error(...)` when every source is exhausted. Fail fast with a clear 503 from the route handler.

### Bug 4 — English fallback re-entered CMS

**What was wrong:** Non-English locale fallback called `loadPrograms('en')`, which tried CMS again.

**What it broke:** Extra latency and another ~20% chance of failure when a simple local file read would work.

**Fix:** Call `loadLocal('en')` directly — skip CMS for the known-safe fallback.

### Bug 5 — No in-flight deduplication

**What was wrong:** Every concurrent request spawned its own CMS fetch.

**What it broke:** Under burst traffic, multiple slow CMS calls ran in parallel for the same locale, wasting resources and increasing failure surface.

**Fix:** `dedupe(locale, fn)` stores the in-flight promise in a `Map` and shares it across callers. Cleared in `.finally()`.

### Maintainability notes

- Splitting cache, loader, revalidation, and inflight into separate modules makes each piece unit-testable (`cache.test.ts`, `load-programs.test.ts`).
- Cold-start strategy in production (`load-programs.ts`) goes further than the original template: local JSON is served before CMS on first request, with background revalidation. This is intentional for the hot-path requirement.

---

## Testing

```bash
npm test
```

Covers auth on the route handler, cache TTL behavior, CMS fallback chain, English fallback without double CMS call, stale-while-revalidate, mapper output shape, and progress storage validation.

---

## What I'd improve with more time

1. Fix locale/auth consistency across all program pages.
2. Add integration tests that hit the real route without mocks.
3. Structured logging and metrics for cache hit/miss and CMS failure rates.
4. Task 4 — webhook signature verification and subscription state machine.

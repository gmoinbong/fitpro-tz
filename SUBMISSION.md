# FitPlan Test Assignment — Submission

## Tasks Completed

I completed Tasks 1, 2, and 3 (Backend API, Frontend catalog & day viewer, and Cache debugging).

I left Task 4 (payment webhooks) out of scope to stay within the suggested time budget. The first three tasks form a complete vertical slice covering the backend API, caching strategy, and frontend experience.

---

## Task 1 — Program Catalog API

### Key decisions

**Local-first on cold start.** The brief says the endpoint is on a hot path and users should not feel CMS latency or outages. Instead of blocking on CMS and falling back only on failure, `getProgramsByLocale` serves local JSON immediately on a cache miss, then triggers a background CMS revalidation. First request is fast; subsequent requests benefit from fresh CMS data when it succeeds.

**Stale-while-revalidate.** Cache entries stay valid for 5 minutes (fresh) and up to 60 minutes (stale). After the fresh window, the API returns cached data instantly and refreshes from CMS in the background. This avoids blocking users on every TTL expiry.

**In-flight deduplication.** Concurrent requests for the same locale share one CMS fetch via `dedupe()` in `inflight.ts`, preventing thundering herd under load.

**Fallback chain.** CMS → local JSON for requested locale → English local JSON. English fallback reads the file directly without re-entering CMS.

**Auth.** `Authorization: Bearer <token>` is validated through `authenticateRequest` in `shared/lib/firebase-auth.ts` (moved from the template path for FSD-style layout).

**CMS adapter.** The CMS integration was isolated behind a small adapter to keep the loading strategy independent from the underlying CMS implementation.

### Trade-offs

- Production code lives in `entities/program/lib/` rather than a single file. More files, but each concern (cache, CMS, local loader, revalidation) is testable in isolation.
- Response shape uses `{ ok: true, programs: [...] }` instead of a bare array — makes error handling consistent on the frontend.

---

## Task 2 — Program Catalog & Day Viewer

### What was built

- `/programs` — searchable, filterable catalog with enrollment badges ("Continue · Day N").
- `/programs/[programId]` — day-by-day viewer with prev/next navigation, day picker, video, exercise description, and coach tip.
- Enrollment and current day persist in `localStorage` (`fitplan_program_progress`) and survive reload.
- Error states: API failures show `ErrorMessage`, `error.tsx` boundary with retry, empty states for no results.
- `AuthTokenTestControls` on the catalog page to manually test valid / invalid / missing tokens.

The catalog supports search and category filtering, while the day viewer keeps the current day synchronized with the URL so it survives refreshes and deep links.

### Trade-offs

- The frontend consumes the public API instead of importing JSON directly, exercising the same authentication, caching, and response flow as a real client.
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

**Problem:** Mapped `video: raw.video_url` instead of `videoUrl`.

**Impact:** Videos were always `undefined` in the API response even when CMS/local JSON had `video_url`.

**Fix:** Map to `videoUrl: raw.video_url ?? ''`.

### Bug 2 — Cache deleted at fresh TTL instead of going stale

**Problem:** `getCacheEntry` removed the entry when age exceeded 5 minutes, forcing every request to wait for CMS.

**Impact:** Users felt CMS latency on every request after 5 minutes.

**Fix:** Keep the entry until 60 minutes (stale TTL). Return `isStale: true` after 5 minutes. Serve stale data immediately and call `revalidate()` in the background.

### Bug 3 — Infinite recursion on English fallback

**Problem:** When all loaders failed for `locale === 'en'`, the code called `return loadPrograms('en')` again.

**Impact:** Stack overflow if `programs-en.json` was missing or corrupt.

**Fix:** Throw `new Error(...)` when every source is exhausted. Fail fast with a clear 503 from the route handler.

### Bug 4 — English fallback re-entered CMS

**Problem:** Non-English locale fallback called `loadPrograms('en')`, which tried CMS again.

**Impact:** Extra latency and another ~20% chance of failure when a simple local file read would work.

**Fix:** Call `loadLocal('en')` directly — skip CMS for the known-safe fallback.

### Bug 5 — Missing in-flight deduplication

**Problem:** Concurrent requests triggered multiple CMS fetches for the same locale.

**Impact:** Unnecessary load and thundering herd under burst traffic.

**Fix:** Share a single in-flight promise per locale via `dedupe(locale, fn)`.

### Maintainability notes

- Splitting cache, loader, revalidation, and inflight into separate modules makes each piece unit-testable (`cache.test.ts`, `load-programs.test.ts`).
- Cold-start strategy in production (`load-programs.ts`) goes further than the original template: local JSON is served before CMS on first request, with background revalidation. This is intentional for the hot-path requirement.

---

## Testing

```bash
npm test
```

Tests cover authentication, cache expiration, fallback behavior, stale-while-revalidate, CMS mapping, and client-side progress persistence.

---

## What I'd improve with more time

1. Refine the shared data-fetching layer to eliminate the remaining duplication around authentication and locale handling across program pages.
2. Add integration tests that hit the real route without mocks.
3. Structured logging and metrics for cache hit/miss and CMS failure rates.
4. Task 4 — webhook signature verification and subscription state machine.

---

## Architecture

I kept the architecture intentionally lightweight. The project is organized around the program entity, separating API access, caching, CMS integration, persistence, and UI without introducing additional layers such as repositories or use cases. My goal was to keep responsibilities clear while avoiding unnecessary abstraction for a project of this size.

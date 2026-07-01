# FitPlan Test Assignment — Submission

## Tasks Completed

I completed **Tasks 1, 2, and 3** (Backend API, Frontend catalog & day viewer, and Cache debugging).

I left **Task 4** (payment webhooks) out of scope to stay within the suggested time budget. The first three tasks form a complete vertical slice covering the backend API, caching strategy, and frontend experience.

---

# Task 1 — Program Catalog API

## Key decisions

### Local-first on cold start

The assignment describes this endpoint as being on a hot path where users should not feel CMS latency or outages. Instead of blocking on the CMS and only falling back on failure, `getProgramsByLocale` serves the bundled local catalog immediately on a cache miss and triggers a background CMS revalidation.

This allows the first request to avoid waiting for the CMS while subsequent requests benefit from refreshed CMS data whenever it becomes available.

### Stale-while-revalidate

Cache entries remain **fresh for 5 minutes** and **stale for up to 60 minutes**.

After the fresh window expires, cached data is still returned immediately while a background refresh updates the cache. This avoids forcing users to wait for the CMS every time the TTL expires.

### In-flight deduplication

Concurrent requests for the same locale share a single CMS request through `dedupe()` in `inflight.ts`, preventing unnecessary duplicate work and reducing load during traffic bursts.

### Fallback chain

The loading strategy is:

```
CMS
    ↓
Local JSON (requested locale)
    ↓
English local JSON
```

The English fallback reads the local file directly without re-entering the CMS.

### Authentication

`Authorization: Bearer <token>` is validated through `authenticateRequest()` in `shared/lib/firebase-auth.ts`.

### CMS adapter

The CMS integration is isolated behind a small adapter, allowing the loading strategy to remain independent of the underlying CMS implementation.

## Trade-offs

* Production code is organized into focused modules under `entities/program/lib/` instead of a single implementation file. This increases the number of files but keeps each responsibility independently testable.
* The API returns a consistent response shape (`{ ok: true, programs }` / `{ ok: false, error }`) instead of a bare array, simplifying frontend error handling.

---

# Task 2 — Program Catalog & Day Viewer

## What was built

* `/programs`

  * searchable catalog
  * category filtering
  * enrollment badges (`Continue · Day N`)
* `/programs/[programId]`

  * day-by-day viewer
  * previous / next navigation
  * day picker
  * exercise description
  * coach tip
  * embedded video (or placeholder)
* Enrollment and current progress persist in `localStorage` (`fitplan_program_progress`) and survive page reloads.
* API failures render `ErrorMessage`, while unexpected rendering errors are handled through `error.tsx`.
* Empty states are shown for missing search results.
* `AuthTokenTestControls` allow switching between valid, invalid, and missing authentication tokens during development.

The catalog supports search and category filtering, while the day viewer keeps the selected day synchronized with the URL (`?day=`), allowing refreshes and deep links to preserve the current position.

## Trade-offs

* The frontend consumes the public API instead of importing JSON directly, exercising the same authentication, caching, and response flow as a real client.
* Progress is only persisted after enrollment. Browsing program days before enrolling updates the URL but does not modify stored progress.
* Locale support exists on the API (`?locale=es`), although the UI currently does not expose a locale switcher.

## With more time

* Add a locale switcher.
* Reduce the remaining duplication around authentication and locale handling across program pages.
* Add `loading.tsx` for streaming/Suspense.
* Improve client-side navigation to avoid full page reloads where appropriate.

---

# Task 3 — Cache Bug Fixes

The template in `src/lib/program-cache-buggy.ts` contained five intentional bugs.

Below is what each bug affected and how it was fixed. The production implementation follows the corrected logic inside `entities/program/lib/`.

## Bug 1 — Wrong field mapping

**Problem**

`video_url` was mapped to `video` instead of `videoUrl`.

**Impact**

Videos were always missing from the API response.

**Fix**

Map the CMS field to:

```ts
videoUrl: raw.video_url ?? ''
```

---

## Bug 2 — Cache removed after fresh TTL

**Problem**

Cache entries were deleted after five minutes.

**Impact**

Every request after the fresh TTL waited for the CMS, defeating the purpose of caching.

**Fix**

Cache entries remain available for a stale period. Stale data is returned immediately while background revalidation refreshes the cache.

---

## Bug 3 — Infinite recursion on English fallback

**Problem**

When every loader failed for the English locale, the code called `loadPrograms('en')` again.

**Impact**

Potential stack overflow if the English catalog was unavailable.

**Fix**

Throw an error once every source has been exhausted, allowing the API route to return an appropriate failure response.

---

## Bug 4 — English fallback re-entered the CMS

**Problem**

The English fallback called `loadPrograms('en')`, causing another CMS request.

**Impact**

Extra latency and another chance of CMS failure when a local file was already available.

**Fix**

Load the English JSON directly without contacting the CMS again.

---

## Bug 5 — Missing in-flight deduplication

**Problem**

Concurrent requests for the same locale each triggered their own CMS request.

**Impact**

Unnecessary CMS load and thundering herd behaviour under burst traffic.

**Fix**

Share a single in-flight promise per locale using `dedupe(locale, fn)`.

## Maintainability

The production implementation separates:

* cache management
* loading strategy
* CMS integration
* background revalidation

into focused modules. This keeps each responsibility independently testable while avoiding one large orchestration file.

The loading strategy intentionally serves local data before contacting the CMS on a cold cache, followed by background revalidation. This prioritizes response time while still allowing the cache to converge toward fresh CMS data.

---

# Testing

Run:

```bash
npm test
```

Tests cover:

* authentication
* cache expiration
* stale-while-revalidate
* fallback behaviour
* CMS mapping
* client-side progress persistence

---

# What I'd improve with more time

* Refine the shared data-fetching layer to eliminate the remaining duplication around authentication and locale handling.
* Add integration tests that exercise the real API routes without mocks.
* Add structured logging and metrics for cache hit/miss ratios and CMS failures.
* Implement **Task 4** (webhook signature verification and subscription state machine).

---

# Architecture

I intentionally kept the architecture lightweight and focused on the scope of the assignment.

The project is organized around the `program` entity, separating API access, caching, CMS integration, persistence, and UI without introducing additional layers such as repositories or use cases.

Throughout the implementation I preferred straightforward solutions over additional abstraction. New modules were introduced only when they removed duplicated responsibility or improved testability, rather than to satisfy a particular architectural pattern. This keeps the codebase easy to navigate while allowing each responsibility to evolve independently.

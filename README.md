# FitPlan — Full-Stack Developer Test Assignment

## About the Project

**FitPlan** is a fitness web app where users browse workout programs, enroll in them, and follow day-by-day training plans. Each program belongs to a category (Strength, Cardio, Yoga, HIIT, Flexibility), contains multiple days, and each day includes exercise descriptions, coach tips, and a video.

**Tech stack:** Next.js 14 (App Router), React, TypeScript, Firebase Auth, headless CMS, Vercel.

## How to Read This Assignment

These briefs are intentionally light on detail. We describe the goal and the constraints — the rest is up to you.

A big part of what we're evaluating is the judgment you bring: what you choose to handle, which trade-offs you make, what edge cases you anticipate, and what you'd consciously leave out of scope. There's no hidden checklist we're matching against, so make your reasoning visible (a few lines in the code or a short note is enough).

## What to Do

Choose **2 out of 4** tasks below. (you can do all 4)  There's no "right" pair — pick the two that play to your strengths.

**Time estimate:** ~3–4 hours total.
**Deadline:** 3 days from receiving this assignment.

---

### Task 1 — Backend: Program Catalog API

Build `GET /api/programs` — an endpoint that serves the workout program catalog.

The catalog comes from an external CMS. A mock CMS client is provided in `src/lib/mock-cms.ts` — treat it as a real remote API: it's slow and unreliable (it fails roughly 20% of the time). The same catalog is also available as local JSON in `src/data/` (`programs-en.json`, `programs-es.json`). This endpoint is hit often and sits on a hot path, so users should not feel the CMS's latency or its outages.

Constraints that define the contract:

- The endpoint is authenticated — validate the `Authorization: Bearer <token>` header using the helper in `src/lib/firebase-auth.ts`.
- It supports multiple locales via a `locale` query param (`en`, `es`).
- The CMS returns `snake_case` fields (`video_url`, `exercise_description`, `coach_tip`, `day_number`); the response must match the shape in `src/lib/types.ts`.

How you make it fast and resilient is your call.

---

### Task 2 — Frontend: Program Catalog & Day Viewer

Build a `/programs` experience where a user can browse the workout catalog, dig into a single program day by day, and track their own progress.

The data lives in `src/data/programs-en.json`. A user should be able to find a program (the catalog can get long), open it, move through the days and read each day's exercise description, coach tip, and video, then enroll and come back later to see where they left off — so their progress needs to survive a reload (client-side is fine).

Design is up to you; we value clarity and usability over decoration. We're interested in how the experience holds up beyond the happy path.

---

### Task 3 — Debug: Fix the Cache Logic

The file `src/lib/program-cache-buggy.ts` implements a caching layer with a fallback chain (CMS → local JSON → English fallback). It's broken — there are several intentional bugs.

Figure out what it's supposed to do, find the bugs, and fix them. For each one, briefly note what was wrong, what it breaks, and why your fix resolves it. If you see ways to make this code more robust or maintainable, mention them.

---

### Task 4 — Backend: Payment Webhook Handler

Build `POST /api/webhooks/payments` — the endpoint that receives payment events from a Stripe-like provider and updates the user's subscription state accordingly.

Events you need to handle:

| Event | Meaning |
|---|---|
| `subscription.created` | Subscription becomes active (plan name, start date) |
| `subscription.cancelled` | Subscription is cancelled (cancellation reason) |
| `payment.failed` | A charge failed |
| `payment.refunded` | A payment was refunded (refund amount) |

This is a public endpoint that moves money-related state on behalf of third-party calls you don't control — keep that in mind. Signatures arrive in the `x-webhook-signature` header as an HMAC-SHA256 of the raw request body, keyed with `WEBHOOK_SECRET` (dev default: `whsec_test_secret_key_123`). Subscription state can live in memory — see the `UserSubscription` type in `src/lib/types.ts`. Example payloads are in `src/data/webhook-examples.json`.

Decide for yourself what "correct and safe" means here, and what the provider should see in each case.

---

## Project Setup

```bash
npm install
npm run dev    # starts Next.js on http://localhost:3000
```

## Submission

Send us the project as an archive, together with a short write-up (a few paragraphs is plenty) covering:

- which two tasks you picked and why;
- the key decisions and trade-offs you made;
- what you'd improve or do differently with more time.

We're at least as interested in your reasoning as in the code itself.

Good luck!

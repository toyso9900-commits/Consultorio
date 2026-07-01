# Tasks: Fix Professional Ratings Flow

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~450 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (seed) → PR 2 (typed submission + form + patient prompt) → PR 3 (professional/admin reviews page) |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Seed deterministic admin, professional, patient, and completed appointment | PR 1 | Independent; run `npx prisma db seed` to verify |
| 2 | Refactor `submitReview` to typed error codes and surface them in `RatingForm`; verify patient dashboard prompt | PR 2 | Tight coupling between action return type and UI mapping |
| 3 | Implement server-rendered reviews list on `/profesional/dashboard/resenas` | PR 3 | Can rebase cleanly onto PR 2; depends on seed for manual verification |

## Phase 1: Foundation

- [x] 1.1 Extend `prisma/seed.ts` to create a deterministic admin, a validated professional with a complete `ProfessionalProfile`, a patient with a `PatientProfile`, and one past `COMPLETED` appointment without a review.
- [ ] 1.2 Add `ReviewErrorCode` and `SubmitReviewResult` types to `lib/reviews.ts`.

## Phase 2: Core Rating Logic

- [ ] 2.1 Refactor `submitReview` in `lib/reviews.ts` to return `{ success: true }` or `{ success: false; error: ReviewErrorCode }` with codes `NOT_FOUND`, `UNAUTHORIZED`, `APPOINTMENT_NOT_COMPLETED`, `ALREADY_REVIEWED`, and `INVALID_SCORE`.
- [ ] 2.2 Recompute the professional's average rating and review count inside the same Prisma transaction as `review.create` in `submitReview`.
- [ ] 2.3 Add `getReviewsForViewer(viewerId, role)` to `lib/reviews.ts`, returning reviews filtered by `professionalId` for professionals and unfiltered for admins.

## Phase 3: UI Feedback & Patient Prompt

- [ ] 3.1 Add translated error message keys for each `ReviewErrorCode` to `lib/i18n/dictionaries/es.ts` and `lib/i18n/dictionaries/en.ts`.
- [ ] 3.2 Update `components/rating/rating-form.tsx` to map returned error codes to dictionary keys and preserve the client-side 1–5 score guard.
- [ ] 3.3 Verify `app/paciente/dashboard/page.tsx` passes `getPendingReviewsForPatient` results to `RatingPrompt`; fix any prop or rendering regression.
- [ ] 3.4 Verify `components/rating/rating-prompt.tsx` correctly filters out submitted appointments via `onSubmitted` and does not hide prompts due to stale local state.

## Phase 4: Professional Reviews Page

- [ ] 4.1 Replace the empty state in `app/profesional/dashboard/resenas/page.tsx` with a server-rendered list using `getReviewsForViewer`, displaying rating, comment, patient name, and created date.
- [ ] 4.2 Add empty-state and list/table dictionary keys to `lib/i18n/dictionaries/es.ts` and `lib/i18n/dictionaries/en.ts` if missing.

## Phase 5: Verification

- [ ] 5.1 Run `npx prisma db reset` and `npx prisma db seed`, then confirm the three accounts and one `COMPLETED` appointment without a review exist.
- [ ] 5.2 Run `npm run typecheck` and `npm run lint`; fix any errors introduced by the refactor.
- [ ] 5.3 Manually verify the patient rating prompt, each error code path, successful review creation, average update, and `/profesional/dashboard/resenas` for both professional and admin roles.

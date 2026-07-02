# Proposal: Fix Professional Ratings Flow

## Intent

Patients cannot rate professionals because the end-to-end flow is not reachable in the current dev environment: the seed only creates an admin, rating errors are swallowed by generic messages, the patient dashboard prompt is unreliable, and professionals/admins have no page to see submitted reviews. This change unblocks testing the rating flow across the three roles with a minimal, focused slice.

## Scope

### In Scope
1. Extend `prisma/seed.ts` to create an admin, a validated professional with a complete `ProfessionalProfile`, a patient, and one `COMPLETED` appointment without a review.
2. Improve `RatingForm` error feedback by making `submitReview` in `lib/reviews.ts` return specific error codes and surfacing them in the UI.
3. Verify and fix the patient dashboard so the rating prompt appears for pending reviews (`getPendingReviewsForPatient` + prompt component).
4. Implement a minimal `/profesional/dashboard/resenas` page listing submitted reviews for professionals and admins.

### Out of Scope
- Renaming `proxy.ts` to `middleware.ts` or adding role middleware.
- Populating `/profesional/dashboard/validaciones`.
- New business rules (e.g., preventing completion of future appointments).
- Photo/calorie feature or theme configuration fixes.

## Actors and Roles

| Role | Concern |
|------|---------|
| Admin | Sees all reviews; validates professionals (still via existing `/profesional/dashboard` or `/usuarios`). |
| Professional | Completes seeded appointment; views reviews on `/profesional/dashboard/resenas`. |
| Patient | Receives rating prompt for the completed appointment and submits a review. |

## Capabilities

### New Capabilities
- `professional-ratings`: Per-appointment rating submission, specific error feedback, patient rating prompt, and professional/admin reviews list.

### Modified Capabilities
- None.

## Approach

1. **Seed**: Add deterministic test accounts and a `COMPLETED` appointment linked to the seeded patient and validated professional so the rating prompt renders immediately after `npx prisma db seed`.
2. **Server action**: Refactor `submitReview` to return typed error codes (`ALREADY_REVIEWED`, `APPOINTMENT_NOT_COMPLETED`, `UNAUTHORIZED`, `INVALID_SCORE`, `NOT_FOUND`) instead of a boolean.
3. **UI feedback**: Update `RatingForm` to map each code to a specific translated message using the existing i18n dictionaries.
4. **Dashboard prompt**: Audit `getPendingReviewsForPatient` usage in `app/paciente/dashboard/page.tsx` and the `RatingPrompt` component; fix any data-fetch or rendering issue that hides pending reviews.
5. **Reviews page**: Build `/profesional/dashboard/resenas` as a server-rendered list/table of `Review` rows visible to the professional who owns them and to admins.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `prisma/seed.ts` | Modified | Adds admin, professional, patient, and completed appointment. |
| `lib/reviews.ts` | Modified | `submitReview` returns specific error codes. |
| `components/rating/rating-form.tsx` | Modified | Displays specific error messages. |
| `app/paciente/dashboard/page.tsx` | Modified | Ensures rating prompt renders for pending reviews. |
| `components/rating/rating-prompt.tsx` | Modified | Fixed if rendering or data issue found. |
| `app/profesional/dashboard/resenas/page.tsx` | New | Minimal reviews list for professional/admin. |
| `lib/i18n/dictionaries/es.ts` | Modified | New error message strings. |
| `lib/i18n/dictionaries/en.ts` | Modified | New error message strings. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Seeded professional is not pre-validated, blocking the appointment flow. | Low | Seed sets `isValidated = true` and a complete `ProfessionalProfile`. |
| Existing `RatingPrompt` relies on client state that misses server data. | Med | Audit and switch to props from the server page when possible. |
| Next.js 16 middleware or auth quirks block the new page. | Low | Keep page as simple server component; verify `npm run build`. |

## Rollback Plan

1. Revert `prisma/seed.ts` to the previous version.
2. Revert `lib/reviews.ts` and `components/rating/rating-form.tsx`.
3. Remove `app/profesional/dashboard/resenas/page.tsx`.
4. Run `npx prisma db seed` again if seeded data changed.

## Dependencies

- Existing `Review` Prisma model and `ProfessionalProfile` validation fields.
- Existing `completeAppointment` action path is reused only via seeded data; no action changes required.

## Success Criteria

- [ ] `npx prisma db seed` creates the three test accounts and one `COMPLETED` appointment without a review.
- [ ] Patient dashboard shows the rating prompt for the seeded appointment.
- [ ] Submitting an invalid or duplicate rating shows a specific, translated error message.
- [ ] Submitting a valid rating creates the `Review` and updates the professional's average.
- [ ] `/profesional/dashboard/resenas` lists the submitted review for the professional and admin.
- [ ] `npm run build` and `npm run typecheck` pass.

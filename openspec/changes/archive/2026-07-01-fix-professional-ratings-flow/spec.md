# Fix Professional Ratings Flow — Specification

## Summary
Unblock the end-to-end professional rating flow by seeding test accounts and a completed appointment, returning specific error codes from `submitReview`, surfacing those errors in `RatingForm`, ensuring the patient dashboard prompts pending reviews, and adding a minimal reviews list page for professionals and admins.

## Requirements

### REQ-001 — Seed data enables rating flow out of the box
`prisma/seed.ts` MUST create an admin account, a validated professional with a complete `ProfessionalProfile`, a patient, and one `COMPLETED` appointment linked to both the patient and the professional without an existing review.

#### Scenario: Fresh database seed
- GIVEN an empty database
- WHEN `npx prisma db seed` runs
- THEN the three role accounts exist with deterministic credentials
- AND the professional has `isValidated = true`
- AND one `COMPLETED` appointment exists for the patient and professional with no review

### REQ-002 — `submitReview` returns specific error codes
`submitReview` in `lib/reviews.ts` MUST validate the request and return a typed result with one of the following error codes on failure: `ALREADY_REVIEWED`, `APPOINTMENT_NOT_COMPLETED`, `UNAUTHORIZED`, `INVALID_SCORE`, `NOT_FOUND`.

#### Scenario: Patient rates a completed appointment
- GIVEN a `COMPLETED` appointment without a review
- WHEN the authenticated patient submits a 1–5 star rating with an optional comment
- THEN a `Review` record is created
- AND the professional's average rating and review count are updated

#### Scenario: Patient tries to rate twice
- GIVEN an appointment that already has a review
- WHEN the patient submits another rating
- THEN `submitReview` returns `ALREADY_REVIEWED`

#### Scenario: Appointment is not completed
- GIVEN an appointment in a status other than `COMPLETED`
- WHEN the patient submits a rating
- THEN `submitReview` returns `APPOINTMENT_NOT_COMPLETED`

#### Scenario: Unauthorized user rates an appointment
- GIVEN a patient who is not the appointment's patient
- WHEN they submit a rating
- THEN `submitReview` returns `UNAUTHORIZED`

#### Scenario: Invalid score
- GIVEN a completed appointment without a review
- WHEN the patient submits a rating outside 1–5
- THEN `submitReview` returns `INVALID_SCORE`

### REQ-003 — `RatingForm` surfaces specific error messages
`RatingForm` MUST map each `submitReview` error code to a specific translated message from the active i18n dictionary and display it to the user.

#### Scenario: Duplicate review
- GIVEN the patient submits a duplicate rating
- WHEN `submitReview` returns `ALREADY_REVIEWED`
- THEN the form shows the translated `ALREADY_REVIEWED` message

#### Scenario: Rating an incomplete appointment
- GIVEN the patient submits a rating for an appointment that is not completed
- WHEN `submitReview` returns `APPOINTMENT_NOT_COMPLETED`
- THEN the form shows the translated `APPOINTMENT_NOT_COMPLETED` message

### REQ-004 — Patient dashboard shows pending rating prompt
`app/paciente/dashboard/page.tsx` MUST render the `RatingPrompt` for each appointment returned by `getPendingReviewsForPatient`.

#### Scenario: Pending review exists
- GIVEN a patient with a `COMPLETED` appointment without a review
- WHEN the patient dashboard loads
- THEN the rating prompt appears with the appointment details and rating form

#### Scenario: No pending reviews
- GIVEN a patient with no completed appointments without reviews
- WHEN the patient dashboard loads
- THEN the rating prompt is not rendered

### REQ-005 — Professional/admin reviews list page
`app/profesional/dashboard/resenas/page.tsx` MUST render a server-rendered list of `Review` rows. Professionals MUST see only reviews for themselves; admins MUST see all reviews.

#### Scenario: Professional views own reviews
- GIVEN an authenticated professional with at least one review
- WHEN they visit `/profesional/dashboard/resenas`
- THEN the page lists the reviews including rating, comment, and patient name

#### Scenario: Admin views all reviews
- GIVEN an authenticated admin
- WHEN they visit `/profesional/dashboard/resenas`
- THEN the page lists every review in the system

#### Scenario: No reviews
- GIVEN a professional or admin with no visible reviews
- WHEN they visit `/profesional/dashboard/resenas`
- THEN the page shows an empty-state message

## Data Model Changes

No Prisma schema changes are required. The existing `Review` model and `ProfessionalProfile` validation fields are reused. The implementation MUST ensure rating values are constrained to 1–5 at the action level.

## Error Cases and Messages

| Error Code | Meaning | UI Message Key |
|---|---|---|
| `ALREADY_REVIEWED` | The appointment already has a review. | `rating.errorAlreadyReviewed` |
| `APPOINTMENT_NOT_COMPLETED` | The appointment is not in `COMPLETED` status. | `rating.errorAppointmentNotCompleted` |
| `UNAUTHORIZED` | The current user is not the patient who owns the appointment. | `rating.errorUnauthorized` |
| `INVALID_SCORE` | The submitted score is outside 1–5. | `rating.errorInvalidScore` |
| `NOT_FOUND` | The appointment does not exist. | `rating.errorNotFound` |

## Acceptance Criteria

- [ ] `npx prisma db seed` creates the three test accounts and one `COMPLETED` appointment without a review.
- [ ] Patient dashboard shows the rating prompt for the seeded appointment.
- [ ] Submitting an invalid or duplicate rating shows a specific, translated error message.
- [ ] Submitting a valid rating creates the `Review` and updates the professional's average.
- [ ] `/profesional/dashboard/resenas` lists the submitted review for the professional and admin.
- [ ] `npm run build` and `npm run typecheck` pass.

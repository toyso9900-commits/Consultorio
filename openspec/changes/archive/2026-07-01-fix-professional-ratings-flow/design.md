# Design: Fix Professional Ratings Flow

## Technical Approach

Make the rating flow testable end-to-end from a fresh seed by:

1. Seeding a validated professional, a patient, and a past `COMPLETED` appointment with no review.
2. Refactoring `submitReview` to return typed error codes instead of opaque strings.
3. Updating `RatingForm` to translate each code via the existing i18n dictionaries.
4. Ensuring `RatingPrompt` receives server-fetched pending reviews and re-renders after submission.
5. Building `/profesional/dashboard/resenas` as a server-rendered list filtered by role.

No Prisma schema changes are required.

## Architecture Decisions

| Decision | Options | Tradeoffs | Choice |
|---|---|---|---|
| Error representation | `success | { error: ReviewErrorCode }` union vs `{ success: boolean; error?: string }` | Union gives callers exhaustiveness checking; string union keeps i18n mapping simple. | Discriminated union with a `ReviewErrorCode` string union. |
| Error code source | String union (`"ALREADY_REVIEWED"`) vs numeric enum | Strings serialize cleanly across server/client boundaries and map 1:1 to dictionary keys. | String union exported from `lib/reviews.ts`. |
| Reviews list data fetch | Inline `prisma.review.findMany` in page vs new `lib/reviews.ts` helper | A helper is reusable and keeps the page a thin view; inline is slightly less code. | New `getReviewsForViewer` helper in `lib/reviews.ts` for testability and reuse. |
| Professional average update | Recompute on every `submitReview` vs rely on aggregated queries | Recomputing avoids stale averages and is cheap for the current scale; aggregation is simpler but the dashboard currently expects a stored average. | Recompute and update `ProfessionalProfile` in the same transaction as `review.create`. |
| Seed determinism | Fixed emails/passwords vs env-driven | Fixed credentials are acceptable for local/dev seeds and match the acceptance flow. | Deterministic accounts with documented credentials. |

## Data Flow

### Rating submission

```
Patient dashboard (server)
  ├─ getPendingReviewsForPatient(patientId)
  │     └─ prisma.appointment.findMany({ status: COMPLETED, review: null })
  └─ renders RatingPrompt ──► RatingForm (client)
        ├─ client validates score 1..5
        ├─ submitReview(appointmentId, patientId, rating, comment) (server action)
        │     ├─ zod validates input
        │     ├─ prisma.appointment.findUnique({ include: { review: true } })
        │     ├─ checks existence → NOT_FOUND
        │     ├─ checks patientId match → UNAUTHORIZED
        │     ├─ checks status === COMPLETED → APPOINTMENT_NOT_COMPLETED
        │     ├─ checks existing review → ALREADY_REVIEWED
        │     └─ prisma.$transaction([review.create, profile.update])
        └─ on success: onSubmitted() removes prompt; on error: maps code → i18n message
```

### Reviews list

```
/profesional/dashboard/resenas (server)
  ├─ auth() → session.user.id + role
  ├─ getReviewsForViewer(userId, role)
  │     └─ prisma.review.findMany({ where: role === ADMIN ? {} : { professionalId: userId } })
  └─ renders table/card list
```

## File Changes

| File | Action | Description |
|---|---|---|
| `prisma/seed.ts` | Modify | Add deterministic admin, validated professional with `ProfessionalProfile`, patient with `PatientProfile`, and one past `COMPLETED` appointment without a review. |
| `lib/reviews.ts` | Modify | Add `ReviewErrorCode` union; refactor `submitReview` to return `{ success: true } \| { success: false; error: ReviewErrorCode }`; add `getReviewsForViewer`. |
| `components/rating/rating-form.tsx` | Modify | Map error codes to `dictionary.rating.error*` keys; keep existing client-side score guard. |
| `app/paciente/dashboard/page.tsx` | Modify | Verify `getPendingReviewsForPatient` result is passed to `RatingPrompt` (already present; confirm no regression). |
| `components/rating/rating-prompt.tsx` | Modify | No functional change expected unless audit reveals prop mismatch; keep client-side dismiss/submitted filtering. |
| `app/profesional/dashboard/resenas/page.tsx` | Modify | Replace empty state with server-rendered reviews list; query via `getReviewsForViewer`. |
| `lib/i18n/dictionaries/es.ts` | Modify | Add `rating.errorAlreadyReviewed`, `rating.errorAppointmentNotCompleted`, `rating.errorUnauthorized`, `rating.errorInvalidScore`, `rating.errorNotFound`. |
| `lib/i18n/dictionaries/en.ts` | Modify | Same error message keys in English. |

## Interfaces / Contracts

```ts
// lib/reviews.ts
export type ReviewErrorCode =
  | "ALREADY_REVIEWED"
  | "APPOINTMENT_NOT_COMPLETED"
  | "UNAUTHORIZED"
  | "INVALID_SCORE"
  | "NOT_FOUND";

export type SubmitReviewResult =
  | { success: true }
  | { success: false; error: ReviewErrorCode };

export async function submitReview(
  appointmentId: string,
  patientId: string,
  rating: number,
  comment?: string
): Promise<SubmitReviewResult>;

export async function getReviewsForViewer(
  viewerId: string,
  role: "ADMIN" | "PROFESSIONAL"
): Promise<
  {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
    patient: { name: string | null; image: string | null };
    professional: { name: string | null; image: string | null };
  }[]
>;
```

Dictionary additions under `rating`:

```ts
errorAlreadyReviewed: "Esta cita ya fue valorada.";
errorAppointmentNotCompleted: "La cita debe estar completada para valorar.";
errorUnauthorized: "No podés valorar esta cita.";
errorInvalidScore: "Seleccioná una calificación entre 1 y 5 estrellas.";
errorNotFound: "No se encontró la cita.";
```

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | `submitReview` validation branches and `getReviewsForViewer` filtering | Manual dev flow; no test runner available. |
| Integration | Seed creates expected rows; rating creates review and updates average | Run `npx prisma db seed`, then exercise UI manually. |
| Build/Type | No type errors or lint failures | `npm run typecheck` and `npm run lint`. |

## Migration / Rollout

No migration required. After applying the change, run `npx prisma db seed` to populate the deterministic test accounts and completed appointment.

## Risks and Rollback Plan

| Risk | Mitigation |
|---|---|
| Seeded professional not recognized as validated | Seed sets `isValidated: true` and a complete `ProfessionalProfile`. |
| `RatingPrompt` still hidden due to stale client state | Pass pending reviews from the server page; remove from local state only after successful submission. |
| Next.js 16 middleware/auth quirks on new page | Keep `/profesional/dashboard/resenas` a simple server component and verify `npm run build`. |
| Type mismatch after refactor | Update both `lib/reviews.ts` return type and `RatingForm` consumption in the same PR. |

Rollback:

1. Revert `prisma/seed.ts`.
2. Revert `lib/reviews.ts` and `components/rating/rating-form.tsx`.
3. Revert `app/profesional/dashboard/resenas/page.tsx`.
4. Revert dictionary changes.
5. Run `npx prisma db seed` again if seeded data changed.

## Open Questions

- None blocking. The middleware rename and validation page population are explicitly out of scope per the proposal.

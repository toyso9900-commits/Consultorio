# Landing Destacados + Subscription Status Specification

## Summary
Replace the hardcoded landing "Top 10 Expertos Destacados" with a DB-driven "Destacados" list ranked by active premium subscription, average rating, and review count. Keep subscription status consistent across `Subscription` and `ProfessionalProfile`, expose an active-subscription helper, and improve Destacado badges and rating stars in both the landing section and the Guía de Expertos.

## Requirements

### Functional

| ID | Requirement |
|----|-------------|
| F1 | The landing section title SHALL use the i18n key `landing.expertsTitle` renamed to "Destacados" / "Featured". |
| F2 | The landing Destacados list SHALL be loaded from the database, not from `MOCK_PROFESSIONALS`. |
| F3 | The Destacados query SHALL include only professionals whose `ProfessionalProfile.isValidated` is true and who have an active premium subscription. |
| F4 | Results SHALL be sorted by active subscription first, then average rating descending, then review count descending. |
| F5 | The list SHALL be limited to a configurable number (default 10). |
| F6 | Destacados cards SHALL display the professional photo, name, title, specialty, location, modality, price, a "Destacado" badge, and a star rating. |
| F7 | The simulated subscription activation flow SHALL keep `professionalProfile.isPremium` in sync with the active `Subscription` status. |
| F8 | A reusable helper `hasActiveSubscription(userId)` SHALL determine active status by checking `Subscription` plan `PREMIUM`, status `ACTIVE`, and non-expired `expiresAt`. |
| F9 | The Guía de Expertos SHALL show the average star rating and a "Destacado" badge for professionals who pass the active-subscription check. |
| F10 | All new UI strings SHALL be added to `es.ts` and `en.ts` dictionaries. |

### Non-Functional

| ID | Requirement |
|----|-------------|
| NF1 | The public landing query SHALL not expose private profile fields or inactive professionals. |
| NF2 | The implementation SHALL pass `npm run build`, `npm run typecheck`, and `npm run lint`. |
| NF3 | The slice SHOULD stay within the 400-line review budget; split into stacked PRs if it grows larger. |

## Scenarios

### Scenario: Visitor sees ranked Destacados on landing

- GIVEN the landing page is requested
- WHEN the server queries approved professionals with active premium subscriptions
- THEN the top 10 are rendered ordered by subscription, average rating, and review count
- AND each card shows the Destacado badge and star rating

### Scenario: Professional without active subscription is excluded

- GIVEN a validated professional exists with `isPremium` true but no active `Subscription` row
- WHEN the Destacados query runs
- THEN that professional is not returned

### Scenario: Subscription simulation activates premium status

- GIVEN a validated professional selects Premium in the simulator
- WHEN `activateSubscription` succeeds
- THEN a `PREMIUM` `ACTIVE` subscription row is created or updated
- AND `professionalProfile.isPremium` is set to true

### Scenario: Guía de Expertos highlights active subscribers

- GIVEN a patient opens the Guía de Expertos
- WHEN the list renders
- THEN professionals with active premium subscriptions show the Destacado badge and star rating
- AND non-subscribed professionals show neither

### Scenario: No Destacados available

- GIVEN no validated professional has an active premium subscription
- WHEN the landing section renders
- THEN it shows an empty-state message using i18n keys

## Data Model Changes

Add a minimal `Review` model to support ranking and future Slice 4 review submission:

```prisma
model Review {
  id             String   @id @default(cuid())
  appointmentId  String   @unique
  appointment    Appointment @relation(fields: [appointmentId], references: [id], onDelete: Cascade)
  professionalId String
  professional   User @relation("ProfessionalReviews", fields: [professionalId], references: [id], onDelete: Cascade)
  patientId      String
  patient        User @relation("PatientReviews", fields: [patientId], references: [id], onDelete: Cascade)
  rating         Int      // 1-5
  comment        String?  @db.Text
  createdAt      DateTime @default(now())
}
```

Extend `User` with relations:

```prisma
receivedReviews Review[] @relation("ProfessionalReviews")
givenReviews    Review[] @relation("PatientReviews")
```

No changes to `Subscription` or `ProfessionalProfile` schemas beyond keeping `isPremium` in sync via code.

## Server Actions / Queries

- `getFeaturedProfessionals(limit?: number)` — public server query returning approved, active-premium professionals with aggregated rating and review count.
- `hasActiveSubscription(userId: string)` — reusable helper querying `Subscription` with status, plan, and expiry checks.
- `activateSubscription(userId, planId)` — updated to also set `professionalProfile.isPremium = true` for paid plans and call `revalidatePath("/")`.

## UI/UX Notes

- Use the existing dictionary-based i18n layer; add keys under `landing` and `patientExperts`.
- Star ratings display the average as filled/partial stars and the review count in parentheses.
- The "Destacado" badge uses an accent color distinct from the specialty tag.
- Cards remain responsive: 1 column on mobile, 2 on sm, 3 on lg, 4 on xl.

## Affected Files

- `app/page.tsx`
- `lib/professionals.ts`
- `lib/professionals-db.ts`
- `lib/subscription.ts` (new)
- `app/profesional/dashboard/suscripcion/actions.ts`
- `app/paciente/dashboard/expertos/experts-client.tsx`
- `app/paciente/dashboard/expertos/page.tsx`
- `prisma/schema.prisma`
- `lib/i18n/dictionaries/es.ts`
- `lib/i18n/dictionaries/en.ts`
- `lib/i18n/dictionaries/index.ts`

## Out of Scope

- Real payment gateway (Stripe/Mercado Pago).
- Rating/review submission UI or post-appointment review flow (Slice 4).
- Appointment booking/request flow (Slice 3).
- Role-specific dashboard colors and layouts (Slice 4).

## Acceptance Criteria

- [ ] Landing "Destacados" renders only from the database.
- [ ] Excluded professionals: unvalidated, no active premium subscription, or expired subscription.
- [ ] Sort order matches subscription > rating > review count.
- [ ] `hasActiveSubscription` is used by both landing and Guía de Expertos.
- [ ] Subscription simulator updates `isPremium` consistently.
- [ ] Guía de Expertos cards show star ratings and Destacado badge.
- [ ] No hardcoded Spanish or English strings in new UI.
- [ ] `npm run build`, `npm run typecheck`, and `npm run lint` pass.

## Verification Approach

- Manual inspection of the landing page and Guía de Expertos.
- Create test professionals with varied subscription/rating states and confirm ordering.
- Run `npm run typecheck`, `npm run lint`, and `npm run build`.

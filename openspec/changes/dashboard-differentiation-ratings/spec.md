# Dashboard Differentiation + Ratings Specification (Slice 4)

## Summary
Differentiate the patient and professional dashboards with role-specific themes, real metrics, and charts. Add a per-appointment rating flow triggered when a professional marks an appointment as completed.

## Requirements

### REQ-001 — Patient dashboard uses emerald/teal wellness theme
The patient dashboard MUST use an emerald/teal accent palette and wellness-focused header.

#### Scenario: Patient opens dashboard
- GIVEN an authenticated patient on `/paciente/dashboard`
- WHEN the page renders
- THEN the header, stat icons, and quick actions use emerald/teal tones
- AND the greeting emphasizes wellness

### REQ-002 — Professional dashboard uses indigo/blue business theme
The professional dashboard MUST use an indigo/blue accent palette and business-focused header.

#### Scenario: Professional opens dashboard
- GIVEN an authenticated professional on `/profesional/dashboard`
- WHEN the page renders
- THEN the header, stat icons, and quick actions use indigo/blue tones
- AND the greeting emphasizes business management

### REQ-003 — Improved patient weight card and progress chart
The system MUST improve the "Peso actual" stat card and render a weight progress chart inside "Mi expediente".

#### Scenario: Patient views weight history
- GIVEN a patient with recorded weight entries
- WHEN the dashboard renders the "Mi expediente" section
- THEN the weight card shows current weight and a trend
- AND the chart plots weight over time

#### Scenario: Patient has no weight history
- GIVEN a patient with only one weight entry
- WHEN the chart renders
- THEN it shows the current value and an empty-state prompt to update weight

### REQ-004 — Professional engagement chart
The system MUST display an engagement chart on the professional dashboard (appointments over time or patient growth).

#### Scenario: Professional views dashboard
- GIVEN a professional with completed appointments
- WHEN the dashboard renders
- THEN a chart shows appointment count grouped by date over the last 30 days

### REQ-005 — "Próximas citas" card opens sorted appointments
The professional "Próximas citas" stat card MUST be clickable and open `/profesional/dashboard/citas` sorted by date/time.

#### Scenario: Professional clicks appointments card
- GIVEN a professional on the dashboard
- WHEN they click the "Próximas citas" card
- THEN the browser navigates to `/profesional/dashboard/citas`
- AND appointments are sorted by scheduled date/time ascending

### REQ-006 — Active patients count reflects paid subscription + active appointments
The "Pacientes activos" stat card MUST count only patients with an active paid subscription AND at least one active appointment.

#### Scenario: Professional has active patients
- GIVEN a professional with patients who have active subscriptions and confirmed/upcoming appointments
- WHEN the dashboard loads
- THEN the "Pacientes activos" card shows the distinct patient count

#### Scenario: Patient lacks subscription
- GIVEN a patient with an active appointment but no active paid subscription
- WHEN the dashboard loads
- THEN the patient is NOT counted as active

### REQ-007 — Real 5-star rating on professional dashboard
The "Valoraciones" stat card MUST display the professional's real average rating and review count.

#### Scenario: Professional has reviews
- GIVEN a professional with at least one review
- WHEN the dashboard loads
- THEN the "Valoraciones" card shows the average rating and total count

#### Scenario: Professional has no reviews
- GIVEN a professional with no reviews
- WHEN the dashboard loads
- THEN the card shows a zero/empty state

### REQ-008 — Replace "Horario de esta semana" stat card
The system MUST remove or replace the "Horario de esta semana" stat card with a meaningful business metric.

#### Scenario: Dashboard renders
- GIVEN the professional dashboard
- WHEN the stat cards render
- THEN "Horario de esta semana" is no longer shown
- AND a replacement metric (e.g., appointments this week or estimated revenue) is displayed

### REQ-009 — Professional "Clientes" view replaces conversation-only list
The system MUST change `/profesional/dashboard/clientes` to show a patient/client list with profile information, not only conversations.

#### Scenario: Professional opens client list
- GIVEN a professional on `/profesional/dashboard/clientes`
- WHEN the page loads
- THEN each row shows patient name, subscription status, last appointment, and action to message

#### Scenario: Message a client
- GIVEN a professional on the client list
- WHEN they click the message action
- THEN the browser navigates to `/profesional/dashboard/mensajes?paciente={id}`

### REQ-010 — Rating submission after appointment completion
The system MUST allow a patient to submit a 1–5 star rating and optional comment for a completed appointment.

#### Scenario: Patient rates a completed appointment
- GIVEN an appointment in `COMPLETED` status without a review
- WHEN the patient submits a 5-star rating and optional comment
- THEN a `Review` record is created
- AND the professional's rating is updated

#### Scenario: Patient tries to rate twice
- GIVEN an appointment that already has a review
- WHEN the patient submits another rating
- THEN the system rejects the request

### REQ-011 — Completing an appointment triggers a rating request
When a professional marks an appointment as `COMPLETED`, the system MUST make it eligible for patient rating.

#### Scenario: Professional completes appointment
- GIVEN a confirmed appointment
- WHEN the professional marks it complete
- THEN the status becomes `COMPLETED`
- AND the patient sees a prompt to rate the appointment

### REQ-012 — i18n for all new strings
All new UI strings introduced by this slice MUST be added to both `lib/i18n/dictionaries/es.ts` and `lib/i18n/dictionaries/en.ts`.

#### Scenario: Switch language
- GIVEN a user with language set to `en`
- WHEN viewing the new dashboard strings
- THEN labels, buttons, and empty states display in English

## Data Model Changes

Add a `WeightEntry` model to track patient weight history:

```prisma
model WeightEntry {
  id               String         @id @default(cuid())
  patientProfileId String
  patientProfile   PatientProfile @relation(fields: [patientProfileId], references: [id], onDelete: Cascade)
  weight           Float
  recordedAt       DateTime       @default(now())
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt

  @@index([patientProfileId, recordedAt])
}
```

Update `PatientProfile`:

```prisma
model PatientProfile {
  // ... existing fields
  weightEntries WeightEntry[]
}
```

The existing `Review` model already supports per-appointment ratings. Ensure rating values are constrained to 1–5 at the action level.

## Server Actions Needed

| Action | Purpose |
|---|---|
| `recordWeight(patientId, weight)` | Creates a `WeightEntry` when weight is set/updated. |
| `getWeightHistory(patientId)` | Returns weight entries ordered by `recordedAt` ascending. |
| `getProfessionalRating(professionalId)` | Returns `{ average, count }` from `Review` rows. |
| `submitReview(appointmentId, rating, comment?)` | Creates a `Review` for a completed appointment by the patient. |
| `getPendingReviewsForPatient(patientId)` | Returns completed appointments without a review. |
| `getProfessionalEngagementData(professionalId)` | Returns appointment counts grouped by date for the last 30 days. |
| `getActivePatients(professionalId)` | Returns distinct patients with active subscription + active appointment. |
| `completeAppointment(appointmentId)` | Update existing action to also trigger rating eligibility. |

## UI/UX Notes

- Patient dashboard: emerald/teal stat icons, wellness greeting, quick action to "Guía de Expertos".
- Professional dashboard: indigo/blue stat icons, business greeting, quick action to "Clientes".
- Weight chart: simple area/line chart in "Mi expediente" using Recharts.
- Engagement chart: bar chart of appointments over the last 30 days.
- Rating prompt: a dismissible card/modal on patient dashboard or `/paciente/dashboard/citas` for completed appointments without reviews.
- Client list: replace conversation-only rows with patient cards showing subscription status, next appointment, and message button.
- Sidebar: remove or demote "Mensajes" for professionals; keep "Clientes" as the primary patient list.

## Affected Files

| Path | Change |
|---|---|
| `prisma/schema.prisma` | Add `WeightEntry` model and relation. |
| `app/paciente/dashboard/page.tsx` | Apply emerald/teal theme, weight chart, quick actions. |
| `app/profesional/dashboard/page.tsx` | Apply indigo/blue theme, engagement chart, real rating/active counts, replace stat card. |
| `app/paciente/dashboard/perfil/actions.ts` | Call `recordWeight` on profile save. |
| `app/paciente/dashboard/onboarding-modal.tsx` | Call `recordWeight` on onboarding save. |
| `app/profesional/dashboard/clientes/page.tsx` | Replace conversation list with patient/client list. |
| `app/profesional/dashboard/mensajes/page.tsx` | Keep chat; remove from sidebar navigation. |
| `app/profesional/dashboard/citas/page.tsx` | Ensure sort by date/time; card click navigates here. |
| `app/profesional/dashboard/appointment-actions.ts` | `completeAppointment` triggers rating request. |
| `lib/appointments.ts` | Update `getAppointmentDashboardCounts` for active patient rule. |
| `lib/reviews.ts` (new) | Review queries and submission. |
| `lib/weight.ts` (new) | Weight history queries. |
| `components/dashboard/*` (new) | Reusable chart components. |
| `components/rating/*` (new) | Rating form/prompt components. |
| `components/layout/sidebar.tsx` | Update professional navigation. |
| `lib/i18n/dictionaries/es.ts` | New Spanish strings. |
| `lib/i18n/dictionaries/en.ts` | New English strings. |

## Out of Scope

- Complex analytics/reports beyond simple charts.
- Full CRM/patient management features.
- Email/push notifications for ratings.
- Real payment gateway integration.
- Admin dashboard redesign.

## Acceptance Criteria

- [ ] Patient dashboard uses emerald/teal wellness theme.
- [ ] Professional dashboard uses indigo/blue business theme.
- [ ] Weight progress chart renders in "Mi expediente".
- [ ] Professional engagement chart renders on dashboard.
- [ ] "Próximas citas" card navigates to sorted appointments list.
- [ ] "Pacientes activos" counts only patients with paid subscription + active appointment.
- [ ] "Valoraciones" shows real average rating and count.
- [ ] "Horario de esta semana" card is removed or replaced.
- [ ] `/profesional/dashboard/clientes` shows patient list with profile info and message action.
- [ ] Patient can submit a rating after an appointment is completed.
- [ ] Rating prompt appears after professional marks appointment complete.
- [ ] All new strings are translated in `es.ts` and `en.ts`.
- [ ] `npm run build`, `npm run typecheck`, and `npm run lint` pass.

## Verification Approach

1. Run `npm run typecheck` to validate new Prisma types and action signatures.
2. Run `npm run lint` to check new components and actions.
3. Run `npm run build` to confirm routes compile.
4. Manual checks:
   - Verify patient and professional dashboard themes and colors.
   - Add/update weight and confirm chart renders.
   - Complete an appointment as a professional and confirm rating prompt appears for the patient.
   - Submit a rating and confirm the professional dashboard reflects the new average.
   - Verify active patient count excludes patients without active subscriptions.
   - Switch language and confirm all new strings translate.

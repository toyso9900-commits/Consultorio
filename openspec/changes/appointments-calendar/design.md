# Design: Appointments + Calendar (Slice 3)

## Architecture Overview

Implement the appointment request/response lifecycle with Next.js App Router server components and server actions. Rename the existing `AppointmentStatus.PENDING` enum value to `REQUESTED` via a Prisma migration. Patient-facing surfaces use the existing emerald/teal wellness palette; professional surfaces continue with the indigo/blue business palette already present in the dashboard.

The calendar requirement is satisfied with a date-grouped list (simplest viable), not a full month/week grid.

## Data Model Changes

```prisma
enum AppointmentStatus {
  REQUESTED   // renamed from PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
}

model Appointment {
  ...
  status AppointmentStatus @default(REQUESTED)
  ...
}
```

A Prisma migration must rename the PostgreSQL enum value, update the column default, and backfill existing `PENDING` rows to `REQUESTED`.

## Server Actions

| Action | File | Signature | Behavior |
|---|---|---|---|
| `requestAppointment` | `app/paciente/dashboard/appointment-actions.ts` | `(input: { professionalId, scheduledAt, notes }) => Result` | Patient only; professional must be validated; `scheduledAt` must be future; notes max 500 chars. |
| `acceptAppointment` | `app/profesional/dashboard/appointment-actions.ts` | `(appointmentId) => Result` | Professional only; status must be `REQUESTED` → `CONFIRMED`. |
| `rejectAppointment` | `app/profesional/dashboard/appointment-actions.ts` | `(appointmentId) => Result` | Professional only; status must be `REQUESTED` → `CANCELLED`. |
| `cancelAppointment` | `app/profesional/dashboard/appointment-actions.ts` | `(appointmentId) => Result` | Either party; status must be `REQUESTED` or `CONFIRMED` → `CANCELLED`. |
| `completeAppointment` | `app/profesional/dashboard/appointment-actions.ts` | `(appointmentId) => Result` | Professional only; status must be `CONFIRMED` → `COMPLETED`. |
| `getAppointmentsForPatient` | `lib/appointments.ts` | `(patientId) => Appointment[]` | Returns patient appointments ordered by `scheduledAt` ASC, including related user names/images. |
| `getAppointmentsForProfessional` | `lib/appointments.ts` | `(professionalId) => Appointment[]` | Returns professional appointments ordered by `scheduledAt` ASC, including related user names/images. |
| `getAppointmentDashboardCounts` | `lib/appointments.ts` | `(userId, role) => Counts` | Upcoming `CONFIRMED` count; for professionals also distinct active patient count. |

All actions return `Result = { success: boolean; error?: string }`.

## Component List

| Component | Location | Purpose |
|---|---|---|
| `AppointmentRequestModal` | `components/appointments/appointment-request-modal.tsx` | Modal form for patients to request an appointment (date, time, notes). |
| `AppointmentCard` | `components/appointments/appointment-card.tsx` | Shared card showing status badge, scheduled date/time, counterparty name, and notes. |
| `AppointmentRequestList` | `components/appointments/appointment-request-list.tsx` | Professional list of `REQUESTED` appointments with Accept/Reject actions. |
| `DateGroupedAppointments` | `components/appointments/date-grouped-appointments.tsx` | Groups `CONFIRMED`/`COMPLETED` appointments by date. |

## Authorization Rules

| Action | Allowed if |
|---|---|
| `requestAppointment` | Authenticated `PATIENT`; target professional exists and `isValidated === true`; `scheduledAt` is in the future. |
| `cancelAppointment` | Session user is the appointment's `patientId` or `professionalId`; current status is `REQUESTED` or `CONFIRMED`. |
| `acceptAppointment` | Session user is the appointment's `professionalId`; current status is `REQUESTED`. |
| `rejectAppointment` | Session user is the appointment's `professionalId`; current status is `REQUESTED`. |
| `completeAppointment` | Session user is the appointment's `professionalId`; current status is `CONFIRMED`. |
| `getAppointmentsForPatient` | Session user matches `patientId`. |
| `getAppointmentsForProfessional` | Session user matches `professionalId`. |

## i18n Key Strategy

Add a top-level `appointments` namespace to both `es.ts` and `en.ts`:

- `appointments.request.title`, `appointments.request.date`, `appointments.request.time`, `appointments.request.notes`, `appointments.request.submit`, `appointments.request.success`
- `appointments.status.REQUESTED`, `appointments.status.CONFIRMED`, `appointments.status.CANCELLED`, `appointments.status.COMPLETED`
- `appointments.actions.accept`, `appointments.actions.reject`, `appointments.actions.cancel`, `appointments.actions.complete`
- `appointments.empty.patient`, `appointments.empty.professional`
- `appointments.errors.pastDate`, `appointments.errors.invalidTransition`, `appointments.errors.unauthorized`

## Affected Files

| File | Action | Description |
|---|---|---|
| `prisma/schema.prisma` | Modify | Rename `PENDING` → `REQUESTED`; update default. |
| `prisma/migrations/...` | Create | Migration for enum rename, default update, and backfill. |
| `lib/appointments.ts` | Create | Queries and dashboard count helpers. |
| `lib/appointments-status.ts` | Create | Internal status-transition guard. |
| `app/paciente/dashboard/appointment-actions.ts` | Create | Patient appointment actions. |
| `app/profesional/dashboard/appointment-actions.ts` | Create | Professional appointment actions. |
| `components/appointments/appointment-request-modal.tsx` | Create | Request form modal. |
| `components/appointments/appointment-card.tsx` | Create | Shared appointment card. |
| `components/appointments/appointment-request-list.tsx` | Create | Professional request list. |
| `components/appointments/date-grouped-appointments.tsx` | Create | Date-grouped list. |
| `app/profesional/[id]/page.tsx` | Modify | Enable "Agendar" button; open modal. |
| `app/paciente/dashboard/citas/page.tsx` | Modify | List real patient appointments. |
| `app/profesional/dashboard/citas/page.tsx` | Modify | Combine request list and date-grouped list. |
| `app/paciente/dashboard/page.tsx` | Modify | Real upcoming appointment count. |
| `app/profesional/dashboard/page.tsx` | Modify | Real upcoming appointment + active patient counts. |
| `app/profesional/dashboard/page.tsx` | Modify (optional) | Real admin "appointments this week" count. |
| `lib/i18n/dictionaries/es.ts` | Modify | Appointment strings. |
| `lib/i18n/dictionaries/en.ts` | Modify | Appointment strings. |

## Verification Approach

1. `npm run typecheck` — validate Prisma enum rename and action types.
2. `npm run lint` — check new components and actions.
3. `npm run build` — confirm routes compile.
4. Manual checks:
   - Request an appointment as a patient and verify `REQUESTED` status.
   - Try a past date and confirm validation error.
   - Accept/reject/complete as professional and verify status transitions.
   - Confirm dashboard stat cards reflect real counts.
   - Switch language and verify appointment labels translate.

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| PostgreSQL enum rename may fail if old default is not updated first. | Migration explicitly updates default value and backfills existing rows. |
| Status transition errors surface as generic failures. | Return specific i18n error keys (`invalidTransition`, `unauthorized`). |
| Professional and patient routes share similar appointment logic. | Keep queries in `lib/appointments.ts` and role-specific actions in separate files. |
| No automated tests; regressions possible. | Rely on build/typecheck/lint and manual scenario verification. |
| Review budget may be exceeded. | Split into chained PRs (schema+actions, patient UI, professional UI, dashboard counts+i18n). |

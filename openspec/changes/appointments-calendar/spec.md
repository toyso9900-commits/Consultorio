# Appointments + Calendar Specification (Slice 3)

## Summary
Enable patients to request appointments with professionals and let professionals review, accept, reject, and browse upcoming appointments. Replace hardcoded dashboard stat counts with real appointment data.

## Requirements

### REQ-001 — Appointment request from professional profile
The system MUST allow an authenticated patient to request an appointment from a validated professional's detail page or from the Guía de Expertos flow.

#### Scenario: Patient requests an appointment
- GIVEN an authenticated patient viewing a validated professional's profile
- WHEN the patient opens the request form, selects a future date and time, enters an optional reason, and submits
- THEN the system creates an `Appointment` with status `REQUESTED`
- AND the patient sees the new appointment in `/paciente/dashboard/citas`

#### Scenario: Request date is in the past
- GIVEN an authenticated patient requesting an appointment
- WHEN the selected date/time is in the past
- THEN the system rejects the request and returns a validation error

### REQ-002 — Appointment request form fields
The appointment request form MUST capture date, time, and an optional reason/note.

#### Scenario: Submitting a valid request
- GIVEN the request form is open
- WHEN the patient provides a future date, a time, and a 500-character note
- THEN the system accepts the input and creates the appointment

### REQ-003 — Professional appointment request list
The system MUST display a professional's incoming appointment requests sorted by scheduled date/time ascending.

#### Scenario: Professional reviews requests
- GIVEN a professional with at least one `REQUESTED` appointment
- WHEN the professional opens `/profesional/dashboard/citas`
- THEN the request list shows patient name, requested date/time, and reason in ascending order

### REQ-004 — Professional accept/reject
The system MUST allow a professional to change a `REQUESTED` appointment to `CONFIRMED` or `CANCELLED`.

#### Scenario: Professional confirms a request
- GIVEN a professional viewing a `REQUESTED` appointment
- WHEN the professional clicks Accept
- THEN the appointment status becomes `CONFIRMED`
- AND the patient sees the updated status

#### Scenario: Professional rejects an invalid state
- GIVEN an appointment already in `COMPLETED` status
- WHEN the professional attempts to reject it
- THEN the system rejects the action and returns an error

### REQ-005 — Professional upcoming appointments view
The system MUST show a professional's upcoming appointments in a calendar or date-grouped list view.

#### Scenario: Viewing upcoming appointments
- GIVEN a professional with confirmed upcoming appointments
- WHEN clicking "Próximas citas" on the dashboard
- THEN `/profesional/dashboard/citas` opens with appointments grouped by date

### REQ-006 — Patient appointment list
The system MUST display a patient's appointments in `/paciente/dashboard/citas` sorted by scheduled date/time ascending.

#### Scenario: Patient views appointments
- GIVEN a patient with requested and confirmed appointments
- WHEN opening `/paciente/dashboard/citas`
- THEN all appointments appear with status, date/time, professional name, and reason

### REQ-007 — Appointment statuses
The system MUST support `REQUESTED`, `CONFIRMED`, `CANCELLED`, and `COMPLETED` statuses.

#### Scenario: Lifecycle from request to completed
- GIVEN an appointment in `REQUESTED` status
- WHEN the professional confirms it and later marks it complete
- THEN the status transitions to `CONFIRMED` and then `COMPLETED`

### REQ-008 — Dashboard stat counts
The patient and professional dashboard stat cards MUST show real appointment counts.

#### Scenario: Dashboard reflects real data
- GIVEN a patient with two upcoming confirmed appointments
- WHEN the patient opens `/paciente/dashboard`
- THEN the "Próximas citas" card shows `2`

### REQ-009 — i18n for new strings
All new UI strings introduced by this slice MUST be added to `lib/i18n/dictionaries/es.ts` and `lib/i18n/dictionaries/en.ts`.

#### Scenario: Switching language
- GIVEN the user language is `en`
- WHEN viewing the appointment request form
- THEN labels and buttons display in English

## Data Model Changes

Rename the `AppointmentStatus` enum value from `PENDING` to `REQUESTED` in `prisma/schema.prisma`:

```prisma
enum AppointmentStatus {
  REQUESTED
  CONFIRMED
  CANCELLED
  COMPLETED
}
```

The existing `Appointment` model already contains `scheduledAt`, `status`, `notes`, `patientId`, and `professionalId`. A Prisma migration is required to update the enum and default value.

## Server Actions

- `requestAppointment(input: { professionalId, scheduledAt, notes })`
  - Validates the session is a patient, the professional is validated, and `scheduledAt` is in the future.
  - Creates an `Appointment` with status `REQUESTED`.
  - Revalidates `/paciente/dashboard/citas` and `/paciente/dashboard`.

- `respondToAppointment(appointmentId, status: "CONFIRMED" | "CANCELLED")`
  - Validates the session owns the appointment as the professional and the current status is `REQUESTED`.
  - Updates the status.
  - Revalidates `/profesional/dashboard/citas` and `/profesional/dashboard`.

- `completeAppointment(appointmentId)`
  - Validates the session owns the appointment as the professional and the current status is `CONFIRMED`.
  - Updates status to `COMPLETED`.
  - Revalidates professional and patient routes.

- `getPatientAppointments(patientId)` and `getProfessionalAppointments(professionalId)`
  - Return appointments ordered by `scheduledAt` ascending, including related user names and profiles.

- `getAppointmentDashboardCounts(userId, role)`
  - Returns upcoming appointment count and, for professionals, active patient count.

## UI/UX Notes

- Replace the disabled "Agendar" button on `/profesional/[id]` with an enabled action that opens a request form (modal or inline).
- Patient-facing surfaces use the emerald/teal wellness palette; professional-facing surfaces use the indigo/blue business palette.
- Appointment cards show a status badge, scheduled date/time, counterparty name, and notes.
- The professional request list includes Accept and Reject buttons with confirmation.
- `/profesional/dashboard/citas` combines a request list with a date-grouped upcoming-appointments list.
- `/paciente/dashboard/citas` lists all patient appointments sorted by date/time.

## Affected Files

| Path | Change |
|---|---|
| `prisma/schema.prisma` | Rename `PENDING` to `REQUESTED` in `AppointmentStatus`. |
| `app/profesional/[id]/page.tsx` | Enable appointment request action; add i18n keys. |
| `app/paciente/dashboard/citas/page.tsx` | List patient appointments with real data. |
| `app/paciente/dashboard/page.tsx` | Compute real upcoming appointment count. |
| `app/profesional/dashboard/citas/page.tsx` | List requests and upcoming appointments; add accept/reject. |
| `app/profesional/dashboard/page.tsx` | Compute real upcoming appointment and active patient counts. |
| `app/paciente/dashboard/appointment-actions.ts` (new) | Server actions for patient appointment requests. |
| `app/profesional/dashboard/appointment-actions.ts` (new) | Server actions for professional responses. |
| `lib/appointments.ts` (new) | Queries and dashboard count helpers. |
| `lib/i18n/dictionaries/es.ts` | Spanish appointment strings. |
| `lib/i18n/dictionaries/en.ts` | English appointment strings. |

## Out of Scope

- Real-time availability slots or complex scheduling rules.
- Payments for appointments.
- Notifications beyond existing Pusher chat.
- Rating/review submission after appointments (Slice 4).
- Admin dashboard stat updates beyond existing pages.

## Acceptance Criteria

- [ ] Patients can request appointments from professional profiles.
- [ ] Request form validates future date/time and optional notes length.
- [ ] Professionals see incoming requests sorted by date/time.
- [ ] Professionals can accept or reject requests.
- [ ] `/profesional/dashboard/citas` shows upcoming appointments grouped by date.
- [ ] `/paciente/dashboard/citas` shows patient appointments sorted by date/time.
- [ ] Statuses follow `REQUESTED` → `CONFIRMED` / `CANCELLED` → `COMPLETED`.
- [ ] Patient and professional dashboard stat cards show real counts.
- [ ] All new strings are translated in `es.ts` and `en.ts`.
- [ ] `npm run build`, `npm run typecheck`, and `npm run lint` pass.

## Verification Approach

1. Run `npm run typecheck` to validate Prisma enum rename and action types.
2. Run `npm run lint` to check new components and actions.
3. Run `npm run build` to confirm routes compile.
4. Manual checks:
   - Request an appointment as a patient and verify it appears with `REQUESTED` status.
   - Try a past date and confirm validation error.
   - Accept the request as the professional and confirm status changes to `CONFIRMED`.
   - Reject a request and confirm status changes to `CANCELLED`.
   - Verify dashboard stat cards reflect real counts.
   - Switch language to English and confirm appointment labels translate.

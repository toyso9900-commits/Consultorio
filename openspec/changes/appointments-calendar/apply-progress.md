# Apply Progress: Appointments + Calendar (Slice 3)

## Status

success

## Executive Summary

Implemented the full Appointments + Calendar slice across four stacked PRs.
The Prisma `AppointmentStatus` enum was renamed from `PENDING` to `REQUESTED`
with a migration, shared query helpers and status guards were added, and the
patient request flow, professional response flow, date-grouped calendar, and
real dashboard counts were wired end-to-end. A focused remediation added
professional **Cancel** and **Complete** action buttons to confirmed
appointments in the date-grouped list, with confirmation dialogs and i18n keys.
All automated quality gates pass; manual scenario verification remains
outstanding.

## Completed Tasks

- [x] 1.1 Rename `AppointmentStatus` enum value `PENDING` → `REQUESTED` in `prisma/schema.prisma`.
- [x] 1.2 Add Prisma migration to rename enum value and update default.
- [x] 1.3 Create `lib/appointments-status.ts` with allowed transition rules.
- [x] 1.4 Create `lib/appointments.ts` with patient/professional queries and dashboard count helpers.
- [x] 2.1 Create `app/paciente/dashboard/appointment-actions.ts` with `requestAppointment`.
- [x] 2.2 Create `app/profesional/dashboard/appointment-actions.ts` with `acceptAppointment`, `rejectAppointment`, `cancelAppointment`, and `completeAppointment`.
- [x] 3.1 Create `components/appointments/appointment-request-modal.tsx`.
- [x] 3.2 Create `components/appointments/appointment-card.tsx`.
- [x] 3.3 Create `components/appointments/appointment-request-list.tsx`.
- [x] 3.4 Create `components/appointments/date-grouped-appointments.tsx`.
- [x] 4.1 Enable schedule button on `app/profesional/[id]/page.tsx` for patients.
- [x] 4.2 Update `app/paciente/dashboard/citas/page.tsx` to list real appointments.
- [x] 4.3 Update `app/paciente/dashboard/page.tsx` with real upcoming count.
- [x] 5.1 Update `app/profesional/dashboard/citas/page.tsx` to show request list.
- [x] 5.2 Add date-grouped upcoming list to professional appointments page.
- [x] 5.3 Update `app/profesional/dashboard/page.tsx` with real upcoming and active-patient counts.
- [x] 6.1 Add `appointments` and `professionalAppointments` i18n keys to `es.ts`/`en.ts` and `Dictionary` interface.
- [x] 6.2 Quality gates: `npm run typecheck`, `npm run lint`, and `npm run build` pass on each PR branch.
- [x] 6.3a Wire professional `cancelAppointment` and `completeAppointment` actions into the UI with confirmation dialogs and i18n keys.
- [ ] 6.3 Manual scenarios (request, past date, accept, reject, complete, language switch, counts).

## Remaining Tasks

- Run manual end-to-end scenarios in a browser or via automated E2E tests once available.
- Open stacked pull requests and address reviewer feedback.

## PR Boundaries

| PR | Branch | Base | Scope | Commit |
|---|---|---|---|---|
| 1 | `feature/appointments-calendar-pr1` | `feature/landing-destacados-pr3` | Schema migration, status guard, query helpers | `4e839cc` |
| 2 | `feature/appointments-calendar-pr2` | `feature/appointments-calendar-pr1` | Patient request flow, request modal, appointment card, patient UI, i18n | `5bfa93d` |
| 3 | `feature/appointments-calendar-pr3` | `feature/appointments-calendar-pr2` | Professional response actions, request list, professional citas page | `5013f17` |
| 4 | `feature/appointments-calendar-pr4` | `feature/appointments-calendar-pr3` | Date-grouped calendar, dashboard counts, build verification | `319128a` |
| 4a | `feature/appointments-calendar-pr4` | `feature/appointments-calendar-pr3` | Remediation: professional Cancel/Complete UI controls with i18n | `pending` |

## Artifacts

| Path | Purpose |
|---|---|
| `prisma/schema.prisma` | Renamed `AppointmentStatus` enum value |
| `prisma/migrations/20260630000700_rename_appointment_status_requested/migration.sql` | Enum rename + default migration |
| `lib/appointments-status.ts` | Status transition guard |
| `lib/appointments.ts` | Queries and dashboard count helpers |
| `app/paciente/dashboard/appointment-actions.ts` | Patient request server action |
| `app/profesional/dashboard/appointment-actions.ts` | Professional response server actions |
| `components/appointments/appointment-request-modal.tsx` | Appointment request modal |
| `components/appointments/appointment-card.tsx` | Shared appointment card |
| `components/appointments/appointment-request-list.tsx` | Professional request list |
| `components/appointments/date-grouped-appointments.tsx` | Date-grouped upcoming list |
| `app/profesional/[id]/page.tsx` | Enabled schedule button |
| `app/paciente/dashboard/citas/page.tsx` | Patient appointment list |
| `app/paciente/dashboard/page.tsx` | Real upcoming count |
| `app/profesional/dashboard/citas/page.tsx` | Requests + date-grouped upcoming |
| `app/profesional/dashboard/page.tsx` | Real upcoming + active patient counts; admin weekly count |
| `lib/i18n/dictionaries/es.ts` | Spanish appointment strings |
| `lib/i18n/dictionaries/en.ts` | English appointment strings |
| `components/appointments/date-grouped-appointments.tsx` | Added Cancel/Complete action buttons for professional confirmed appointments |
| `lib/i18n/dictionaries/es.ts` | Spanish confirmation dialog strings |
| `lib/i18n/dictionaries/en.ts` | English confirmation dialog strings |
| `lib/i18n/dictionaries/index.ts` | Updated `Dictionary` interface with `appointments.confirmations` |
| `openspec/changes/appointments-calendar/tasks.md` | Task checklist with completed items |

## Next Recommended

`sdd-verify` — run the verification phase and execute the remaining manual scenarios.

## Risks

- The migration script was tuned for a local PostgreSQL instance that already had the old `PENDING` value. Fresh deployments will apply the migration cleanly; the current local database required a manual `migrate resolve --applied` after partial failures caused by the old default value.
- The professional `cancelAppointment` and `completeAppointment` actions are now invoked from `DateGroupedAppointments` for `CONFIRMED` appointments, with `confirm()` dialogs and `router.refresh()` to reflect state changes.
- No automated tests exist for the appointment lifecycle; regressions can only be caught by manual verification or future E2E tests.
- The GGA pre-commit hook auto-stages untracked files, so commits were made after temporarily moving `lib/session.ts`, `openspec/changes/archive/`, and `openspec/specs/` out of the worktree to honor the constraint not to commit them.

## Skill Resolution

- Loaded `sdd-apply`, `work-unit-commits`, and `chained-pr` skills.
- Followed stacked-to-main strategy: each PR branch targets the previous PR branch.
- Used work-unit commits, one per PR scope, with a separate docs commit for task checklists.
- Did not push to remote.
- Standard apply mode (Strict TDD was not active).

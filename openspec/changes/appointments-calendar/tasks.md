# Tasks: Appointments + Calendar (Slice 3)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~950–1150 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR1 Foundation → PR2 Patient → PR3 Professional → PR4 Calendar/dashboard |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | PR | Notes |
|------|------|-----|-------|
| 1 | Schema, migration, queries, status guard | PR1 | base `main` |
| 2 | Patient request flow | PR2 | needs PR1 |
| 3 | Professional response flow | PR3 | needs PR1 |
| 4 | Calendar, counts, build | PR4 | needs PR2, PR3 |

## Phase 1: Foundation

- [x] **1.1 Rename enum** — `prisma/schema.prisma` (~3). `PENDING`→`REQUESTED`, default `REQUESTED`. Deps: none. AC: four values.
- [x] **1.2 Add migration** — `prisma/migrations/...` (~50). Rename value, update default, backfill. Deps: 1.1. AC: clean apply.
- [x] **1.3 Status guard** — `lib/appointments-status.ts` (~40). Allowed transitions. Deps: none. AC: guards invalid.
- [x] **1.4 Queries** — `lib/appointments.ts` (~120). Patient/prof lists, dashboard counts. Deps: 1.1. AC: ordered results.

## Phase 2: Server Actions

- [x] **2.1 Patient request** — `app/paciente/dashboard/appointment-actions.ts` (~80). Validate patient, validated prof, future date, notes ≤500; revalidate. Deps: 1.4. AC: creates `REQUESTED`.
- [x] **2.2 Professional response** — `app/profesional/dashboard/appointment-actions.ts` (~130). Accept/reject/cancel/complete; authorize prof. Deps: 1.3, 1.4. AC: transitions match spec.

## Phase 3: Components

- [x] **3.1 Request modal** — `components/appointments/appointment-request-modal.tsx` (~120). Date/time/notes; submit via 2.1. Deps: 2.1. AC: opens from profile, rejects past dates.
- [x] **3.2 Appointment card** — `components/appointments/appointment-card.tsx` (~60). Badge, date/time, name, notes. Deps: none. AC: renders all statuses.
- [x] **3.3 Request list** — `components/appointments/appointment-request-list.tsx` (~100). `REQUESTED` list with Accept/Reject. Deps: 2.2, 3.2. AC: sorted; actions wired.
- [x] **3.4 Date-grouped list** — `components/appointments/date-grouped-appointments.tsx` (~80). Groups `CONFIRMED`/`COMPLETED` by date. Deps: 3.2. AC: groups/sorts.

## Phase 4: Patient UI

- [x] **4.1 Schedule button** — `app/profesional/[id]/page.tsx` (~15). Enable Agendar; open 3.1. Deps: 3.1. AC: patient can request.
- [x] **4.2 Appointments page** — `app/paciente/dashboard/citas/page.tsx` (~50). Real list via 3.2. Deps: 1.4, 3.2. AC: sorted by date/time.
- [x] **4.3 Dashboard count** — `app/paciente/dashboard/page.tsx` (~10). Real upcoming count. Deps: 1.4. AC: real value.

## Phase 5: Professional UI

- [x] **5.1 Requests page** — `app/profesional/dashboard/citas/page.tsx` (~60). Render 3.3. Deps: 2.2, 3.3. AC: requests visible.
- [x] **5.2 Upcoming grouping** — `app/profesional/dashboard/citas/page.tsx` (~30). Render 3.4 below requests. Deps: 3.4, 5.1. AC: grouped by date.
- [x] **5.3 Dashboard counts** — `app/profesional/dashboard/page.tsx` (~25). Real upcoming + active patients. Deps: 1.4. AC: real values.

## Phase 6: i18n & Verify

- [x] **6.1 Dictionary keys** — `lib/i18n/dictionaries/es.ts`, `en.ts` (~60). Appointments namespace. Deps: 3.1–5.3. AC: complete.
- [x] **6.2 Quality gates** — `npm run typecheck`, `lint`, `build`. Deps: all. AC: pass.
- [ ] **6.3 Manual scenarios** — Request, past date, accept, reject, complete, language switch, counts. Deps: all. AC: spec passes.

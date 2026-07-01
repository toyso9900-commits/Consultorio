# Archive Report: Dashboard Differentiation + Ratings (Slice 4)

**Change name:** `dashboard-differentiation-ratings`  
**Change title:** Dashboard Differentiation + Ratings  
**Slice:** 4  
**Final status:** ✅ COMPLETE  
**Archive date:** 2026-06-29  
**Archived to:** `openspec/changes/archive/2026-06-29-dashboard-differentiation-ratings/`  
**Artifact store mode:** OpenSpec + Engram  

---

## Summary of What Was Implemented

Slice 4 differentiated the patient and professional dashboards and introduced a per-appointment rating flow.

### Patient dashboard (emerald/teal wellness theme)
- Applied emerald/teal accent palette and wellness-focused copy.
- Replaced the static weight card with a real weight history chart in "Mi expediente".
- Added an inline weight entry form on the dashboard.
- Wired `recordWeight` into onboarding and profile save actions so every weight update creates a `WeightEntry`.
- Surfaced a dismissible `RatingPrompt` for completed-but-unreviewed appointments on `/paciente/dashboard` and `/paciente/dashboard/citas`.

### Professional dashboard (indigo/blue business theme)
- Applied indigo/blue accent palette and business-focused copy.
- Replaced the old "Horario de esta semana" card with a "Citas esta semana" metric.
- Added an engagement bar chart showing completed appointments over the last 30 days.
- Wired real counts for average rating, active patients, upcoming appointments, and weekly appointments.
- Made the "Próximas citas" stat card clickable, navigating to `/profesional/dashboard/citas` sorted by `scheduledAt` ascending.

### Client list and navigation
- Rewrote `/profesional/dashboard/clientes` from a conversation-only list to a patient list showing subscription status, last appointment, and a message action.
- Removed "Mensajes" from the professional sidebar; messaging remains reachable from the client list.

### Rating flow
- Extended `completeAppointment` to transition appointments to `COMPLETED` and revalidate patient paths.
- Added `submitReview` with Zod validation (1–5 stars), duplicate guard via unique `Review.appointmentId`, and status/authorization checks.
- Added `RatingForm` for star input + optional comment.

### Data layer
- Added `WeightEntry` model and Prisma migration.
- Added `lib/weight.ts`, `lib/reviews.ts`, and updated `lib/appointments.ts` with `getActivePatients`, `getProfessionalEngagementData`, and client helpers.

### i18n
- Added new `patientHome`, `professionalDashboard`, `professionalClients`, and `rating` keys to `es.ts` and `en.ts`, plus `rating` namespace exposure in `index.ts`.

---

## PR List

| PR | Branch | Base branch | Scope | Status |
|----|--------|-------------|-------|--------|
| 1 | `feature/dashboard-differentiation-ratings-pr1` | `feature/appointments-calendar-pr4` | Schema, data layer, role CSS variables | ✅ committed |
| 2 | `feature/dashboard-differentiation-ratings-pr2` | `feature/dashboard-differentiation-ratings-pr1` | Patient dashboard theme, weight chart, rating prompt | ✅ committed |
| 3 | `feature/dashboard-differentiation-ratings-pr3` | `feature/dashboard-differentiation-ratings-pr2` | Professional dashboard theme, engagement chart, real stats | ✅ committed |
| 4 | `feature/dashboard-differentiation-ratings-pr4` | `feature/dashboard-differentiation-ratings-pr3` | Rating form, client list, sidebar, i18n, verification | ✅ committed |

---

## Verification Result

**Status:** ✅ PASS

| Command | Result |
|---------|--------|
| `npm run typecheck` | ✅ PASS |
| `npm run lint` | ✅ PASS |
| `npm run build` | ✅ PASS (26/26 static routes generated) |

All 13 verification checklist items passed, including role themes, weight/engagement charts, real stat counts, client list rewrite, rating flow, and i18n coverage. No untracked files remained on the branch.

---

## Known Issues / Follow-ups

- **WeightEntry `notes` field:** The migration and `recordWeight` signature include an optional `notes` field not originally listed in the spec's data model. It is a harmless extension, but the main spec should document it explicitly if it is retained long-term.
- **`"use server"` in library modules:** `lib/weight.ts` and `lib/reviews.ts` use `"use server"` to prevent `pg` from being bundled into client components. Consider migrating to `server-only` or explicit server-action wrappers in a future refactor.
- **Active patient definition hardcodes `PREMIUM`:** If additional paid plans are introduced, update `getActivePatients` and related queries in `lib/appointments.ts`.
- **Migration deployment:** The dev DB required a reset due to checksum drift on a previous migration. Plan production migration ordering carefully.

---

## Lessons Learned

- Prisma `migrate dev` can detect checksum drift on previous migrations and require a dev DB reset before creating a new migration. Keep migrations under version control and deploy incrementally.
- Client components importing modules that transitively import `pg` can cause the PostgreSQL driver to be bundled for the browser. Marking the library module `"use server"` is a pragmatic short-term fix, but it couples data helpers to Next.js server-action semantics.
- A `WeightEntry` history table (rather than storing only the latest weight) enables trend charts with minimal extra UI complexity.
- Showing the rating prompt on both `/paciente/dashboard` and `/paciente/dashboard/citas` increases visibility without adding intrusive notifications.
- Replacing the professional "Horario de esta semana" card with "Citas esta semana" reuses existing data and keeps the dashboard actionable.

---

## Related Artifacts

### Engram observations
| Topic key | Observation ID | Purpose |
|-----------|----------------|---------|
| `sdd/dashboard-differentiation-ratings/spec` | #80 | Requirements and acceptance criteria |
| `sdd/dashboard-differentiation-ratings/design` | #81 | Architecture decisions and data flow |
| `sdd/dashboard-differentiation-ratings/tasks` | #82 | Implementation task plan |
| `sdd/dashboard-differentiation-ratings/apply-progress` | #83 | Apply phase progress and PR boundaries |
| `sdd/dashboard-differentiation-ratings/verify-report` | #85 | Verification results and compliance matrix |
| `sdd/dashboard-differentiation-ratings/archive-report` | (this report) | Final archive report |

### OpenSpec files (archived)
- `openspec/changes/archive/2026-06-29-dashboard-differentiation-ratings/spec.md`
- `openspec/changes/archive/2026-06-29-dashboard-differentiation-ratings/design.md`
- `openspec/changes/archive/2026-06-29-dashboard-differentiation-ratings/tasks.md`
- `openspec/changes/archive/2026-06-29-dashboard-differentiation-ratings/apply-progress.md`
- `openspec/changes/archive/2026-06-29-dashboard-differentiation-ratings/verify-report.md`
- `openspec/changes/archive/2026-06-29-dashboard-differentiation-ratings/archive-report.md`

---

## SDD Cycle Closure

All tasks complete, verification passed, and artifacts archived. The change is closed.

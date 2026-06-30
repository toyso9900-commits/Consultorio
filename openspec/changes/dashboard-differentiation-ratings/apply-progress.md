# Apply Progress: Dashboard Differentiation + Ratings (Slice 4)

**Change name**: `dashboard-differentiation-ratings`  
**Slice**: 4  
**Mode**: Standard (Strict TDD inactive; no test runner configured)  
**Artifact store**: OpenSpec + Engram  
**Start branch**: `feature/appointments-calendar-pr4`  
**Current branch**: `feature/dashboard-differentiation-ratings-pr3`

## Executive Summary

Completed PR 1 (foundation), PR 2 (patient dashboard differentiation), and PR 3 (professional dashboard differentiation). All dashboards now use role-specific themes, real metrics, and charts; the rating prompt and weight chart are live on the patient side, and the professional side shows real active-patient counts, average rating, weekly appointments, and an engagement bar chart.

## Completed Tasks

- [x] 1.1 Add `WeightEntry` model and migration
- [x] 1.2 Create weight helpers
- [x] 1.3 Create review helpers
- [x] 1.4 Update appointment helpers
- [x] 1.5 Add role CSS variables
- [x] 2.1 Theme patient dashboard
- [x] 2.2 Integrate weight chart
- [x] 2.3 Wire weight recording
- [x] 2.4 Add rating prompt
- [x] 3.1 Theme professional dashboard
- [x] 3.2 Engagement chart and card
- [x] 3.3 Real stat counts
- [x] 3.4 Clickable appointments card

## Remaining Tasks

- [ ] 4.1 Revalidate on completion
- [ ] 4.2 Rating form and submit
- [ ] 4.3 Rewrite client list
- [ ] 4.4 Update professional sidebar
- [ ] 5.1 Add i18n strings
- [ ] 5.2 Verify and close

## PR Boundaries

| PR | Branch | Base | Scope | Status |
|----|--------|------|-------|--------|
| 1 | `feature/dashboard-differentiation-ratings-pr1` | `feature/appointments-calendar-pr4` | Schema, helpers, role CSS | ✅ committed |
| 2 | `feature/dashboard-differentiation-ratings-pr2` | `feature/dashboard-differentiation-ratings-pr1` | Patient dashboard theme, weight chart, rating prompt | ✅ committed |
| 3 | `feature/dashboard-differentiation-ratings-pr3` | `feature/dashboard-differentiation-ratings-pr2` | Professional dashboard theme, engagement chart, real stats | ✅ committed |
| 4 | `feature/dashboard-differentiation-ratings-pr4` | `feature/dashboard-differentiation-ratings-pr3` | Rating form, client list, sidebar, i18n, verification | pending |

## Artifacts

| File | Action | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | Modify | Added `WeightEntry` model and `PatientProfile.weightEntries` relation |
| `prisma/migrations/20260630035337_add_weight_entry/migration.sql` | Create | Migration for `WeightEntry` table, index, and FK |
| `lib/weight.ts` | Create | `recordWeight`, `getWeightHistory` helpers (server actions) |
| `lib/reviews.ts` | Create | `getProfessionalRating`, `getPendingReviewsForPatient`, `submitReview` (server actions) |
| `lib/appointments.ts` | Modify | `getActivePatients`, `getProfessionalEngagementData`, updated dashboard counts, optional professional filter for weekly count |
| `app/globals.css` | Modify | Role CSS variables for emerald/teal and indigo/blue |
| `app/paciente/dashboard/page.tsx` | Modify | Emerald/teal theme, weight chart, weight entry form, rating prompt |
| `app/paciente/dashboard/citas/page.tsx` | Modify | Rating prompt, emerald icon theme |
| `app/paciente/dashboard/actions.ts` | Modify | Records `WeightEntry` on onboarding save |
| `app/paciente/dashboard/perfil/actions.ts` | Modify | Records `WeightEntry` on profile update |
| `app/paciente/dashboard/weight-entry-form.tsx` | Create | Inline weight entry form |
| `components/dashboard/weight-chart.tsx` | Create | Recharts area/line chart using role CSS variables |
| `components/rating/rating-prompt.tsx` | Create | Dismissible pending-review prompt with star input + comment |
| `app/profesional/dashboard/page.tsx` | Modify | Indigo/blue theme, engagement chart, real rating/active counts, clickable appointments card |
| `components/dashboard/engagement-chart.tsx` | Create | Recharts bar chart for completed appointments over last 30 days |
| `lib/i18n/dictionaries/es.ts` | Modify | New patient, rating, and professional dashboard strings |
| `lib/i18n/dictionaries/en.ts` | Modify | New patient, rating, and professional dashboard strings |
| `lib/i18n/dictionaries/index.ts` | Modify | Added `rating` namespace to `Dictionary` |

## Next Recommended

`sdd-apply` — continue with PR 4 (ratings, client list, sidebar, i18n, verification).

## Risks

- Prisma migration required a dev DB reset because the previous migration checksum drifted; production rollout will need careful migration ordering.
- `WeightEntry` uses `patientProfileId` per the design rather than `userId` as listed in the high-level scope, but an optional `notes` field was added to align with the scope note.
- `lib/weight.ts` and `lib/reviews.ts` were marked `"use server"` to prevent `pg` from being bundled into client components; this is a workaround that should be revisited if a `server-only` marker is adopted.

## Skill Resolution

- Loaded `sdd-apply`, `work-unit-commits`, and `chained-pr` skills.
- Standard mode (Strict TDD inactive because no test runner is configured).

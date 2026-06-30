# Apply Progress: Dashboard Differentiation + Ratings (Slice 4)

**Change name**: `dashboard-differentiation-ratings`  
**Slice**: 4  
**Mode**: Standard (Strict TDD inactive; no test runner configured)  
**Artifact store**: OpenSpec + Engram  
**Start branch**: `feature/appointments-calendar-pr4`  
**Current branch**: `feature/dashboard-differentiation-ratings-pr1`

## Executive Summary

Started the `sdd-apply` phase for Slice 4 and completed PR 1 (foundation). The `WeightEntry` model and migration were added, data-layer helpers for weight and reviews were created, appointment helpers were updated with real active-patient and engagement logic, and role-specific CSS variables were defined.

## Completed Tasks

- [x] 1.1 Add `WeightEntry` model and migration
- [x] 1.2 Create weight helpers
- [x] 1.3 Create review helpers
- [x] 1.4 Update appointment helpers
- [x] 1.5 Add role CSS variables

## Remaining Tasks

- [ ] 2.1 Theme patient dashboard
- [ ] 2.2 Integrate weight chart
- [ ] 2.3 Wire weight recording
- [ ] 2.4 Add rating prompt
- [ ] 3.1 Theme professional dashboard
- [ ] 3.2 Engagement chart and card
- [ ] 3.3 Real stat counts
- [ ] 3.4 Clickable appointments card
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
| 2 | `feature/dashboard-differentiation-ratings-pr2` | `feature/dashboard-differentiation-ratings-pr1` | Patient dashboard theme, weight chart, rating prompt | pending |
| 3 | `feature/dashboard-differentiation-ratings-pr3` | `feature/dashboard-differentiation-ratings-pr2` | Professional dashboard theme, engagement chart, real stats | pending |
| 4 | `feature/dashboard-differentiation-ratings-pr4` | `feature/dashboard-differentiation-ratings-pr3` | Rating form, client list, sidebar, i18n, verification | pending |

## Artifacts

| File | Action | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | Modify | Added `WeightEntry` model and `PatientProfile.weightEntries` relation |
| `prisma/migrations/20260630035337_add_weight_entry/migration.sql` | Create | Migration for `WeightEntry` table, index, and FK |
| `lib/weight.ts` | Create | `recordWeight` and `getWeightHistory` helpers |
| `lib/reviews.ts` | Create | `getProfessionalRating`, `getPendingReviewsForPatient`, `submitReview` |
| `lib/appointments.ts` | Modify | `getActivePatients`, `getProfessionalEngagementData`, updated dashboard counts |
| `app/globals.css` | Modify | Role CSS variables for emerald/teal and indigo/blue |

## Next Recommended

`sdd-apply` — continue with PR 2 (patient dashboard differentiation).

## Risks

- Prisma migration required a dev DB reset because the previous migration checksum drifted; production rollout will need careful migration ordering.
- `WeightEntry` uses `patientProfileId` per the design rather than `userId` as listed in the high-level scope, but an optional `notes` field was added to align with the scope note.

## Skill Resolution

- Loaded `sdd-apply`, `work-unit-commits`, and `chained-pr` skills.
- Standard mode (Strict TDD inactive because no test runner is configured).

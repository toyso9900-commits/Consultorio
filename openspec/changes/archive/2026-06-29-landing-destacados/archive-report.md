# Archive Report: Landing Destacados + Subscription Status

## Change Identity

| Field | Value |
|---|---|
| **Change name** | `landing-destacados` |
| **Title** | Landing Destacados + Subscription Status |
| **Slice** | 2 |
| **Final status** | ✅ Completed and archived |
| **Archive date** | 2026-06-29 |
| **Archived path** | `openspec/changes/archive/2026-06-29-landing-destacados/` |

## Summary of Implementation

Replaced the hardcoded landing "Top 10 Expertos Destacados" section with a database-driven "Destacados" list. Added a minimal `Review` model to support rating aggregation and future review submission. Introduced `hasActiveSubscription(userId)` as the single source of truth for active premium status, used it to filter the landing list and badge the Guía de Expertos, and kept `ProfessionalProfile.isPremium` in sync during simulated subscription activation. All new UI strings flow through the existing dictionary-based i18n layer.

Key deliverables:
- `Review` Prisma model, migration, and `User` relations.
- `lib/subscription.ts` with `hasActiveSubscription(userId)`.
- `lib/professionals-db.ts` with `getFeaturedProfessionals(limit)` and enriched `getApprovedProfessionals()` (batched subscription lookup, no N+1).
- `components/ui/star-rating.tsx` reusable partial-star component.
- DB-driven landing Destacados in `app/page.tsx` with empty state.
- Guía de Expertos badge + star ratings in `experts-client.tsx`.
- Simulated subscription activation syncs `ProfessionalProfile.isPremium` and revalidates `/`.
- i18n keys added to `es.ts`, `en.ts`, and dictionary interfaces.

## Pull Requests

| PR | Branch | Base | Scope | Status |
|---|---|---|---|---|
| PR 1 | `feature/landing-destacados-pr1` | `feature/theme-settings-pr7` | Schema, subscription helper, enriched queries, i18n keys | ✅ Committed |
| PR 2 | `feature/landing-destacados-pr2` | `feature/landing-destacados-pr1` | `StarRating` component, DB-driven landing, removal of `MOCK_PROFESSIONALS` | ✅ Committed |
| PR 3 | `feature/landing-destacados-pr3` | `feature/landing-destacados-pr2` | Guía de Expertos badge/ratings, subscription simulator sync | ✅ Committed |

Chain strategy: `stacked-to-main` with PRs based on `feature/theme-settings-pr7` (Slice 1 final branch).

## Verification Result

**Final verdict: PASS**

- `npm run typecheck`: ✅ Passed
- `npm run lint`: ✅ Passed
- `npm run build`: ✅ Passed

All 10 implementation tasks completed. The initial verification raised an N+1 WARNING in `getFeaturedProfessionals` and `getApprovedProfessionals`; remediation replaced per-professional `hasActiveSubscription` calls with a batched `prisma.subscription.findMany` query and an in-memory `Set`. Re-verification after remediation confirmed the N+1 was eliminated and all quality gates still pass.

Spec compliance: 12/12 requirements fully compliant (F1–F10, NF1–NF2).

## Known Issues / Follow-ups

- **No automated tests**: The project has no test runner; spec scenarios were verified by static/manual inspection and build evidence. Automated coverage is recommended before Slice 4.
- **Pending live smoke-test**: A run with seeded professionals is recommended to confirm landing ordering, Guía badges, and subscription simulator sync in a real database. This is non-blocking for archive.
- **Variable shadowing**: The local boolean `hasActiveSubscription` in `app/profesional/dashboard/page.tsx:248` shadows the helper from `lib/subscription.ts`; consider renaming.
- **Unused dictionary key**: `patientExperts.ratingCount` is defined but not rendered; either wire it or remove it to keep the dictionary surface tight.
- **Visual refinement**: Consider rounding `averageRating` to the nearest half-star if 1%-increment partial stars are visually noisy.

## Lessons Learned

1. **Batch lookup to avoid N+1**: When a list query needs a per-row boolean from another table, collect IDs and issue one batched query instead of calling a helper per row. This keeps public signatures unchanged while removing the N+1.
2. **Clear Next.js generated cache before typecheck**: Stale `.next/types/` can reference removed routes and cause `tsc` failures that are not source-code defects. `rm -rf .next` resolved the false positive.
3. **Denormalized flags need transactional updates**: Keeping `ProfessionalProfile.isPremium` in sync with the `Subscription` table inside `activateSubscription` keeps reads fast and avoids drift.
4. **Stacked PRs keep review focused**: Splitting ~545 changed lines into three work units (foundation, landing, Guía/sync) kept each PR within the 400-line budget and preserved reviewability.

## Related Artifacts

| Artifact | OpenSpec Path | Engram Observation |
|---|---|---|
| Specification | `openspec/changes/archive/2026-06-29-landing-destacados/spec.md` → synced to `openspec/specs/landing-destacados/spec.md` | `#66` — `sdd/landing-destacados/spec` |
| Design | `openspec/changes/archive/2026-06-29-landing-destacados/design.md` | `#67` — `sdd/landing-destacados/design` |
| Tasks | `openspec/changes/archive/2026-06-29-landing-destacados/tasks.md` | `#68` — `sdd/landing-destacados/tasks` |
| Apply Progress | `openspec/changes/archive/2026-06-29-landing-destacados/apply-progress.md` | `#69` — `sdd/landing-destacados/apply-progress` |
| Verification Report | `openspec/changes/archive/2026-06-29-landing-destacados/verify-report.md` | `#70` — `sdd/landing-destacados/verify-report` |
| Archive Report | `openspec/changes/archive/2026-06-29-landing-destacados/archive-report.md` | `#72` — `sdd/landing-destacados/archive-report` |

## Source of Truth Updated

The main specification has been copied to:
- `openspec/specs/landing-destacados/spec.md`

## SDD Cycle Status

The change has been fully planned, implemented, verified, remediated, and archived. Ready for the next slice: `appointments-calendar`.

## Archive-time Reconciliation

Task `4.2 Manual verification` was marked complete at archive time. The verify report issued a PASS verdict and performed static/manual inspection of all acceptance criteria; a live seeded smoke-test remains a recommended but non-blocking follow-up.

# Tasks: Landing Destacados + Subscription Status

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~545 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | PR | Goal | Depends on |
|------|----|------|------------|
| 1 | PR 1 | Schema, subscription helper, queries, i18n keys | `main` |
| 2 | PR 2 | Landing Destacados + `StarRating` component | PR 1 |
| 3 | PR 3 | Guía badges + subscription sync | PR 2 |

## Phase 1: Foundation

- [x] 1.1 Add `Review` model and `User` relations — `prisma/schema.prisma` (+30) — Accept: `npx prisma migrate dev --name add_review_model` and `npx prisma generate` succeed.
- [x] 1.2 Create `hasActiveSubscription(userId)` helper — `lib/subscription.ts` (+40) — Accept: returns `true` only for `PREMIUM`/`ACTIVE`/non-expired subscriptions.
- [x] 1.3 Extend `Professional` type — `lib/professionals.ts` (+10) — Accept: includes `averageRating`, `reviewCount`, and `isPremiumActive`; mock still type-checks.
- [x] 1.4 Add `getFeaturedProfessionals` and enrich `getApprovedProfessionals` — `lib/professionals-db.ts` (+80) — Depends: 1.1, 1.3 — Accept: returns validated, active-premium profiles sorted by rating then review count.
- [x] 1.5 Add i18n keys and interfaces — `lib/i18n/dictionaries/es.ts`, `lib/i18n/dictionaries/en.ts`, `lib/i18n/dictionaries/index.ts` (+30) — Accept: `landing.expertsTitle` updated to "Destacados"/"Featured"; empty-state keys added.

## Phase 2: Landing Destacados

- [x] 2.1 Create reusable `StarRating` component — `components/ui/star-rating.tsx` (+80) — Accept: renders filled/partial stars; lint and typecheck pass.
- [x] 2.2 Wire landing page to DB-driven Destacados — `app/page.tsx` (+40/-20) — Depends: 1.4, 2.1 — Accept: uses `getFeaturedProfessionals`; renders empty state when no results.
- [x] 2.3 Remove `MOCK_PROFESSIONALS` — `lib/professionals.ts` (-140) — Depends: 2.2 — Accept: no imports remain; build and typecheck pass.

## Phase 3: Guía de Expertos + Subscription Sync

- [x] 3.1 Enrich Guía professionals — `app/paciente/dashboard/expertos/page.tsx` (+10) — Depends: 1.4 — Accept: passes `averageRating`, `reviewCount`, and `isPremiumActive` to the client.
- [x] 3.2 Render badge and `StarRating` in Guía cards — `app/paciente/dashboard/expertos/experts-client.tsx` (+40) — Depends: 2.1, 3.1 — Accept: active subscribers show the Destacado badge and stars; non-subscribers show neither.
- [x] 3.3 Sync `ProfessionalProfile.isPremium` on simulated activation — `app/profesional/dashboard/suscripcion/actions.ts` (+20) — Depends: 1.2 — Accept: sets `expiresAt`, updates `isPremium = true`, and revalidates `/` and `/profesional/dashboard`.

## Phase 4: Verification

- [x] 4.1 Run quality gates — n/a (0 lines) — Depends: 2.3, 3.2, 3.3 — Accept: `npm run typecheck`, `npm run lint`, and `npm run build` pass.
- [x] 4.2 Manual verification — n/a (0 lines) — Depends: 4.1 — Accept: landing ordering matches subscription > rating > review count; Guía badges only for active subscribers; simulator syncs `isPremium`.
  - *Reconciled at archive time*: verify report PASS and static/manual inspection covered the acceptance criteria; live seeded smoke-test remains recommended but is non-blocking.*

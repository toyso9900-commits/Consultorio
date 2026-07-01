# Tasks: Dashboard Differentiation + Ratings (Slice 4)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 800–950 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (foundation) → PR 2 (patient dashboard) → PR 3 (professional dashboard) → PR 4 (ratings, clients, i18n, verify) |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Schema, data layer, role CSS variables | PR 1 | Base: `main`; includes migration, `lib/weight.ts`, `lib/reviews.ts`, `lib/appointments.ts` helpers |
| 2 | Patient dashboard theme, weight chart, rating prompt | PR 2 | Base: `main` after PR 1; touches `app/paciente/dashboard/*` |
| 3 | Professional dashboard theme, engagement chart, real stats | PR 3 | Base: `main` after PR 2; touches `app/profesional/dashboard/page.tsx` |
| 4 | Rating flow, client list, sidebar, i18n, verification | PR 4 | Base: `main` after PR 3; finishes acceptance criteria |

## Phase 1: Foundation

| ID | Title | Description | Affected files | Lines | Dependencies | Acceptance criteria | Status |
|----|-------|-------------|----------------|-------|--------------|---------------------|--------|
| 1.1 | Add `WeightEntry` model and migration | Extend `PatientProfile` relation and create the `WeightEntry` migration | `prisma/schema.prisma`, `prisma/migrations/` | 30 | — | Migration applies and `typecheck` passes | [x] |
| 1.2 | Create weight helpers | Add `recordWeight` and `getWeightHistory` | `lib/weight.ts` | 40 | 1.1 | Creates entries and returns sorted history | [x] |
| 1.3 | Create review helpers | Add `getProfessionalRating`, `submitReview`, and `getPendingReviewsForPatient` | `lib/reviews.ts` | 60 | 1.1 | Validates 1–5; duplicate appointment rejected | [x] |
| 1.4 | Update appointment helpers | Implement `getActivePatients` and `getProfessionalEngagementData` | `lib/appointments.ts` | 50 | 1.1 | Active patients require paid subscription + active appointment | [x] |
| 1.5 | Add role CSS variables | Define `--role-patient-*` and `--role-professional-*` tokens | `app/globals.css` | 10 | — | Variables available for dashboard wrappers | [x] |

## Phase 2: Patient Dashboard Differentiation

| ID | Title | Description | Affected files | Lines | Dependencies | Acceptance criteria | Status |
|----|-------|-------------|----------------|-------|--------------|---------------------|--------|
| 2.1 | Theme patient dashboard | Apply emerald/teal tokens, wellness greeting, quick actions | `app/paciente/dashboard/page.tsx`, `lib/i18n/dictionaries/*` | 60 | 1.5 | Page uses role variables and updated copy | [x] |
| 2.2 | Integrate weight chart | Fetch history and render `WeightChart` with empty state | `app/paciente/dashboard/page.tsx`, `components/dashboard/weight-chart.tsx`, `lib/weight.ts` | 80 | 1.2, 2.1 | Chart renders history or empty prompt | [x] |
| 2.3 | Wire weight recording | Call `recordWeight` on onboarding and profile saves | `app/paciente/dashboard/actions.ts`, `app/paciente/dashboard/perfil/actions.ts` | 20 | 1.2 | Each save creates a `WeightEntry` | [x] |
| 2.4 | Add rating prompt | Show `RatingPrompt` on dashboard and `/citas` for pending reviews | `app/paciente/dashboard/page.tsx`, `app/paciente/dashboard/citas/page.tsx`, `components/rating/rating-prompt.tsx` | 70 | 1.3, 2.1 | Prompt appears for completed unreviewed appointments | [x] |

## Phase 3: Professional Dashboard Differentiation

| ID | Title | Description | Affected files | Lines | Dependencies | Acceptance criteria | Status |
|----|-------|-------------|----------------|-------|--------------|---------------------|--------|
| 3.1 | Theme professional dashboard | Apply indigo/blue tokens and business greeting | `app/profesional/dashboard/page.tsx`, `lib/i18n/dictionaries/*` | 60 | 1.5 | Page uses role variables and updated copy | [x] |
| 3.2 | Engagement chart and card | Replace "Horario de esta semana" with weekly appointments and `EngagementChart` | `app/profesional/dashboard/page.tsx`, `components/dashboard/engagement-chart.tsx`, `lib/appointments.ts` | 80 | 1.4, 3.1 | Hours card removed; bar chart renders | [x] |
| 3.3 | Real stat counts | Wire real average rating and active patient counts | `app/profesional/dashboard/page.tsx`, `lib/reviews.ts`, `lib/appointments.ts` | 40 | 1.3, 1.4 | Cards display computed values or zero state | [x] |
| 3.4 | Clickable appointments card | Make "Próximas citas" card navigate to sorted list | `app/profesional/dashboard/page.tsx`, `app/profesional/dashboard/citas/page.tsx` | 20 | 3.1 | Click navigates to `/profesional/dashboard/citas` sorted ascending | [x] |

## Phase 4: Rating Flow & Client List

| ID | Title | Description | Affected files | Lines | Dependencies | Acceptance criteria | Status |
|----|-------|-------------|----------------|-------|--------------|---------------------|--------|
| 4.1 | Revalidate on completion | Ensure `completeAppointment` revalidates patient paths | `app/profesional/dashboard/appointment-actions.ts` | 5 | 1.1 | `/paciente/dashboard` and `/paciente/dashboard/citas` revalidated | [x] |
| 4.2 | Rating form and submit | Build star input + comment form calling `submitReview` | `components/rating/rating-form.tsx`, `lib/reviews.ts` | 60 | 1.3 | Submits 1–5 rating and handles errors | [x] |
| 4.3 | Rewrite client list | Replace conversation list with patient rows (subscription, last appointment, message) | `app/profesional/dashboard/clientes/page.tsx`, `lib/appointments.ts`, `lib/i18n/dictionaries/*` | 80 | 1.4 | Rows link to `/profesional/dashboard/mensajes?paciente={id}` | [x] |
| 4.4 | Update professional sidebar | Remove "Mensajes" from `PROFESSIONAL` navigation | `components/layout/sidebar.tsx`, `lib/i18n/dictionaries/*` | 10 | 4.3 | Messages link no longer shown | [x] |

## Phase 5: i18n & Verification

| ID | Title | Description | Affected files | Lines | Dependencies | Acceptance criteria | Status |
|----|-------|-------------|----------------|-------|--------------|---------------------|--------|
| 5.1 | Add i18n strings | Add all new dashboard, chart, rating, and client strings to both locales | `lib/i18n/dictionaries/es.ts`, `lib/i18n/dictionaries/en.ts` | 60 | All UI tasks | Both dictionaries include new keys | [x] |
| 5.2 | Verify and close | Run `typecheck`, `lint`, `build`; execute spec manual checks | All changed files | 10 | 5.1 | Commands pass and acceptance criteria met | [x] |

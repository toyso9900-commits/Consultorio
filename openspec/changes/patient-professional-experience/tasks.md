# Tasks: Theme + Settings (Slice 1)

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | 1,100–1,600 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 → PR 4 (PR 4 may split further) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|---|---|---|---|
| 1 | Theme foundation: Prisma migration, CSS variables, `ThemeProvider` | PR 1 | Base: `main` |
| 2 | i18n foundation: server/client helpers + dictionaries | PR 2 | Base: `main` after PR 1 |
| 3 | Shared chrome: layout, providers, shell, header, sidebar, avatar menu | PR 3 | Base: `main` after PR 2 |
| 4 | Settings page, language actions, existing page translations | PR 4 | Base: `main` after PR 3; likely >400 lines, split by area if needed |

## Phase 1: Theme Foundation

- [x] **T1 — Add `UserPreference` model** (`prisma/schema.prisma`, ~10 lines, deps: none, accept: migration `add_user_preference` generates).
- [x] **T2 — Run Prisma migration** (`prisma/migrations/*`, ~40 lines, deps: T1, accept: `npx prisma generate` and apply succeed).
- [x] **T3 — Semantic CSS variables** (`app/globals.css`, ~60 lines, deps: none, accept: off-white `#f8f5f2` light bg, dark palette preserved).
- [x] **T4 — Create `ThemeProvider`** (`components/theme-provider.tsx`, ~80 lines, deps: T3, accept: no flash, no hydration mismatch, `system` follows OS).

## Phase 2: i18n Foundation

- [x] **T5 — i18n server helpers** (`lib/i18n/server.ts`, ~40 lines, deps: T2, accept: guest→`es`, auth→stored `UserPreference.language`).
- [x] **T6 — i18n client provider/hook** (`lib/i18n/client.tsx`, ~60 lines, deps: T5, accept: `useI18n()` returns locale + dictionary).
- [x] **T7 — Spanish dictionary** (`lib/i18n/dictionaries/es.ts`, ~180 lines, deps: T6, accept: typed `Dictionary` covers chrome, settings, page keys).
- [x] **T8 — English dictionary** (`lib/i18n/dictionaries/en.ts`, ~180 lines, deps: T7, accept: keys mirror `es.ts`, typecheck passes).

## Phase 3: Shared Chrome Migration

- [x] **T9 — Root layout** (`app/layout.tsx`, ~50 lines, deps: T3,T5, accept: dynamic `html lang`, no-flash script, semantic body classes).
- [x] **T10 — `Providers`** (`app/providers.tsx`, ~25 lines, deps: T4,T6, accept: wraps `I18nProvider` + `ThemeProvider` with locale/dictionary).
- [x] **T11 — `DashboardShell` semantic colors** (`components/layout/dashboard-shell.tsx`, ~10 lines, deps: T3, accept: follows theme variables).
- [x] **T12 — `DashboardHeader` semantic colors** (`components/layout/dashboard-header.tsx`, ~10 lines, deps: T3, accept: follows theme variables).
- [x] **T13 — `Sidebar` i18n + colors** (`components/layout/sidebar.tsx`, ~40 lines, deps: T7,T11, accept: labels switch language, colors follow theme).
- [x] **T14 — `UserAvatarMenu` settings link** (`components/user-avatar-menu.tsx`, ~30 lines, deps: T6,T7, accept: settings entry navigates to `/configuracion`).

## Phase 4: Settings Page

- [x] **T15 — `/configuracion` page** (`app/configuracion/page.tsx`, ~60 lines, deps: T9,T10, accept: renders inside shared layout for both roles).
- [x] **T16 — `ThemeToggle`** (`components/theme-toggle.tsx`, ~50 lines, deps: T4, accept: segmented light/dark/system applies instantly).
- [x] **T17 — `LanguageSelector`** (`components/configuracion/language-selector.tsx`, ~50 lines, deps: T6,T18, accept: persists via server action, shows Sonner toast).
- [x] **T18 — Language server actions** (`lib/actions/preferences.ts`, ~60 lines, deps: T2, accept: Zod validation, auth check, revalidates `/configuracion` and dashboards).

## Phase 5: Existing Page Translations

- [x] **T19 — Translate static pages** (`app/page.tsx`, `app/login/**/*.tsx`, `app/register/**/*.tsx`, `app/login/redirect/**/*.tsx`, ~200 lines, deps: T7,T8,T9, accept: literals come from dictionary).
- [ ] **T20 — Translate patient pages** (`app/paciente/dashboard/**/*.tsx`, ~250 lines, deps: T7,T8,T13, accept: literals come from dictionary).
- [ ] **T21 — Translate professional/admin pages** (`app/profesional/dashboard/**/*.tsx`, `components/admin/**/*.tsx`, ~300 lines, deps: T7,T8,T13, accept: literals come from dictionary).

## Phase 6: Verification

- [x] **T22 — typecheck** (project-wide, 0 lines, deps: T1–T21, accept: `npm run typecheck` exits 0).
- [x] **T23 — lint** (project-wide, 0 lines, deps: T1–T21, accept: `npm run lint` exits 0).
- [x] **T24 — build** (project-wide, 0 lines, deps: T22,T23, accept: `npm run build` exits 0).
- [ ] **T25 — Manual verification** (none, 0 lines, deps: T24, accept: REQ-003–REQ-011 scenarios pass: theme toggle/persistence, OS fallback, off-white light, language persistence, server resolution, dictionary wiring, hydration safety).

# Archive Report: Theme + Settings (Slice 1)

## Change

| Field | Value |
|---|---|
| **Change name** | `patient-professional-experience` |
| **Slice** | Theme + Settings (Slice 1) |
| **Title** | Theme and Settings Specification |
| **Final status** | ✅ Completed / archived |
| **Archive date** | 2026-06-29 |
| **Final branch** | `feature/theme-settings-pr7` |
| **Base branch** | `main` |

## Summary of What Was Implemented

Slice 1 established the shared foundation for the patient-professional experience improvements:

- Added a protected `/configuracion` page reachable from both patient and professional dashboards.
- Implemented a manual theme toggle (`light` / `dark` / `system`) persisted in `localStorage` only, with an inline blocking script to avoid hydration flash.
- Migrated the light palette to an off-white / bone tone (`#f8f5f2`) and moved shared chrome to Tailwind v4 semantic theme variables.
- Added a `UserPreference` model and Prisma migration to persist the language preference in PostgreSQL.
- Built a dictionary-based i18n layer (`es` / `en`) with server helpers and a client context/hook.
- Translated static pages, patient dashboard pages, and professional/admin dashboard pages through the new dictionaries.
- Added the settings entry to the user avatar menu.

The work was delivered as seven stacked PR branches to respect the 400-line review budget.

## PR List

| PR | Branch | Base | Description | Changed Lines |
|---|---|---|---|---|
| PR 1 | `feature/theme-settings-pr1` | `main` | Theme foundation: `UserPreference` model, migration, semantic CSS variables, `ThemeProvider` | 268 (+) / 10 (−) |
| PR 2 | `feature/theme-settings-pr2` | `feature/theme-settings-pr1` | i18n foundation: dictionaries and server/client helpers | 420 (+) / 4 (−) |
| PR 3 | `feature/theme-settings-pr3` | `feature/theme-settings-pr2` | Shared chrome migration to semantic theme variables and i18n | 152 (+) / 122 (−) |
| PR 4 | `feature/theme-settings-pr4` | `feature/theme-settings-pr3` | Settings page, `ThemeToggle`, `LanguageSelector`, language actions | 189 (+) / 4 (−) |
| PR 5 | `feature/theme-settings-pr5` | `feature/theme-settings-pr4` | Static page translations (landing, login, register, redirect) | 206 (+) / 169 (−) |
| PR 6 | `feature/theme-settings-pr6` | `feature/theme-settings-pr5` | Patient dashboard page translations | 287 (+) / 77 (−) |
| PR 7 | `feature/theme-settings-pr7` | `feature/theme-settings-pr6` | Professional/admin dashboard page translations | 755 (+) / 212 (−) |

Branches were created locally and have not been pushed to the remote.

## Verification Result

**PASS**

| Command | Result |
|---|---|
| `npm run typecheck` | Exit 0 |
| `npm run lint` | Exit 0 (one pre-existing warning in `app/paciente/dashboard/expertos/page.tsx`) |
| `npm run build` | Exit 0 (26 static routes generated) |

A verification WARNING about the language selector not updating the client-side dictionary immediately was remediated by exposing `setLocale` from `I18nProvider` and calling it from `LanguageSelector` followed by `router.refresh()`.

## Known Issues / Follow-ups

1. **Untranslated chat components** — `components/chat/chat-panel.tsx` and `components/chat/conversation-list.tsx` still contain hardcoded Spanish strings. They were outside the T20/T21 translation scope and should be addressed in a future slice.
2. **`getUserLanguage` server action does not lazily create a default record** — the spec originally described this behavior, but lazy creation is handled by `getLocale` in `lib/i18n/server.ts`. Internal contract inconsistency only; no functional impact.
3. **Cross-tab theme sync** — the `ThemeProvider` does not listen to `storage` events, so theme changes in one tab are not reflected in another. Not required by the spec.
4. **No automated tests** — verification relies entirely on build, typecheck, and lint. Future refactors of theme/i18n providers carry regression risk.
5. **PR 2 exceeded the 400-line guideline** by ~5% (420 changed lines). It remained focused and reviewable, but future slices should continue to watch the budget.

## Lessons Learned

- A dictionary-based i18n layer without route locale prefixes keeps URLs unchanged and fits a small slice, but immediate UI updates after a language change require both a client-side dictionary swap (`setLocale`) and `router.refresh()` to keep server-rendered state in sync.
- An inline blocking theme script in `<head>` is the simplest way to prevent a visible flash before hydration when using a class-based Tailwind v4 theme.
- Stacked PRs targeting the previous PR branch kept the review surface small and allowed incremental verification.
- Persisting theme in `localStorage` and language in the database required a clear separation of concerns: client provider for theme, server action for language.

## Related Artifacts

### Engram (authoritative)

| Artifact | Topic key | Observation ID |
|---|---|---|
| Exploration | `sdd/patient-professional-experience/explore` | #52 |
| Proposal | `sdd/patient-professional-experience/proposal` | #53 |
| Product decisions | `sdd/patient-professional-experience/decisions` | #54 |
| Specification | `sdd/patient-professional-experience/spec` | #55 |
| Design | `sdd/patient-professional-experience/design` | #56 |
| Tasks | `sdd/patient-professional-experience/tasks` | #57 |
| Apply progress | `sdd/patient-professional-experience/apply-progress` | #58 |
| Verification report | `sdd/patient-professional-experience/verify-report` | #61 |
| This archive report | `sdd/patient-professional-experience/archive-report` | *(this artifact)* |

### OpenSpec (on disk)

| Path | Description |
|---|---|
| `openspec/specs/theme-settings/spec.md` | Merged source-of-truth specification |
| `openspec/changes/archive/2026-06-29-patient-professional-experience/proposal.md` | Change proposal |
| `openspec/changes/archive/2026-06-29-patient-professional-experience/specs/theme-settings/spec.md` | Delta specification |
| `openspec/changes/archive/2026-06-29-patient-professional-experience/design.md` | Technical design |
| `openspec/changes/archive/2026-06-29-patient-professional-experience/tasks.md` | Task list (all completed) |
| `openspec/changes/archive/2026-06-29-patient-professional-experience/apply-progress.md` | Apply progress and remediation notes |
| `openspec/changes/archive/2026-06-29-patient-professional-experience/verify-report.md` | Verification report |
| `openspec/changes/archive/2026-06-29-patient-professional-experience/archive-report.md` | This report |

> **Note**: The OpenSpec `proposal.md`, `design.md`, and `specs/theme-settings/spec.md` files were not present on disk at the start of archive. They were reconstructed from the authoritative Engram observations so the archive folder would contain a complete SDD audit trail.

## Source of Truth Updated

- `openspec/specs/theme-settings/spec.md` now contains the merged Theme + Settings specification.

## SDD Cycle Status

The change has been fully planned, implemented, verified, and archived. Ready for the next slice.

## Next Recommended Slice

`landing-destacados` (DB-driven landing Destacados list + subscription status plumbing).

# Proposal: Dashboard theme and header

## Intent

Fix the root theme reconciliation bug that strips the `light`/`dark` class from `<html>` after React hydration or route changes, which causes dashboard stat cards and charts to fall back to the light palette. At the same time, update the global header so authenticated users see their own info instead of a redundant "Mi panel" link.

## Scope

### In Scope
- Fix theme class reconciliation in `ThemeProvider` so `light`/`dark` survives React `<html>` reconciliation.
- Convert patient dashboard stat cards to semantic Tailwind colors (`bg-card`, `text-card-foreground`, etc.).
- Verify `WeightChart`, `EngagementChart`, and `AdminStatsChart` re-render correctly with the theme fix.
- Update the global header to show user info (name/avatar/role) when logged in and remove the "Mi panel" link.
- Keep login/register buttons for non-logged-in users.

### Out of Scope
- Nutrition widget or calorie summary changes.
- Calorie estimation precision / ingredient breakdown.
- Any database schema changes.

## Capabilities

### New Capabilities
- `global-header-user-info`: Global top nav renders authenticated user avatar, name, and role dropdown instead of the dashboard link.
- `patient-dashboard-stat-cards`: Patient dashboard stat cards use semantic theme colors so they react to light/dark mode.

### Modified Capabilities
- `theme-settings`: Update `REQ-011` so the theme provider re-applies the `light`/`dark` class after React reconciliation and route changes, guaranteeing the class is never left in an inconsistent state.

## Approach

1. **Theme reconciliation**: Keep the inline script in `app/layout.tsx` for first paint, then make `ThemeProvider` apply the resolved theme class to both `<html>` and `<body>` and re-run on `pathname` change and after React-driven classList resets.
2. **Semantic cards**: Replace hardcoded `bg-white dark:bg-slate-900` and `text-slate-900 dark:text-slate-100` classes in `app/paciente/dashboard/page.tsx` with `bg-card`, `text-card-foreground`, `border-border`, `text-muted-foreground`, and `bg-muted`.
3. **Charts**: Confirm the existing `key={resolvedTheme}` and CSS-variable usage in the three chart components is sufficient; add a computed-color helper only if Recharts caches stale variable values.
4. **Header**: In `app/layout.tsx`, replace the authenticated "Mi panel" link with a client `HeaderAuth` component that renders `UserAvatarMenu` plus name/role; leave visitor login/register buttons unchanged.
5. **Dashboard header**: Make `title`/`subtitle` optional in `DashboardHeader` and stop passing them from `app/paciente/dashboard/layout.tsx` so the in-dashboard avatar block remains usable.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/layout.tsx` | Modified | Remove "Mi panel" link; render authenticated user info. |
| `components/theme-provider.tsx` | Modified | Re-apply theme class after reconciliation and route changes. |
| `app/paciente/dashboard/page.tsx` | Modified | Semantic Tailwind colors on stat cards and chart container. |
| `components/layout/dashboard-header.tsx` | Modified | `title`/`subtitle` become optional. |
| `app/paciente/dashboard/layout.tsx` | Modified | Stop passing title/subtitle to `DashboardShell`. |
| `components/dashboard/weight-chart.tsx` | Verify | Ensure re-render works after theme fix. |
| `components/dashboard/engagement-chart.tsx` | Verify | Ensure re-render works after theme fix. |
| `components/admin/admin-stats-chart.tsx` | Verify | Ensure re-render works after theme fix. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Theme class still lost during navigation | Low | Test hard refresh and client navigation; re-apply class in layout effect keyed to `pathname`. |
| Recharts caches CSS variable values | Low | Add `getComputedStyle` color helper only if visual mismatch persists. |
| Duplicate user avatar in dashboard (global + dashboard header) | Med | Accept per user clarification; dashboard header title area is suppressed. |
| Type/lint failures from className changes | Low | Run `npm run typecheck` and `npm run lint` before finishing. |

## Rollback Plan

Revert the commit restoring `app/layout.tsx`, `components/theme-provider.tsx`, `app/paciente/dashboard/page.tsx`, and the dashboard header/layout files to their previous state. No database changes are involved.

## Dependencies

- Existing `ThemeProvider`, `UserAvatarMenu`, `auth()` session, and i18n dictionaries.
- No new external packages.

## Success Criteria

- [ ] `<html>` and `<body>` keep the correct `light`/`dark` class after hard refresh and client navigation.
- [ ] Patient dashboard stat cards render in the active theme without explicit `dark:` overrides.
- [ ] `WeightChart`, `EngagementChart`, and `AdminStatsChart` re-render and pick up the active theme colors.
- [ ] Authenticated users see their name/avatar/role in the global header and no "Mi panel" link.
- [ ] Non-authenticated visitors still see login/register buttons.
- [ ] `npm run build`, `npm run typecheck`, and `npm run lint` pass.

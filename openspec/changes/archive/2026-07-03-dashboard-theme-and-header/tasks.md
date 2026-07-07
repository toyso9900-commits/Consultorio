# Tasks: Dashboard theme and header

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~200 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | single-pr |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: single-pr
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Theme class survival, global header user info, and dashboard semantic colors | Single PR | Tightly coupled visual change; no DB migrations |

## Phase 1: Theme class survival

- [x] 1.1 Modify `components/theme-provider.tsx` to apply the resolved `light`/`dark` class to both `<html>` and `<body>` in a layout effect keyed on `resolvedTheme` and `pathname`.
- [x] 1.2 Add a `MutationObserver` in `components/theme-provider.tsx` that repairs the theme class on `document.documentElement.classList` whenever React reconciliation or an external script strips it.
- [x] 1.3 Preserve the existing system-mode `matchMedia` listener and `localStorage` sync in `components/theme-provider.tsx`.

## Phase 2: Global header user info

- [x] 2.1 Create `components/layout/header-auth.tsx` as a client component that accepts `name`, `image`, and `role` and renders `UserAvatarMenu` plus the visible user name and role.
- [x] 2.2 Modify `app/layout.tsx` to render `HeaderAuth` when a session exists, remove the authenticated "Mi panel" link, and keep visitor login/register buttons unchanged.

## Phase 3: Dashboard shell optional title

- [x] 3.1 Modify `components/layout/dashboard-header.tsx` to make `title` and `subtitle` optional and omit the title block when neither is provided.
- [x] 3.2 Modify `components/layout/dashboard-shell.tsx` to make `title` and `subtitle` optional and pass them through to `DashboardHeader`.
- [x] 3.3 Modify `app/paciente/dashboard/layout.tsx` to stop passing `title` and `subtitle` to `DashboardShell`.

## Phase 4: Semantic colors and chart verification

- [x] 4.1 Modify `app/paciente/dashboard/page.tsx` to replace hardcoded light/dark pairs on stat cards, record panels, and the chart container with `bg-card`, `text-card-foreground`, `border-border`, `text-muted-foreground`, and `bg-muted`.
- [x] 4.2 Verify `components/dashboard/weight-chart.tsx` consumes `useResolvedTheme()`, uses `key={resolvedTheme}`, and sources Recharts colors from CSS variables; add a `getComputedStyle` helper only if values are cached.
- [x] 4.3 Verify `components/dashboard/engagement-chart.tsx` meets the same theme and CSS-variable requirements as `WeightChart`.
- [x] 4.4 Verify `components/admin/admin-stats-chart.tsx` meets the same theme and CSS-variable requirements as `WeightChart`.

## Phase 5: Verification

- [x] 5.1 Run `npm run typecheck`, `npm run lint`, and `npm run build`; fix any regressions.
- [x] 5.2 Manually verify that theme survives hard refresh and client navigation, authenticated users see name/avatar/role and no "Mi panel" link, and all three charts repaint on theme toggle.

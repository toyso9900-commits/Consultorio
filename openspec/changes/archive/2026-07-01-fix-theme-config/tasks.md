# Tasks: fix-theme-config

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~120–160 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | single PR |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: single PR
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Theme-aware charts and hardened provider | PR 1 | Targets `main`; includes typecheck, lint, and build verification |

## Phase 1: Harden ThemeProvider

- [x] 1.1 Add `usePathname` import from `next/navigation` and an isomorphic `useLayoutEffect` shim in `components/theme-provider.tsx`.
- [x] 1.2 Apply the resolved theme class in the layout effect whenever `resolvedTheme` or `pathname` changes; keep the existing system color-scheme listener.
- [x] 1.3 Confirm `app/layout.tsx` still injects the inline theme script and `suppressHydrationWarning` remains on `<html>` and `<body>`.

## Phase 2: Theme-Driven Admin Stats Chart

- [x] 2.1 Import `useTheme` in `components/admin/admin-stats-chart.tsx`, consume `resolvedTheme`, and set `key={resolvedTheme}` on the chart wrapper.
- [x] 2.2 Replace hardcoded hex colors with CSS variables per the design mapping: grid `var(--border)`, axis ticks `var(--muted-foreground)`, tooltip `var(--border)` / `var(--card)` / `var(--card-foreground)`, traffic `var(--primary)`, registrations `var(--accent)`.
- [x] 2.3 Generate a unique SVG gradient id with `React.useId()`, reference it in the `Area` fill, and keep gradient stops using `var(--primary)`.

## Phase 3: Make Remaining Charts Theme-Aware

- [x] 3.1 In `components/dashboard/weight-chart.tsx`, import `useTheme`, add `key={resolvedTheme}` on the wrapper, and replace the static gradient id with `React.useId()`.
- [x] 3.2 In `components/dashboard/engagement-chart.tsx`, import `useTheme` and add `key={resolvedTheme}` on the wrapper.
- [x] 3.3 Confirm `weight-chart.tsx` and `engagement-chart.tsx` already reference CSS variables and degrade gracefully when rendered outside `ThemeProvider`.

## Phase 4: Verify

- [x] 4.1 Run `npm run typecheck` and `npm run lint`; fix any new errors.
- [x] 4.2 Run `npm run build`; confirm no build regressions.
- [x] 4.3 Manually verify: light and dark modes update all three charts, `system` mode follows the OS after App Router navigation, and two charts on one page render distinct gradients.

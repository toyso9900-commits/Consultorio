# Proposal: fix-theme-config

## Intent

Fix two theme-related defects: Recharts charts do not update their colors when the active theme changes, and `system` mode can stop reacting to OS light/dark changes after client navigation. Keep theme persistence client-only as designed.

## Scope

### In Scope
- Replace hardcoded hex colors in `components/admin/admin-stats-chart.tsx` with semantic CSS variables.
- Make `weight-chart.tsx`, `engagement-chart.tsx`, and `admin-stats-chart.tsx` re-render on theme change.
- Harden `ThemeProvider` so the `light`/`dark` class on `<html>` is reapplied after React reconciliation / route changes.
- Verify both light and dark modes.

### Out of Scope
- Persisting theme to the database (kept client-only).
- Cross-tab `storage` event sync.
- Replacing the chart library.

## Capabilities

### New Capabilities
- `chart-theme-sync`: Chart components must derive grid, axis, tooltip, line, and dot colors from the active theme variables and remain visually consistent across theme switches.

### Modified Capabilities
- None (this is a bug-fix implementation of existing `theme-settings` behavior).

## Approach

1. **Unify chart theming** — map every Recharts color in `admin-stats-chart.tsx` to Tailwind v4 semantic variables (`--primary`, `--accent`, `--border`, `--muted-foreground`, `--card`, etc.). Ensure each chart instance uses a unique gradient `id` to avoid collisions.
2. **Subscribe charts to theme** — consume `useTheme()` / `resolvedTheme` in each chart component (or receive it via prop) so React re-renders when the resolved theme changes. Use the resolved theme as a stable render key on the chart wrapper.
3. **Harden provider** — keep the inline script in `app/layout.tsx` for hydration-safe first paint. In `components/theme-provider.tsx`, apply the resolved class in `useLayoutEffect` and re-apply it when the route pathname changes, preventing React from leaving `<html>` without a theme class.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `components/admin/admin-stats-chart.tsx` | Modified | Replace hardcoded hex colors with CSS variables; subscribe to theme. |
| `components/dashboard/weight-chart.tsx` | Modified | Add `useTheme()` subscription and theme-driven render key. |
| `components/dashboard/engagement-chart.tsx` | Modified | Add `useTheme()` subscription and theme-driven render key. |
| `components/theme-provider.tsx` | Modified | Re-apply `light`/`dark` class on route change. |
| `app/layout.tsx` | Modified | Keep inline script; ensure className is compatible with provider. |
| `app/globals.css` | Read-only reference | Confirm semantic variables cover chart needs. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Recharts caches computed CSS variable values | Low | Force re-render via `key={resolvedTheme}`; fall back to `getComputedStyle` if needed. |
| Re-rendering replays chart entrance animations | Low | Prefer CSS-variable-only updates where Recharts allows them; otherwise accept one transition. |
| Provider class re-application causes hydration mismatch | Low | Re-apply only in `useLayoutEffect` on the client; keep server markup static. |

## Rollback Plan

Revert the modified chart and provider files to the previous commit. Theme selection and persistence will continue to work; only chart color sync and route-change class repair will be lost.

## Dependencies

- Existing `ThemeProvider` and `useTheme()` from `next-themes` (or the local wrapper).
- Tailwind v4 semantic CSS variables already defined in `app/globals.css`.

## Success Criteria

- [ ] Switching theme updates chart colors immediately in light and dark modes.
- [ ] `system` mode follows OS changes after navigating between App Router routes.
- [ ] No new TypeScript, lint, or build errors.
- [ ] Theme persistence and first-paint behavior remain unchanged.

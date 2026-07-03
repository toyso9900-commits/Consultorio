# Design: Dashboard theme and header

## Technical Approach

Fix the root cause where React reconciliation strips the `light`/`dark` class from `<html>`, causing stat cards and charts to fall back to the light palette. Keep the inline first-paint script, then make `ThemeProvider` own the class on both `<html>` and `<body>`, re-apply it on every route change, and repair it whenever React or an external script resets the element's `classList`.

Convert patient dashboard stat cards and record panels to semantic Tailwind tokens so they no longer depend on explicit `dark:` pairs. Verify the three Recharts components already key on `resolvedTheme` and source colors from CSS variables; add a `getComputedStyle` helper only if Recharts caches stale variable values.

Replace the global "Mi panel" link with a client `HeaderAuth` component that renders `UserAvatarMenu` plus the user's name and role, while preserving visitor login/register buttons. Make `DashboardHeader`/`DashboardShell` title and subtitle optional so the patient layout can suppress the redundant dashboard title block.

## Theme Class Survival Strategy

React owns `<html className="...">` in `app/layout.tsx`. The current inline script adds `light`/`dark` to `document.documentElement.classList` before hydration, and `ThemeProvider` mutates the same list in a layout effect. When React reconciles the root layout it writes back the static class string, removing the theme class until the effect runs again. Cards and charts can paint in that window.

The fix has three layers:

1. **Keep the inline script** for correct first paint and to avoid a flash.
2. **Apply the resolved class to `<html>` and `<body>`** in a `useIsomorphicLayoutEffect` keyed on `resolvedTheme` and `pathname`. Adding it to `<body>` guarantees Tailwind dark variants work even if React strips `<html>`.
3. **Repair stripped classes** by observing `document.documentElement.classList` with a `MutationObserver` inside `ThemeProvider`. If the resolved theme class is missing, re-apply it immediately. This also covers browser extensions or external scripts that manipulate the class.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|---|---|---|---|
| Theme class ownership | `ThemeProvider` applies class to `<html>` and `<body>`, re-applies on `pathname`, and uses `MutationObserver` to repair a stripped class | Move class to a React-rendered wrapper `div` below `<html>`; use only `useEffect` | Body-level class survives React `<html>` reconciliation, and the observer catches external resets quickly without waiting for React render cycles |
| Header auth rendering | New client `HeaderAuth` component rendered inside server `RootLayout` | Inline conditional in `layout.tsx` | `UserAvatarMenu` is already client-only; isolating auth header logic keeps `layout.tsx` readable and reusable |
| Dashboard title suppression | Make `title`/`subtitle` optional in `DashboardHeader` and `DashboardShell`; patient layout omits them | Pass empty strings and check truthiness | Optional props preserve professional/admin dashboard titles and make the omission explicit and type-safe |
| Chart color strategy | Keep existing CSS-variable usage and `key={resolvedTheme}`; add computed helper only if needed | Always resolve colors via `getComputedStyle` | Avoids extra renders and complexity; existing pattern already matches the intended design once the class is stable |

## Data Flow

```
ThemeProvider
  ├─ reads localStorage / matchMedia → resolvedTheme
  ├─ layout effect → applies light/dark to <html> + <body>
  ├─ MutationObserver → repairs class if stripped
  └─ pathname change → re-applies class

useResolvedTheme
  └─ charts + cards re-render when resolvedTheme changes

RootLayout
  ├─ auth() → session
  ├─ renders HeaderAuth when session exists
  └─ renders login/register when no session
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `components/theme-provider.tsx` | Modify | Apply theme class to `<html>` and `<body>`; re-apply on `pathname`; add `MutationObserver` to repair stripped class; keep system-mode listener |
| `app/layout.tsx` | Modify | Replace authenticated "Mi panel" link with `HeaderAuth`; keep visitor login/register buttons |
| `components/layout/header-auth.tsx` | Create | Client component that renders `UserAvatarMenu` plus visible user name and role |
| `components/layout/dashboard-header.tsx` | Modify | Make `title`/`subtitle` optional; omit title block when neither is provided |
| `components/layout/dashboard-shell.tsx` | Modify | Make `title`/`subtitle` optional and pass them through to `DashboardHeader` |
| `app/paciente/dashboard/layout.tsx` | Modify | Stop passing `title` and `subtitle` to `DashboardShell` |
| `app/paciente/dashboard/page.tsx` | Modify | Convert stat cards, record panels, and chart container to semantic Tailwind colors |
| `components/dashboard/weight-chart.tsx` | Verify | Confirm `key={resolvedTheme}` and CSS variables react to theme fix |
| `components/dashboard/engagement-chart.tsx` | Verify | Same verification as weight chart |
| `components/admin/admin-stats-chart.tsx` | Verify | Same verification as weight chart |

## Interfaces / Contracts

```tsx
// components/layout/header-auth.tsx
interface HeaderAuthProps {
  name?: string | null;
  image?: string | null;
  role?: "PATIENT" | "PROFESSIONAL" | "ADMIN" | string | null;
}
```

```tsx
// components/layout/dashboard-header.tsx
interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  name?: string | null;
  image?: string | null;
  role?: string | null;
}
```

## Semantic Color Migration

On `app/paciente/dashboard/page.tsx`, replace the following patterns:

| Current | Replacement |
|---|---|
| `bg-white dark:bg-slate-900` | `bg-card` |
| `text-slate-900 dark:text-slate-100` | `text-card-foreground` |
| `border-slate-200 dark:border-slate-800` | `border-border` |
| `text-slate-500 dark:text-slate-400` | `text-muted-foreground` |
| `text-slate-600 dark:text-slate-400` | `text-muted-foreground` |
| `bg-slate-50 dark:bg-slate-800` | `bg-muted` |

Icon backgrounds (`bg-emerald-100 dark:bg-emerald-950`, etc.) do not have direct semantic equivalents and are not required to change by the spec. They can keep explicit `dark:` pairs now that the theme class is stable.

## Chart Verification / Fix Plan

1. Confirm each chart consumes `useResolvedTheme()` and its wrapper has `key={resolvedTheme}`.
2. Confirm all Recharts colors come from CSS variables (`--primary`, `--accent`, `--border`, `--muted-foreground`, `--card`, `--card-foreground`, `--role-patient-primary`, `--role-professional-primary`).
3. Manually verify after the theme fix: mount `WeightChart`, `EngagementChart`, and `AdminStatsChart`, then toggle light/dark and navigate between routes. Charts should repaint with the active palette without a manual refresh.
4. If Recharts caches a stale variable value, add a small helper that reads the computed color string via `getComputedStyle` and pass that string to the Recharts prop, recomputing whenever `resolvedTheme` changes.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Visual / Manual | Theme class survives hard refresh and client navigation | Toggle theme, hard refresh, navigate between routes, inspect `<html>` and `<body>` class |
| Visual / Manual | Stat cards render correctly in light/dark | Toggle theme; verify card surfaces, borders, and text use semantic tokens |
| Visual / Manual | Charts re-render on theme change | Mount all three charts; toggle theme and verify palette change |
| Build | typecheck + lint + build | Run `npm run typecheck`, `npm run lint`, `npm run build` |

## Migration / Rollout

No data migration. Rollback is a single revert of the modified files.

## Open Questions

None.

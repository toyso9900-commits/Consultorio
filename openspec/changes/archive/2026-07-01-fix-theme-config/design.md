# Design: fix-theme-config

## Technical Approach

Keep theme persistence client-only. Fix chart color sync by replacing hardcoded hex values with semantic CSS variables and forcing a re-render when the resolved theme changes. Harden `ThemeProvider` by re-applying the `light`/`dark` class before paint and after every App Router route change, so React reconciliation cannot leave `<html>` without a theme class.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|----------|--------|--------------|-----------|
| Chart re-render trigger | `key={resolvedTheme}` on the chart wrapper | Re-render only when CSS variables change | Recharts computes some SVG values at render time; a controlled remount guarantees the new palette is picked up. |
| Gradient ids | `React.useId()` per chart instance | Static `id` attributes | Avoids SVG fill collisions when multiple charts share a page. |
| Provider timing | `useLayoutEffect` for class application (isomorphic fallback to `useEffect` on server) | Plain `useEffect` | Prevents flash of un-themed content and repairs the class before paint after route changes. |
| Provider route guard | `usePathname()` dependency | MutationObserver on `<html>` | `usePathname` is the idiomatic App Router signal and avoids DOM polling. |
| Color mapping | Tailwind v4 semantic variables (`--primary`, `--accent`, etc.) | Custom chart-only variables | Reuses existing design tokens; no new CSS surface to maintain. |

## Data Flow

```
┌──────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│ layout.tsx       │────▶│ ThemeProvider        │────▶│ document.html   │
│ inline script    │     │ useLayoutEffect +    │     │ class light/dark│
│ sets first class │     │ pathname dependency  │     │                 │
└──────────────────┘     └──────────────────────┘     └─────────────────┘
          │                        │                            │
          ▼                        ▼                            ▼
   localStorage            useTheme() context            CSS variables
   consultorio-theme       resolvedTheme                 in globals.css
                                                          │
                                 ┌────────────────────────┘
                                 ▼
                    Chart wrappers key={resolvedTheme}
                                 │
                                 ▼
                    Recharts reads var(--*) and re-renders
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `components/admin/admin-stats-chart.tsx` | Modify | Replace hardcoded hex colors with CSS variables; consume `useTheme()`; add unique gradient id and theme re-render key. |
| `components/dashboard/weight-chart.tsx` | Modify | Consume `useTheme()`; add unique gradient id and theme re-render key. |
| `components/dashboard/engagement-chart.tsx` | Modify | Consume `useTheme()`; add theme re-render key. |
| `components/theme-provider.tsx` | Modify | Use isomorphic `useLayoutEffect`; apply class on `resolvedTheme` and `pathname` changes. |
| `app/layout.tsx` | Read-only / minor | Keep inline script; ensure `suppressHydrationWarning` remains. |
| `app/globals.css` | Read-only | Confirm variables cover chart needs (verified). |

## CSS Variable Mapping for Charts

| Visual element | Hardcoded value (admin) | Mapped variable |
|----------------|------------------------|-----------------|
| Grid stroke | `#e2e8f0` | `var(--border)` |
| Axis tick fill | `#64748b` | `var(--muted-foreground)` |
| Tooltip border | `#e2e8f0` | `var(--border)` |
| Tooltip background | `#ffffff` | `var(--card)` |
| Tooltip text | `#1c1917` | `var(--card-foreground)` |
| Traffic line/area/dots | `#6366f1` | `var(--primary)` |
| Registrations line/dots | `#10b981` | `var(--accent)` |
| Weight series | already `var(--role-patient-primary)` | keep |
| Engagement bars | already `var(--role-professional-primary)` | keep |

Gradient stops mirror the line color (`--primary` for admin traffic, `--role-patient-primary` for weight).

## Interfaces / Contracts

No new public APIs. `useTheme()` continues to return:

```ts
interface ThemeProviderState {
  theme: "light" | "dark" | "system";
  resolvedTheme: "light" | "dark";
  setTheme: (theme: "light" | "dark" | "system") => void;
}
```

Chart components remain self-contained; theme subscription is internal.

## ThemeProvider Route-Change Strategy

1. `layout.tsx` injects the inline script so `<html>` already has `light`/`dark` before first paint.
2. `ThemeProvider` reads `localStorage`, resolves `system`, and stores `theme` / `resolvedTheme`.
3. In an isomorphic layout effect it calls `applyTheme(resolvedTheme)` whenever `resolvedTheme` or `pathname` changes.
4. The system scheme listener updates `resolvedTheme` and re-applies the class only while `theme === "system"`.

This repairs cases where React reconciliation strips the class during client navigation without waiting for the OS scheme to change.

## Recharts Re-Render Strategy

Each chart component consumes `useTheme()` and uses `resolvedTheme` as a render key on its outer wrapper:

```tsx
const { resolvedTheme } = useTheme();
const gradientId = React.useId();

return (
  <div key={resolvedTheme} className="h-80 w-full">
    {/* Recharts tree */}
  </div>
);
```

Because all colors reference CSS variables, the remount picks up the active theme values. `useId()` guarantees distinct SVG gradient ids across charts.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Type / build | No TS or build regressions | `npm run typecheck` and `npm run build` |
| Visual light | Admin, weight, engagement charts render with light palette | Manual smoke test |
| Visual dark | Same charts render with dark palette after toggle | Manual smoke test |
| System mode | OS scheme changes update charts after navigating routes | Manual test with OS toggle |
| Multi-chart | Two charts on one page show correct gradients | Admin dashboard + patient dashboard |

## Migration / Rollout

No migration required. Theme remains client-only.

## Risks

| Risk | Mitigation |
|------|------------|
| Full chart remount replays entrance animation | Acceptable for a theme toggle; keep CSS-variable-only paths where Recharts supports them. |
| `usePathname` returns null during SSR | Guard with `typeof window` check; class is applied client-side only. |
| Hydration mismatch if inline script and provider disagree | Inline script and provider use the same resolution logic; `suppressHydrationWarning` remains. |

## Rollback

Revert `components/admin/admin-stats-chart.tsx`, `components/dashboard/weight-chart.tsx`, `components/dashboard/engagement-chart.tsx`, and `components/theme-provider.tsx`. Theme selection and persistence continue to work; chart color sync and route-change class repair are lost.

## Open Questions

None.

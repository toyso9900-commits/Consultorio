# Delta Spec: fix-theme-config

## Scope

Bug-fix change for chart theme synchronization and `ThemeProvider` class resilience. Adds the `chart-theme-sync` capability and hardens existing `theme-settings` behavior.

## ADDED Requirements — chart-theme-sync

### Requirement: Chart colors MUST use semantic CSS variables

All color values used by Recharts components in `components/admin/admin-stats-chart.tsx` MUST reference theme CSS variables instead of hardcoded hex values.

#### Scenario: Admin stats chart in light mode

- GIVEN the dashboard renders `AdminStatsChart` in light mode
- WHEN the chart paints
- THEN grid, axes, tooltip, lines, dots, and area gradient use variables such as `--border`, `--muted-foreground`, `--card`, `--card-foreground`, `--primary`, and `--accent`

#### Scenario: Admin stats chart in dark mode

- GIVEN the same chart in dark mode
- WHEN the chart paints
- THEN those elements render the dark values of the same variables

### Requirement: Chart components MUST re-render on theme change

`AdminStatsChart`, `WeightChart`, and `EngagementChart` MUST consume the active resolved theme so React re-renders them whenever `light` or `dark` changes.

#### Scenario: Switching theme updates every chart

- GIVEN multiple charts are visible
- WHEN the user toggles from light to dark
- THEN every chart re-renders and reflects the dark palette without a manual refresh

#### Scenario: System mode follows the OS

- GIVEN the theme is set to `system`
- WHEN the OS color scheme changes
- THEN every visible chart re-renders to match the new resolved theme

### Requirement: Gradient IDs MUST be unique per chart instance

Any SVG gradient `id` defined inside a chart MUST be unique so multiple charts on the same page do not share or override fills.

#### Scenario: Two charts with gradients on one page

- GIVEN a page contains both `AdminStatsChart` and `WeightChart`
- WHEN both gradients are defined
- THEN each `Area` fill references a distinct `id`

## MODIFIED Requirements — theme-settings

### Requirement: REQ-003 — Theme selector options

The settings page MUST provide a theme selector with three explicit choices: `light`, `dark`, and `system`.

(Previously: `system` reflected the current OS color scheme only at selection time.)

#### Scenario: Choosing each theme mode

- GIVEN a user on `/configuracion`
- WHEN the user selects `light`, `dark`, or `system`
- THEN the UI immediately applies the selected mode
- AND `system` reflects the current OS color scheme

#### Scenario: System mode after client navigation

- GIVEN the theme is `system` and the user navigates to another App Router route
- WHEN the OS color scheme changes
- THEN the UI still updates to match the OS

### Requirement: REQ-011 — Hydration-safe theme provider

The `ThemeProvider` MUST read the resolved theme before the first paint, apply the corresponding class to `<html>`, suppress React hydration mismatches, and re-apply the class after React reconciliation or route changes so the class is never left in an inconsistent state.

(Previously: the provider applied the class only on initial mount and when `resolvedTheme` changed.)

#### Scenario: Hard refresh with saved light mode

- GIVEN a saved theme of `light`
- WHEN the user performs a hard refresh
- THEN `<html class="light">` is present in the initial markup or applied before paint
- AND no hydration warning is logged

#### Scenario: Route change preserves theme class

- GIVEN the UI is in dark mode
- WHEN the user navigates to another App Router route
- THEN `<html class="dark">` remains applied
- AND subsequent OS scheme changes are still honored when in `system` mode

## Error Cases

### Scenario: ThemeProvider re-applies class after React resets it

- GIVEN React reconciliation removes the theme class from `<html>`
- WHEN the provider layout effect runs
- THEN the resolved theme class is restored before paint

### Scenario: Chart re-render without ThemeProvider context

- GIVEN a chart is rendered outside `ThemeProvider`
- WHEN the theme changes
- THEN the chart falls back to its last rendered appearance and does not throw

## Acceptance Criteria

- [ ] Switching theme updates chart colors immediately in light and dark modes.
- [ ] `system` mode follows OS changes after navigating between App Router routes.
- [ ] No new TypeScript, lint, or build errors.
- [ ] Theme persistence and first-paint behavior remain unchanged.

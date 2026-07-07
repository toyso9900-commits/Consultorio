# Delta for Theme Settings

## MODIFIED Requirements

### REQ-011 — Theme provider survives React `<html>` reconciliation

The `ThemeProvider` MUST read the resolved theme before the first paint, apply the corresponding `light`/`dark` class to both `<html>` and `<body>`, suppress React hydration mismatches, and re-apply the class on every route change and whenever React reconciliation or an external script resets the element's `classList`, so the theme class is never left in an inconsistent state.

(Previously: the provider applied the class to `<html>` only when `resolvedTheme` changed.)

#### Scenario: Hard refresh with saved light mode

- GIVEN a saved theme of `light`
- WHEN the user performs a hard refresh
- THEN `<html class="... light">` and `<body class="... light">` are present before the first paint
- AND no hydration warning is logged

#### Scenario: Route change preserves theme class

- GIVEN the UI is in dark mode
- WHEN the user navigates to another App Router route
- THEN `<html class="... dark">` and `<body class="... dark">` remain applied
- AND subsequent OS scheme changes are still honored when in `system` mode

#### Scenario: React reconciliation reset is repaired

- GIVEN React reconciliation removes the `dark` class from `<html>`
- WHEN the provider layout effect runs
- THEN the resolved theme class is restored to `<html>` and `<body>` before paint

#### Scenario: External classList manipulation is repaired

- GIVEN a script or browser extension removes the theme class from `<html>`
- WHEN the provider detects the change
- THEN the resolved theme class is restored before the next paint

### REQ-013 — Chart colors use theme CSS variables

`WeightChart`, `EngagementChart`, and `AdminStatsChart` MUST source all color values used by Recharts from theme CSS variables (`--primary`, `--accent`, `--border`, `--muted-foreground`, `--card`, `--card-foreground`, etc.) instead of hardcoded hex values.

(Previously: only `AdminStatsChart` was required to use theme CSS variables.)

#### Scenario: Admin stats chart in light mode

- GIVEN the dashboard renders `AdminStatsChart` in light mode
- WHEN the chart paints
- THEN grid, axes, tooltip, lines, dots, and area gradient use the light values of the theme variables

#### Scenario: Admin stats chart in dark mode

- GIVEN the same chart in dark mode
- WHEN the chart paints
- THEN those elements render the dark values of the same variables

#### Scenario: Weight chart in dark mode

- GIVEN the dashboard renders `WeightChart` in dark mode
- WHEN the chart paints
- THEN its line, area, grid, and tooltip use the dark values of the theme variables

### REQ-014 — Chart components re-render on theme change

`WeightChart`, `EngagementChart`, and `AdminStatsChart` MUST consume the active resolved theme and re-render whenever it changes, including after hard refresh, client navigation, and React-driven reconciliation, so they always reflect the active palette.

(Previously: charts re-rendered only when `light` or `dark` changed directly.)

#### Scenario: Switching theme updates every chart

- GIVEN multiple charts are visible
- WHEN the user toggles from light to dark
- THEN every chart re-renders and reflects the dark palette without a manual refresh

#### Scenario: System mode follows the OS

- GIVEN the theme is set to `system`
- WHEN the OS color scheme changes
- THEN every visible chart re-renders to match the new resolved theme

#### Scenario: Chart after client navigation

- GIVEN the user navigates to a dashboard page while in dark mode
- WHEN `WeightChart`, `EngagementChart`, or `AdminStatsChart` mounts
- THEN the chart paints with the active dark palette without requiring a manual refresh

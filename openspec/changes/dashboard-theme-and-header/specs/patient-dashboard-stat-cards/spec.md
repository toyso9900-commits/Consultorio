# Patient Dashboard Stat Cards Specification

## Purpose

Define the visual behavior of the patient dashboard stat cards, record panels, chart container, and dashboard header so they react to the active theme without explicit `dark:` overrides.

## Requirements

### REQ-001 — Stat cards use semantic theme colors

All stat cards on `/paciente/dashboard` MUST derive their background, text, border, and muted text colors from semantic Tailwind tokens (`bg-card`, `text-card-foreground`, `border-border`, `text-muted-foreground`, `bg-muted`) instead of hardcoded light/dark pairs.

#### Scenario: Light mode

- GIVEN the active theme is `light`
- WHEN the stat cards render
- THEN their surfaces, borders, and text use the light values of the semantic tokens

#### Scenario: Dark mode

- GIVEN the active theme is `dark`
- WHEN the stat cards render
- THEN their surfaces, borders, and text use the dark values of the semantic tokens

### REQ-002 — Record and detail containers use semantic colors

Inner record panels and detail boxes inside the dashboard MUST use `bg-muted` and `text-muted-foreground` so they remain theme-aware without explicit `dark:` overrides.

#### Scenario: Record panel renders

- GIVEN the user views the weight/record section
- WHEN the inner panels render
- THEN their background and text follow the active theme semantic tokens

### REQ-003 — Dashboard header title/subtitle are optional

`DashboardHeader` MUST accept `title` and `subtitle` as optional props and MUST omit the title block when neither is provided.

#### Scenario: Patient layout omits title

- GIVEN `app/paciente/dashboard/layout.tsx` does not pass `title` or `subtitle`
- WHEN the dashboard header renders
- THEN only the avatar menu area is shown
- AND no empty title block is rendered

### REQ-004 — Build/typecheck/lint pass

Changes to the dashboard page and dashboard header MUST leave `npm run build`, `npm run typecheck`, and `npm run lint` passing.

#### Scenario: Verification

- GIVEN the changes are implemented
- WHEN the verification commands run
- THEN all three commands exit with code zero

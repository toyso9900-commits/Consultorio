# Food Photo Calories — Specification

## Data Model

### Requirement: MealEntry persistence

The system MUST persist meal entries in a `MealEntry` model linked to `User`.

| Field | Type | Requirement |
|---|---|---|
| id | CUID | Required primary key |
| userId | String | Required foreign key to `User` |
| imageUrl | String? | Optional stored photo path |
| description | String | Required meal description |
| mealType | MealType | Required, default `OTHER` |
| calories | Int | Required, ≥ 0 |
| proteinG, carbsG, fatG | Float? | Optional macronutrients |
| aiModel, aiConfidence | String?, Float? | Optional AI metadata |
| source | MealSource | Required, default `AI` |
| consumedAt, createdAt, updatedAt | DateTime | Required timestamps |

#### Scenario: Saving an analyzed meal

- GIVEN a patient confirms an AI analysis
- WHEN `saveMealEntry` is invoked with valid data
- THEN a `MealEntry` row is created for the current user

#### Scenario: Aggregating today's entries

- GIVEN saved entries exist for today
- WHEN the dashboard queries today's calories
- THEN the system returns the sum of `calories`

### Requirement: Enumerated types

The system MUST define `MealType` (`BREAKFAST`, `LUNCH`, `DINNER`, `SNACK`, `OTHER`) and `MealSource` (`AI`, `MANUAL`) enums.

## AI Analysis

### Requirement: analyzeFoodImage server action

The system MUST expose `analyzeFoodImage` as a server action that validates the image, stores it, calls the vision model, and returns Zod-validated JSON.

#### Scenario: Valid image is analyzed

- GIVEN an authenticated patient uploads an allowed image ≤ 5 MB
- WHEN `analyzeFoodImage` runs
- THEN it returns `description`, `calories`, `proteinG`, `carbsG`, `fatG`, and `confidence`

#### Scenario: Invalid file is rejected

- GIVEN a non-image file or oversized image
- WHEN `analyzeFoodImage` runs
- THEN it returns a validation error without calling the AI

## Nutrition Page

### Requirement: Upload and playground

The page MUST allow photo upload/capture and display AI estimates without persisting playground results.

#### Scenario: Playground analysis

- GIVEN the patient uploads a photo in playground mode
- WHEN analysis completes
- THEN results are shown and no `MealEntry` is created

#### Scenario: Save analyzed meal

- GIVEN analysis results are displayed
- WHEN the patient confirms/edits and saves
- THEN a `MealEntry` is persisted and shown in history

### Requirement: History and totals

The page MUST list today's saved entries with calories and timestamps.

#### Scenario: History reflects saved entries

- GIVEN the patient has saved meals today
- WHEN the history section renders
- THEN it shows each entry's description, type, calories, and time

## Navigation & Dashboard

### Requirement: Sidebar link

The patient sidebar MUST include a "Comidas"/"Meals" link to `/paciente/dashboard/nutricion`.

#### Scenario: Sidebar renders

- GIVEN the patient is in the dashboard
- WHEN the sidebar renders
- THEN the nutrition link is visible and navigable

### Requirement: Calorie widget

The dashboard "Calories today" widget MUST sum today's `MealEntry` records.

#### Scenario: Widget updates with meals

- GIVEN the patient saved meals today
- WHEN the dashboard loads
- THEN the widget shows the sum of today's `MealEntry.calories`

## i18n

### Requirement: Translation coverage

All new user-facing strings MUST be added to `lib/i18n/dictionaries/es.ts` and `en.ts`.

#### Scenario: Locale switch

- GIVEN the patient changes locale
- WHEN the nutrition page renders
- THEN labels, buttons, disclaimers, and errors appear in the selected language

## Security

### Requirement: File validation

The system MUST enforce allowed MIME types (`image/jpeg`, `image/png`, `image/webp`) and a 5 MB size limit server-side.

#### Scenario: Disallowed upload

- GIVEN a file with invalid type or size
- WHEN it is submitted
- THEN it is rejected before storage or AI invocation

### Requirement: Rate limiting

The system MUST enforce per-user rate limiting on `analyzeFoodImage`.

#### Scenario: Limit exceeded

- GIVEN a patient exceeds the configured analysis limit
- WHEN they request another analysis
- THEN the action returns a rate-limit error

### Requirement: PII-free prompt

The system MUST NOT include patient names, identifiers, medical history, or location in the AI prompt.

#### Scenario: Prompt inspection

- GIVEN any analysis request
- WHEN the prompt is built
- THEN it contains only the image and a neutral system prompt

## Acceptance Criteria

- Photo upload/capture returns structured calorie and macro estimates.
- Playground analysis does not create a `MealEntry`.
- Save persists a validated entry linked to the current user.
- Dashboard "Calories today" sums today's saved entries.
- `npm run typecheck` and `npm run build` pass.

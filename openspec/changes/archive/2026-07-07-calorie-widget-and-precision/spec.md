# Spec: Calorie Widget and Precision

## ADDED Requirements

### Requirement: MealIngredient model

The system MUST add a `MealIngredient` model linked to `MealEntry` with fields `mealEntryId`, `name`, `weightG`, `calories`, `proteinG`, `carbsG`, `fatG`.

#### Scenario: Persisting ingredients

- GIVEN a meal with ingredients is saved
- WHEN persisted
- THEN `MealEntry` and `MealIngredient` rows are created

### Requirement: Reference-scale detection

The system SHOULD detect a known reference object (coin, card, spoon, hand).

#### Scenario: Object detected

- GIVEN the photo contains a recognizable reference
- WHEN `analyzeFoodImage` runs
- THEN `referenceScale` returns `type`, `detected: true`, and `confidence`

#### Scenario: Object absent

- GIVEN no reference is detected
- WHEN analysis completes
- THEN `detected` is `false` and a warning is shown

### Requirement: Ingredient breakdown

The system MUST return an ingredient list with weights and macros.

#### Scenario: Valid photo

- GIVEN an allowed image ≤ 5 MB
- WHEN `analyzeFoodImage` runs
- THEN it returns `ingredients` with `name`, `weightG`, `calories`, `proteinG`, `carbsG`, `fatG`, and `confidence`

#### Scenario: Unrecognizable photo

- GIVEN the model cannot identify ingredients
- WHEN analysis completes
- THEN `ingredients` is empty

### Requirement: Nutritional table calculation

The system MUST override AI macros with per-gram table values.

#### Scenario: Ingredient in table

- GIVEN an ingredient matches a table entry and `weightG` is present
- WHEN computed
- THEN values use `table value × weight`

#### Scenario: Ingredient not in table

- GIVEN an ingredient has no table entry
- WHEN computed
- THEN the system falls back to AI values

### Requirement: Ingredient editing

The system MUST allow editing ingredient names and weights before saving.

#### Scenario: Weight override

- GIVEN ingredients are displayed
- WHEN a weight changes
- THEN totals recalculate and save uses the new weight

#### Scenario: Ingredient removal

- GIVEN the patient removes an ingredient
- WHEN saved
- THEN that ingredient is excluded and totals reflect the remainder

### Requirement: Calorie summary widget

The system MUST render a `CalorieSummary` widget showing today's calories, macros, and progress toward a daily goal.

#### Scenario: Meals logged

- GIVEN today's entries exist
- WHEN the dashboard loads
- THEN the widget shows kcal, protein, carbs, fat, and progress

#### Scenario: No meals logged

- GIVEN no meals are logged today
- WHEN the widget renders
- THEN totals are zero and progress is 0%

## MODIFIED Requirements

### Requirement: analyzeFoodImage server action

The system MUST update `analyzeFoodImage` to return JSON including `referenceScale` and `ingredients`.

(Previously: returned only `description`, `calories`, macros, and `confidence`.)

#### Scenario: Valid image

- GIVEN a patient uploads an allowed image ≤ 5 MB
- WHEN `analyzeFoodImage` runs
- THEN it returns `description`, `referenceScale`, `ingredients`, calories, macros, and `confidence`

#### Scenario: Invalid file

- GIVEN a non-image or oversized file
- WHEN `analyzeFoodImage` runs
- THEN it returns a validation error without calling the AI

### Requirement: Calorie widget

The dashboard "Calories today" widget MUST aggregate today's `MealEntry` and `MealIngredient` macros.

(Previously: summed only `MealEntry.calories`.)

#### Scenario: Widget updates

- GIVEN the patient saved meals today
- WHEN the dashboard loads
- THEN the widget shows summed calories and macros

#### Scenario: Legacy entries

- GIVEN saved meals have no ingredient rows
- WHEN the widget loads
- THEN those entries use stored `MealEntry.calories` and null macros

## Unchanged Requirements

### Requirement: File validation

The system MUST enforce MIME types (`image/jpeg`, `image/png`, `image/webp`) and a 5 MB size limit server-side.

#### Scenario: Disallowed upload

- GIVEN an invalid type or oversized file
- WHEN submitted
- THEN it is rejected before storage or AI invocation

## Acceptance Criteria

- `analyzeFoodImage` returns ingredient breakdown, reference status, and confidence.
- Saving a meal persists each ingredient with weight and macros.
- Dashboard widget shows today's calories, macros, and progress toward a goal.
- User can edit ingredients and override weight before saving.
- `npm run typecheck` and `npm run build` pass.

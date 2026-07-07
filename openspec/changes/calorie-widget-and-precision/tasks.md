# Tasks: Calorie Widget and Precision

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 500–800 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 → PR 4 |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Database foundation and nutritional table | PR 1 | `prisma/schema.prisma`, migration, `lib/nutrition-data.ts`; base = `main` or feature tracker |
| 2 | Ingredient-aware analysis and save pipeline | PR 2 | `app/paciente/dashboard/nutricion/actions.ts`; depends on PR 1 |
| 3 | Daily macro aggregation and dashboard widget | PR 3 | `get-today-macros.ts`, `calorie-summary.tsx`, `page.tsx`; depends on PR 1, can follow PR 2 |
| 4 | Editable ingredient UI and i18n labels | PR 4 | `food-analysis-result.tsx`, dictionaries; depends on PR 2 |

## Phase 1: Database Foundation

- [x] 1.1 Add `MealIngredient` model to `prisma/schema.prisma` and add `ingredients MealIngredient[]` relation to `MealEntry`.
- [x] 1.2 Generate and apply `add_meal_ingredients` Prisma migration locally.
- [x] 1.3 Create `lib/nutrition-data.ts` with per-gram table and `computeIngredient` helper.

## Phase 2: Analysis Pipeline

- [x] 2.1 Update Zod schemas in `app/paciente/dashboard/nutricion/actions.ts` to include `referenceScale` and `ingredients`.
- [x] 2.2 Update Gemini prompt to request reference object, ingredient list, and per-ingredient weights.
- [x] 2.3 Apply `computeIngredient` override to each analyzed ingredient before returning results.
- [x] 2.4 Update `saveMealEntry` to accept and persist `ingredients` as nested `MealIngredient` rows.

## Phase 3: Dashboard Widget

- [x] 3.1 Rename `app/paciente/dashboard/nutricion/get-today-calories.ts` to `get-today-macros.ts` and aggregate calories + macros.
- [x] 3.2 Create `components/dashboard/calorie-summary.tsx` server component with progress bar and macro bars.
- [x] 3.3 Update `app/paciente/dashboard/page.tsx` to call `getTodayMacros` and render `CalorieSummary`.

## Phase 4: Ingredient Editing UI

- [x] 4.1 Update `components/food/food-analysis-result.tsx` to render reference-scale banner and editable ingredient rows.
- [x] 4.2 Add live totals recalculation and ingredient removal in `components/food/food-analysis-result.tsx`.
- [x] 4.3 Add new nutrition and patient-home labels to `lib/i18n/dictionaries/es.ts` and `en.ts`.

## Phase 5: Verification

- [ ] 5.1 Run `npm run typecheck` and fix type errors.
- [ ] 5.2 Run `npm run build` and fix build errors.
- [ ] 5.3 Smoke test photo upload, ingredient editing, save, and dashboard widget locally.

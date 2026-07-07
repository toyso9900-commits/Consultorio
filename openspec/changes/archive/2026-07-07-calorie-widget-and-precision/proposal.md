# Proposal: Calorie Widget and Precision

## Intent

The current food-photo calorie estimate is a single AI guess with no portion scale or ingredient math. We will make estimates more reliable by combining visual reference detection, ingredient-level weights, and a real nutritional-values table, while surfacing a richer daily summary on the patient dashboard.

## Scope

### In Scope
- Reference-scale object detection in food photos (coin, card, spoon, hand) with low-confidence warning and continue option.
- AI ingredient breakdown with estimated weights.
- Calorie and macro calculation from a per-gram nutritional table.
- Editable ingredient list and real-weight override before saving.
- Daily calorie summary widget on the patient dashboard with macros and progress toward a daily goal.

### Out of Scope
- Theme or header changes (handled in `dashboard-theme-and-header`).
- Professional/advisor view of patient meals.
- Patient profile goal editing; goal is hard-coded or read from an existing profile field.

## Capabilities

### New Capabilities
- `meal-ingredient-model`: Add `MealIngredient` Prisma model and migrate existing `MealEntry` rows.
- `reference-scale-detection`: Detect a known reference object in the photo and warn when absent.
- `ingredient-based-calculation`: Convert ingredient weights to calories/macros using a nutritional table.
- `calorie-summary-widget`: Render daily calorie/macro summary and progress on the patient dashboard.

### Modified Capabilities
- `nutrition`: Update `analyzeFoodImage`, `saveMealEntry`, and `FoodAnalysisResult` to support ingredient breakdown and weight overrides. Update `getTodayCalories` aggregation to include macros for the widget.

## Approach

1. Add `MealIngredient` linked to `MealEntry` and run a Prisma migration.
2. Extend the Gemini prompt to request a reference object, ingredient list with weights, and per-ingredient macros/calories.
3. Build a small `lib/nutrition-data.ts` table of calories/protein/carbs/fat per gram for common foods; override AI macro guesses with table values when the ingredient is recognized.
4. Update `foodAnalysisSchema` and `FoodAnalysisResult` UI to display ingredients, confidence, reference status, and editable weights.
5. Create `CalorieSummary` server component on `app/paciente/dashboard/page.tsx` using aggregated `MealIngredient` and `MealEntry` data.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | New | Add `MealIngredient` model. |
| `app/paciente/dashboard/nutricion/actions.ts` | Modified | New schema, prompt, and save logic. |
| `components/food/food-analysis-result.tsx` | Modified | Ingredient list editing and weight override. |
| `app/paciente/dashboard/page.tsx` | Modified | Add `CalorieSummary` widget. |
| `components/dashboard/calorie-summary.tsx` | New | Daily summary + goal progress. |
| `app/paciente/dashboard/nutricion/get-today-calories.ts` | Modified | Aggregate macros and calories. |
| `lib/nutrition-data.ts` | New | Per-gram nutritional table. |
| `lib/i18n/dictionaries/*.ts` | Modified | New labels and warnings. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| AI reference detection is unreliable | Med | Allow low-confidence continue and let the user override weight. |
| Nutritional table is incomplete | Med | Keep table extensible; fall back to AI values when unknown. |
| Schema migration on deployed data | Low | Migration is additive; existing rows have no ingredients. |
| Change exceeds review budget | High | Split into migration + analysis + widget slices during `sdd-tasks`. |

## Rollback Plan

1. Revert the code changes.
2. Run a down migration to remove `MealIngredient` or leave the empty table in place.
3. Restore the previous AI prompt/schema if precision changes regress.

## Dependencies

- Gemini API key and vision model access.
- Existing `MealEntry` schema and `getTodayCalories` aggregation.

## Success Criteria

- [ ] `analyzeFoodImage` returns ingredient breakdown, reference status, and confidence.
- [ ] Saving a meal persists each ingredient with weight and macros.
- [ ] Dashboard widget shows today's calories, macros, and progress toward a daily goal.
- [ ] User can edit ingredients and override weight before saving.
- [ ] `npm run typecheck` and `npm run build` pass.

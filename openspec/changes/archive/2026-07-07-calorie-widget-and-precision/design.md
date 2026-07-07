# Design: Calorie Widget and Precision

## Technical Approach

Replace the single AI calorie guess with a reference-aware, ingredient-level pipeline. A photo is analyzed for a known reference object, an ingredient list with estimated weights, and per-ingredient macros. Weights are then re-computed through a local per-gram nutritional table, and the user can edit names/weights before saving. A new dashboard widget surfaces today's calories, macros, and progress toward a hard-coded daily goal.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|----------|--------|--------------|-----------|
| Ingredient storage | New `MealIngredient` table linked to `MealEntry` | Store ingredients as JSON in `MealEntry` | Normalized rows are queryable for aggregations and edits. |
| Calorie source of truth | Sum of saved `MealIngredient.calories` | Keep relying on `MealEntry.calories` | Totals must match the editable ingredient list. Legacy rows fall back to `MealEntry.calories`. |
| Nutritional table | Static `lib/nutrition-data.ts` lookup | External USDA API | Avoids network dependency and keeps response fast. Table is intentionally small and extensible. |
| Reference object handling | Detect and warn; allow continue | Block upload without reference | Portion estimation is already approximate; user override is the safety net. |
| Daily goal | Hard-coded constant `2000` kcal | Read from `PatientProfile.goals` | Goal editing is out of scope; constant can be moved to config/profile later. |
| Widget type | Server component on dashboard | Client-only widget | Data is already fetched server-side; keeps UI simple and avoids extra round trip. |

## Data Flow

```
Patient upload
    │
    ▼
analyzeFoodImage ──► file validation ──► rate limit ──► save image
    │
    ▼
Gemini vision prompt
    │
    ▼
foodAnalysisSchema.parse ──► lib/nutrition-data.ts override
    │
    ▼
FoodAnalysisResult (edit weights / remove ingredients)
    │
    ▼
saveMealEntry ──► Prisma MealEntry + MealIngredient rows
    │
    ▼
getTodayMacros ──► CalorieSummary widget
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | Modify | Add `MealIngredient` model and relation from `MealEntry`. |
| `prisma/migrations/*` | Create | `add_meal_ingredients` migration. Existing rows remain ingredient-less. |
| `app/paciente/dashboard/nutricion/actions.ts` | Modify | New Zod schemas, Gemini prompt, table override, ingredient-aware save. |
| `lib/nutrition-data.ts` | Create | Per-gram calories/protein/carbs/fat table and lookup helper. |
| `app/paciente/dashboard/nutricion/get-today-calories.ts` | Modify | Rename to `get-today-macros.ts`; return calories + macros. |
| `components/food/food-analysis-result.tsx` | Modify | Ingredient list, editable weights, reference warning, recalculated totals. |
| `components/dashboard/calorie-summary.tsx` | Create | Daily summary, macro breakdown, progress vs goal. |
| `app/paciente/dashboard/page.tsx` | Modify | Fetch macros and render `CalorieSummary`. |
| `lib/i18n/dictionaries/es.ts`, `en.ts` | Modify | New nutrition and patient-home labels. |

## Interfaces / Contracts

### Prisma model

```prisma
model MealIngredient {
  id          String    @id @default(cuid())
  mealEntryId String
  mealEntry   MealEntry @relation(fields: [mealEntryId], references: [id], onDelete: Cascade)
  name        String
  weightG     Float?
  calories    Int
  proteinG    Float?
  carbsG      Float?
  fatG        Float?
}
```

Add `ingredients MealIngredient[]` to `MealEntry`.

### Analysis schema

```ts
const ingredientSchema = z.object({
  name: z.string(),
  weightG: z.number().min(0),
  calories: z.number().int().min(0),
  proteinG: z.number().min(0).optional(),
  carbsG: z.number().min(0).optional(),
  fatG: z.number().min(0).optional(),
  confidence: z.number().min(0).max(1),
});

const foodAnalysisSchema = z.object({
  description: z.string(),
  referenceScale: z.object({
    type: z.enum(["coin", "card", "spoon", "hand", "none"]),
    detected: z.boolean(),
    confidence: z.number().min(0).max(1),
  }),
  ingredients: z.array(ingredientSchema),
  calories: z.number().int().min(0),
  proteinG: z.number().min(0).optional(),
  carbsG: z.number().min(0).optional(),
  fatG: z.number().min(0).optional(),
  confidence: z.number().min(0).max(1),
});
```

### Nutritional table helper

```ts
export function computeIngredient(name: string, weightG: number, aiValues: IngredientValues) {
  const row = lookupNutrition(name);
  if (!row) return aiValues;
  return {
    calories: Math.round(row.kcalPerG * weightG),
    proteinG: round(row.proteinGPerG * weightG),
    carbsG: round(row.carbsGPerG * weightG),
    fatG: round(row.fatGPerG * weightG),
  };
}
```

## Server Action Flow

1. `analyzeFoodImage`
   - Validate file type/size (existing behavior).
   - Persist image and rate-limit request.
   - Call Gemini with the updated prompt (reference object + ingredient array).
   - Parse with `foodAnalysisSchema`.
   - For each ingredient, override macros with `computeIngredient`.
   - Return image URL, `referenceScale`, `ingredients`, and totals.

2. `saveMealEntry`
   - Accept `ingredients` array in the payload.
   - Create `MealEntry` with top-level totals.
   - Create nested `MealIngredient` rows.
   - Revalidate dashboard paths.

3. `getTodayMacros`
   - Query today's `MealEntry` rows with `ingredients` included.
   - For entries with ingredients, sum ingredient fields.
   - For legacy entries without ingredients, use `MealEntry.calories` and `null` macros.

## Updated `FoodAnalysisResult` UI

- Render reference-scale banner: green if detected, yellow warning if not with a "Continue anyway" save path.
- Show editable ingredient rows: name input, weight input (g), computed calories/macros, confidence badge.
- Provide remove button per row and a live totals footer.
- On save, send the current `ingredients` array so the server persists the edited values.

## `CalorieSummary` Widget Design

- Server component receiving `{ calories, proteinG, carbsG, fatG, goal }`.
- Large calorie total with "of {goal} kcal" label and a linear progress bar (`calories / goal`).
- Compact macro bars for protein, carbs, and fat with gram values.
- Empty state: all zeros and 0% progress.
- Place inside the dashboard's lower grid, above or beside the existing documents/experts cards.

## Dashboard Integration

- Update `app/paciente/dashboard/page.tsx` to call `getTodayMacros(userId)` instead of `getTodayCalories`.
- Pass the returned object to `CalorieSummary` and keep the existing stat-card value for quick scanning.
- Add dictionary keys for widget labels (e.g., `patientHome.calorieGoal`, `nutrition.referenceNotDetected`).

## Migration / Rollout

1. Apply Prisma schema change.
2. Run `npx prisma migrate dev --name add_meal_ingredients` locally.
3. Run `npx prisma migrate deploy` in production.
4. No data migration required; existing `MealEntry` rows simply have no `MealIngredient` children and are treated as legacy.

## Risks / Rollback

| Risk | Mitigation |
|------|------------|
| AI reference detection unreliable | Allow low-confidence continue; user can override weight. |
| Nutritional table incomplete | Fallback to AI macros; expand table over time. |
| Total mismatch between ingredients and `MealEntry.calories` | Recompute totals from ingredients in the UI and server before save. |
| Migration issues | Additive migration; rollback = revert code + optional down migration. |

Rollback plan: revert code, restore previous prompt/schema, and run `prisma migrate deploy` with the previous migration baseline or manually drop `MealIngredient`.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Type | New schemas, Prisma types, server action types | `npm run typecheck` |
| Build | Widget and action pages render | `npm run build` |
| Manual | Upload photo, edit ingredients, save, check dashboard aggregation | Local smoke test |

## Open Questions

- [ ] Should `MealIngredient` store per-ingredient AI confidence? (Not required by spec.)
- [ ] Is `2000` kcal the right hard-coded daily goal, or should it come from a config/env?

# Verification Report — Food Photo Calories

- **Change**: `food-photo-calories`
- **Project**: `consultorio`
- **Branch**: `feature/dashboard-differentiation-ratings-pr4`
- **Artifact store**: `openspec`
- **Execution mode**: `auto`
- **Date**: 2026-07-03
- **Verifier**: `sdd-verify`

---

## Executive Summary

All OpenSpec tasks are marked complete and the project passes `typecheck`, `lint`, and `build`. Static inspection confirms the new Prisma model, enums, server actions, components, i18n keys, sidebar link, and dashboard widget are in place. However, one functional deviation blocks a clean pass: the nutrition history section is titled "Hoy"/"Today" but renders **all** saved meal entries, not just today's, violating the spec requirement that the page "MUST list today's saved entries." Runtime verification of the AI flow was not performed because there is no test runner and this environment cannot run a browser/manual session.

**Verdict**: `FAIL` (one CRITICAL spec deviation). Once the history filter is corrected, the change can move to `PASS WITH WARNINGS` pending manual AI-flow validation.

---

## 1. Task Completeness

| Task | Status | Evidence |
|---|---|---|
| 1.1 Add `MealEntry`, `MealType`, `MealSource` to Prisma + `User` relation | ✅ | `prisma/schema.prisma` lines 250–286; `User.mealEntries` line 64 |
| 1.2 Run migration and regenerate client | ✅ | Migration `prisma/migrations/20260703201533_add_meal_entries/migration.sql` exists |
| 1.3 Add `GEMINI_API_KEY=` to `.env.example` | ✅ | `.env.example` line 28 |
| 1.4 Add `@google/genai` dependency and install | ✅ | `package.json` line 18 |
| 1.5 Add `nav.meals` and `nutrition.*` i18n keys | ✅ | `lib/i18n/dictionaries/es.ts`, `en.ts`, `lib/i18n/dictionaries/index.ts` |
| 1.6 Add patient "Meals" nav item | ✅ | `components/layout/sidebar.tsx` lines 55, 17 |
| 1.7 Create `get-today-calories.ts` and update dashboard | ✅ | `app/paciente/dashboard/nutricion/get-today-calories.ts`; `app/paciente/dashboard/page.tsx` line 53 |
| 2.1 Create `actions.ts` exporting required functions/schemas | ✅ | `app/paciente/dashboard/nutricion/actions.ts` lines 23–261 |
| 2.2 File validation (MIME + 5 MB) | ✅ | `actions.ts` lines 84–92 |
| 2.3 Per-user in-memory rate limiting | ✅ | `actions.ts` lines 19–72, 94–96 |
| 2.4 Store images under `public/uploads/meals/` | ✅ | `actions.ts` lines 98–108 |
| 2.5 Gemini call with JSON prompt + Zod validation | ✅ | `actions.ts` lines 112–171 |
| 2.6 `saveMealEntry` persistence | ✅ | `actions.ts` lines 186–238 |
| 2.7 `getMealEntries(userId)` | ✅ | `actions.ts` lines 240–261 |
| 3.1 `food-photo-upload.tsx` | ✅ | `components/food/food-photo-upload.tsx` |
| 3.2 `food-analysis-result.tsx` | ✅ | `components/food/food-analysis-result.tsx` |
| 3.3 `meal-history-list.tsx` | ✅ | `components/food/meal-history-list.tsx` |
| 3.4 Nutrition page composing all parts | ✅ | `app/paciente/dashboard/nutricion/page.tsx` + `nutrition-page-client.tsx` |
| 4.1 `typecheck` and `build` pass | ✅ | See Build Evidence below |
| 4.2 Manual verification noted in apply-progress | ⚠️ | Documented as smoke-tested by apply agent; not re-run in this headless session |

**Task completion**: 20/20 checked.

---

## 2. Build / Static-Analysis Evidence

### `npm run typecheck`

```text
> consultorio@0.1.0 typecheck
> tsc --noEmit

(Exit 0, no errors)
```

### `npm run lint`

```text
> consultorio@0.1.0 lint
> eslint

(Exit 0, no errors)
```

### `npm run build`

```text
> consultorio@0.1.0 build
> next build

▲ Next.js 16.2.9 (Turbopack)
- Environments: .env

  Creating an optimized production build ...
✓ Compiled successfully in 44s
  Running TypeScript ...
  Finished TypeScript in 33.5s ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/27) ...
  ...
✓ Generating static pages using 7 workers (27/27) in 2.2s
  Finalizing page optimization ...

Route (app)
├ ...
├ ƒ /paciente/dashboard/nutricion
├ ...
```

Build completed with exit code `0` and the `/paciente/dashboard/nutricion` route is present.

---

## 3. Spec Compliance Matrix

| Requirement | Scenario | Evidence | Status |
|---|---|---|---|
| **MealEntry persistence** | Saving an analyzed meal | `saveMealEntry` → `prisma.mealEntry.create` (`actions.ts` lines 214–228) | ✅ Implemented |
| **MealEntry persistence** | Aggregating today's entries | `getTodayCalories` uses `prisma.mealEntry.aggregate` with `gte`/`lte` of today (`get-today-calories.ts`) | ✅ Implemented |
| **Enumerated types** | `MealType` & `MealSource` exist | `prisma/schema.prisma` lines 275–286 | ✅ Implemented |
| **analyzeFoodImage** | Valid image analyzed | `actions.ts` lines 74–171; uses `@google/genai` + Zod schema | ⚠️ Implemented / AI flow not runtime-tested |
| **analyzeFoodImage** | Invalid file rejected | `actions.ts` lines 84–92 enforce MIME type, size, non-empty | ✅ Implemented |
| **Nutrition Page** | Playground analysis | `FoodPhotoUpload` calls `analyzeFoodImage`; only `setAnalysis` is called, no DB write until Save | ⚠️ Implemented / not runtime-tested |
| **Nutrition Page** | Save analyzed meal | `FoodAnalysisResult` calls `saveMealEntry`; `revalidatePath` refreshes page | ⚠️ Implemented / not runtime-tested |
| **Nutrition Page** | History reflects saved entries | `MealHistoryList` renders entries; **but entries are not filtered to today** | ❌ **CRITICAL deviation** |
| **Navigation** | Sidebar renders meals link | `components/layout/sidebar.tsx` PATIENT nav lines 53–61 | ✅ Implemented |
| **Dashboard** | Calorie widget sums today | `app/paciente/dashboard/page.tsx` line 53 uses `getTodayCalories(userId)` | ✅ Implemented |
| **i18n** | Translation coverage | `es.ts` and `en.ts` contain full `nutrition` namespace; `Dictionary` interface updated | ✅ Implemented |
| **Security** | File validation | Server-side MIME (`image/jpeg`, `image/png`, `image/webp`) and 5 MB check in `analyzeFoodImage` | ✅ Implemented |
| **Security** | Rate limiting | In-memory sliding window (15 min, 5 req) keyed by `userId` | ✅ Implemented |
| **Security** | PII-free prompt | Prompt contains only the image and a neutral JSON schema request; no user data | ✅ Implemented |

---

## 4. Correctness Table

| Checkpoint | Expected | Actual | Status |
|---|---|---|---|
| `prisma/schema.prisma` contains `MealEntry` | Yes | Yes, with all required fields and `@@index([userId, consumedAt])` | ✅ |
| `MealType` & `MealSource` enums exist | Yes | Yes (`BREAKFAST/LUNCH/DINNER/SNACK/OTHER`, `AI/MANUAL`) | ✅ |
| `app/paciente/dashboard/nutricion/actions.ts` exists and exports `analyzeFoodImage`, `saveMealEntry`, `getMealEntries`, Zod schemas, result types | Yes | Yes | ✅ |
| Nutrition page exists at `/paciente/dashboard/nutricion` | Yes | `page.tsx` + `nutrition-page-client.tsx`; build route generated | ✅ |
| Food upload, analysis result, history components exist | Yes | `components/food/food-photo-upload.tsx`, `food-analysis-result.tsx`, `meal-history-list.tsx` | ✅ |
| Sidebar includes "Comidas"/"Meals" link | Yes | `components/layout/sidebar.tsx` line 55 | ✅ |
| Dashboard widget sums today's `MealEntry.calories` | Yes | `app/paciente/dashboard/page.tsx` line 53 | ✅ |
| i18n keys present in both locales | Yes | `es.ts` and `en.ts` `nutrition` namespace; `Dictionary` interface updated | ✅ |

---

## 5. Design Coherence

| Design Decision | Design Spec | Implementation | Status |
|---|---|---|---|
| `MealEntry` model shape | Matches schema in design.md | Matches exactly | ✅ |
| File storage in `public/uploads/meals/` with UUID | Yes | Yes (`randomUUID` + extension) | ✅ |
| Rate limit window | 15 min sliding window, 10 requests in design.md | 15 min, 5 requests | ⚠️ WARNING: design doc stale; implementation matches tasks/spec |
| Vision model | `gemini-1.5-flash-latest` | `gemini-flash-latest` alias | ⚠️ WARNING: API alias substitution (documented in apply-progress) |
| History list receives "today's entries" | Yes | Receives all user entries | ❌ **CRITICAL deviation** |
| i18n key plan | Listed keys | All present plus extra UI labels (calories, protein, etc.) | ✅ |

---

## 6. Issues

### CRITICAL

1. **History section shows all saved entries, not just today's.**
   - **Location**: `app/paciente/dashboard/nutricion/actions.ts` `getMealEntries` (lines 250–255) and `app/paciente/dashboard/nutricion/page.tsx`.
   - **Details**: `getMealEntries` queries `where: { userId }` with `take: 50` and no date filter. The page passes these unfiltered entries to `MealHistoryList`, whose title is "Hoy"/"Today".
   - **Spec impact**: Violates "The page MUST list today's saved entries" and the scenario "History reflects saved entries" (today).
   - **Recommended fix**: Add a `startOfDay`/`endOfDay` filter on `consumedAt` in `getMealEntries`, or filter server-side in `page.tsx` before passing props.

### WARNING

1. **No automated tests / headless runtime verification for the AI flow.**
   - Strict TDD is disabled and no test runner is configured. The AI upload→analysis→save end-to-end flow could not be exercised automatically in this environment. Manual browser testing is required.
2. **Rate-limit threshold differs from design.md.**
   - Design says 10 requests per 15-minute window; tasks and implementation use 5. Implementation is spec-consistent but the design document is stale.
3. **Gemini model alias substitution.**
   - The design requested `gemini-1.5-flash-latest`; the API returned `404 NOT_FOUND` for that alias, so the code uses `gemini-flash-latest`. The apply-progress documents this, but it remains a design deviation.
4. **Orphan uploaded images.**
   - Every analysis stores a file under `public/uploads/meals/` even if the user never saves the meal. This is an accepted MVP tradeoff documented in the design, but it creates storage growth.

### SUGGESTION

1. Revoke `URL.createObjectURL` previews in `FoodPhotoUpload` to avoid client-side memory leaks.
2. Clear the analysis panel after a successful save to give clearer user feedback.
3. Add integration/unit tests for file validation, rate limiting, and `saveMealEntry` once a test runner is introduced.
4. Consider server-side timezone handling for `getTodayCalories` if users span timezones.

---

## 7. Automatically Verified vs. Manual-Only

### Automatically verified in this run

- `npm run typecheck` passes (no TypeScript errors).
- `npm run lint` passes.
- `npm run build` passes and includes `/paciente/dashboard/nutricion`.
- Prisma schema contains `MealEntry`, `MealType`, and `MealSource`.
- Migration file `20260703201533_add_meal_entries` exists.
- `app/paciente/dashboard/nutricion/actions.ts` exports `analyzeFoodImage`, `saveMealEntry`, `getMealEntries`, Zod schemas, and result types.
- Nutrition page and components (`food-photo-upload`, `food-analysis-result`, `meal-history-list`, `nutrition-page-client`) exist and type-check.
- Sidebar and dashboard integration are present.
- i18n dictionaries (`es.ts`, `en.ts`) and the `Dictionary` interface include `nutrition` keys.
- Server-side file validation, rate-limiting, and PII-free prompt code were inspected.

### Requires manual / browser testing

- Photo upload and camera capture on mobile/desktop.
- Gemini analysis returning valid JSON and the UI displaying estimates.
- Playground analysis **not** creating a `MealEntry`.
- Save flow persisting a row and the corrected history list showing only today's entries.
- Dashboard "Calories today" widget updating after a save.
- Locale switch rendering all new labels in English/Spanish.
- Invalid file and rate-limit error UI messages.
- Real `GEMINI_API_KEY` present in the runtime environment.

---

## 8. Final Verdict

**`FAIL`**

The implementation is structurally complete and builds cleanly, but the CRITICAL history-filter deviation means the spec requirement "list today's saved entries" is not met. Once `getMealEntries` (or the page) is corrected to return only today's entries, the change can be re-verified. At that point the expected verdict is **`PASS WITH WARNINGS`** because the AI end-to-end flow still requires manual/browser validation in an environment with a valid Gemini API key.

---

## 9. Next Recommended Phase

- **`sdd-apply`** to fix the history filtering deviation, then re-run `sdd-verify`.

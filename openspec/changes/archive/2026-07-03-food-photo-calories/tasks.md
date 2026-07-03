# Tasks: Food photo → calorie estimation

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 550–800 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: Foundation (schema, env, deps, i18n, nav, widget) → PR 2: AI backend (server actions, storage, rate limiting) → PR 3: Frontend (page + components) |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Data layer + infra + navigation + dashboard widget | PR 1 | Targets feature/tracker or main; no AI calls yet |
| 2 | AI analysis + storage + persistence actions | PR 2 | Targets PR 1 branch in feature-branch-chain; includes rate limiting and PII-free prompt |
| 3 | Nutrition page + upload/result/history components | PR 3 | Targets PR 2 branch in feature-branch-chain; wires units 1 and 2 together |

## Phase 1: Foundation

- [x] 1.1 Add `MealEntry`, `MealType`, and `MealSource` to `prisma/schema.prisma` and add `mealEntries MealEntry[]` to `User`.
- [x] 1.2 Run `npx prisma migrate dev --name add_meal_entries` and regenerate the client.
- [x] 1.3 Add `GEMINI_API_KEY=` to `.env.example`.
- [x] 1.4 Add `@google/genai` to `package.json` and run `npm install`.
- [x] 1.5 Add `nav.meals` and `nutrition.*` keys to `lib/i18n/dictionaries/es.ts` and `en.ts`.
- [x] 1.6 Add the patient "Meals" nav item to `components/layout/sidebar.tsx`.
- [x] 1.7 Create `app/paciente/dashboard/nutricion/get-today-calories.ts` and update `app/paciente/dashboard/page.tsx` to sum today's `MealEntry.calories`.

## Phase 2: Core AI Backend

- [x] 2.1 Create `app/paciente/dashboard/nutricion/actions.ts` exporting `analyzeFoodImage`, `saveMealEntry`, and Zod schemas.
- [x] 2.2 Implement file validation in `analyzeFoodImage`: allowed MIME types (`image/jpeg`, `image/png`, `image/webp`) and 5 MB max size.
- [x] 2.3 Add per-user in-memory rate limiting (15-minute sliding window, 5 requests) to `analyzeFoodImage`.
- [x] 2.4 Store uploaded images under `public/uploads/meals/` using UUID filenames, mirroring `upload-actions.ts`.
- [x] 2.5 Call Google Gemini 1.5 Flash vision with a JSON-structured prompt using a neutral, PII-free prompt and validate the response with Zod.
- [x] 2.6 Implement `saveMealEntry` to persist validated `MealEntry` rows linked to the current patient.
- [x] 2.7 Add `getMealEntries(userId)` to fetch the current patient's meal history.

## Phase 3: Frontend Components

- [x] 3.1 Create `components/food/food-photo-upload.tsx` with file/camera input, preview, and `useTransition` submission.
- [x] 3.2 Create `components/food/food-analysis-result.tsx` to display and edit AI results and trigger `saveMealEntry`.
- [x] 3.3 Create `components/food/meal-history-list.tsx` to list today's saved entries with type, calories, and time.
- [x] 3.4 Create `app/paciente/dashboard/nutricion/page.tsx` composing upload, result, history, and i18n; fetch today's history server-side.

## Phase 4: Verification

- [x] 4.1 Run `npm run typecheck` and `npm run build`; fix any errors.
- [x] 4.2 Manually verify: playground analysis does not create a `MealEntry`, saving persists and appears in history, and the dashboard widget sums today's calories. (API smoke test passed with a tiny JPEG; full UI flow requires a logged-in session.)

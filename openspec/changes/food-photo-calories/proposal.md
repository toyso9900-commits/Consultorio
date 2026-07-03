# Proposal: Food photo → calorie estimation

## Intent
Add a patient-facing AI-assisted meal logger so users can estimate calories and macros from a food photo. This supports the README's future premium capability "Inteligencia Artificial para reconocimiento calórico por fotografías" and extends the existing basic calorie tracker without replacing it.

## Scope

### In Scope
- Add `MealEntry` model and `MealType`/`MealSource` enums to Prisma; link to `User`.
- Add `GEMINI_API_KEY` environment variable and the `@google/genai` dependency.
- Create server action `analyzeFoodImage` that validates the image, stores it, calls Gemini 1.5 Flash vision, and returns Zod-validated JSON with calories and macros.
- Create server action `saveMealEntry` to persist confirmed entries.
- Create `app/paciente/dashboard/nutricion/page.tsx` with photo upload/capture, analysis result display, playground mode, save button, and meal history list.
- Update the patient sidebar with a "Comidas"/"Meals" link.
- Update the patient dashboard "Calories today" widget to sum today's `MealEntry` records.
- Add i18n keys to `lib/i18n/dictionaries/es.ts` and `en.ts`.

### Out of Scope
- Professional view of patient meals.
- Advanced nutrition goals or targets.
- Local/on-premise AI model.
- Payment-gated premium enforcement (the feature is built; gating is future work).

## Capabilities

### New Capabilities
- `food-photo-analysis`: validate, store, and analyze food photos via Gemini 1.5 Flash vision; return structured calorie/macro estimates.
- `meal-entry`: persist, list, and aggregate `MealEntry` records per patient.
- `patient-nutrition-page`: UI for upload, playground analysis, save flow, history, and dashboard integration.

### Modified Capabilities
- None.

## Approach
Use Google Gemini 1.5 Flash as the default vision model because it supports a large free tier and reliable multimodal understanding. The SDK call runs inside a server action; responses are validated with Zod before being rendered. Images are stored using the existing `public/uploads` pattern with UUID filenames for the MVP. Playground mode analyzes without creating a database row. If API availability becomes an issue, Gemini can be swapped for another vision model through a thin provider abstraction.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | Modified | Add `MealEntry`, `MealType`, `MealSource`, and relation to `User`. |
| `.env.example` | Modified | Add `GEMINI_API_KEY`. |
| `package.json` | Modified | Add `@google/genai`. |
| `app/paciente/dashboard/nutricion/actions.ts` | New | `analyzeFoodImage`, `saveMealEntry`. |
| `app/paciente/dashboard/nutricion/page.tsx` | New | Photo upload, playground, save, history. |
| `app/paciente/dashboard/page.tsx` | Modified | Sum today's `MealEntry` calories. |
| `components/layout/sidebar.tsx` | Modified | Add patient "Comidas" nav item. |
| `lib/i18n/dictionaries/es.ts`, `en.ts` | Modified | Add translation keys. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Vision estimate is inaccurate | High | Show confidence score, disclaimer, and editable fields. |
| API cost or abuse | Medium | Add per-user rate limiting; use the smallest adequate model. |
| Sensitive meal photos in `public/uploads` | Medium | Use random UUID filenames; plan authenticated storage for a future iteration. |
| No automated tests | Medium | Verify with `npm run typecheck` and `npm run build`. |

## Rollback Plan
1. Revert the Prisma migration and schema changes.
2. Remove `@google/genai` from `package.json` and reinstall dependencies.
3. Delete new files under `app/paciente/dashboard/nutricion/`.
4. Revert sidebar, dashboard widget, and i18n changes.
5. Remove `GEMINI_API_KEY` from `.env.example`.

## Dependencies
- Google Gemini API key with access to Gemini 1.5 Flash vision.
- Prisma migration can run against the current PostgreSQL database.

## Success Criteria
- [ ] Patient can upload or capture a photo and receive a structured calorie/macro estimate.
- [ ] Playground analysis returns results without creating a `MealEntry`.
- [ ] Save button persists a validated entry linked to the current user.
- [ ] Dashboard "Calories today" reflects the sum of today's saved entries.
- [ ] `npm run typecheck` and `npm run build` pass.

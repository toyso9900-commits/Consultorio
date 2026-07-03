# Design: Food photo → calorie estimation

## Technical Approach

Add a patient-only nutrition page that lets a user upload a food photo, receive a Gemini 1.5 Flash vision estimate, optionally edit/save it as a `MealEntry`, and view today's history. The dashboard's "Calories today" widget will sum `MealEntry.calories`. The feature reuses the existing `public/uploads` storage pattern, Next.js server actions, and i18n dictionary shape.

## Architecture Decisions

| Decision | Options | Tradeoff | Choice |
|---|---|---|---|
| Vision provider | Google Gemini 1.5 Flash vs OpenAI GPT-4o-mini | Gemini has a large free tier and strong multimodal understanding; GPT-4o-mini has native JSON mode | Gemini 1.5 Flash via `@google/genai` SDK with structured JSON requested in the prompt |
| Persisted image storage | `public/uploads/meals` UUID filenames vs authenticated object store | Public folder is simple but exposes photos; object store is safer but adds infra | `public/uploads/meals` with random UUID filenames for MVP |
| Rate limiting | In-memory `Map<userId, timestamps[]>` vs Redis/Upstash | In-memory is zero-dependency but lost on server restart and not distributed across instances | In-memory map with 15-minute sliding window (10 analyses) |
| Playground vs saved image | Always store file, or only store on save | Always storing simplifies preview but writes orphan files | Store on every `analyzeFoodImage` call; attach the same `imageUrl` to the saved `MealEntry` |
| Calorie widget source | Sum `MealEntry` only vs `MealEntry` + existing `CalorieEntry` | The spec only mentions `MealEntry`; `CalorieEntry` is a separate beta feature | Sum `MealEntry` only |
| i18n for AI output | Ask model to respond in user's locale vs fixed language | Locale improves UX but relies on model compliance | Request the user's current locale in the prompt and validate numbers only |

## Data Flow

```
Patient selects/captures photo
         │
         ▼
+----------------------------------+
| app/paciente/dashboard/nutricion/ │
| page.tsx + FoodPhotoUpload        |
+----------------------------------+
         │ FormData
         ▼
+----------------------------------+
| analyzeFoodImage(formData)        |
| - check session/userId            |
| - validate type/size              |
| - rate-limit check                |
| - store file to public/uploads/   |
| - base64 encode image             |
| - call Gemini 1.5 Flash with JSON prompt |
| - Zod parse response              |
+----------------------------------+
         │ structured result
         ▼
+----------------------------------+
| FoodAnalysisResult (edit/save)    |
+----------------------------------+
         │
         ├──── Playground ──► render only
         │
         └──── Save ────────► saveMealEntry() ──► Prisma MealEntry
                                              │
                                              ▼
                              app/paciente/dashboard/page.tsx
                              sums today's MealEntry.calories
```

## File Changes

| File | Action | Description |
|---|---|---|
| `prisma/schema.prisma` | Modify | Add `MealEntry`, `MealType`, `MealSource` enums; add `mealEntries` relation to `User` |
| `.env.example` | Modify | Add `OPENAI_API_KEY` |
| `package.json` | Modify | Add `@google/genai` dependency |
| `app/paciente/dashboard/nutricion/page.tsx` | Create | Photo upload, analysis, save, and history page |
| `app/paciente/dashboard/nutricion/actions.ts` | Create | `analyzeFoodImage`, `saveMealEntry`, rate-limit helper |
| `app/paciente/dashboard/nutricion/get-today-calories.ts` | Create | Server helper that sums today's `MealEntry.calories` |
| `components/food/food-photo-upload.tsx` | Create | File input with `capture="environment"`, preview, and submit state |
| `components/food/food-analysis-result.tsx` | Create | Editable result card for description, type, calories, macros, confidence |
| `components/food/meal-history-list.tsx` | Create | List of today's saved entries |
| `app/paciente/dashboard/page.tsx` | Modify | Replace hardcoded `0 kcal` with `getTodayCalories(userId)` |
| `components/layout/sidebar.tsx` | Modify | Add patient "Comidas"/"Meals" link |
| `lib/i18n/dictionaries/es.ts`, `en.ts` | Modify | Add `nutrition.*` keys |

## Data Model

```prisma
model MealEntry {
  id            String     @id @default(cuid())
  userId        String
  user          User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  imageUrl      String?
  description   String
  mealType      MealType   @default(OTHER)

  calories      Int
  proteinG      Float?
  carbsG        Float?
  fatG          Float?

  aiModel       String?
  aiConfidence  Float?
  source        MealSource @default(AI)

  consumedAt    DateTime   @default(now())
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  @@index([userId, consumedAt])
}

enum MealType {
  BREAKFAST
  LUNCH
  DINNER
  SNACK
  OTHER
}

enum MealSource {
  AI
  MANUAL
}
```

Add `mealEntries MealEntry[]` to the `User` model. Migration: `npx prisma migrate dev --name add_meal_entries`. No seed data required.

## Interfaces / Contracts

```ts
// app/paciente/dashboard/nutricion/actions.ts
export type AnalyzeFoodImageResult =
  | { success: true; data: FoodAnalysisData; imageUrl: string }
  | { success: false; error: string };

export type SaveMealEntryResult =
  | { success: true; id: string }
  | { success: false; error: string };

export async function analyzeFoodImage(formData: FormData): Promise<AnalyzeFoodImageResult>;
export async function saveMealEntry(analysis: FoodAnalysisData & { imageUrl?: string }): Promise<SaveMealEntryResult>;
```

Zod schemas:

```ts
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;

const foodAnalysisSchema = z.object({
  description: z.string().min(1),
  calories: z.number().int().min(0),
  proteinG: z.number().min(0).optional(),
  carbsG: z.number().min(0).optional(),
  fatG: z.number().min(0).optional(),
  confidence: z.number().min(0).max(1),
});
```

## AI Analysis Flow

1. **Session check**: verify `auth()` returns a patient user.
2. **File validation**: read `file` from `FormData`; reject if missing, not in `ALLOWED_TYPES`, or larger than 5 MB.
3. **Rate limiting**: check in-memory `Map<userId, number[]>` for requests in the last 15 minutes; allow 10 analyses per window.
4. **Storage**: write file to `public/uploads/meals/{uuid}.{ext}` using `fs/promises`; keep `/uploads/meals/{fileName}` as `imageUrl`.
5. **Base64 encoding**: read file bytes and encode as base64 data URI.
6. **Gemini call**: use `GoogleGenAI` with model `gemini-1.5-flash-latest` and a neutral system prompt that includes only the image and a request for the JSON schema. No PII is sent.
7. **Zod parsing**: parse `JSON.parse(content)` with `foodAnalysisSchema`; on failure return a generic error and do not save anything extra.

## Server Action Error Handling

- Validation errors: return `{ success: false, error: "nutrition.errorInvalidFile" }` (mapped to i18n).
- Rate limit: return `{ success: false, error: "nutrition.errorRateLimited" }`.
- Gemini or parse failure: return `{ success: false, error: "nutrition.errorAnalysis" }`.
- Unexpected exception: return `{ success: false, error: "errors.generic" }`.
- The UI shows a Sonner toast or inline alert based on the returned key.

## Component Architecture

- `page.tsx` (server): fetches session, locale, dictionary, and today's history; renders upload, result, and list sections.
- `FoodPhotoUpload` (client): controlled file input with `accept="image/*" capture="environment"`, preview, and `useTransition` for submission.
- `FoodAnalysisResult` (client): displays the structured estimate with editable description/meal type/calories/macros; contains the Save button.
- `MealHistoryList` (server or client): receives today's entries and renders description, type, calories, and consumed time.

## Sidebar and Dashboard Integration

- In `components/layout/sidebar.tsx`, add to the `PATIENT` array:
  `{ label: (d) => d.nav.meals, href: "/paciente/dashboard/nutricion", icon: Camera }`.
- In `app/paciente/dashboard/page.tsx`, replace `0 kcal` with a call to `getTodayCalories(userId)`.

```ts
// app/paciente/dashboard/nutricion/get-today-calories.ts
export async function getTodayCalories(userId: string): Promise<number> {
  const start = startOfDay(new Date());
  const end = endOfDay(new Date());
  const result = await prisma.mealEntry.aggregate({
    where: { userId, consumedAt: { gte: start, lte: end } },
    _sum: { calories: true },
  });
  return result._sum.calories ?? 0;
}
```

## i18n Key Plan

Add a `nutrition` namespace to `es.ts` and `en.ts`:

| Key | es | en |
|---|---|---|
| `nav.meals` | Comidas | Meals |
| `nutrition.title` | Registro de comidas | Meal log |
| `nutrition.subtitle` | Analizá tu plato con una foto | Analyze your meal with a photo |
| `nutrition.uploadLabel` | Subí o sacá una foto de tu plato | Upload or take a photo of your meal |
| `nutrition.analyze` | Analizar | Analyze |
| `nutrition.analyzing` | Analizando... | Analyzing... |
| `nutrition.save` | Guardar comida | Save meal |
| `nutrition.saving` | Guardando... | Saving... |
| `nutrition.playgroundHint` | Modo prueba: no se guarda en tu historial | Playground mode: not saved to history |
| `nutrition.disclaimer` | Estimación aproximada. Consultá a un profesional. | Approximate estimate. Consult a professional. |
| `nutrition.historyTitle` | Hoy | Today |
| `nutrition.emptyHistory` | No guardaste comidas hoy. | No meals saved today. |
| `nutrition.errorInvalidFile` | La imagen debe ser JPG, PNG o WebP de hasta 5 MB. | Image must be JPG, PNG, or WebP up to 5 MB. |
| `nutrition.errorRateLimited` | Demasiados análisis. Intentá más tarde. | Too many analyses. Please try again later. |
| `nutrition.errorAnalysis` | No se pudo analizar la imagen. | Could not analyze the image. |

## File Storage Approach

- Store files in `public/uploads/meals/` with UUID filenames and original extension.
- Use `fs/promises` to create the directory and write bytes, mirroring `upload-actions.ts`.
- Files are publicly accessible by URL; mitigate with random filenames. Future iterations should move to authenticated storage.

## Rate Limiting Approach

- Simple in-memory `Map<string, number[]>` keyed by `userId`.
- On each call, prune entries older than 15 minutes and count remaining entries.
- Allow up to 10 requests per window; return `nutrition.errorRateLimited` if exceeded.
- Note: this resets on deploy/server restart and is not distributed across instances. If the app scales horizontally, switch to Redis.

## Migration / Rollout

1. Add schema changes and run `prisma migrate dev`.
2. Install `@google/genai` and add `GEMINI_API_KEY`.
3. Create page, actions, components, and helpers.
4. Update sidebar, dashboard widget, and i18n.
5. Verify with `npm run typecheck` and `npm run build`.

Rollback: revert the migration, remove `@google/genai` and env variable, delete new files, and revert sidebar/dashboard/i18n changes.

## Risks

- Vision estimates can be inaccurate; mitigated by disclaimer and editable fields.
- `public/uploads` exposes meal photos; mitigated by UUID filenames and flagged for future authenticated storage.
- In-memory rate limiting does not survive restarts or scale horizontally.
- No automated tests; verification relies on typecheck and build.

## Open Questions

- None — design is ready for tasks.

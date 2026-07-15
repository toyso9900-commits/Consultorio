# Exploration: daily-plan-tracking

Turn the placeholder "Plan general" section on the patient routine page into a real daily plan tracker (authored items, daily check-off with persistence + reset, water counter), then auto-track meals from nutrition logs, then streaks/weekly view.

## Current State

### Routine model + authoring flow (from `client-paid-plan`, archived 2026-07-13)

- `Routine` (`prisma/schema.prisma:394-408`): `id`, `patientId`, `professionalId`, `title`, `content` (Text), `createdAt`, `updatedAt`. `@@unique([patientId, professionalId])` — **one routine per patient–professional pair, replaced in place via upsert**. No plan items, no structure beyond free text.
- Professional authoring UI: `app/profesional/dashboard/rutinas/page.tsx` lists clients from `getProfessionalClients(professionalId)` (`lib/appointments.ts:131`) and renders `RoutineEditor` (`routine-editor.tsx`, client component with title + content form) per subscribed client; non-subscribed rows render a locked notice.
- Server action: `publishRoutineForPatient(patientId, title, content)` in `app/profesional/dashboard/rutinas/actions.ts` — gates on `hasActivePatientSubscription` (lazy-expiry: ACTIVE or CANCELLED with `expiresAt > now`; do NOT change), upserts the single row, `revalidatePath` both dashboards, fires `triggerRoutinePublished` Pusher event.
- Patient delivery: `app/paciente/dashboard/rutina/page.tsx` — auth-gated PATIENT page; `listActiveSubscriptionsForPatient(patientId)`; fetches `prisma.routine.findMany` filtered to subscribed professionals (REQ-004: non-subscribers never receive content); renders one `RoutinePlanCard` per routine + a static FREE section (REQ-005) for everyone.
- Main spec synced at `openspec/specs/personalized-routine/spec.md` (REQ-001..REQ-005).

### Nutrition data model — CORRECTION to exploration brief

- **`CalorieEntry` is legacy dead weight.** The model still exists in `prisma/schema.prisma:271-279` (`id`, `userId`, `description`, `calories`, `consumedAt` — no meal classification) but has **zero code references**: no `prisma.calorieEntry` usage anywhere in `app/`, `lib/`, `components/`. Nothing writes or reads it.
- The real meal log is **`MealEntry`** (`prisma/schema.prisma:282-307`): `id`, `userId`, `imageUrl?`, `description`, **`mealType` enum (BREAKFAST | LUNCH | DINNER | SNACK | OTHER, default OTHER)**, `calories`, `proteinG?/carbsG?/fatG?`, `aiModel?`, `aiConfidence?`, `source` (AI | MANUAL), **`consumedAt` (default now, client-overridable via ISO string)**, `createdAt/updatedAt`; `@@index([userId, consumedAt])`; children `MealIngredient[]`.
- Write path: `saveMealEntry` in `app/paciente/dashboard/nutricion/actions.ts:309` (server action, Zod-validated, recomputes totals from ingredients). AI photo pipeline: `analyzeFoodImage` (same file, Gemini `gemini-2.5-flash` via `@google/genai`, rate-limited 5/15min per user, uploads to `public/uploads/meals/`). The result form (`components/food/food-analysis-result.tsx`) lets the patient pick `mealType` before saving (defaults OTHER).
- Read paths for "today": `getMealEntries(userId)` (actions.ts:399 — entries where `consumedAt` in `[serverLocalStartOfDay, serverLocalStartOfNextDay)`, take 50) and `getTodayMacros(userId)` (`app/paciente/dashboard/nutricion/get-today-macros.ts` — same day window, aggregates macros; used by the dashboard calorie widget).
- **Assessment: "patient logged N meals today" IS reliably derivable** — `count(MealEntry where userId, consumedAt in day-window)`, optionally filtered by `mealType`. Caveats: `mealType` defaults to OTHER (patient may not classify), and `consumedAt` is client-supplied (editable/backdatable) — fine for a wellness tracker, not tamper-proof.

### Placeholder to replace

- `app/paciente/dashboard/rutina/page.tsx` — passes i18n labels (`planWalk/planWater/planMeals/planGeneralTitle`) into the card; renders one card **per routine** (list, ordered by `updatedAt desc`).
- `components/patient/routine-plan-card.tsx` — client component; "Plan general" section is hardcoded `planItems` array (walk/water/meals with Footprints/Droplets/Utensils icons) and `checkedItems` in **local React state only** (comment at line 39-40 explicitly says "never persisted"). Also has a local-state "Mark as completed" pill for the whole routine (unrelated to plan items). Decorative leaves are ornamental.
- i18n keys live in `patientRoutine` namespace (`lib/i18n/dictionaries/{en,es}.ts`), typed via `lib/i18n/dictionaries/index.ts` (`Record<keyof typeof es.patientRoutine, string>`) — **es.ts is the source of truth for key shape; both files must be extended together**.

### Daily reset / timezone

- No date library (no date-fns/dayjs; package.json). No timezone field on User/UserPreference (only `language`).
- Existing day-boundary helpers: `startOfToday()`/`endOfToday()` in `lib/appointments.ts:25-37` — **server-local time** (`new Date(now.getFullYear(), ...)`). Same server-local pattern inlined in `getMealEntries` and `get-today-macros.ts`. `getAppointmentsThisWeekCount` uses UTC boundaries (inconsistent precedent).
- Implication: "reset at midnight" today means **midnight in the server's TZ**, not the patient's. Consistent with all existing features, but a patient in a different TZ than the server will see resets at the wrong local hour. Streaks inherit this skew.

## Affected Areas

- `prisma/schema.prisma` — new models (plan items, daily completions/progress), relations from `Routine` and `User`; new migration under `prisma/migrations/`.
- `app/paciente/dashboard/rutina/page.tsx` — fetch plan items + today's completion state, pass into card.
- `components/patient/routine-plan-card.tsx` — replace hardcoded rows with server-fed items; wire toggles/counter to server actions.
- `app/profesional/dashboard/rutinas/` — extend `RoutineEditor` (or new sibling component) with a plan-item editor (label, icon, order, target); new/extended server actions in `actions.ts`.
- New: `app/paciente/dashboard/rutina/actions.ts` (toggle completion, increment/decrement water) and probably `lib/daily-plan.ts` (queries + day-window helpers).
- `app/paciente/dashboard/nutricion/actions.ts` — slice 2: after `saveMealEntry` succeeds, recompute/auto-complete the meals item (or compute read-time instead — see approaches).
- `lib/i18n/dictionaries/{es,en}.ts` + `index.ts` — extend `patientRoutine` and `professionalRoutines` namespaces.
- Slice 3: streak/weekly UI in the card or page; streak computation from completions table.

## Schema Impact Forecast

Minimal, additive set (one migration):

```prisma
model RoutinePlanItem {
  id         String  @id @default(cuid())
  routineId  String
  routine    Routine @relation(fields: [routineId], references: [id], onDelete: Cascade)
  label      String
  icon       String                 // lucide icon key, validated against allowlist
  sortOrder  Int     @default(0)
  kind       PlanItemKind @default(CHECK)   // CHECK | COUNTER | AUTO_MEALS
  targetCount Int?                  // e.g. 8 glasses, 3 meals (null = single toggle)
  createdAt/updatedAt
  completions RoutinePlanItemCompletion[]
  @@index([routineId, sortOrder])
}

model RoutinePlanItemCompletion {
  id        String   @id @default(cuid())
  itemId    String
  item      RoutinePlanItem @relation(..., onDelete: Cascade)
  patientId String
  patient   User     @relation(..., onDelete: Cascade)
  date      DateTime @db.Date        // the day this progress belongs to
  count     Int      @default(0)     // 0..targetCount; CHECK items use 0/1
  completedAt DateTime?
  @@unique([itemId, patientId, date])
}
```

- Water counter = a `COUNTER` item with `targetCount` (e.g. 8); no dedicated water table needed — the generic `count` column covers it.
- "Daily reset" = no cron; new day ⇒ no completion rows for that `date` ⇒ UI shows fresh state (same lazy-expiry philosophy as subscriptions). Store `date` as a date-only value to make resets and streak queries trivial.
- Streaks (slice 3) derivable from completions — no extra table for V1; a cache table only if queries get hot.
- Relations to add on `Routine` (`planItems RoutinePlanItem[]`) and `User` (`planItemCompletions RoutinePlanItemCompletion[]`).
- `CalorieEntry`: leave untouched (out of scope; candidate for a separate cleanup change).

## Approaches

1. **Items hang off `Routine`; one generic completion table with `count`; auto-meals computed read-time** (recommended)
   - Plan items belong to a `Routine` (matches "professional authors per routine" and the existing gating/upsert flow). Completion state is per `(item, patient, date)` with a `count` column covering CHECK (0/1), COUNTER (water), and AUTO_MEALS (derived).
   - Meals auto-completion computed **read-time**: when loading the patient page, count today's `MealEntry` rows and mark the AUTO_MEALS item satisfied if `count >= targetCount`. No write-path coupling with `saveMealEntry`.
   - Pros: single code path for all item kinds; no cron/reset job; auto-meals always correct even for backdated/edited logs; mirrors lazy-expiry precedent; slice 2 becomes a query, not a pipeline change.
   - Cons: read-time join per page load (trivial at this scale); historical "was it auto-completed that day" is recomputed, not snapshotted (acceptable for wellness data).
   - Effort: Medium.

2. **Items hang off `Routine`; completion rows written eagerly (write-time auto-meals)**
   - Same tables, but `saveMealEntry` also upserts today's completion for the patient's AUTO_MEALS items.
   - Pros: completion history is an explicit snapshot; streak queries slightly simpler.
   - Cons: couples nutrition write path to routine feature; backdated/deleted meals leave stale completions; more failure modes. Effort: Medium-High.

3. **One global daily plan per patient (not per routine)**
   - Plan items keyed to `patientId` instead of `routineId`.
   - Pros: avoids the multi-subscription duplication problem entirely.
   - Cons: contradicts agreed scope ("authors daily plan items per routine"); breaks the authoring-per-professional model and REQ-004 gating reuse. Effort: Medium but wrong shape.

**Recommendation: Approach 1**, with read-time auto-meals. It composes with the existing upsert/gating/Pusher flow, needs no scheduled jobs, and keeps slices 2–3 as query-layer work.

## UI Surface Area

- **Professional authoring**: extend `app/profesional/dashboard/rutinas/routine-editor.tsx` with a plan-item editor (add/remove/reorder rows: label, icon picker from a small lucide allowlist, kind, target count). Persist via a new server action (e.g. `saveRoutinePlanItems(patientId, items[])`) in `app/profesional/dashboard/rutinas/actions.ts`, gated by the same `hasActivePatientSubscription`. Save plan items **in the same transaction/flow as the routine upsert** or as a separate section — decision for design phase.
- **Patient UI**: `RoutinePlanCard` already has the exact visual target (icon circle + label + round checkbox). Replace hardcoded rows with server-fed items; CHECK items toggle via server action with optimistic UI; COUNTER (water) gets +/− stepper showing `count/targetCount`; AUTO_MEALS renders read-only auto state ("2/3 comidas") with manual override question for the PO (flag in proposal).
- **i18n**: extend `patientRoutine` (water counter labels, counter aria-labels, auto-meals strings, streak/weekly strings in slice 3) and `professionalRoutines` (item editor labels, kind names, icon names). Update `lib/i18n/dictionaries/index.ts` types automatically via `keyof typeof es.*` pattern.
- **Weekly view (slice 3)**: completions for last 7 days per item; Recharts is already a dependency if a chart is wanted, but a 7-dot row per item is cheaper.

## Risks

- **Multi-subscription duplication (biggest scope question)**: the page renders one card **per routine**, and a patient can be subscribed to several professionals → several "Plan general" sections, each with its own items and per-item state. Whose plan does the patient track? Options: track all independently (state explosion), or designate a primary (new rule). Needs PO decision in proposal.
- **FREE plan applicability**: Plan items live on `Routine`, which requires a subscription (REQ-004). FREE users see only the static section — so daily tracking is a **paid-only feature** unless PO wants a default FREE plan item set. Confirm in proposal.
- **Timezone skew**: "midnight reset" and streaks use server-local day boundaries (consistent with `getMealEntries`/`getTodayMacros`, but wrong for patients in other TZs). V1 can accept server-local; a per-user TZ field is a later change. Must be stated explicitly in specs so streak edge cases are defined.
- **`mealType` data quality for auto-tracking**: defaults to OTHER and is user-editable; "3 plan meals" should probably count **any** MealEntry regardless of type (simplest, most robust), not specific types.
- **Backdated `consumedAt`**: patients can log meals for past days → read-time derivation handles it gracefully; write-time snapshots would not (another argument for Approach 1).
- **Routine upsert replaces in place**: editing a routine currently keeps the same row id — good: plan items survive title/content edits. But deleting/replacing plan items must define what happens to completion history (recommend `onDelete: Cascade` on completions + soft reconciliation by item id, not label).
- **No automated tests**: verification = `npm run typecheck` + `npm run lint` + `npm run build` only (per `openspec/config.yaml`). Streak/date logic is bug-prone without tests — keep date math dead simple (date-only `@db.Date` column).
- **Next.js 16**: server actions + `revalidatePath` patterns are already in use here; consult `node_modules/next/dist/docs/` before touching caching behavior.

## Ready for Proposal

Yes — with two PO questions to settle in the proposal: (1) multi-subscription behavior (track per-routine vs primary plan), (2) FREE-plan applicability and whether AUTO_MEALS items allow manual override. Scope is otherwise well-bounded by the three slices; Approach 1 recommended.

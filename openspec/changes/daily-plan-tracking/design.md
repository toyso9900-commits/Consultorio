# Design: Daily Plan Tracking

## Technical Approach

Exploration Approach 1: items hang off `Routine`; one completion table keyed `(itemId, patientId, date)`; AUTO_MEALS derived read-time; lazy reset (new day ⇒ no rows, like subscription lazy-expiry). One additive migration, zero new dependencies. Slices: S1 foundation, S2 auto-meals, S3 streaks/weekly.

## Architecture Decisions

| Decision | Options | Tradeoff | Choice |
|----------|---------|----------|--------|
| Item save flow | Extend `publishRoutineForPatient(..., items[])` ONE action/tx ← separate items action | Larger payload | One aggregate; single-save UX; tx consistency |
| Item reconciliation | By id (payload `id?`): delete removed, update kept, create new; `sortOrder` = index; deletes cascade completions (DPT-009) ← wipe+recreate | Client tracks ids | Recreate breaks FKs and history |
| TZ storage | `User.timezone String?` IANA; null ⇒ server-local fallback ← UserPreference col | Two paths | Nullable = safe partial rollback; fallback matches legacy (DPT-004) |
| Day-boundary math | `lib/day-boundaries.ts`, pure `Intl`; legacy helpers untouched ← date-fns/dayjs | ~1h DST-edge error | Zero-dep; date-only `@db.Date` is DST-safe; offset via `Intl.DateTimeFormat` at noon UTC of target date |
| AUTO_MEALS | Read-time `MealEntry` count (any mealType) in local-day UTC window; never persisted ← write-time upsert | Join per load | Backdating/deletes recompute correctly (DPT-006) |
| TZ auto-detect | Island → `saveDetectedTimezone(tz)`; server writes ONLY when null; profile edit explicit ← always overwrite | Null until first visit | Persist-once protects manual choice |
| Streaks | Read-time walk-back, cap 365, no cache ← cron/cache | Recompute per load | Lazy-expiry philosophy; trivial volume |
| Patient UI split | Page server; `RoutinePlanCard` = THE client island fed a server view model ← per-row islands | Card-level re-render | Existing page-server/card-client convention |

## Data Model (one additive migration)

```prisma
enum RoutineItemType { CHECK WATER AUTO_MEALS }

model RoutineItem {
  id          String          @id @default(cuid())
  routineId   String
  routine     Routine         @relation(fields: [routineId], references: [id], onDelete: Cascade)
  type        RoutineItemType @default(CHECK)
  title       String
  icon        String          // lucide key, server-validated allowlist
  goal        Int?            // ml (WATER) / meal count (AUTO_MEALS); null for CHECK
  sortOrder   Int             @default(0)
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
  completions RoutineItemCompletion[]
  @@index([routineId, sortOrder])
}

model RoutineItemCompletion {
  id          String      @id @default(cuid())
  itemId      String
  item        RoutineItem @relation(fields: [itemId], references: [id], onDelete: Cascade)
  patientId   String
  patient     User        @relation(fields: [patientId], references: [id], onDelete: Cascade)
  date        DateTime    @db.Date // user local date, stored as UTC midnight
  count       Int         @default(0) // CHECK 0/1 · WATER ml · AUTO_MEALS never persisted
  completedAt DateTime?
  @@unique([itemId, patientId, date]) // item+patient+date range (streaks)
  @@index([patientId, date])          // hot read: today's completions
}
```

`User` gains `timezone String?` + `routineItemCompletions`; `Routine` gains `items`. Water quick-add = ±250 ml, clamped `[0, goal]` (DPT-003).

## Interfaces / Contracts

`lib/day-boundaries.ts` (pure, server+client safe):

```ts
localDateString(now: Date, tz: string | null): string   // "YYYY-MM-DD"
utcWindowForLocalDate(dateStr: string, tz: string | null): { start: Date; end: Date } // [start,end)
dateOnlyUtc(dateStr: string): Date                      // for @db.Date writes
shiftDays(dateStr: string, delta: number): string
```

`lib/routine-items.ts`: icon allowlist (footprints, droplets, utensils, dumbbell, heart, moon, bike, salad), Zod item schema, `WATER_STEP_ML = 250`. `lib/daily-plan.ts`: `getDailyPlanForPatient(patientId, routineIds, tz)` → per-routine view model (`items[]` of `{id,type,title,icon,goal,count,satisfied,readOnly}`, `streak`, `week[7]`).

## Data Flow

Patient page load (read model):

```
page.tsx (server)
 ├─ listActiveSubscriptionsForPatient          (unchanged gating, REQ-004)
 ├─ getDailyPlanForPatient(patientId, routineIds, tz)
 │   ├─ RoutineItem.findMany(routineId in …, orderBy sortOrder)
 │   ├─ RoutineItemCompletion.findMany(patientId, date = today)
 │   ├─ MealEntry.count(consumedAt in utcWindow)        [S2]
 │   └─ computeStreaks + weekly window                  [S3]
 └─ <RoutinePlanCard items streak week/>       (client island)
```

Toggle / water write: `RoutinePlanCard` → `toggleCheckItem(itemId)` / `adjustWaterItem(itemId, ±250)` → auth PATIENT → `item.routine.patientId === session.user.id` (DPT-002) → `hasActivePatientSubscription(patient, item.routine.professionalId)` (unchanged) → upsert `(itemId, patientId, dateOnlyUtc(today))` → `revalidatePath`.

TZ auto-detect: `<TimezoneAutoDetect/>` useEffect reads `Intl…resolvedOptions().timeZone` → `saveDetectedTimezone(tz)` validates via `Intl` (invalid ⇒ reject) → `UPDATE … WHERE timezone IS NULL` (profile edit stays authoritative).

Professional save: one action → `$transaction` [routine upsert → fetch existing item ids → delete removed → update kept → create new] → revalidate dashboards → existing Pusher event.

Streak algorithm (S3): `cursor = today`; if today incomplete, `cursor = yesterday` (in-progress today never breaks); count consecutive complete days walking back, max 365. Complete day = every CHECK `count≥1` AND every WATER `count≥goal` AND each AUTO_MEALS has ≥goal entries that local date (one `MealEntry` range query bucketed per local date in JS). Weekly strip = Mon–Sun of user's current local week (DPT-008).

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `prisma/schema.prisma` + migration | Modify | Models, enum, `User.timezone` (S1) |
| `lib/day-boundaries.ts` | Create | Intl TZ helpers (S1) |
| `lib/routine-items.ts` | Create | Icon allowlist, Zod schema, constants (S1) |
| `lib/daily-plan.ts` | Create | Read model; +streaks/week (S1–S3) |
| `app/profesional/dashboard/rutinas/actions.ts` | Modify | Extended publish + tx reconcile (S1) |
| `app/profesional/dashboard/rutinas/routine-editor.tsx` | Modify | Item editor subsection (S1) |
| `app/paciente/dashboard/rutina/actions.ts` | Create | toggle/adjust/saveDetectedTimezone (S1) |
| `app/paciente/dashboard/rutina/page.tsx` | Modify | Assemble view model; mount detector (S1) |
| `components/patient/routine-plan-card.tsx` | Modify | Real rows, stepper, auto row, streak + week strip (S1–S3) |
| `app/paciente/dashboard/perfil/*` | Modify | Timezone select (S1) |
| `lib/i18n/dictionaries/{es,en}.ts` | Modify | New keys; drop `planWalk/planWater/planMeals` (S1) |

i18n forecast — `patientRoutine`: `waterProgress {count}/{goal}`, `waterAdd`, `waterRemove`, `mealsProgress {count}/{goal}`, `autoBadge`, `streakLabel {count}`, `weekStripLabel`, `timezoneLabel`. `professionalRoutines`: `itemsTitle`, `addItem`, `removeItem`, `itemTitleLabel`, `itemTypeLabel`, `typeCheck/Water/Meals`, `itemIconLabel`, `itemGoalLabel`, `goalUnitMl`, `goalUnitMeals`, `moveUp/Down`.

## Slice Mapping

- **S1**: migration; `day-boundaries`, `routine-items`, `daily-plan` (items + today); item editor + extended publish; patient actions + card CHECK/WATER rows; TZ auto-detect + profile field; i18n.
- **S2**: AUTO_MEALS derivation + read-only card row.
- **S3**: streak + weekly computation; badge + strip UI.

## Testing Strategy

No test runner (openspec/config.yaml): verification = typecheck + lint + build + manual smoke per slice; date math kept date-only to minimize untested edge risk.

## Migration / Rollout / Rollback

Additive nullable schema — migrate, then deploy. Slices ship S1 → S2 → S3, independently releasable. Rollback = code revert (prior UI returns); new tables/columns are inert and droppable later. Clearing `User.timezone` reverts to server-local boundaries — partial rollback safe.

## Open Questions

- [ ] Weekly strip = calendar week Mon–Sun (user TZ). Confirm with PO if trailing-7-days was intended. Non-blocking.

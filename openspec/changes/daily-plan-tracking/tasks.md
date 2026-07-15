# Tasks: Daily Plan Tracking

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1300–1700 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (S1a) → 2 (S1b) → 3 (S1c) → 4 (S2) → 5 (S3) |
| Delivery strategy | ask-always |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Schema migration + pure libs | PR 1 (S1a, ~300–380) | Additive, no UI |
| 2 | Professional item authoring | PR 2 (S1b, ~320–400) | Editor + publish + i18n |
| 3 | Patient tracker (CHECK/WATER + TZ) | PR 3 (S1c, ~380–460) | Split card if over budget |
| 4 | AUTO_MEALS derivation | PR 4 (S2, ~110–160) | Read-only row |
| 5 | Streaks + weekly view | PR 5 (S3, ~200–260) | Badge/strip UI |

## Slice 1: Foundation

- [x] 1.1 **DB migration**: add `RoutineItemType` enum, `RoutineItem`, `RoutineItemCompletion`, `User.timezone` + relations in `prisma/schema.prisma`; `npx prisma migrate dev --name add_daily_plan_tracking`; regenerate client. Additive. (DPT-001, DPT-009)
- [x] 1.2 Create `lib/day-boundaries.ts`: `localDateString`, `utcWindowForLocalDate`, `dateOnlyUtc`, `shiftDays`; pure `Intl`, null tz ⇒ server-local. (DPT-004, DPT-005)
- [x] 1.3 Create `lib/routine-items.ts`: icon allowlist, Zod item schema, `WATER_STEP_ML = 250`. (DPT-003)
- [x] 1.4 Create `lib/daily-plan.ts`: `getDailyPlanForPatient` — items + today's completions. (DPT-001, DPT-002, DPT-005)
- [x] 1.5 Extend `publishRoutineForPatient` (`profesional/dashboard/rutinas/actions.ts`): items[] reconcile-by-id in `$transaction`; reject non-subscriber/cross-professional. (REQ-006, REQ-002 MOD, DPT-009)
- [x] 1.6 Add item editor subsection to `routine-editor.tsx` (add/remove/reorder, type/icon/goal). (REQ-006)
- [x] 1.7 Create patient `rutina/actions.ts`: `toggleCheckItem`, `adjustWaterItem` (±250, clamp [0, goal]), `saveDetectedTimezone` (write-if-null, Intl-validated); ownership + subscription guards. (DPT-002/003/004)
- [x] 1.8 Update patient `rutina/page.tsx`: fetch view model, mount `TimezoneAutoDetect` island; REQ-004 gating unchanged. (REQ-007)
- [x] 1.9 Rework `components/patient/routine-plan-card.tsx`: CHECK toggle + WATER stepper rows, empty state; drop placeholder rows. (REQ-007, DPT-002/003)
- [ ] 1.10 Add timezone select to `perfil/` form + action. (DPT-004)
- [x] 1.11 i18n: new `patientRoutine`/`professionalRoutines` keys in `es.ts` + `en.ts` mirror + Dictionary interface; drop `planWalk/planWater/planMeals`. (REQ-006, REQ-007)
- [ ] 1.12 Verify S1: typecheck, lint, build; smoke — toggle persists on reload, water clamps, fresh state next local day, cross-patient rejected, FREE unchanged.

## Slice 2: AUTO_MEALS

- [x] 2.1 Extend `lib/daily-plan.ts`: read-time `MealEntry` count in local-day window, `satisfied`/`readOnly` flags. (DPT-006)
- [ ] 2.2 Card: read-only AUTO_MEALS row "X/Y" + `autoBadge`; es+en keys. (DPT-006)
- [ ] 2.3 Verify S2: gates; smoke — 2/3 renders without toggle; meal delete recomputes next load.

## Slice 3: Streaks + Weekly

- [ ] 3.1 Extend `lib/daily-plan.ts`: streak walk-back (cap 365; in-progress today never breaks) + Mon–Sun week. (DPT-007, DPT-008)
- [ ] 3.2 Card: streak badge + 7-day strip; es+en keys. (DPT-007, DPT-008)
- [ ] 3.3 Verify S3: gates; smoke — streak increments, missed day ⇒ 0, tz change rebases boundaries.

All schema changes in 1.1; S2/S3 code-only. Non-blocking PO question: Mon–Sun week vs trailing 7 days.

# Proposal: Daily Plan Tracking

## Intent

The "Plan general" section on the patient routine page is a hardcoded placeholder with local-only React state (never persisted). This change turns it into a real daily plan tracker: professionals author plan items per routine; patients track completion daily with persistence and a local-midnight reset; meals auto-track from real `MealEntry` logs; streaks and a weekly view gamify adherence. It deepens the MVP's paid "seguimiento 1 a 1" value proposition (README §3, §11) and extends the archived `client-paid-plan` work (`personalized-routine` spec).

## Scope

### In Scope

- **Slice 1 — Foundation**: `RoutinePlanItem` + `RoutinePlanItemCompletion` tables; `User.timezone` (IANA, browser auto-detected, editable in patient profile); professional plan-item editor in `RoutineEditor`; patient CHECK toggles and water COUNTER (+250 ml quick-add, professional-defined goal); lazy daily reset at the user's local midnight (no cron); user-TZ day-boundary helpers using date-only `@db.Date` math.
- **Slice 2 — Meals auto-tracking**: `AUTO_MEALS` item kind satisfied read-time from `MealEntry` count for the user's day (any `mealType`). Read-only, **no manual override** — it's the only objectively verifiable item; overriding would destroy credibility with the professional.
- **Slice 3 — Gamification**: per-routine streaks (complete day = all CHECK checked + all AUTO satisfied; resets to 0 on a break) and a 7-day weekly view in the routine card.

Locked decisions: per-routine independent trackers (multi-subscription mirrors per-conversation messages); FREE plan untouched (static generic text; plan items live on `Routine`, paid-only); water is habit tracking, not surveillance — the accountability loop is the professional relationship (weight/photos at appointments), not sensors.

### Out of Scope

- Changing subscription/cancellation behavior (streaming model: CANCELLED keeps access until `expiresAt` — stays exactly as-is).
- Water or meal photo verification.
- Reminders/notifications (future version).
- Professional-side analytics dashboard (future version).
- `CalorieEntry` cleanup (dead schema; separate change).
- Migrating existing server-local day helpers (`getMealEntries`, etc.) to user TZ.

## Capabilities

### New Capabilities

- `daily-plan-tracking`: plan item model, daily completion persistence, user-TZ day boundaries and lazy reset, water counter, read-time auto-meals, per-routine streaks and weekly view.

### Modified Capabilities

- `personalized-routine`: `Routine` gains authored plan items; professional editor extends to manage them; patient routine page renders the real tracker per routine card instead of placeholder rows (REQ-004 gating and FREE static section unchanged).

## Approach

Exploration Approach 1: items hang off `Routine`; one generic completion table keyed `(itemId, patientId, date)` with a `count` column covering CHECK (0/1), COUNTER (water), AUTO_MEALS (derived read-time, never written). New day ⇒ no rows ⇒ fresh state (mirrors subscription lazy-expiry). One additive Prisma migration, zero new dependencies, no date library — date-only columns plus simple date math.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `prisma/schema.prisma` + migrations | Modified | 2 new models, `User.timezone`, relations |
| `app/profesional/dashboard/rutinas/` | Modified | Plan-item editor + `saveRoutinePlanItems` action |
| `app/paciente/dashboard/rutina/` | Modified | Fetch items/completions; new `actions.ts` |
| `components/patient/routine-plan-card.tsx` | Modified | Server-fed rows, toggle/stepper/auto UI |
| `lib/daily-plan.ts` | New | Queries + user-TZ day-window helpers |
| `lib/i18n/dictionaries/{es,en}.ts` | Modified | Extend `patientRoutine`, `professionalRoutines` |
| Patient profile page | Modified | Timezone edit field |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Schema migration on prod data | Low | Additive only; all new tables/columns nullable-defaulted |
| User-TZ day-boundary bugs (no tests) | Med | Date-only `@db.Date`; dead-simple math; nullable `timezone` falls back to server-local |
| `consumedAt` backdating skews auto-meals | Low | Read-time derivation recomputes correctly |
| Item deletion orphans history | Low | `onDelete: Cascade`; reconcile by item id |

## Rollback Plan

Code revert restores placeholder behavior; new tables are additive and can be dropped in a follow-up migration or left harmlessly. TZ handling: `User.timezone` nullable — clearing values reverts all users to server-local day boundaries without a migration.

## Dependencies

None (no new packages).

## Success Criteria

- [ ] Professional authors/edits plan items per subscribed patient; patient sees them per routine card
- [ ] CHECK and water progress persist and reset at the user's local midnight
- [ ] Meals item reflects real `MealEntry` logs read-only ("2/3")
- [ ] Per-routine streak + 7-day view render correctly
- [ ] `npm run typecheck`, `npm run lint`, `npm run build` pass

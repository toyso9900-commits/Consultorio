# Verification Report

**Change**: daily-plan-tracking
**Version**: N/A
**Mode**: Standard (strict_tdd: false — no test runner; verification = gates + static/manual inspection per openspec testing strategy)
**Date**: 2026-07-15
**Scope**: All 5 PRs merged to main (S1a schema+libs, S1b professional editor, S1c patient tracker, S2 auto-meals + profile TZ, S3 streaks+weekly). Local `main` tip `99fec4b` matches `origin/main`.

### Completeness

| Metric | Value |
|--------|-------|
| Tasks total | 18 |
| Tasks complete | 15 |
| Tasks incomplete | 3 (1.12, 2.3, 3.3 — manual-smoke tasks, **deferred to user smoke session** by design) |

All 15 implementation tasks verified complete in code. The 3 unchecked tasks are the verify/smoke boxes intentionally left for this phase; they remain unchecked and are handed to the user as a smoke checklist (below). Not blocking per project config, but runtime evidence is still pending.

### Build & Tests Execution

**Typecheck**: ✅ Passed
```text
$ npm run typecheck
> consultorio@0.1.0 typecheck
> tsc --noEmit
(exit 0, no output)
```

**Lint**: ✅ Passed
```text
$ npm run lint
> consultorio@0.1.0 lint
> eslint
(exit 0, no output)
```

**Build**: ✅ Passed
```text
$ npm run build
▲ Next.js 16.2.9 (Turbopack)
✓ Compiled successfully in 27.7s
  Finished TypeScript in 41s
✓ Generating static pages using 7 workers (31/31) in 2.2s
(exit 0; 31/31 routes generated, /paciente/dashboard/rutina + /profesional/dashboard/rutinas + /paciente/dashboard/perfil all present)
```

**Tests**: ➖ Not available (no test runner — project config; S3 apply recorded 18 runtime algorithm assertions via ad-hoc tsx scripts: walk-back, 365 cap, in-progress-today, zero-item guard, Mon-start, state classification, AUTO_MEALS bucketing, TZ rebase AR-vs-Madrid — all passed per APPLY-PROGRESS #216)

**Coverage**: ➖ Not available

### Spec Compliance Matrix

Compliance basis: static source inspection with file:line evidence + all gates green. Runtime confirmation of every scenario is bundled into the deferred smoke checklist (§ Manual Smoke).

| Requirement | Scenario | Evidence | Result |
|-------------|----------|----------|--------|
| DPT-001 | Two subscriptions, two trackers | `app/paciente/dashboard/rutina/page.tsx:31-42` fetches one `Routine` per subscribed professional; `page.tsx:96-131` renders one `RoutinePlanCard` per routine, each fed its own plan from `plansByRoutineId` (`:57-59`, `:108-110`); `lib/daily-plan.ts:275-301` builds one independent plan per routineId | ✅ STATIC PASS (smoke pending) |
| DPT-001 | FREE-only patient sees no tracker | `page.tsx:26-27,31` — `isSubscribed=false` ⇒ `routines=[]`, paywall branch `:74-89`; only static FREE section `:134-148` (REQ-005) renders. `RoutineItem` hangs off `Routine` only (`prisma/schema.prisma:422-440`); FREE content has no items | ✅ STATIC PASS (smoke pending) |
| DPT-002 | Patient toggles an item | `app/paciente/dashboard/rutina/actions.ts:74-125` upserts `(itemId, patientId, date)` flipping 0↔1; persists across reload via `lib/daily-plan.ts:208-216,245-255` read-back | ✅ STATIC PASS (smoke pending) |
| DPT-002 | Cross-patient mutation rejected | `actions.ts:31-71` `authorizeItemAccess`: session role PATIENT (`:34`) AND `item.routine.patientId !== patientId` ⇒ null (`:50-52`) ⇒ "Unauthorized." (`:77-79`). Same guard on `adjustWaterItem` (`:135-139`). Read path impossible by construction (page passes session id only) | ✅ STATIC PASS |
| DPT-003 | Increment toward goal | `actions.ts:131-191`: step validated `±250` (`:145-147`), `nextCount = min(max(count+delta,0),goal)` (`:163`); `WATER_STEP_ML = 250` (`lib/routine-items.ts:11`); card stepper `routine-plan-card.tsx:249-287` | ✅ STATIC PASS (smoke pending) |
| DPT-003 | Decrement floor at day boundary | Server clamp floor `actions.ts:163`; button disabled at `count<=0` (`routine-plan-card.tsx:269`) and at goal (`:278-281`) | ✅ STATIC PASS (smoke pending) |
| DPT-004 | Auto-detected timezone persisted | `components/patient/timezone-auto-detect.tsx:12-17` reads `Intl…resolvedOptions().timeZone`; `actions.ts:198-223` Intl-validates then `updateMany … WHERE timezone IS NULL` (persist-once; manual choice never overwritten); `User.timezone String?` (`schema.prisma:52`); migration `20260715215137` adds the column | ✅ STATIC PASS (smoke pending) |
| DPT-004 | Null timezone falls back to server-local | `lib/day-boundaries.ts:38-44` (no `timeZone` option ⇒ server-local) and `:132-138` (server-local window via Date arithmetic); callers pass `user?.timezone ?? null` (`page.tsx:47-56`, `actions.ts:63-68`) | ✅ STATIC PASS |
| DPT-004 | Patient may edit timezone in profile | `perfil/profile-form.tsx:33` (`Intl.supportedValuesOf`), `:196-212` select with "auto" empty option; `perfil/actions.ts:44-51` IANA validation, `:55-58` persisted; `null` reverts to auto/server-local | ✅ STATIC PASS (smoke pending) |
| DPT-005 | New day shows fresh state | Lazy reset: no cron anywhere (grep `cron` — only comments/docs); new local day has no completion rows ⇒ counts default 0 (`lib/daily-plan.ts:11-16`, `:282`); date key = user-local date (`actions.ts:68`) | ✅ STATIC PASS (smoke pending) |
| DPT-006 | Count reflects logged meals, no toggle | Read-time derivation: `lib/daily-plan.ts:218-239` range-fetches `MealEntry.consumedAt` in local-day UTC windows (only when an AUTO_MEALS item exists), bucketed per local date `:256-262`; item `count` = patient-level meals today `:271,280-282`, `readOnly: true` `:291`. Card renders progress + badge, zero controls (`routine-plan-card.tsx:291-321`) | ✅ STATIC PASS (smoke pending) |
| DPT-006 | No manual override path anywhere | `toggleCheckItem` rejects non-CHECK (`actions.ts:81-83`); `adjustWaterItem` rejects non-WATER (`:141-143`); AUTO_MEALS is never persisted (no write path exists; `RoutineItemCompletion` writes only in those two actions) | ✅ STATIC PASS |
| DPT-006 | Backdated meal recomputes correctly | Derivation is pure read-time over current `MealEntry` rows — deletes/backdates recompute on next load (`lib/daily-plan.ts:18-23`) | ✅ STATIC PASS (smoke pending) |
| DPT-007 | Streak increments | `computeStreak` (`lib/daily-plan.ts:139-155`): cursor = today if complete else yesterday (in-progress today never breaks); walk-back cap 365 (`STREAK_MAX_DAYS :39`). Complete day = `items.length>0` AND every CHECK `count>=1` AND WATER `count>=goal` AND AUTO_MEALS `>=goal` (`:93-133` — zero-item guard prevents vacuous streaks) | ✅ STATIC PASS (smoke pending; algorithm assertions passed at apply) |
| DPT-007 | Missed day resets streak | Walk-back breaks at first incomplete day (`:150-152`); result 0 or 1 per today's state | ✅ STATIC PASS (smoke pending) |
| DPT-007 | Timezone change mid-streak | Nothing is stored — streak recomputed per read with the user's CURRENT tz (`:25-31`); subsequent boundaries use the new zone automatically | ✅ STATIC PASS (smoke pending) |
| DPT-008 | Week summary renders | `buildWeek` (`lib/daily-plan.ts:157-180`): Monday offset via `(dateOnlyUtc(today).getUTCDay()+6)%7` (TZ-independent), 7 days Mon–Sun, states complete/partial/empty/future + `isToday`; strip UI `routine-plan-card.tsx:352-395` with per-dot aria-labels, today ring | ✅ STATIC PASS (smoke pending) |
| DPT-009 | Routine edit preserves items | Reconcile-by-id `actions.ts:139-172`: payload ids matching existing rows are updated (`:167-168`), unknown ids created (`:169-171`), absent ids deleted (`:154-156`); editor swaps in returned real ids after save (`routine-editor.tsx:191-193`) so re-saves never delete+recreate | ✅ STATIC PASS |
| DPT-009 | Deleting item cascades completions | `onDelete: Cascade` on `RoutineItemCompletion.itemId` (`schema.prisma:448`; migration.sql:47) | ✅ STATIC PASS |
| DPT-009 | Expired subscription retains data | Nothing deletes items/completions on expiry (only `routineItem.deleteMany` in the codebase is the reconcile path, scoped `routineId`, `actions.ts:154`); expiry is a read-time predicate (`lib/patient-subscriptions.ts:11-22`) that only closes access; resubscribe restores reads with full history | ✅ STATIC PASS (smoke pending) |
| REQ-006 | Professional authors items for subscriber | `publishRoutineForPatient` accepts validated `items[]` (`actions.ts:40-51`), sub-gate before any write (`:67-78`), single `$transaction` upsert + reconcile (`:84-113`); editor subsection `routine-editor.tsx:245-407` (add/remove/reorder/type/icon/goal, cap 20 mirrored `:25`) | ✅ STATIC PASS (smoke pending) |
| REQ-006 | Authoring rejected for non-subscriber | `hasActivePatientSubscription` false ⇒ `{errorCode:"not-subscribed"}` before the transaction (`actions.ts:72-78`) — no items created; editor row locked when `subscriptionStatus!=="active"` (`rutinas/page.tsx:81,104-109`) | ✅ STATIC PASS |
| REQ-006 | Cross-professional authoring rejected | `professionalId = session.user.id` (`actions.ts:53`); upsert keyed on the caller's own `(patientId, professionalId)` pair (`:85-97`); reconcile scoped to the caller's routine; forged foreign item ids degrade to plain creates on the caller's routine (`:135-137`, `:150-152`) — another professional's rows are unreachable | ✅ STATIC PASS |
| REQ-007 | Subscriber sees authored items | Card renders server view-model items with live counts (`page.tsx:108`, `routine-plan-card.tsx:245-349`); placeholder keys `planWalk/planWater/planMeals` deleted from dictionaries (grep: zero hits); pill-era `markCompleted/completedToast` also gone | ✅ STATIC PASS (smoke pending) |
| REQ-007 | Routine without items renders empty tracker | `daily-plan.ts:275-277` returns empty items list per routine; card empty state `routine-plan-card.tsx:240-243` (`noItemsYet`); streak badge and week strip hidden when no items (`:211`, `:354`) | ✅ STATIC PASS (smoke pending) |
| REQ-002 MOD | Professional updates routine content | Upsert on `@@unique([patientId, professionalId])` (`schema.prisma:412`, `actions.ts:85-97`) — same routine id preserved, one row per pair | ✅ STATIC PASS |
| REQ-002 MOD | Edit preserves plan items and history | Same as DPT-009 first scenario — ids survive, completions stay linked | ✅ STATIC PASS |

**Compliance summary**: 24/24 scenarios STATIC PASS; 0 FAILING. Runtime confirmation deferred to user smoke session (13 scenarios carry "smoke pending").

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|------------|--------|-------|
| Per-routine independent trackers | ✅ Implemented | One plan per routineId; independent state |
| FREE plan untouched | ✅ Implemented | Static REQ-005 section unchanged (`page.tsx:134-148`); gating via `listActiveSubscriptionsForPatient` unchanged (REQ-004) |
| CHECK toggle + persistence | ✅ Implemented | Upsert on `(itemId, patientId, date)` unique key |
| Water ±250 clamp [0, goal] | ✅ Implemented | Server clamp + disabled UI bounds |
| AUTO_MEALS read-only | ✅ Implemented | Derived read-time; no mutation path accepts it |
| User-IANA-TZ boundaries + null fallback | ✅ Implemented | `lib/day-boundaries.ts` pure Intl; null ⇒ server-local |
| Lazy reset, no cron | ✅ Implemented | Date-keyed rows; zero scheduled jobs |
| Complete-day streak rule | ✅ Implemented | All-kinds evaluator + zero-item guard + in-progress-today skip + 365 cap |
| Weekly Mon–Sun strip | ✅ Implemented | TZ-independent Monday anchor |
| Item lifecycle / history retention | ✅ Implemented | Reconcile-by-id; cascade delete; expiry never deletes |
| Subscription gating unchanged (streaming/lazy-expiry model) | ✅ Implemented | `lib/patient-subscriptions.ts` untouched; both new call sites reuse it |
| i18n es/en parity | ✅ Implemented | `patientRoutine` +13 keys, `professionalRoutines` item-editor keys mirrored (es.ts:694-707 / en.ts:690-703; es.ts:725-739 / en.ts:720-734); obsolete keys removed |

### Coherence (Design)

| Decision | Followed? | Notes |
|----------|-----------|-------|
| One aggregate action, single `$transaction` | ✅ Yes | `publishRoutineForPatient(..., items?)` |
| Reconcile by id, `sortOrder` = index, cascade deletes | ✅ Yes | `actions.ts:139-172` |
| `User.timezone String?` nullable, null ⇒ server-local | ✅ Yes | Schema + helpers |
| Pure `Intl` day-boundary lib, date-only `@db.Date`, offset sampled at noon UTC | ✅ Yes | `lib/day-boundaries.ts`; disclosed ~1h DST-edge tolerance (design tradeoff) |
| AUTO_MEALS read-time, never persisted | ✅ Yes | `lib/daily-plan.ts:218-262` |
| TZ auto-detect island, server writes only when null | ✅ Yes | `timezone-auto-detect.tsx` + `saveDetectedTimezone` |
| Streaks read-time walk-back, cap 365, no cache/cron | ✅ Yes | `computeStreak` |
| Page server / `RoutinePlanCard` client island convention | ✅ Yes | streak/week are plain props (not useState shadows) so `revalidatePath` refreshes them |
| Documented deviation: "mark completed" pill removed | ✅ Accepted | Orchestrator-directed, PO-disclosed: day completion IS all-items-done; a fake button would be dishonest UI. No spec requirement covered a pill; keys/card/page fully cleaned |

### Security Spot-Checks

| Check | Result |
|-------|--------|
| Cross-patient mutation on tracker actions | ✅ Rejected — `authorizeItemAccess` ownership + role + subscription guard (`rutina/actions.ts:31-71`) |
| Cross-professional authoring | ✅ Rejected — session-derived professionalId, pair-keyed upsert, reconcile scoped to own routine; forged ids degrade harmlessly (`rutinas/actions.ts:53,84-113,139-172`) |
| `updatePatientProfile` IDOR fix | ✅ Correct — `session.user.id !== userId` ⇒ rejected (`perfil/actions.ts:39-42`); ownership is session-derived, not payload-derived |

### Manual Smoke Checklist (tasks 1.12 / 2.3 / 3.3 — DEFERRED TO USER SMOKE SESSION)

Setup: professional **P**; patients **A** (ACTIVE subscription to P) and **B** (no subscription). As P, publish a routine for A with 3 items: CHECK "Caminar 30 min", WATER goal 2000, AUTO_MEALS goal 3.

**1.12 — S1 smoke**
1. As P, save the 3-item routine → expect success toast; items persist after reload, in order.
2. As A, open `/paciente/dashboard/rutina` → one card, 3 rows, no hardcoded placeholder rows; FREE static section at the bottom.
3. Tap the CHECK row → fills emerald; reload → still checked (persistence).
4. Water: tap `+` → "250 / 2000 ml"; repeat to 2000 → `+` disables at goal; tap `−` → 1750; tap `−` down to 0 → `−` disables, stays 0.
5. Fresh state: profile → set timezone to a zone already in tomorrow (e.g. from America/Argentina to Australia/Sydney) → reload rutina → all counts 0 / unchecked (then revert timezone).
6. Cross-patient: as second subscriber C (or as A for P's other patient), confirm each card shows only that patient's own items; server rejection of forged itemIds is covered by static inspection (`actions.ts:50-52`).
7. As B → paywall + FREE section only; zero tracker UI.

**2.3 — S2 smoke**
1. As A, log 2 meals today in `/paciente/dashboard/nutricion` → open rutina → AUTO_MEALS row shows "2/3 …", badge "Automático", NO toggle/stepper controls.
2. Log a 3rd meal → reload → "3/3", badge turns emerald (satisfied).
3. Delete one of today's meal logs → reload rutina → back to "2/3" (read-time recompute).

**3.3 — S3 smoke**
1. Complete everything today (CHECK + water to goal + 3 meals) → streak badge shows 1 (emerald flame); today's dot = complete (emerald + check + ring).
2. Next local day, complete nothing → badge muted at 0; weekly strip shows yesterday complete, today empty/partial.
3. Complete everything today again → streak = 1 (missed day reset it, today counts).
4. Change profile timezone (e.g. America/Argentina/Buenos_Aires → Europe/Madrid) → reload → today's date and all boundaries re-evaluate under Madrid (counts may shift local day — expected rebase, not data loss).
5. Weekly strip shows 7 dots Mon–Sun with per-day aria-labels; states match actual activity; today carries the ring.

### Issues Found

**CRITICAL**: None

**WARNING**:
1. Tasks 1.12, 2.3, 3.3 unchecked — runtime smoke evidence for 13 spec scenarios is pending the user's smoke session (checklist above). Gates are green and static evidence is complete, but browser behavior (toasts, disabled states, reload persistence, streak UI) has not been observed at runtime.

**SUGGESTION**:
1. `updatePatientProfile` (`perfil/actions.ts:39-42`) enforces ownership but not role — a PROFESSIONAL session could update its own `User` row and upsert a `PatientProfile` for itself via this endpoint. Inert data, but a `session.user.role === "PATIENT"` check would be defense-in-depth.
2. `TimezoneAutoDetect` is mounted only on the rutina page; patients who never visit it keep `timezone: null` (server-local fallback). Consider mounting it in the patient dashboard layout for earlier detection.
3. S3 slice landed at 454 diff lines vs the 400-line budget (+13%, disclosed in the PR body). Future final slices could pre-split lib vs card to stay inside budget.

### Verdict

**PASS WITH WARNINGS**

All gates green; 24/24 spec scenarios have complete static evidence; all design decisions honored (one PO-disclosed deviation, accepted); security spot-checks pass. The single WARNING is the pending user smoke session (tasks 1.12/2.3/3.3, deferred by design — no test runner exists to substitute).

**Ready for sdd-archive**: after the user executes the smoke checklist and confirms the 13 pending scenarios, run sdd-archive. If smoke surfaces defects, route back to apply first.

# Daily Plan Tracking Specification

## Purpose

Daily completion tracking for plan items authored on paid routines: per-user-timezone day boundaries with lazy reset, CHECK toggles, self-reported water counter, read-only auto-meals derived from `MealEntry`, and per-routine streaks with a weekly view. Slice tags: S1 foundation, S2 auto-meals, S3 streaks+weekly.

## Requirements

### Requirement: DPT-001 Per-routine independent trackers (S1)

Plan items SHALL belong to a `Routine`. A patient with multiple subscriptions MUST see one independent tracker per routine card, each with its own items and completion state. FREE plan content MUST NOT have plan items; FREE-only users MUST NOT see any plan tracker.

#### Scenario: Two subscriptions, two trackers

- GIVEN Juan holds active subscriptions to Laura and Pedro, each with authored plan items
- WHEN Juan opens `/paciente/dashboard/rutina`
- THEN two routine cards render, each with its own items and independent completion state

#### Scenario: FREE-only patient sees no tracker

- GIVEN Ana has no active subscription
- WHEN Ana opens the routine page
- THEN only the static FREE section renders with no plan items

### Requirement: DPT-002 CHECK item completion (S1)

A patient SHALL check/uncheck their own CHECK items; state MUST persist per (item, patient, user-local date). The system MUST reject attempts to read or mutate another patient's completions.

#### Scenario: Patient toggles an item

- GIVEN Juan has an unchecked CHECK item today
- WHEN Juan taps it
- THEN the completion persists and survives a page reload

#### Scenario: Cross-patient mutation rejected

- GIVEN a completion belongs to Juan
- WHEN Ana attempts to toggle it
- THEN the action is rejected with an authorization error

### Requirement: DPT-003 Water counter (S1)

WATER items SHALL be self-reported counters: +250 ml per increment toward a professional-defined daily goal (e.g. 2000 ml); the patient MAY decrement to undo; the count MUST stay within [0, goal]. Philosophy: habit tracking, not surveillance.

#### Scenario: Increment toward goal

- GIVEN a water item with goal 2000 ml at 500 ml logged
- WHEN Juan taps +250 ml
- THEN the count persists at 750 ml

#### Scenario: Decrement floor at day boundary

- GIVEN a water item at 0 ml on a new local day
- WHEN Juan taps decrement
- THEN the count remains 0

### Requirement: DPT-004 User timezone and day boundaries (S1)

`User.timezone` SHALL store an IANA timezone, auto-detected from the browser client and persisted; the patient MAY edit it in their profile. All day-boundary logic (today's completions, meals-today count, streaks) MUST use the user's local midnight. If `timezone` is null, the system MUST fall back to server-local boundaries.

#### Scenario: Auto-detected timezone persisted

- GIVEN Juan's browser reports "America/Argentina/Buenos_Aires" and his timezone is null
- WHEN the client detection runs
- THEN `User.timezone` persists "America/Argentina/Buenos_Aires"

#### Scenario: Null timezone falls back to server-local

- GIVEN a user with null timezone
- WHEN day boundaries are computed
- THEN server-local midnight is used

### Requirement: DPT-005 Lazy daily reset (S1)

Completion state SHALL reset lazily at the user's local midnight: a new local day has no completion rows, so the UI shows fresh state. No scheduled jobs SHALL be used.

#### Scenario: New day shows fresh state

- GIVEN Juan completed all items yesterday (his local day)
- WHEN he opens the page after his local midnight
- THEN all items show unchecked / zero counts

### Requirement: DPT-006 AUTO_MEALS read-only derivation (S2)

AUTO_MEALS items SHALL be satisfied read-time by counting `MealEntry` rows whose `consumedAt` falls within the user's current local day (any mealType), displayed as "X/Y meals logged today". Manual check/uncheck MUST NOT be possible.

#### Scenario: Count reflects logged meals

- GIVEN an AUTO_MEALS item with target 3 and Juan logged 2 meals today
- WHEN the routine page loads
- THEN the item displays "2/3 meals logged today" with no toggle control

#### Scenario: Backdated meal recomputes correctly

- GIVEN Juan met yesterday's target
- WHEN he deletes one of yesterday's meal logs
- THEN yesterday's derived state reflects 1 fewer meal on next read

### Requirement: DPT-007 Complete day and streaks (S3)

A complete day = all CHECK items checked AND all AUTO/WATER goals met. Streak = consecutive complete days, computed per routine; a missed day resets the streak to 0. Day boundaries MUST be evaluated with the user's current timezone.

#### Scenario: Streak increments

- GIVEN Juan completed every item the last 3 local days
- WHEN he completes all items today
- THEN the streak shows 4

#### Scenario: Missed day resets streak

- GIVEN a streak of 5 and yesterday was incomplete
- WHEN the page loads today
- THEN the streak shows 0 or 1 per today's state

#### Scenario: Timezone change mid-streak

- GIVEN a streak computed under "America/Cordoba"
- WHEN Juan changes timezone to "Europe/Madrid"
- THEN subsequent day boundaries use Madrid local midnight

### Requirement: DPT-008 Weekly view (S3)

The routine card SHALL render a per-day completion summary (complete/incomplete) for the current week, computed in the user's timezone.

#### Scenario: Week summary renders

- GIVEN completions across the current user-local week
- WHEN the routine card renders
- THEN 7 per-day indicators show complete vs incomplete

### Requirement: DPT-009 Item lifecycle and history retention (S1)

Deleting a plan item SHALL cascade-delete its completions. Routine upserts MUST preserve unchanged item ids (reconcile by id, not label). Subscription expiry MUST NOT delete items or completions: access closes, and resubscription MUST restore full history.

#### Scenario: Routine edit preserves items

- GIVEN a routine with plan items and completion history
- WHEN the professional edits title/content without changing items
- THEN item ids survive and completion history remains linked

#### Scenario: Expired subscription retains data

- GIVEN Juan's subscription expired with tracked history
- WHEN he resubscribes
- THEN prior items and completions reappear intact

# Verify Report: client-paid-plan

- **Change**: `client-paid-plan`
- **Mode**: Full spec verification (proposal + specs + design + tasks present)
- **Date**: 2026-07-13
- **Executor**: `sdd-verify` sub-agent
- **Verdict**: **PASS WITH WARNINGS** (0 CRITICAL, 1 WARNING, 2 SUGGESTION) → recommend `sdd-archive`

## Runtime Evidence

| Command | Result | Notes |
|---|---|---|
| `npm run typecheck` | ✓ PASS | `tsc --noEmit` clean |
| `npm run lint` | ✓ PASS | ESLint clean |
| `npm run build` | ✓ PASS | Next.js 16.2.9 (Turbopack) builds all 31 routes, including `/paciente/dashboard/rutina`, `/paciente/dashboard/suscripcion`, `/profesional/dashboard/rutinas` |
| Automated tests | N/A | Repo has no test runner (per design's documented risk). Manual walkthroughs (5.2, 5.3) are pending user click-tests. |

## Task Completeness

| Task | Status |
|---|---|
| Phase 1 (Foundation) 1.1–1.8 | ✓ 8/8 |
| Phase 2 (Slice 1 UI) 2.1–2.5 | ✓ 5/5 |
| Phase 3 (Slice 2 UI) 3.1–3.4 | ✓ 4/4 |
| Phase 4 (i18n + wiring) 4.1–4.2 | ✓ 2/2 |
| Phase 5.1 build/typecheck/lint | ✓ 1/1 |
| Phase 5.2 Slice 1 manual walkthrough | ⏳ pending user verification (USER-EXECUTED, not a failure) |
| Phase 5.3 Slice 2 manual walkthrough | ⏳ pending user verification (USER-EXECUTED, not a failure) |

All implementation tasks complete. The two remaining unchecked tasks are manual click-throughs the agent cannot execute (no dev server).

## Spec Compliance Matrix

### Capability: patient-paid-subscription

| Requirement | Evidence | Status |
|---|---|---|
| REQ-001 View professional plan offer (priced plan) | `app/profesional/[id]/page.tsx:29` `hasPaidPlan = prof.planPrice != null && prof.planPrice > 0`; FREE card always rendered (lines 119-130); PAID card gated on `hasPaidPlan` (line 132); subscribe CTA only when `isPatient` AND `!alreadySubscribed` (lines 152-163) | ✓ PASS |
| REQ-001 View professional plan offer (no price) | `hasPaidPlan=false` → only FREE card renders; no CTA path reachable | ✓ PASS |
| REQ-002 Subscribe with simulated payment (success) | `app/paciente/dashboard/suscripcion/actions.ts:81-114` — `prisma.$transaction` wraps `patientSubscription.upsert` (ACTIVE, startedAt=now, expiresAt=now+30d, pricePaid=planPrice snapshot, currency=MXN) + `payment.create` (payerId, payeeId, amount, status=PAID, provider=TEST, providerRef, patientSubscriptionId) | ✓ PASS |
| REQ-002 Subscribe with simulated payment (failure) | `actions.ts:69-74` — if `charge.status !== "PAID"` returns error **before** `$transaction` runs; no DB writes | ✓ PASS |
| REQ-003 Notify professional of new subscriber | `actions.ts:120-125` calls `triggerPatientSubscribed({patientId, patientName, professionalId, expiresAt})` after commit; `lib/pusher-server.ts:116-126` posts to `userChannel(professionalId)` = `private-user-{professionalId}` with event `patient-subscribed`; `notification-bell.tsx:77` binds event → refetch; `lib/notifications.ts:133-138, 188-198` builds `patient-subscription` items for professional feed | ✓ PASS |
| REQ-004 Cancel at period end | `actions.ts:133-186` — auth+PATIENT role check, validates row exists, rejects EXPIRED/past-expiresAt and already-CANCELLED; sets `status="CANCELLED"` only (line 168), `expiresAt` untouched (streaming model per design decision 3); triggers `subscription-cancelled` | ✓ PASS |
| REQ-005 Expiry revokes personalized access | `lib/patient-subscriptions.ts:11-22` — `hasActivePatientSubscription` returns false for missing sub or `status==="EXPIRED"`; otherwise `expiresAt > new Date()` (CANCELLED-not-expired still true, ACTIVE-expired false); `app/paciente/dashboard/rutina/page.tsx:23-39` gates routine query on `listActiveSubscriptionsForPatient` (status ACTIVE/CANCELLED AND expiresAt>now); FREE block always rendered (line 103-113) | ✓ PASS |
| REQ-006 Prevent duplicate subscriptions | Schema `@@unique([patientId, professionalId])` at `prisma/schema.prisma:386` + migration `PatientSubscription_patientId_professionalId_key` unique index; action checks `hasActivePatientSubscription` pre-charge (actions.ts:54-60) → returns "Already subscribed."; resubscribe path uses `upsert.update` to reset status/startedAt/expiresAt/pricePaid (actions.ts:93-99) | ✓ PASS |

### Capability: personalized-routine

| Requirement | Evidence | Status |
|---|---|---|
| REQ-001 Publish routine for a subscriber | `app/profesional/dashboard/rutinas/actions.ts:14-83` — auth+PROFESSIONAL role, patient validated (exists + role=PATIENT), trimmed non-empty title/content, `hasActivePatientSubscription` gate returns `{success:false, error:"Patient is not subscribed.", errorCode:"not-subscribed"}` on false, `prisma.routine.upsert` on pair, `triggerRoutinePublished` to `private-user-{patientId}` | ✓ PASS |
| REQ-002 Edit an existing routine | `actions.ts:59-71` — `Routine.upsert` `update` path replaces title+content in place; `@@unique([patientId, professionalId])` guarantees one row per pair | ✓ PASS |
| REQ-003 Patient views gated routine | `app/paciente/dashboard/rutina/page.tsx:23-38` — only fetches routines for professionals in `activeSubscriptions`; renders title (line 80), content with `whitespace-pre-line` (line 93), publishedBy/updatedAt (lines 82-92) | ✓ PASS |
| REQ-004 Paywall for non-subscribers | `page.tsx:28-39` — when `!isSubscribed`, `routines=[]` literal (no prisma query runs — no SSR leak); paywall block (lines 52-67) renders paywallTitle/paywallBody/paywallCta; subscribe CTA links to `/paciente/dashboard/expertos` | ✓ PASS |
| REQ-005 FREE plan content is static | `page.tsx:101-113` — FREE block rendered unconditionally for every patient; content is `t.freePlanBody` (hardcoded dictionary string, identical for all); profile form (`app/profesional/dashboard/perfil/profile-form.tsx:292-296`) renders only a read-only `freePlanReadonly` notice, no editable field | ✓ PASS |

### Capability: client-list (modified)

| Requirement | Evidence | Status |
|---|---|---|
| REQ-005 Show paid-subscription status per client | `lib/appointments.ts:121-247` — `getProfessionalClients` queries `prisma.patientSubscription.findMany({where: {professionalId, patientId: {in: patientIds}}})`, computes `subscriptionStatus` with `isExpired = status==="EXPIRED" \|\| expiresAt <= now` (matches gating predicate), returns `"active" \| "expired" \| "none"` tri-state; `app/profesional/dashboard/clientes/page.tsx:112-123` renders badge per state | ✓ PASS |

## Design Coherence

| Decision | Implementation | Status |
|---|---|---|
| New `PatientSubscription` model, `@@unique([patientId, professionalId])` | `prisma/schema.prisma:367-388` | ✓ |
| Reuse `SubscriptionStatus` enum | Line 374: `status SubscriptionStatus @default(ACTIVE)` | ✓ |
| Cancel semantics: CANCELLED + expiresAt unchanged | `actions.ts:166-169` only sets status | ✓ |
| Lazy expiry read-time predicate | `lib/patient-subscriptions.ts:20-21` | ✓ |
| Resubscribe via `upsert` | `actions.ts:82-100` | ✓ |
| `PaymentProvider` interface + `TestPaymentProvider` | `lib/payments/index.ts:12-34` | ✓ |
| Routine: one row per pair, upsert | `prisma/schema.prisma:404` + `actions.ts:59-71` | ✓ |
| FREE content static, not editable | `page.tsx:103-113` + `profile-form.tsx:292-296` | ✓ |
| Gate enforcement server-only | All three actions + two RSC pages | ✓ |
| Pusher reuses `private-user-{userId}` | `lib/pusher-shared.ts:3-5` + `lib/pusher-server.ts:116-150` | ✓ |
| Migration additive (no destructive SQL) | `prisma/migrations/20260713215932_add_patient_subscription_routine_payment/migration.sql` — only `CREATE TYPE`, `ALTER TABLE ADD COLUMN`, `CREATE TABLE`, `CREATE INDEX`, `ADD CONSTRAINT`; no `DROP`/`DELETE`/data rewrite | ✓ |
| i18n three-file sync (es/en/index) | `lib/i18n/dictionaries/{es,en,index}.ts` — all new sections present; `index.ts` uses `Record<keyof typeof es.X, string>` for compile-time enforcement | ✓ |
| Sidebar links resolve | PATIENT `myRoutine`→`/paciente/dashboard/rutina` ✓, `mySubscriptions`→`/paciente/dashboard/suscripcion` ✓, PROFESSIONAL `routines`→`/profesional/dashboard/rutinas` ✓ (all confirmed in `next build` route table) | ✓ |

## Findings

### CRITICAL
None.

### WARNING

**W-1. Patient subscription page does not render the plan offer / subscribe CTA described in REQ-001 prose.**
- Requirement: `patient-paid-subscription` REQ-001 — "The system SHALL display, on a professional's public profile **and in the patient's subscription page**, the plan offer: FREE plan label, PAID plan price and duration text as set by the professional, and a subscribe CTA only for authenticated patients."
- Location: `app/paciente/dashboard/suscripcion/page.tsx`
- What's wrong: The page lists the patient's existing subscriptions with price/expiry/status/cancel button and an empty state that links to the Expert Guide. It does NOT re-render a plan offer (FREE/PAID cards, subscribe CTA) as the requirement prose suggests.
- Evidence: `page.tsx:57-126` — only iterates `subscriptions` from the DB; no plan-offer card, no subscribe CTA on this page.
- Why WARNING not CRITICAL: both scenarios attached to REQ-001 exercise only `/profesional/{id}`; no scenario tests the subscription page for a plan offer. The empty state routes the user to `/paciente/dashboard/expertos` where they can reach professional pages and subscribe. Behavior matches the scenarios; the prose is broader than the scenarios.
- Remediation: either tighten the requirement prose to match the scenarios, or add a small plan-offer card per professional to the subscription page.

### SUGGESTION

**S-1. Unused i18n keys `subscription.alreadySubscribed` and `subscription.planPriceMissing`.**
- Location: `lib/i18n/dictionaries/{es,en,index}.ts` (es.ts:626-629, en.ts:624-627, index.ts:106-107)
- What's wrong: Both keys were added per the design's i18n plan but no UI code consumes them. `subscribe-button.tsx:26` falls back to `result.error || dictionary.patientSubscription.subscribeError` — surfacing the server's English error strings ("Already subscribed.", "Plan price is not configured.") directly to the user instead of a localized message.
- Evidence: Grep for `dictionary.subscription.alreadySubscribed` / `dictionary.subscription.planPriceMissing` returns zero consumers.
- Remediation (non-blocking): extend the server action return shape with an optional `errorCode` (mirroring `publishRoutineForPatient`'s `"not-subscribed"` pattern) and map to these keys in the subscribe button, or drop the unused keys.

**S-2. `cancel-button.tsx` shows the cancel button for expired/cancelled subscriptions in a disabled state rather than hiding it.**
- Location: `app/paciente/dashboard/suscripcion/page.tsx:115-118`
- What's wrong: Button is rendered with `disabled={!canCancel}` for any non-active sub. Cosmetic only — the action still rejects duplicate cancels server-side.
- Remediation (non-blocking): hide the button for expired/cancelled subs, or replace with a status note.

## Pending User Verification (USER-EXECUTED — not agent failures)

- **Task 5.2 — Slice 1 manual walkthrough** (6 steps in `tasks.md`): subscribe flow, payment persistence, notification toast, cancel behavior, lapse behavior, double-subscribe rejection. Requires `npm run dev` + Prisma Studio, which the agent does not run.
- **Task 5.3 — Slice 2 manual walkthrough** (6 steps in `tasks.md`): publish routine, edit in place, subscriber view, non-subscriber paywall (inspect SSR HTML for leak), FREE block identical, client-list badge.

Both are scripted in `tasks.md` lines 64-82 for the user to execute.

## Rollback Readiness

- Migration is purely additive (verified — no `DROP`/`DELETE`/data rewrite).
- New pages under `app/paciente/dashboard/{rutina,suscripcion}` and `app/profesional/dashboard/rutinas` are self-contained.
- Reverting = drop migration + delete new pages/actions + revert sidebar/i18n/pusher/notifications edits. No existing rows mutated.

## Recommendation

**Proceed to `sdd-archive`.** All CRITICAL paths are covered by code and verified by build/typecheck/lint. The single WARNING is a prose-vs-scenario mismatch in REQ-001 and does not break any scenario. The two SUGGESTIONs are cosmetic/i18n polish. Pending manual walkthroughs (5.2/5.3) are user-executed click-tests and are explicitly not agent-executable; they do not block archive per the mission's note.

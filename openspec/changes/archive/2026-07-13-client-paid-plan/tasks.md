# Tasks: Client Paid Plan

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1,200–1,400 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes (informational — user chose direct commit to `main`, no PRs) |
| Suggested split | 3 apply batches: foundation → Slice 1 UI → Slice 2 UI |
| Delivery strategy | ask-always (direct commit, no PRs) |
| Chain strategy | size-exception (informational only; not used) |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: size-exception
400-line budget risk: High

### Suggested Apply Batches

| Batch | Goal | Scope |
|-------|------|-------|
| 1 | Schema + libs | Prisma + migration, gating helper, payment provider, Pusher payloads/triggers, notifications, client-list lib |
| 2 | Slice 1 UI + wiring | Subscribe/cancel actions, `/paciente/dashboard/suscripcion`, `/profesional/[id]` CTA, profile price fields, PATIENT sidebar, i18n subset |
| 3 | Slice 2 UI + wiring | `/profesional/dashboard/rutinas` + publish action, `/paciente/dashboard/rutina` gated view, PRO sidebar, client-list badge wiring, i18n subset |

## Phase 1 — Foundation (Batch 1)

- [x] 1.1 `prisma/schema.prisma`: add `PatientSubscription`, `Routine`, `Payment`, `PaymentStatus`, `PaymentProvider`, `ProfessionalProfile.planPrice`/`planDuration`, User back-relations. ~150 LOC. AC: schema parses (`prisma format`).
- [x] 1.2 Run `prisma migrate dev --name add_patient_subscription_routine_payment`; review generated `migration.sql`. ~80 LOC. AC: migration applies on local Postgres with no destructive ops.
- [x] 1.3 Create `lib/patient-subscriptions.ts`: `hasActivePatientSubscription`, `listActiveSubscriptionsForPatient`, `getPatientSubscription`. ~60 LOC. AC: predicate matches patient-paid-subscription REQ-005 (ACTIVE-or-CANCELLED AND `expiresAt > now`).
- [x] 1.4 Create `lib/payments/index.ts`: `PaymentProvider` interface, `testPaymentProvider`, `paymentProvider` export. ~40 LOC. AC: charge returns `{status:"PAID", providerRef:"test_*"}`.
- [x] 1.5 Modify `lib/pusher-shared.ts`: add `PatientSubscribedPayload`, `RoutinePublishedPayload`, `SubscriptionCancelledPayload`. ~30 LOC. AC: typecheck passes.
- [x] 1.6 Modify `lib/pusher-server.ts`: add `triggerPatientSubscribed`, `triggerRoutinePublished`, `triggerSubscriptionCancelled` on `userChannel(id)`. ~50 LOC. AC: typecheck passes.
- [x] 1.7 Modify `lib/notifications.ts`: extend `NotificationItem.type` with `"patient-subscription" | "routine"`; add patient builder (last 3 routines) and professional builder (last 3 subs). ~80 LOC. AC: typecheck passes.
- [x] 1.8 Modify `lib/appointments.ts`: `getProfessionalClients` joins `PatientSubscription` per pair; computes `subscriptionStatus: "active" | "expired" | "none"` using read-time predicate. ~40 LOC. AC: client-list REQ-005 scenarios.

## Phase 2 — Slice 1: Subscribe, Pay, Notify (Batch 2)

- [x] 2.1 Create `app/paciente/dashboard/suscripcion/actions.ts`: `subscribePatientToProfessional(professionalId)` and `cancelPatientSubscription(professionalId)` server actions — auth + role from `auth()`, `planPrice` guard, `prisma.$transaction` (upsert + Payment.create), `revalidatePath`, Pusher trigger. ~110 LOC. AC: patient-paid-subscription REQ-002, REQ-004, REQ-006.
- [x] 2.2 Create `app/paciente/dashboard/suscripcion/page.tsx`: list patient's subs with status badge, expiry label, cancel button; empty state links to expert guide. ~90 LOC. AC: REQ-001 (priced plan) + REQ-004 (cancel).
- [x] 2.3 Modify `app/profesional/[id]/page.tsx`: paid-plan card when `planPrice` set; subscribe CTA only for PATIENT role and not already subscribed. ~60 LOC. AC: REQ-001 both scenarios.
- [x] 2.4 Modify `app/profesional/dashboard/perfil/{page,profile-form,actions}.tsx`: add `planPrice` + `planDuration` inputs, extend zod, render FREE content read-only. ~90 LOC. AC: personalized-routine REQ-005 (FREE static) + REQ-001 (priced plan source).
- [x] 2.5 Modify `components/layout/sidebar.tsx`: PATIENT gains `myRoutine` (`Dumbbell`) + `mySubscriptions` (`CreditCard`) before `Mi Cuenta`. ~15 LOC.

## Phase 3 — Slice 2: Publish & View Routine (Batch 3)

- [x] 3.1 Create `app/profesional/dashboard/rutinas/actions.ts`: `publishRoutineForPatient(patientId, title, content)` with `hasActivePatientSubscription` gate, `Routine.upsert`, Pusher `routine-published`. ~70 LOC. AC: personalized-routine REQ-001, REQ-002.
- [x] 3.2 Create `app/profesional/dashboard/rutinas/page.tsx`: active subscribers list with inline editor (title + textarea); locked row for non-subscribers. ~140 LOC. AC: REQ-001, REQ-002 scenarios.
- [x] 3.3 Create `app/paciente/dashboard/rutina/page.tsx`: gated personalized routines + static FREE block + paywall CTA. ~90 LOC. AC: REQ-003, REQ-004, REQ-005.
- [x] 3.4 Modify `components/layout/sidebar.tsx`: PROFESSIONAL gains `routines` (`Dumbbell`) before `Suscripción`. ~10 LOC.

## Phase 4 — i18n + Wiring

- [x] 4.1 Modify `lib/i18n/dictionaries/{es,en,index}.ts` (one commit): add `nav.{routines,myRoutine,mySubscriptions}`, `patientSubscription.*`, `patientRoutine.*`, `professionalRoutines.*`, `professionalProfile.{planPrice,planDuration,freePlanReadonly}`, `subscription.{alreadySubscribed,planPriceMissing}`. ~150 LOC. AC: typecheck passes — `index.ts` enforces alignment.
- [x] 4.2 Wire `sonner` toasts on subscribe/cancel/publish success+error; confirm notification feed renders new types. ~20 LOC.

## Phase 5 — Verification

- [x] 5.1 `npm run build` + `npm run typecheck` + `npm run lint` all pass.
- [ ] 5.2 Manual Slice 1 walkthrough (below). ← pending user click-test (no dev server run by agent)
- [ ] 5.3 Manual Slice 2 walkthrough (below). ← pending user click-test (no dev server run by agent)

## Manual Verification (no test runner — scripted click-paths)

### Slice 1 — Subscribe, Pay, Notify

1. **REQ-001 priced plan**: log in as PATIENT; open `/profesional/{id}` for a professional with `planPrice=1500`, `planDuration="por mes"` → FREE + PAID cards + subscribe CTA. Without `planPrice` → only FREE card, no CTA.
2. **REQ-002 subscribe**: click subscribe → Prisma Studio shows `PatientSubscription` (ACTIVE, `expiresAt` = +30d) and `Payment` (PAID, TEST, `providerRef` set). Force failure (mock provider returns FAILED) → no rows written.
3. **REQ-003 notify**: keep professional's dashboard open in another session; subscribe → `patient-subscribed` Pusher toast with patient name appears.
4. **REQ-004 cancel**: on `/paciente/dashboard/suscripcion`, cancel → status CANCELLED, `expiresAt` unchanged, routine page still accessible.
5. **REQ-005 lapse**: backdate `expiresAt` to yesterday in Prisma Studio → routine page shows paywall + FREE block only.
6. **REQ-006 double-subscribe**: click subscribe twice → second attempt rejected, no second `Payment` row.

### Slice 2 — Publish & View Routine

1. **REQ-001 publish**: as PROFESSIONAL, open `/profesional/dashboard/rutinas`, publish routine for a subscriber → row persists. Attempt publish for non-subscriber → rejected with "patient not subscribed".
2. **REQ-002 edit**: edit title/content and save → same row updated, `updatedAt` bumped, only one row for the pair.
3. **REQ-003 view**: subscribed patient opens `/paciente/dashboard/rutina` → personalized routine renders.
4. **REQ-004 paywall**: non-subscriber opens same page → paywall + subscribe CTA, no personalized content leaks (inspect server-rendered HTML).
5. **REQ-005 FREE static**: FREE block identical for subscribed and non-subscribed patients; professional profile UI has no edit control for FREE content.
6. **client-list REQ-005**: open `/profesional/dashboard/clientes` → active badge for ACTIVE and CANCELLED-not-expired; expired label after `expiresAt`; no badge for never-subscribed.

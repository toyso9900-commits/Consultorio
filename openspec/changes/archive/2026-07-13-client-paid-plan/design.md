# Design: Client Paid Plan

## Technical Approach

Mirror the existing professional-side subscription simulator (`app/profesional/dashboard/suscripcion`) on the patient→professional axis. One additive Prisma migration adds `PatientSubscription`, `Routine`, `Payment`, plus `planPrice`/`planDuration` on `ProfessionalProfile`. New `lib/patient-subscriptions.ts` is the single gating source; server actions enforce role+ownership inside `prisma.$transaction`. Pusher reuses `private-user-{userId}` via `lib/pusher-server.ts`. Payments abstracted behind a `PaymentProvider` interface with a `TestPaymentProvider` for V1.

## Architecture Decisions

| # | Decision | Choice | Rejected | Rationale |
|---|----------|--------|----------|-----------|
| 1 | Subscription identity | New `PatientSubscription`, `@@unique([patientId, professionalId])` | Reuse `Subscription` | Existing `@@unique([userId, plan])` caps one paid plan per user. |
| 2 | Status enum | Reuse `SubscriptionStatus` (ACTIVE/CANCELLED/EXPIRED) | New enum | Identical semantics; avoids duplication. |
| 3 | Cancel semantics | `CANCELLED` + `expiresAt` unchanged; gate reads `expiresAt > now` | Flip to EXPIRED immediately | Spec REQ-004 streaming model. |
| 4 | Expiry | Lazy read-time predicate; EXPIRED set on resubscribe | Cron job | No scheduler in repo. |
| 5 | Resubscribe path | `prisma.patientSubscription.upsert` | Insert + catch | Mirrors `activateSubscription` pattern. |
| 6 | Payment abstraction | `PaymentProvider` interface + `TestPaymentProvider` | Inline simulator | Real gateway drops in later. |
| 7 | Routine storage | One row per pair, `@@unique`, upsert | Version history table | Spec REQ-002 "replace in place". |
| 8 | FREE content | Static hardcoded text in patient page | Editable profile field | Spec REQ-005: MUST NOT be editable. |
| 9 | Gate enforcement | Server components + server actions only | Client checks | Matches existing pattern; no content leak. |
| 10 | Pusher channel | Reuse `private-user-{userId}` | New channel | Existing auth route already covers it. |

## Data Flow — Subscribe

```
Patient RSC        Action                    Prisma                Pusher
    │ subscribe CTA ─▶│ auth + role check      │                    │
    │                 │ TestPayment.charge ───▶│                    │
    │                 │ $transaction:          │                    │
    │                 │  ├ PatientSub.upsert   │                    │
    │                 │  └ Payment.create      │                    │
    │                 │ revalidatePath + triggerPatientSubscribed ▶│
    │◀── toast ok ────│                        │                    │
```

Publish flow is analogous: professional action → `hasActivePatientSubscription` → `Routine.upsert` → `triggerRoutinePublished` → patient channel.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | Modify | New models + `ProfessionalProfile.planPrice`/`planDuration` + User back-relations |
| `prisma/migrations/{ts}_add_patient_subscription_routine_payment/migration.sql` | Create | `prisma migrate dev --name add_patient_subscription_routine_payment` |
| `lib/patient-subscriptions.ts` | Create | `hasActivePatientSubscription`, `listActiveSubscriptionsForPatient`, `getPatientSubscription` |
| `lib/payments/index.ts` | Create | `PaymentProvider` interface + `TestPaymentProvider` |
| `lib/pusher-shared.ts` | Modify | Three new payload types |
| `lib/pusher-server.ts` | Modify | Three new trigger helpers |
| `lib/notifications.ts` | Modify | Extend `NotificationItem.type`; new routine + patient-subscription builders |
| `lib/appointments.ts` | Modify | `getProfessionalClients` reads `PatientSubscription` (per pair, expiry predicate) |
| `app/paciente/dashboard/suscripcion/{page,actions}.ts(x)` | Create | List patient's subs + cancel action |
| `app/paciente/dashboard/rutina/page.tsx` | Create | Gated routine view + FREE fallback + paywall |
| `app/profesional/dashboard/rutinas/{page,actions}.ts(x)` | Create | Publish/edit routine per subscriber |
| `app/profesional/[id]/page.tsx` | Modify | Paid-plan card + subscribe CTA for PATIENT role |
| `app/profesional/dashboard/perfil/{page,profile-form,actions}.tsx` | Modify | Add `planPrice` + `planDuration` inputs |
| `components/layout/sidebar.tsx` | Modify | Add `routines` (PRO), `myRoutine` + `mySubscriptions` (PATIENT) |
| `lib/i18n/dictionaries/{es,en,index}.ts` | Modify | New `nav.*` + sections `patientSubscription`, `patientRoutine`, `professionalRoutines` |

## Prisma Additions

```prisma
model PatientSubscription {
  id             String @id @default(cuid())
  patientId      String
  patient        User   @relation("PatientSubsAsPatient", fields: [patientId], references: [id], onDelete: Cascade)
  professionalId String
  professional   User   @relation("PatientSubsAsProfessional", fields: [professionalId], references: [id], onDelete: Cascade)
  status         SubscriptionStatus @default(ACTIVE)
  startedAt      DateTime @default(now())
  expiresAt      DateTime              // +30d on create/renew
  pricePaid      Float
  currency       String   @default("MXN")
  payment        Payment?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  @@unique([patientId, professionalId])
  @@index([professionalId, expiresAt])
}

model Routine {
  id             String @id @default(cuid())
  patientId      String
  patient        User   @relation("RoutinesAsPatient", fields: [patientId], references: [id], onDelete: Cascade)
  professionalId String
  professional   User   @relation("RoutinesAsProfessional", fields: [professionalId], references: [id], onDelete: Cascade)
  title          String
  content        String @db.Text
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  @@unique([patientId, professionalId])
}

model Payment {
  id                    String @id @default(cuid())
  payerId               String
  payer                 User   @relation("PaymentsAsPayer", fields: [payerId], references: [id], onDelete: Cascade)
  payeeId               String
  payee                 User   @relation("PaymentsAsPayee", fields: [payeeId], references: [id], onDelete: Cascade)
  amount                Float
  currency              String          @default("MXN")
  status                PaymentStatus   @default(PAID)
  provider              PaymentProvider @default(TEST)
  providerRef           String?
  patientSubscriptionId String?  @unique
  patientSubscription   PatientSubscription? @relation(fields: [patientSubscriptionId], references: [id], onDelete: SetNull)
  createdAt             DateTime @default(now())
  @@index([payerId, createdAt])
  @@index([payeeId, createdAt])
}

enum PaymentStatus   { PENDING PAID FAILED REFUNDED }
enum PaymentProvider { TEST STRIPE MERCADOPAGO }
```

`ProfessionalProfile` gains `planPrice Float?`, `planDuration String?`. `User` gains the six matching back-relations (`patientSubscriptionsAsPatient`, `patientSubscriptionsAsProfessional`, `routinesAsPatient`, `routinesAsProfessional`, `paymentsAsPayer`, `paymentsAsPayee`).

## Gating Helper

```ts
// lib/patient-subscriptions.ts
export async function hasActivePatientSubscription(
  patientId: string,
  professionalId: string
): Promise<boolean> {
  const sub = await prisma.patientSubscription.findUnique({
    where: { patientId_professionalId: { patientId, professionalId } },
    select: { status: true, expiresAt: true },
  });
  if (!sub || sub.status === "EXPIRED") return false;
  return sub.expiresAt > new Date();   // ACTIVE or CANCELLED, still in period
}
```

Enforced in `subscribePatientToProfessional` (reject if true), `publishRoutineForPatient` (reject if false), `/paciente/dashboard/rutina` (server read), and `getProfessionalClients` badge.

## Server Actions

All actions use `"use server"` and read caller identity from `auth()` — never from args.

| Action | Caller | Validates | Mutation | Pusher |
|--------|--------|-----------|----------|--------|
| `subscribePatientToProfessional(professionalId)` | PATIENT self | `planPrice` set; not already active | `$transaction`: `PatientSubscription.upsert` (ACTIVE, `+30d`, `pricePaid` snapshot) + `Payment.create` | `patient-subscribed` → professional |
| `cancelPatientSubscription(professionalId)` | PATIENT self | Row exists; status not EXPIRED | `update status=CANCELLED`, `expiresAt` unchanged | `subscription-cancelled` → professional |
| `publishRoutineForPatient(patientId, title, content)` | PROFESSIONAL self | `hasActivePatientSubscription` true; non-empty inputs | `Routine.upsert` on pair | `routine-published` → patient |

Return shape `{ success: boolean; error?: string }` mirrors `activateSubscription`. `revalidatePath` targets affected patient and professional pages.

## Payment Provider Contract

```ts
// lib/payments/index.ts
export interface PaymentProvider {
  charge(input: { payerId: string; payeeId: string; amount: number; currency: string }): Promise<{
    status: "PAID" | "FAILED";
    providerRef?: string;
    errorMessage?: string;
  }>;
}

export const testPaymentProvider: PaymentProvider = {
  async charge() {
    return { status: "PAID", providerRef: `test_${crypto.randomUUID()}` };
  },
};

export const paymentProvider: PaymentProvider = testPaymentProvider;
```

If `charge` returns `FAILED`, no DB writes happen. Real gateway swap = one-line change.

## UI / Pages

- **`/profesional/[id]`** (modify): paid-plan card when `prof.planPrice` set. Subscribe CTA only for PATIENT role and not already subscribed.
- **`/paciente/dashboard/suscripcion`** (new): list of patient's subs with status badge + cancel button; empty state links to expert guide.
- **`/paciente/dashboard/rutina`** (new): renders each `Routine` with active subscription; always renders the static FREE block; paywall CTA when no subscription.
- **`/profesional/dashboard/rutinas`** (new): active subscribers with inline editor (title + textarea) backed by `publishRoutineForPatient`; non-subscribers show locked row.
- **`/profesional/dashboard/perfil`** (modify): `profile-form.tsx` gains `planPrice` + `planDuration`; zod schema extended; FREE content displayed read-only.
- **Sidebar**: PROFESSIONAL gains `Rutinas` (`Dumbbell`) before `Suscripción`; PATIENT gains `Mi Rutina` (`Dumbbell`) and `Mis Suscripciones` (`CreditCard`) before `Mi Cuenta`.

## i18n Keys (es + en + index.ts, one commit)

- `nav.routines`, `nav.myRoutine`, `nav.mySubscriptions`
- `patientSubscription.{title, subtitle, empty, statusActive, statusCancelled, statusExpired, expiresLabel, cancelCta, cancelConfirm, cancelSuccess, cancelError, priceLabel, professionalLabel, browseExperts}`
- `patientRoutine.{title, freePlanTitle, freePlanBody, paywallTitle, paywallBody, paywallCta, noRoutineYet, publishedBy, updatedAt}`
- `professionalRoutines.{title, subtitle, lockedRow, titleLabel, contentLabel, publishCta, updateCta, saveSuccess, saveError, notSubscribedError}`
- `professionalProfile.{planPrice, planDuration, freePlanReadonly}`
- `subscription.{alreadySubscribed, planPriceMissing}`

## Pusher / Notifications

`lib/pusher-shared.ts` adds `PatientSubscribedPayload`, `RoutinePublishedPayload`, `SubscriptionCancelledPayload`. `lib/pusher-server.ts` adds `triggerPatientSubscribed`, `triggerRoutinePublished`, `triggerSubscriptionCancelled` — each posts to `userChannel(targetUserId)` with the event name. `lib/notifications.ts`:

- `NotificationItem.type` gains `"patient-subscription" | "routine"`.
- Patient builder: `prisma.routine.findMany({ where: { patientId }, orderBy: { updatedAt: "desc" }, take: 3 })` → `"routine"` items.
- Professional builder: `prisma.patientSubscription.findMany({ where: { professionalId }, orderBy: { createdAt: "desc" }, take: 3 })` → `"patient-subscription"` items.

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Build/Type/Lint | Schema compiles; i18n keys aligned | `npm run build`, `typecheck`, `lint` |
| Migration smoke | `prisma migrate dev` applies on current DB | Local Postgres; diff `migration.sql` |
| Manual flows | Each spec scenario walkthrough | Scripted per success criterion in proposal |
| Automated tests | None — repo has no runner | Document in verify phase |

## Migration / Rollout

Single additive migration; no data rewrite. Safe to ship before pages go live (routes are opt-in). Rollback = revert migration + delete new pages/actions + revert sidebar/i18n edits. No existing rows mutated.

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Prisma 7 + adapter-pg migration drift | Med | Additive only; run `migrate dev` locally; diff SQL before commit. |
| Next.js 16 server-action quirks | Med | Follow `node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md`; mirror `suscripcion/actions.ts`. |
| i18n three-file sync gap | Med | Single commit; `index.ts` types force compile error if a key is missing. |
| No test runner | High | Build + typecheck + lint + scripted manual walkthroughs. |
| Resubscribe leaving stale `EXPIRED` | Med | `upsert.update` explicitly resets `status=ACTIVE`, `startedAt`, `expiresAt`. |
| Payer identity spoofing | Med | Caller IDs come from `auth()`, never from args. |
| Concurrent subscribe clicks | Low | Single upsert is atomic; UI disables button while pending. |

## Open Questions

None blocking. Defaults locked in proposal: cancellation at period end, single paid tier (no `plan` field), FREE content static.

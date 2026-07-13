# Proposal: Client Paid Plan

## Intent

Patients get everything free today; professionals cannot monetize personalized follow-up. Let a patient pay a professional a monthly fee (test-mode) to unlock a personalized routine; a generic FREE plan stays available to all. Streaming model: on lapse or cancellation, personalized access ends.

## Scope

### In Scope (V1)
- Two plans per professional: FREE (generic default routine/diet, same for all, not editable) and PAID (personalized per patient, editable).
- Monthly recurring subscription via simulated payment, mirroring `/profesional/dashboard/suscripcion`; professional sets price + duration text.
- Cancellation/expiry gating; Pusher events `patient-subscribed`, `routine-published`.

### Out of Scope
- Refunds, invoicing, real gateway/webhooks, multiple tiers/currencies, editing FREE default content.

## Slices
- **Slice 1** (~M): patient subscribes to a paid plan (test payment); professional notified; patient lists plans.
- **Slice 2** (~M): professional publishes/edits per-patient routine; patient views it gated on subscription.

## Key Flows
- **Subscribe**: `/profesional/[id]` CTA → simulated payment → `PatientSubscription` ACTIVE (30d) + `Payment` row → notify professional.
- **Cancel**: `CANCELLED`; access ends at `expiresAt`.
- **Publish**: professional upserts `Routine` for a subscriber → notify patient.
- **View**: `/paciente/dashboard/rutina` gated on `hasActivePatientSubscription`.

## Capabilities

### New Capabilities
- `patient-paid-subscription`: subscribe/cancel/expire a patient's monthly paid plan for one professional (test payment).
- `personalized-routine`: professional-authored per-patient routine with gated delivery.

### Modified Capabilities
- `client-list`: "Suscripción activa" badge backed by `PatientSubscription`.

## Approach

**Data model** (one additive migration):
- `PatientSubscription { patientId, professionalId, status, startedAt, expiresAt, pricePaid }`, `@@unique([patientId, professionalId])`. Reusing `Subscription` rejected: `@@unique([userId, plan])` caps one paid professional per patient.
- `Routine { patientId, professionalId, title, content }`, `@@unique([patientId, professionalId])`.
- `Payment { payerId, payeeId, amount, currency, status, provider, createdAt }` — audit row.
- `ProfessionalProfile.planPrice: Float?`, `planDuration: String?`.

**Gating**: new `lib/patient-subscriptions.ts` with `hasActivePatientSubscription` (ACTIVE + `expiresAt > now`), enforced in routine page and subscribe/publish actions (role + ownership checks).

**Notifications**: both events on the existing `private-user-{userId}` channel; extend `lib/notifications.ts` with a `routine` type.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `prisma/schema.prisma` + migration | Modified | New models + profile fields (additive). |
| `lib/patient-subscriptions.ts` | New | Gating helper. |
| `app/paciente/dashboard/{suscripcion,rutina}` | New | Plan list, gated routine. |
| `app/profesional/[id]`, `.../perfil`, `.../rutinas` | Modified/New | CTA, price fields, publish UI. |
| `lib/{pusher-server,notifications}.ts`, `sidebar.tsx`, `lib/i18n/dictionaries/*` | Modified | Events, nav, strings. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Prisma 7 adapter migration drift | Med | Additive migration; `migrate dev` + build. |
| Next.js 16 API changes | Med | Follow `node_modules/next/dist/docs/`. |
| i18n three-file sync gap | Med | Add es/en/index keys in one commit. |
| No tests in repo | High | Build, typecheck, lint, manual walkthroughs. |

## Rollback Plan

Additive schema only: revert migration, delete new pages/actions, restore pusher/sidebar/i18n edits; no existing data mutated.

## Success Criteria

- [ ] Patient subscribes in test mode; rows persist; professional notified.
- [ ] Cancellation/expiry removes routine access; free content stays.
- [ ] Professional publishes/edits routine; subscriber views it; others gated.
- [ ] `npm run build`, `typecheck`, `lint` pass.

## Open Questions

None. Defaults: cancellation at period end; single tier ⇒ no `plan` field; FREE content static.

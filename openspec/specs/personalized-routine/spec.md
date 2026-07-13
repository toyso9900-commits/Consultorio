# Personalized Routine Specification

## Purpose

Allow a professional to author and maintain a single personalized routine per subscribed patient, and gate its delivery at `/paciente/dashboard/rutina` on the patient holding an active paid subscription. The generic FREE plan content is static, identical for every patient, and not editable by professionals in V1.

## Requirements

### Requirement: REQ-001 Publish routine for a subscriber

The system SHALL allow a professional to create a personalized `Routine` (title + content) for a patient only when that patient holds an active subscription to them, enforcing `@@unique([patientId, professionalId])`, and MUST reject publish attempts for non-subscribers.

#### Scenario: Professional publishes for subscriber

- GIVEN patient Juan has an ACTIVE subscription to Dra. Méndez
- WHEN Laura publishes routine "Plan Semana 1" with content for Juan
- THEN a `Routine` row is persisted for the pair (Juan, Laura)

#### Scenario: Publish rejected for non-subscriber

- GIVEN patient Ana has no active subscription to Laura
- WHEN Laura attempts to publish a routine for Ana
- THEN the action is rejected with a "patient not subscribed" error
- AND no `Routine` row is created

### Requirement: REQ-002 Edit an existing routine

The system SHALL allow the authoring professional to update the title and content of an existing routine for a subscribed patient, replacing the previous version in place.

#### Scenario: Professional updates routine content

- GIVEN a routine "Plan Semana 1" exists for (Juan, Laura)
- WHEN Laura edits the content to "Plan Semana 2" and saves
- THEN the stored routine reflects the new title and content
- AND only one `Routine` row exists for the pair

### Requirement: REQ-003 Patient views gated routine

The system SHALL show the personalized routine at `/paciente/dashboard/rutina` only when `hasActivePatientSubscription` is true (status ACTIVE and `expiresAt` in the future) for the patient–professional pair.

#### Scenario: Subscriber opens routine page

- GIVEN Juan's subscription is ACTIVE until 2026-08-12 and a routine exists
- WHEN Juan opens `/paciente/dashboard/rutina` on 2026-07-20
- THEN the personalized routine title and content render

### Requirement: REQ-004 Paywall for non-subscribers

The system SHALL show a paywall with an upgrade CTA, and MUST NOT leak personalized content, when a patient without an active subscription opens the routine page.

#### Scenario: Non-subscriber hits paywall

- GIVEN patient Ana has no active subscription to any professional
- WHEN Ana opens `/paciente/dashboard/rutina`
- THEN a paywall message and subscribe CTA are shown
- AND no personalized routine content is rendered

### Requirement: REQ-005 FREE plan content is static

The system SHALL display the same generic FREE plan content to every patient regardless of subscription status, and MUST NOT allow professionals to edit FREE default content in V1.

#### Scenario: FREE content identical for all patients

- GIVEN the FREE default routine text is "Rutina general: 30 min de caminata diaria"
- WHEN patients Juan (subscribed) and Ana (not subscribed) view the FREE section
- THEN both see the identical static text
- AND Laura has no UI control to edit it

## Business Rules

- BR-001: One `Routine` row per (patientId, professionalId) pair; `upsert` replaces title/content in place.
- BR-002: Routine gating reuses the `hasActivePatientSubscription` read-time predicate from `patient-paid-subscription` (status IN (ACTIVE, CANCELLED) AND `expiresAt > now`).
- BR-003: The paywall branch short-circuits before any routine query runs — no personalized content reaches the server-rendered HTML for non-subscribers.
- BR-004: FREE content lives in the i18n dictionaries (`patientRoutine.freePlanBody`) and is identical for all locales' patients; it is not persisted per user.

## Data Affected

- `Routine` table (new): `patientId`, `professionalId`, `title`, `content`, `createdAt`, `updatedAt`; `@@unique([patientId, professionalId])`.

## Interfaces / APIs Needed

- Server action `publishRoutineForPatient(patientId, title, content)` — auth+PROFESSIONAL role, patient validated, non-empty trimmed inputs, `hasActivePatientSubscription` gate, `Routine.upsert`, Pusher `routine-published` to the patient.
- Page `/profesional/dashboard/rutinas` — list of active subscribers with inline editor; locked rows for non-subscribers.
- Page `/paciente/dashboard/rutina` — gated personalized routines + static FREE block + paywall CTA.
- Pusher event `routine-published` on `private-user-{patientId}`.

## Error Scenarios

- ES-001: Non-subscriber target — action returns `{success:false, error:"Patient is not subscribed.", errorCode:"not-subscribed"}`; client maps `errorCode` to a localized message.
- ES-002: Empty title or content after trim — action rejects with a validation error.
- ES-003: Patient opens routine page with no routine published yet — renders a "no routine yet" state, not a paywall.

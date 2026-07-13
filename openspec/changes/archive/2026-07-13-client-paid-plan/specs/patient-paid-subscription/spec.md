# Delta for patient-paid-subscription

## ADDED Requirements

### Requirement: REQ-001 View professional plan offer

The system SHALL display, on a professional's public profile and in the patient's subscription page, the plan offer: FREE plan label, PAID plan price and duration text as set by the professional, and a subscribe CTA only for authenticated patients.

#### Scenario: Patient views a priced plan

- GIVEN professional "Dra. Laura Méndez" has planPrice 1500 and planDuration "por mes"
- WHEN patient "Juan Pérez" opens `/profesional/{lauraId}`
- THEN the page shows "Plan FREE" (generic) and "Plan Pago — $1500 por mes" with a subscribe button

#### Scenario: Professional without price set

- GIVEN a professional has not set planPrice
- WHEN a patient opens their profile
- THEN only the FREE plan is shown and no subscribe CTA appears

### Requirement: REQ-002 Subscribe with simulated payment

The system SHALL, when a patient confirms subscription, create one `PatientSubscription` (status ACTIVE, `startedAt` now, `expiresAt` now + 30 days, `pricePaid` snapshot) and one `Payment` audit row in a single transaction, and MUST NOT persist either row if the other fails.

#### Scenario: Successful test-mode subscription

- GIVEN patient Juan has no subscription to Dra. Méndez and the simulated payment succeeds
- WHEN Juan confirms the subscription on 2026-07-13
- THEN a `PatientSubscription` row exists with status ACTIVE and expiresAt 2026-08-12
- AND a `Payment` row records payerId Juan, payeeId Laura, amount 1500, status PAID, provider TEST

#### Scenario: Simulated payment fails

- GIVEN the simulated payment returns failure
- WHEN Juan confirms the subscription
- THEN no `PatientSubscription` and no `Payment` row are persisted
- AND Juan sees an error message and may retry

### Requirement: REQ-003 Notify professional of new subscriber

The system SHALL emit a Pusher `patient-subscribed` event on the professional's `private-user-{userId}` channel after a successful subscription, including the patient's display name.

#### Scenario: Professional receives realtime notification

- GIVEN professional Laura has the dashboard open
- WHEN patient Juan's subscription is committed
- THEN Laura receives a `patient-subscribed` event naming "Juan Pérez"

### Requirement: REQ-004 Cancel at period end

The system SHALL set the subscription status to CANCELLED on patient request and MUST keep personalized-routine access until `expiresAt`; no refund SHALL be issued in V1.

#### Scenario: Patient cancels mid-period

- GIVEN Juan's subscription is ACTIVE with expiresAt 2026-08-12
- WHEN Juan cancels on 2026-07-20
- THEN the status becomes CANCELLED with expiresAt unchanged
- AND Juan retains routine access until 2026-08-12

### Requirement: REQ-005 Expiry revokes personalized access

The system SHALL treat a subscription as inactive when status is CANCELLED/EXPIRED or `expiresAt` is past, and MUST then deny personalized-routine access while keeping FREE content available.

#### Scenario: Subscription lapses

- GIVEN Juan's CANCELLED subscription reached expiresAt 2026-08-12
- WHEN Juan opens `/paciente/dashboard/rutina` on 2026-08-13
- THEN personalized content is hidden and the paywall/upgrade CTA is shown
- AND the FREE plan content remains visible

### Requirement: REQ-006 Prevent duplicate subscriptions

The system SHALL enforce `@@unique([patientId, professionalId])` and MUST NOT allow a second active subscription for the same patient–professional pair; a resubscribe after expiry SHALL update the existing row instead of inserting a new one.

#### Scenario: Double-subscribe attempt

- GIVEN Juan already has an ACTIVE subscription to Laura
- WHEN Juan attempts to subscribe again
- THEN the action is rejected with a "already subscribed" message
- AND no new `Payment` row is created

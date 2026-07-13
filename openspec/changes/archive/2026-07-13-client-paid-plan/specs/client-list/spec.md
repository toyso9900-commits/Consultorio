# Delta for client-list

## ADDED Requirements

### Requirement: REQ-005 Show paid-subscription status per client

The system SHALL display, for each patient row in the professional's client list, the paid-subscription status derived from `PatientSubscription` for that patient–professional pair: ACTIVE (including CANCELLED not yet expired), EXPIRED, or none.

#### Scenario: Client list shows subscriber badge

- GIVEN patient Juan has an ACTIVE subscription to Dra. Méndez until 2026-08-12
- WHEN Laura opens `/profesional/dashboard/clientes` on 2026-07-20
- THEN Juan's row shows a "Suscripción activa" badge

#### Scenario: Cancelled but not expired still shows active

- GIVEN Juan cancelled on 2026-07-20 with expiresAt 2026-08-12
- WHEN Laura opens the client list on 2026-07-21
- THEN Juan's row still shows "Suscripción activa"

#### Scenario: Expired subscription shows expired status

- GIVEN Juan's subscription expired on 2026-08-12
- WHEN Laura opens the client list on 2026-08-13
- THEN Juan's row shows an expired status (no active badge)

#### Scenario: Patient never subscribed

- GIVEN patient Ana has no `PatientSubscription` row with Laura
- WHEN the client list renders
- THEN Ana's row shows no subscription badge

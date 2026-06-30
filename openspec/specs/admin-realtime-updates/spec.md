# Admin Real-time Updates Specification

## Purpose

Enable the admin dashboard and user-management views to reflect professional registration and validation changes without a manual page refresh.

## Requirements

### Requirement: REQ-001 Push professional registered event

The system MUST emit a Pusher event when a new professional completes registration.

#### Scenario: New professional triggers admin refresh

- GIVEN an admin has `/profesional/dashboard` open
- WHEN a new professional registers successfully
- THEN the server emits an `admin-updates` event with payload type `professional-registered`
- AND the admin view refreshes automatically to show the new pending professional

### Requirement: REQ-002 Push professional validation state changed event

The system MUST emit a Pusher event when a professional's validation state changes (validated, rejected, or toggled).

#### Scenario: Validation action triggers admin refresh

- GIVEN an admin has `/profesional/dashboard/usuarios` open
- WHEN `validateProfessional`, `rejectProfessional`, or `toggleUserValidation` succeeds
- THEN the server emits an `admin-updates` event with payload type `professional-validated` or `professional-rejected`
- AND both `/profesional/dashboard` and `/profesional/dashboard/usuarios` refresh automatically

#### Scenario: Rejected professional disappears from admin list

- GIVEN a professional is pending validation
- WHEN the admin rejects the professional
- THEN the emitted event causes the admin list to refresh
- AND the rejected professional is removed from the admin pending/validated lists

### Requirement: REQ-003 Admin client listens for real-time events

Admin pages that display professional lists MUST subscribe to the `admin-updates` channel and trigger a data refresh on each event.

#### Scenario: Admin dashboard listener

- GIVEN the admin dashboard is rendered
- WHEN an `admin-updates` event is received
- THEN the page re-fetches professional list data without full reload

### Requirement: REQ-004 Graceful fallback when real-time is unavailable

The system SHOULD continue to function with manual refresh if Pusher is unreachable or misconfigured.

#### Scenario: Pusher credentials missing

- GIVEN Pusher credentials are not configured
- WHEN the admin page loads
- THEN the page renders the current list
- AND logs a warning without blocking the UI

## Business Rules

- BR-001: Real-time updates apply only to users with admin or professional-admin role.
- BR-002: A rejected professional MUST be removed from all admin lists after refresh.
- BR-003: Event payloads MUST NOT include sensitive data beyond identifiers and change type.

## Data Affected

- `User` table (role, professional state)
- `ProfessionalProfile` table (`isValidated`)
- Client state on `/profesional/dashboard` and `/profesional/dashboard/usuarios`

## Interfaces / APIs Needed

- Server-side Pusher trigger helper in `lib/pusher.ts`
- `admin-updates` Pusher channel
- Client listener component mounted on admin pages

## Error Scenarios

- ES-001: Pusher emit fails silently; DB write still succeeds and admin refreshes manually.
- ES-002: Duplicate events arrive; client refresh is idempotent and shows consistent data.
- ES-003: Unauthorized client subscribes to `admin-updates`; subscription is rejected.

# Professional Validation Specification

## Purpose

Ensure server actions that validate, reject, or toggle professional state refresh every admin view that displays the affected data.

## Requirements

### Requirement: REQ-001 Revalidate all affected admin routes

The system MUST revalidate `/profesional/dashboard` and `/profesional/dashboard/usuarios` after any action that changes a professional's validation state.

#### Scenario: Validate from dashboard refreshes user management

- GIVEN an admin validates a professional from `/profesional/dashboard`
- WHEN `validateProfessional` succeeds
- THEN `/profesional/dashboard` is revalidated
- AND `/profesional/dashboard/usuarios` is revalidated

#### Scenario: Toggle validation from user management refreshes dashboard

- GIVEN an admin toggles validation from `/profesional/dashboard/usuarios`
- WHEN `toggleUserValidation` succeeds
- THEN `/profesional/dashboard/usuarios` is revalidated
- AND `/profesional/dashboard` is revalidated

#### Scenario: Reject professional refreshes both views

- GIVEN an admin rejects a professional
- WHEN `rejectProfessional` succeeds
- THEN both admin routes are revalidated
- AND the professional is removed from admin lists

### Requirement: REQ-002 Emit state-change event after DB write

The system MUST emit a Pusher event after the database transaction commits, before returning to the client.

#### Scenario: Event emitted after successful write

- GIVEN a validation action completes the Prisma update
- WHEN the transaction commits
- THEN an `admin-updates` event is triggered
- AND the action returns success to the caller

### Requirement: REQ-003 Preserve existing authorization checks

The system MUST continue to restrict validation actions to authorized admin users.

#### Scenario: Non-admin cannot validate

- GIVEN an unauthenticated or non-admin user invokes the action
- WHEN the action runs
- THEN it returns an authorization error
- AND no DB write or event is emitted

## Business Rules

- BR-001: Revalidation MUST occur after DB commit and before returning success.
- BR-002: Rejected professionals MUST be excluded from admin pending and validated lists.
- BR-003: Only users with admin role MAY invoke validation actions.

## Data Affected

- `ProfessionalProfile` table (`isValidated`)
- `User` table (professional role linkage)
- Cached pages for `/profesional/dashboard` and `/profesional/dashboard/usuarios`

## Interfaces / APIs Needed

- Updated `validateProfessional`, `rejectProfessional`, `toggleUserValidation` server actions
- Pusher trigger helper

## Error Scenarios

- ES-001: Revalidation fails; DB state is still correct and admin refreshes manually.
- ES-002: Pusher emit fails after DB commit; action succeeds and admin refreshes manually.
- ES-003: Unauthorized action; returns error before any DB write or event.

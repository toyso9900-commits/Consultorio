# Client List Specification

## Purpose

Replace the placeholder Clients page with a functional conversation list that shows the last message preview, timestamp, and unread count per client for the authenticated professional.

## Requirements

### Requirement: REQ-001 Load professional conversations

The system MUST load all one-to-one conversations for the authenticated professional, including last message content and timestamp.

#### Scenario: Professional opens client list

- GIVEN a professional navigates to `/profesional/dashboard/clientes`
- WHEN the page loads
- THEN the system returns a list of conversation partners
- AND each row shows the partner name, last message preview, and last message time

### Requirement: REQ-002 Display unread count per client

The system MUST display the unread message count for each conversation partner.

#### Scenario: Client with unread messages

- GIVEN a client has sent unread messages to the professional
- WHEN the client list renders
- THEN the row shows the unread count as a badge

#### Scenario: Client with no unread messages

- GIVEN a conversation has no unread messages
- WHEN the client list renders
- THEN the row shows no unread badge

### Requirement: REQ-003 Navigate to conversation

The system MUST allow the professional to open the conversation with a client from the list.

#### Scenario: Click client row opens chat

- GIVEN the professional is on the client list
- WHEN the professional clicks a client row
- THEN the application navigates to the message view with that client selected

### Requirement: REQ-004 Keep client list updated live

The system SHOULD update the client list when new messages arrive or read status changes.

#### Scenario: New message updates last message preview

- GIVEN the client list is visible
- WHEN a new message arrives for any conversation
- THEN the affected row updates its last message preview and unread count

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

## Business Rules

- BR-001: Conversations are derived from `Message` rows where the professional is sender or receiver.
- BR-002: The last message preview is truncated to a configurable maximum length.
- BR-003: Rows are ordered by most recent message time, descending.
- BR-004: Unread count is computed only for messages where the professional is the receiver and `readAt` is null.
- BR-005: Paid-subscription status reuses the read-time predicate from `patient-paid-subscription` (status IN (ACTIVE, CANCELLED) AND `expiresAt > now`); EXPIRED is derived, never written.

## Data Affected

- `Message` table
- `User` table (partner name)
- `PatientProfile` table (optional patient details)
- `PatientSubscription` table (paid-subscription status badge)

## Interfaces / APIs Needed

- Updated `getUserConversations` server action returning `partner`, `lastMessage`, `lastMessageAt`, `unreadCount`
- `getProfessionalClients(professionalId)` returning `subscriptionStatus: "active" | "expired" | "none"` per client row
- `/profesional/dashboard/clientes/page.tsx` rendering the list and the subscription badge
- Link to `/profesional/dashboard/mensajes?clientId={id}`

## Error Scenarios

- ES-001: No conversations exist; page shows empty state.
- ES-002: Conversation query fails; page shows error message and retry option.
- ES-003: Real-time update missed; list reconciles on next navigation or refresh.
- ES-004: Patient has no `PatientSubscription` row — no badge rendered; row behaves as before.

# Pusher Channel Security Specification

## Purpose

Replace public Pusher channels with authorized private channels so that users receive only events intended for them.

## Requirements

### Requirement: REQ-001 Authenticate private channel subscriptions

The system MUST provide an authorization endpoint that validates the session before allowing subscription to a private channel.

#### Scenario: Authorized user subscribes to private channel

- GIVEN an authenticated user requests subscription to `private-user-{ownId}`
- WHEN the auth endpoint receives the request
- THEN the endpoint returns a Pusher auth signature
- AND the subscription succeeds

#### Scenario: Unauthorized user is rejected

- GIVEN an unauthenticated or different user requests subscription to `private-user-{otherId}`
- WHEN the auth endpoint validates the session
- THEN the endpoint returns HTTP 403
- AND Pusher rejects the subscription

### Requirement: REQ-002 Use private channels for user-specific updates

The system MUST use private channels for all user-specific and admin real-time events.

#### Scenario: Chat uses private channel

- GIVEN a conversation exists between two users
- WHEN the chat panel subscribes to updates
- THEN it uses a private channel name scoped to the conversation or user
- AND only conversation participants can subscribe

#### Scenario: Admin updates use private channel

- GIVEN an admin page needs real-time updates
- WHEN it subscribes to updates
- THEN it uses a private admin channel
- AND only users with admin role can subscribe

### Requirement: REQ-003 Configure Pusher environment variables

The system MUST read Pusher credentials from environment variables and fail the build if required variables are missing in production.

#### Scenario: Required variables present

- GIVEN `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`, `NEXT_PUBLIC_PUSHER_KEY`, and `NEXT_PUBLIC_PUSHER_CLUSTER` are set
- WHEN the application starts
- THEN Pusher client and server initialize successfully

#### Scenario: Missing credentials in development

- GIVEN Pusher credentials are missing in a development environment
- WHEN the application starts
- THEN real-time features are disabled
- AND the rest of the application continues to work

### Requirement: REQ-004 Reject public channels for sensitive data

The system MUST NOT use public channels for events carrying conversation, unread counts, or admin state data.

#### Scenario: No public channels for chat

- GIVEN a chat or unread-count event
- WHEN the server triggers the event
- THEN it is sent over a private channel
- AND no public channel carries the same payload

## Business Rules

- BR-001: Private channel names MUST be derived from the authenticated user's identifier or a hashed conversation identifier.
- BR-002: Auth endpoint MUST reuse the existing NextAuth session; no new token scheme is introduced.
- BR-003: Channel authorization MUST check exact ownership; admin channels require admin role.

## Data Affected

- Environment variables (`.env`)
- `lib/pusher.ts` server and client helpers
- New or updated API route `/api/pusher/auth`

## Interfaces / APIs Needed

- `POST /api/pusher/auth` route
- `private-user-{id}` channel
- `private-admin-updates` channel
- Pusher client helper with private channel support

## Error Scenarios

- ES-001: Auth endpoint called without session; returns 401/403.
- ES-002: Pusher credentials invalid; server logs error and skips triggers.
- ES-003: Client receives subscription error; UI degrades to manual refresh.

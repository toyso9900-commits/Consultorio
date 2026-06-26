# Conversation Unread Badges Specification

## Purpose

Display unread message counts grouped by conversation partner for professionals, moving the indicator from the global Messages sidebar item to the Clients list and sidebar item.

## Requirements

### Requirement: REQ-001 Compute unread counts per conversation partner

The system MUST compute unread message counts grouped by sender for the authenticated professional.

#### Scenario: Professional has unread messages from multiple clients

- GIVEN a professional has received unread messages from patient A and patient B
- WHEN the client list or sidebar badge is rendered
- THEN patient A shows its unread count and patient B shows its unread count
- AND the Clients sidebar badge shows the total unread count

#### Scenario: Count includes any one-to-one conversation

- GIVEN a professional has unread messages from any user role
- WHEN unread counts are computed
- THEN every one-to-one conversation partner contributes to the count

### Requirement: REQ-002 Display per-client unread badge in client list

The system MUST show an unread badge next to each client in the conversation list.

#### Scenario: Client list shows unread badge

- GIVEN the professional opens `/profesional/dashboard/clientes`
- WHEN a client has unread messages
- THEN the client row displays the unread count

### Requirement: REQ-003 Move sidebar badge to Clients

The system MUST remove the unread badge from the Messages sidebar item for `PROFESSIONAL` and display the total unread count on the Clients item.

#### Scenario: Sidebar shows total unread on Clients

- GIVEN a professional has 5 unread messages across 2 clients
- WHEN the sidebar renders
- THEN the Clients item shows badge `5`
- AND the Messages item shows no badge

### Requirement: REQ-004 Update badges live

The system MUST update unread badges when a new message arrives or when the professional marks messages as read.

#### Scenario: New message updates badge

- GIVEN a professional is viewing the client list
- WHEN a new message arrives via Pusher
- THEN the sender's unread badge increments
- AND the Clients sidebar badge increments

#### Scenario: Mark as read clears badge

- GIVEN a professional opens a conversation with unread messages
- WHEN `markMessagesAsRead` succeeds
- THEN the sender's unread badge is removed
- AND the Clients sidebar total decreases

## Business Rules

- BR-001: Unread counts are calculated where `receiverId = professionalId` and `readAt IS NULL`.
- BR-002: Grouping is by conversation partner (`senderId` when professional is receiver, otherwise `receiverId`).
- BR-003: The sidebar total is the sum of all per-conversation unread counts.
- BR-004: Marking a conversation as read updates all messages from that partner where the professional is the receiver.

## Data Affected

- `Message` table (`readAt`, `senderId`, `receiverId`)
- Prisma indexes on `(receiverId, readAt)` and `(senderId, receiverId)`
- Client state for sidebar and client list

## Interfaces / APIs Needed

- `getUnreadCountsBySender(receiverId)` server action
- Updated `getUserConversations` returning `lastMessage`, `lastMessageAt`, `unreadCount`
- `markMessagesAsRead` must broadcast read event
- `private-user-{id}` Pusher channel

## Error Scenarios

- ES-001: Count query fails; list renders with zero badges and logs error.
- ES-002: Race between mark-as-read and incoming message; server count reconciles on next refresh.
- ES-003: Professional opens a conversation not addressed to them; no messages are marked as read.

# Tasks: Real-time admin updates and chat improvements

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~830 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (foundation) → PR 2 (admin real-time) → PR 3 (chat badges) |
| Delivery strategy | ask-always (user approved autonomous completion; no PRs, work-unit commits only) |
| Chain strategy | stacked-to-main (deferred if/when PRs are opened) |

Decision needed before apply: Resolved — user approved autonomous completion with work-unit commits on current branch; PRs deferred.
Chained PRs recommended: Yes
Chain strategy: stacked-to-main (deferred until PR creation)
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Add `rejectedAt`, message indexes, Pusher helpers, auth endpoint, env vars | PR 1 | Base: main; includes auth route tests |
| 2 | Wire admin real-time events and listener across dashboard/user pages | PR 2 | Base: PR 1 branch; includes listener component + action triggers |
| 3 | Build conversation list, per-client unread badges, sidebar move, chat panel updates | PR 3 | Base: PR 2 branch; includes message action updates + chat real-time |

## Phase 1: Foundation

- [x] 1.1 Add `rejectedAt DateTime?` to `ProfessionalProfile` and `@@index([isValidated, rejectedAt])` in `prisma/schema.prisma`
- [x] 1.2 Add `@@index([receiverId, readAt])` and `@@index([senderId, receiverId])` to `Message` in `prisma/schema.prisma`
- [x] 1.3 Extend Pusher helpers with `triggerAdminUpdate`, `triggerUnreadCounts`, channel name helpers, and client config helper
- [x] 1.4 Add Pusher environment variables to `.env` and fail build in production when required vars are missing
- [x] 1.5 Create `app/api/pusher/auth/route.ts` to authorize `private-user-{id}` and `private-admin-updates` using `auth()` session
- [~] 1.6 Write unit tests for `/api/pusher/auth` channel rules (own user channel allowed, other user channel rejected, admin channel requires admin role) — skipped: no test runner configured

## Phase 2: Admin Real-time

- [x] 2.1 Update `app/register/actions.ts` to trigger `admin-updates` event with type `professional-registered` after professional signup
- [x] 2.2 Update `app/profesional/dashboard/actions.ts` to set/clear `rejectedAt`, revalidate `/profesional/dashboard/usuarios`, and trigger `admin-updates` event after validate/reject/toggle
- [x] 2.3 Update `app/profesional/dashboard/usuarios/actions.ts` to clear `rejectedAt` when validating, revalidate `/profesional/dashboard`, and trigger `admin-updates` event
- [x] 2.4 Update `app/profesional/dashboard/page.tsx` to exclude `rejectedAt != null` professionals from pending/validated queries and mount `AdminRealtimeListener`
- [x] 2.5 Update `app/profesional/dashboard/usuarios/page.tsx` to mount `AdminRealtimeListener`
- [x] 2.6 Create `components/admin/admin-realtime-listener.tsx` subscribing to `private-admin-updates` and calling `router.refresh()` on each event
- [~] 2.7 Write integration tests spying on `pusher.trigger` and `revalidatePath` order for validation/rejection/toggle actions — skipped: no test runner configured

## Phase 3: Chat Unread Badges

- [x] 3.1 Add `getUnreadCountsBySender(receiverId)` to `app/messages/actions.ts` returning `{ senderId; count }[]`
- [x] 3.2 Update `getUserConversations(userId)` in `app/messages/actions.ts` to return `lastMessage`, `lastMessageAt`, and `unreadCount` per partner
- [x] 3.3 Update `markMessagesAsRead(readerId, senderId)` in `app/messages/actions.ts` to broadcast `conversation-read` event on `private-user-{readerId}`
- [x] 3.4 Update `sendMessage` in `app/messages/actions.ts` to broadcast `unread-counts` and `new-message` events on receiver's private channel
- [x] 3.5 Create `components/chat/conversation-list.tsx` rendering partner name, last message preview, timestamp, and unread badge per row
- [x] 3.6 Update `app/profesional/dashboard/clientes/page.tsx` to render `ConversationList` with server-fetched data and link to `/profesional/dashboard/mensajes?clientId={id}`
- [x] 3.7 Update `app/profesional/dashboard/mensajes/page.tsx` to use shared `ConversationList` in the sidebar
- [x] 3.8 Update `components/layout/sidebar.tsx` to move unread badge from Messages to Clients for `PROFESSIONAL` using total unread count
- [x] 3.9 Update `components/chat/chat-panel.tsx` to subscribe to `private-user-{userId}`, filter events by current partner, and reconcile badge state on read
- [~] 3.10 Write integration tests for unread count computation and E2E tests for real-time badge updates when sending/reading messages — skipped: no test runner configured

## Phase 4: Verification & Rollout

- [x] 4.1 Run `npx prisma migrate dev --name add_rejected_at_and_message_indexes` and verify migration applies cleanly
- [x] 4.2 Run `npm run typecheck`, `npm run lint`, and `npm run build`; fix any errors
- [~] 4.3 Verify `/api/pusher/auth` returns 403 for unauthorized channels in staging — manual/staging step
- [~] 4.4 Update README or deployment docs with required Pusher environment variables — documented in `.env.example`

# Proposal: Real-time admin updates and chat improvements

## Intent

Make the admin dashboard feel live when professionals are registered or validated, and move the unread-message indicator to the client list (per conversation) instead of the global "Messages" sidebar item. This fixes the current need for manual refresh and aligns the professional UX with WhatsApp-style conversation badges.

## Scope

### In Scope
- Real-time refresh of admin views when a professional registers or is validated/rejected.
- Per-client/conversation unread message badges for professionals.
- Move the sidebar unread badge from "Messages" to "Clients".
- Fix incomplete revalidation paths in `validateProfessional` / `rejectProfessional`.
- Configure Pusher environment variables and secure channels.
- Add Prisma indexes for frequent message queries.

### Out of Scope
- Full rewrite of the messaging domain or a new `Conversation` model.
- Admin middleware / route protection (separate change).
- Patient-side unread badges or push notifications beyond the existing chat flow.
- OCR, payments, subscriptions, or appointment real-time updates.

## Capabilities

### New Capabilities
- `admin-realtime-updates`: Push events to admin clients when professional registration/validation state changes so lists update without reload.
- `conversation-unread-badges`: Compute and display unread counts grouped by sender for the professional client list and sidebar.
- `pusher-channel-security`: Use private/authorized Pusher channels instead of public channels derived from user IDs.

### Modified Capabilities
- `professional-validation`: Extend revalidation paths after validation/rejection to cover all affected admin routes.
- `client-list`: Replace the placeholder clients page with a functional conversation list showing last message and unread count per client.

## Approach

Use Pusher for server-to-client events. Server actions (`registerUser`, `validateProfessional`, `rejectProfessional`, `toggleUserValidation`) trigger an `admin-updates` event after DB writes. Admin pages mount a small client listener that calls `router.refresh()` on incoming events. For chat, add a per-user private channel (`private-user-{id}`) to broadcast unread-count changes; client components update local badge state without reload. Update `getUserConversations` to return `lastMessageAt` and `unreadCount`. Move the sidebar badge mapping from "Messages" to "Clients". Add Prisma indexes on `(receiverId, readAt)` and `(senderId, receiverId)`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/profesional/dashboard/page.tsx` | Modified | Listen for admin real-time events. |
| `app/profesional/dashboard/usuarios/page.tsx` | Modified | Listen for admin real-time events. |
| `app/profesional/dashboard/actions.ts` | Modified | Add Pusher triggers and revalidate `/profesional/dashboard/usuarios`. |
| `app/register/actions.ts` | Modified | Trigger `professional-registered` event after signup. |
| `app/profesional/dashboard/clientes/page.tsx` | Modified | Replace placeholder with conversation list. |
| `app/profesional/dashboard/mensajes/page.tsx` | Modified | Use conversation list with unread badges. |
| `app/messages/actions.ts` | Modified | Add `getUnreadCountsBySender`, update `getUserConversations`. |
| `components/layout/sidebar.tsx` | Modified | Move badge to "Clients" item for `PROFESSIONAL`. |
| `components/chat/chat-panel.tsx` | Modified | Use private channels and broadcast read/unread changes. |
| `lib/pusher.ts` | Modified | Add private channel helpers and auth endpoint. |
| `prisma/schema.prisma` | Modified | Add indexes on `Message`. |
| `.env` | Modified | Add Pusher credentials. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Pusher config missing in production | High | Document required env vars; fail build if missing. |
| Private channel auth complexity | Medium | Implement `/api/pusher/auth` using existing `auth()` session. |
| Race conditions on unread counts | Medium | Update counts optimistically and reconcile on server response. |
| Increased DB load from count queries | Low | Add indexes and cache counts in client state. |
| Next.js 16 API changes | Medium | Verify APIs against `node_modules/next/dist/docs/` before coding. |

## Rollback Plan

1. Revert the code changes in server actions and client listeners.
2. Restore the original sidebar badge mapping.
3. Restore placeholder client page.
4. Run `npx prisma migrate dev` to remove added indexes if they caused issues.
5. Re-deploy previous build.

## Dependencies

- Pusher account and credentials.
- Database migration capability for new indexes.
- Existing NextAuth session available for private channel auth.

## Success Criteria

- [ ] Admin sees new professionals appear in pending/validated lists without reloading.
- [ ] Validating/rejecting a professional refreshes both dashboard and user-management views.
- [ ] Professional sidebar "Clients" shows total unread count.
- [ ] Client list shows per-conversation unread badges and last message preview.
- [ ] Opening a conversation marks messages as read and updates badges live across views.
- [ ] `npm run build`, `npm run typecheck`, and `npm run lint` pass.

## Open Questions

1. Should rejected professionals be removed from the admin list entirely or shown with a "rejected" status?
2. For per-client unread badges, do we count only messages from patients, or any role that has messaged the professional?
3. Should the admin real-time listener refresh the full page (`router.refresh()`) or do we prefer targeted client-side state updates?

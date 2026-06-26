# Design: Real-time admin updates and chat improvements

## Technical Approach

Add a `rejectedAt` flag to `ProfessionalProfile` so rejected professionals can be filtered out of admin pending/validated lists while preserving data. Use Pusher private channels (`private-user-{id}` and `private-admin-updates`) backed by a NextAuth session auth endpoint. Server actions emit events after successful DB writes; admin client listeners call `router.refresh()` and chat components update local badge state. Move the sidebar unread badge from Messages to Clients and build a conversation list with per-row unread counts.

## Architecture Decisions

| Decision | Options | Tradeoffs | Choice |
|---|---|---|---|
| Rejected state | `rejectedAt` column; delete profile; status enum | `rejectedAt` preserves data, avoids migration ambiguity, and is easy to filter | Add `rejectedAt DateTime?` |
| Admin update strategy | `router.refresh()` on event; targeted client state | Refresh is simple and consistent with server rendering; targeted updates duplicate state | `router.refresh()` |
| Chat channel model | Public `chat-` channel; `private-user-{id}`; per-conversation private channel | User channel handles unread counts and any 1:1 chat; conversation channel needs per-pair auth | `private-user-{id}` |
| Unread count source | Server computed; client computed | Server is source of truth; client risks races | Server computed, client reconciled |
| Read receipts | Broadcast to reader only; also to sender | Reader-only clears badges; sender receipts out of scope | Reader-only `conversation-read` |

## Data Flow

### Admin real-time

```
Server action (validate / reject / toggle / register)
  → Prisma update (ProfessionalProfile.rejectedAt / isValidated)
  → revalidatePath(admin routes)
  → pusher.trigger("private-admin-updates", "admin-updates", { type, userId })

Admin page
  → mount AdminRealtimeListener
  → Pusher.subscribe("private-admin-updates") via /api/pusher/auth
  → on "admin-updates" → router.refresh()
```

### Chat unread badges

```
sendMessage
  → Prisma create Message
  → pusher.trigger(`private-user-${receiverId}`, "unread-counts", { counts })
  → pusher.trigger(`private-user-${receiverId}`, "new-message", { message })

Client list / sidebar
  → subscribe to private-user-{ownId}
  → on "unread-counts" → update badge state
  → on "new-message" → refresh conversation list / append message

markMessagesAsRead(reader, sender)
  → Prisma updateMany readAt
  → pusher.trigger(`private-user-${readerId}`, "conversation-read", { senderId })
```

## File Changes

| File | Action | Description |
|---|---|---|
| `prisma/schema.prisma` | Modify | Add `rejectedAt` to `ProfessionalProfile`; add `@@index([isValidated, rejectedAt])`; add `Message` indexes `(receiverId, readAt)` and `(senderId, receiverId)` |
| `lib/pusher.ts` | Modify | Add `triggerAdminUpdate`, `triggerUnreadCounts`, channel name helpers; add client config helper |
| `app/api/pusher/auth/route.ts` | Create | Authorize `private-user-{id}` and `private-admin-updates` using `auth()` session |
| `app/register/actions.ts` | Modify | After creating a `PROFESSIONAL`, trigger `admin-updates` event |
| `app/profesional/dashboard/actions.ts` | Modify | Set/clear `rejectedAt`; revalidate `/profesional/dashboard/usuarios`; trigger admin event |
| `app/profesional/dashboard/usuarios/actions.ts` | Modify | Clear `rejectedAt` when validating; revalidate `/profesional/dashboard`; trigger admin event |
| `app/profesional/dashboard/page.tsx` | Modify | Exclude `rejectedAt != null` from pending queries; mount `AdminRealtimeListener` |
| `app/profesional/dashboard/usuarios/page.tsx` | Modify | Mount `AdminRealtimeListener` |
| `app/messages/actions.ts` | Modify | Add `getUnreadCountsBySender`; update `getUserConversations` to return last message, timestamp, unread count; broadcast on read |
| `app/profesional/dashboard/clientes/page.tsx` | Modify | Render `ConversationList` with server-fetched data |
| `app/profesional/dashboard/mensajes/page.tsx` | Modify | Use shared `ConversationList` for sidebar |
| `components/admin/admin-realtime-listener.tsx` | Create | Client hook subscribing to `private-admin-updates` and calling `router.refresh()` |
| `components/chat/conversation-list.tsx` | Create | Client list showing partner, preview, time, badge; listens to `private-user-{id}` |
| `components/chat/chat-panel.tsx` | Modify | Subscribe to `private-user-{userId}`; filter events by current partner |
| `components/layout/sidebar.tsx` | Modify | Move badge mapping from Messages to Clients for `PROFESSIONAL` |
| `.env` | Modify | Add Pusher credentials; build fails in production if missing |

## Interfaces / Contracts

```ts
// Pusher payloads
type AdminUpdateEvent =
  | { type: "professional-registered"; userId: string }
  | { type: "professional-validated"; userId: string; profileId: string }
  | { type: "professional-rejected"; userId: string; profileId: string };

type UnreadCountsEvent = { counts: { senderId: string; count: number }[] };
type ConversationReadEvent = { senderId: string };
```

```ts
// Server actions
async function getUnreadCountsBySender(
  userId: string
): Promise<{ senderId: string; count: number }[]>;

async function getUserConversations(userId: string): Promise<{
  id: string;
  name: string | null;
  image: string | null;
  role: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
}[]>;
```

Channel authorization in `/api/pusher/auth`:
- `private-user-{id}` allowed if `session.user.id === id`.
- `private-admin-updates` allowed if `session.user.role === "ADMIN"`.

## Testing Strategy

| Layer | What | Approach |
|---|---|---|
| Unit | Auth endpoint channel rules | Mock `auth()` and assert 200/403 per channel |
| Integration | Server actions emit events and revalidate paths | Spy on `pusher.trigger` and `revalidatePath`; assert call order |
| E2E | Admin real-time and chat badges | Register professional and assert admin list updates; send message and assert badge increments |

## Migration / Rollout

1. Run `npx prisma migrate dev --name add_rejected_at_and_message_indexes`.
2. Backfill: existing `isValidated: false` rows remain pending because `rejectedAt` did not exist before.
3. Add Pusher environment variables to production runtime.
4. Deploy and verify `/api/pusher/auth` returns 403 for unauthorized channels.
5. Rollback: revert migration, remove env vars, redeploy previous build.

## Open Questions

- Should rejected professionals also be hidden from `/profesional/dashboard/usuarios` or only marked as rejected?
- Do we need a read-receipt event broadcast to the message sender?

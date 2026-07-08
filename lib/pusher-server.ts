import Pusher from "pusher";
import {
  ADMIN_CHANNEL,
  userChannel,
  AdminUpdateEvent,
  NewMessagePayload,
  AppointmentUpdatePayload,
} from "@/lib/pusher-shared";

const appId = process.env.PUSHER_APP_ID;
const key = process.env.PUSHER_KEY;
const secret = process.env.PUSHER_SECRET;
const cluster = process.env.PUSHER_CLUSTER;

export const isPusherServerConfigured = Boolean(
  appId && key && secret && cluster
);

function requireServerConfig() {
  if (!isPusherServerConfigured) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Pusher credentials are required in production.");
    }
    return null;
  }
  return { appId: appId!, key: key!, secret: secret!, cluster: cluster! };
}

function createPusherServer(): Pusher | null {
  const config = requireServerConfig();
  if (!config) return null;

  return new Pusher({
    appId: config.appId,
    key: config.key,
    secret: config.secret,
    cluster: config.cluster,
    useTLS: true,
  });
}

export const pusherServer = createPusherServer();

export async function triggerAdminUpdate(event: AdminUpdateEvent) {
  if (!pusherServer) {
    return;
  }

  await pusherServer.trigger(ADMIN_CHANNEL, "admin-updates", event);
}

export async function triggerUnreadCounts(
  receiverId: string,
  counts: { senderId: string; count: number }[]
) {
  if (!pusherServer) {
    return;
  }

  await pusherServer.trigger(userChannel(receiverId), "unread-counts", { counts });
}

export async function triggerConversationRead(readerId: string, senderId: string) {
  if (!pusherServer) {
    return;
  }

  await pusherServer.trigger(userChannel(readerId), "conversation-read", { senderId });
}

export async function triggerMessage(message: NewMessagePayload) {
  if (!pusherServer) {
    return;
  }

  await pusherServer.trigger(userChannel(message.receiverId), "new-message", message);
}

export async function triggerAppointmentCreated(payload: AppointmentUpdatePayload) {
  if (!pusherServer) {
    return;
  }

  await pusherServer.trigger(
    userChannel(payload.professionalId),
    "appointment-created",
    payload
  );
  await pusherServer.trigger(
    userChannel(payload.patientId),
    "appointment-created",
    payload
  );
}

export async function triggerAppointmentUpdated(payload: AppointmentUpdatePayload) {
  if (!pusherServer) {
    return;
  }

  await pusherServer.trigger(
    userChannel(payload.professionalId),
    "appointment-updated",
    payload
  );
  await pusherServer.trigger(
    userChannel(payload.patientId),
    "appointment-updated",
    payload
  );
}

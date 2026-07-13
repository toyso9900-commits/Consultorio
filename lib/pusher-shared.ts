export const ADMIN_CHANNEL = "private-admin-updates";

export function userChannel(userId: string): string {
  return `private-user-${userId}`;
}

export type AdminUpdateEvent =
  | { type: "professional-registered"; userId: string }
  | { type: "professional-validated"; userId: string; profileId: string }
  | { type: "professional-rejected"; userId: string; profileId: string };

export type UnreadCountsEvent = {
  counts: { senderId: string; count: number }[];
};

export interface NewMessagePayload {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export type AppointmentUpdatePayload = {
  appointmentId: string;
  patientId: string;
  professionalId: string;
  status: string;
  scheduledAt: string;
};

export type PatientSubscribedPayload = {
  patientId: string;
  patientName: string | null;
  professionalId: string;
  expiresAt: string;
};

export type RoutinePublishedPayload = {
  patientId: string;
  professionalId: string;
  professionalName: string | null;
  title: string;
};

export type SubscriptionCancelledPayload = {
  patientId: string;
  patientName: string | null;
  professionalId: string;
  expiresAt: string;
};

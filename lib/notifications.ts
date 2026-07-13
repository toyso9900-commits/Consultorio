import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export interface NotificationItem {
  id: string;
  type: "message" | "appointment" | "validation" | "subscription" | "review" | "photo" | "meal" | "patient-subscription" | "routine";
  title: string;
  description: string;
  href: string;
  createdAt: Date;
}

export async function getNotifications(
  userId: string,
  role: UserRole
): Promise<NotificationItem[]> {
  switch (role) {
    case "ADMIN":
      return getAdminNotifications();
    case "PROFESSIONAL":
      return getProfessionalNotifications(userId);
    case "PATIENT":
    default:
      return getPatientNotifications(userId);
  }
}

async function getPatientNotifications(userId: string): Promise<NotificationItem[]> {
  const [unreadMessages, upcomingAppointments, pendingReviews, recentRoutines] = await Promise.all([
    prisma.message.findMany({
      where: { receiverId: userId, readAt: null },
      include: { sender: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.appointment.findMany({
      where: {
        patientId: userId,
        status: { in: ["REQUESTED", "CONFIRMED"] },
        scheduledAt: { gte: new Date() },
      },
      include: { professional: { select: { id: true, name: true } } },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    }),
    prisma.appointment.findMany({
      where: {
        patientId: userId,
        status: "COMPLETED",
        review: { is: null },
      },
      include: { professional: { select: { id: true, name: true } } },
      orderBy: { scheduledAt: "desc" },
      take: 3,
    }),
    prisma.routine.findMany({
      where: { patientId: userId },
      include: { professional: { select: { id: true, name: true } } },
      orderBy: { updatedAt: "desc" },
      take: 3,
    }),
  ]);

  const notifications: NotificationItem[] = [];

  for (const message of unreadMessages) {
    notifications.push({
      id: `msg-${message.id}`,
      type: "message",
      title: "Nuevo mensaje",
      description: `De ${message.sender.name || "un especialista"}`,
      href: `/paciente/dashboard/mensajes?profesional=${encodeURIComponent(message.senderId)}&nombre=${encodeURIComponent(message.sender.name || "Especialista")}`,
      createdAt: message.createdAt,
    });
  }

  for (const appointment of upcomingAppointments) {
    notifications.push({
      id: `appt-${appointment.id}`,
      type: "appointment",
      title: appointment.status === "CONFIRMED" ? "Cita confirmada" : "Solicitud de cita",
      description: `Con ${appointment.professional.name || "tu especialista"}`,
      href: "/paciente/dashboard/citas",
      createdAt: appointment.scheduledAt,
    });
  }

  for (const review of pendingReviews) {
    notifications.push({
      id: `review-${review.id}`,
      type: "review",
      title: "Valorá tu última sesión",
      description: `Con ${review.professional.name || "tu especialista"}`,
      href: "/paciente/dashboard/citas",
      createdAt: review.scheduledAt,
    });
  }

  for (const routine of recentRoutines) {
    notifications.push({
      id: `routine-${routine.id}`,
      type: "routine",
      title: "Rutina actualizada",
      description: `${routine.professional.name || "Tu especialista"} publicó "${routine.title}"`,
      href: "/paciente/dashboard/rutina",
      createdAt: routine.updatedAt,
    });
  }

  return notifications
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10);
}

async function getProfessionalNotifications(userId: string): Promise<NotificationItem[]> {
  const [unreadMessages, requestedAppointments, clients, recentPatientSubs] = await Promise.all([
    prisma.message.findMany({
      where: { receiverId: userId, readAt: null },
      include: { sender: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.appointment.findMany({
      where: {
        professionalId: userId,
        status: "REQUESTED",
      },
      include: { patient: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    getProfessionalClientsWithMissingActivity(userId),
    prisma.patientSubscription.findMany({
      where: { professionalId: userId },
      include: { patient: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  const notifications: NotificationItem[] = [];

  for (const message of unreadMessages) {
    notifications.push({
      id: `msg-${message.id}`,
      type: "message",
      title: "Nuevo mensaje",
      description: `De ${message.sender.name || "un paciente"}`,
      href: `/profesional/dashboard/mensajes?paciente=${encodeURIComponent(message.senderId)}&nombre=${encodeURIComponent(message.sender.name || "Paciente")}`,
      createdAt: message.createdAt,
    });
  }

  for (const appointment of requestedAppointments) {
    notifications.push({
      id: `appt-${appointment.id}`,
      type: "appointment",
      title: "Solicitud de cita",
      description: `De ${appointment.patient.name || "un paciente"}`,
      href: "/profesional/dashboard/citas",
      createdAt: appointment.createdAt,
    });
  }

  for (const client of clients) {
    if (client.missingPhoto) {
      notifications.push({
        id: `photo-${client.patientId}`,
        type: "photo",
        title: "Foto de progreso pendiente",
        description: `Paciente: ${client.name || "Paciente"}`,
        href: `/profesional/dashboard/mensajes?paciente=${encodeURIComponent(client.patientId)}&nombre=${encodeURIComponent(client.name || "Paciente")}`,
        createdAt: new Date(),
      });
    }
    if (client.missingMeal) {
      notifications.push({
        id: `meal-${client.patientId}`,
        type: "meal",
        title: "Registro de comida pendiente",
        description: `Paciente: ${client.name || "Paciente"}`,
        href: `/profesional/dashboard/mensajes?paciente=${encodeURIComponent(client.patientId)}&nombre=${encodeURIComponent(client.name || "Paciente")}`,
        createdAt: new Date(),
      });
    }
  }

  for (const sub of recentPatientSubs) {
    const isActive = sub.status !== "EXPIRED" && sub.expiresAt > new Date();
    notifications.push({
      id: `patient-sub-${sub.id}`,
      type: "patient-subscription",
      title: isActive ? "Nuevo suscriptor" : "Suscripción de paciente actualizada",
      description: sub.patient.name || "Paciente sin nombre",
      href: "/profesional/dashboard/clientes",
      createdAt: sub.createdAt,
    });
  }

  return notifications
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10);
}

async function getAdminNotifications(): Promise<NotificationItem[]> {
  const [
    pendingValidations,
    recentProfessionals,
    recentSubscriptions,
    recentReviews,
  ] = await Promise.all([
    prisma.professionalProfile.findMany({
      where: { isValidated: false, rejectedAt: null },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.professionalProfile.findMany({
      where: { isValidated: true },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.subscription.findMany({
      where: { plan: { in: ["PREMIUM", "PRO"] }, status: "ACTIVE" },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { startedAt: "desc" },
      take: 5,
    }),
    prisma.review.findMany({
      include: {
        patient: { select: { id: true, name: true } },
        professional: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const notifications: NotificationItem[] = [];

  for (const validation of pendingValidations) {
    notifications.push({
      id: `validation-${validation.id}`,
      type: "validation",
      title: "Validación pendiente",
      description: validation.user.name || "Profesional sin nombre",
      href: `/profesional/dashboard/validaciones?profile=${validation.id}`,
      createdAt: validation.createdAt,
    });
  }

  for (const professional of recentProfessionals) {
    notifications.push({
      id: `prof-${professional.id}`,
      type: "review",
      title: "Nuevo profesional registrado",
      description: professional.user.name || "Profesional sin nombre",
      href: `/profesional/dashboard/profesionales`,
      createdAt: professional.createdAt,
    });
  }

  for (const subscription of recentSubscriptions) {
    notifications.push({
      id: `sub-${subscription.id}`,
      type: "subscription",
      title: subscription.plan === "PRO" ? "Suscripción Pro activada" : "Suscripción Premium activada",
      description: subscription.user.name || "Profesional sin nombre",
      href: `/profesional/dashboard/suscripciones`,
      createdAt: subscription.startedAt,
    });
  }

  for (const review of recentReviews) {
    notifications.push({
      id: `review-${review.id}`,
      type: "review",
      title: "Nueva reseña",
      description: `De ${review.patient.name || "Paciente"} para ${review.professional?.name || "la plataforma"}`,
      href: `/profesional/dashboard/resenas`,
      createdAt: review.createdAt,
    });
  }

  return notifications
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10);
}

interface ClientWithMissingActivity {
  patientId: string;
  name: string | null;
  missingPhoto: boolean;
  missingMeal: boolean;
}

async function getProfessionalClientsWithMissingActivity(
  professionalId: string
): Promise<ClientWithMissingActivity[]> {
  const photoCutoff = new Date();
  photoCutoff.setDate(photoCutoff.getDate() - 14);

  const mealCutoff = new Date();
  mealCutoff.setDate(mealCutoff.getDate() - 3);

  const appointments = await prisma.appointment.findMany({
    where: { professionalId },
    select: { patientId: true },
    distinct: ["patientId"],
  });

  const patientIds = appointments.map((a) => a.patientId);
  if (patientIds.length === 0) return [];

  const [latestPhotos, latestMeals, patients] = await Promise.all([
    prisma.progressPhoto.groupBy({
      by: ["patientId"],
      where: { patientId: { in: patientIds } },
      _max: { createdAt: true },
    }),
    prisma.mealEntry.groupBy({
      by: ["userId"],
      where: { userId: { in: patientIds } },
      _max: { consumedAt: true },
    }),
    prisma.user.findMany({
      where: { id: { in: patientIds } },
      select: { id: true, name: true },
    }),
  ]);

  const photoMap = new Map(latestPhotos.map((p) => [p.patientId, p._max.createdAt]));
  const mealMap = new Map(latestMeals.map((m) => [m.userId, m._max.consumedAt]));
  const patientMap = new Map(patients.map((p) => [p.id, p.name]));

  return patientIds.map((patientId) => {
    const latestPhoto = photoMap.get(patientId);
    const latestMeal = mealMap.get(patientId);

    return {
      patientId,
      name: patientMap.get(patientId) || null,
      missingPhoto: !latestPhoto || latestPhoto < photoCutoff,
      missingMeal: !latestMeal || latestMeal < mealCutoff,
    };
  });
}

import { prisma } from "@/lib/prisma";
import { AppointmentStatus, UserRole } from "@prisma/client";

const appointmentWithUsers = {
  patient: {
    select: {
      id: true,
      name: true,
      image: true,
    },
  },
  professional: {
    select: {
      id: true,
      name: true,
      image: true,
    },
  },
} as const;

export type AppointmentWithUsers = Awaited<
  ReturnType<typeof getAppointmentsForPatient>
>[number];

export function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
}

export function endOfTodayUtc(): Date {
  const start = startOfTodayUtc();
  return new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
}

export async function getAppointmentsForPatient(patientId: string) {
  return prisma.appointment.findMany({
    where: { patientId },
    include: appointmentWithUsers,
    orderBy: { scheduledAt: "asc" },
  });
}

export async function getAppointmentsForProfessional(professionalId: string) {
  return prisma.appointment.findMany({
    where: { professionalId },
    include: appointmentWithUsers,
    orderBy: { scheduledAt: "asc" },
  });
}

export interface AppointmentDashboardCounts {
  upcoming: number;
  activePatients?: number;
}

export async function getAppointmentDashboardCounts(
  userId: string,
  role: "PATIENT" | "PROFESSIONAL" | "ADMIN"
): Promise<AppointmentDashboardCounts> {
  const today = startOfTodayUtc();

  if (role === "ADMIN") {
    return { upcoming: 0 };
  }

  const upcomingWhere =
    role === "PATIENT"
      ? {
          patientId: userId,
          status: {
            in: [AppointmentStatus.REQUESTED, AppointmentStatus.CONFIRMED],
          },
          scheduledAt: { gte: today },
        }
      : {
          professionalId: userId,
          status: AppointmentStatus.CONFIRMED,
          scheduledAt: { gte: today },
        };

  const upcoming = await prisma.appointment.count({
    where: upcomingWhere,
  });

  if (role !== "PROFESSIONAL") {
    return { upcoming };
  }

  const activePatients = await getActivePatients(userId);

  return { upcoming, activePatients };
}

export async function getActivePatients(professionalId: string): Promise<number> {
  const today = startOfTodayUtc();

  const activePatientGroups = await prisma.appointment.groupBy({
    by: ["patientId"],
    where: {
      professionalId,
      status: AppointmentStatus.CONFIRMED,
      scheduledAt: { gte: today },
      patient: {
        subscriptions: {
          some: {
            status: "ACTIVE",
            plan: "PREMIUM",
          },
        },
      },
    },
  });

  return activePatientGroups.length;
}

export interface ProfessionalClient {
  patientId: string;
  name: string | null;
  image: string | null;
  hasActivePaidSubscription: boolean;
  lastAppointment: Date | null;
}

export async function getProfessionalClients(
  professionalId: string
): Promise<ProfessionalClient[]> {
  const subscriptionSelection = {
    where: {
      status: "ACTIVE",
      plan: "PREMIUM",
    },
    select: { id: true },
    take: 1,
  } as const;

  const [appointments, messages] = await Promise.all([
    prisma.appointment.findMany({
      where: { professionalId },
      select: {
        patientId: true,
        scheduledAt: true,
        patient: {
          select: {
            id: true,
            name: true,
            image: true,
            subscriptions: subscriptionSelection,
          },
        },
      },
      orderBy: { scheduledAt: "desc" },
    }),
    prisma.message.findMany({
      where: {
        OR: [{ senderId: professionalId }, { receiverId: professionalId }],
      },
      select: {
        senderId: true,
        receiverId: true,
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
            subscriptions: subscriptionSelection,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
            subscriptions: subscriptionSelection,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const clientMap = new Map<string, ProfessionalClient>();

  for (const appointment of appointments) {
    const existing = clientMap.get(appointment.patientId);

    if (existing) {
      if (
        !existing.lastAppointment ||
        appointment.scheduledAt > existing.lastAppointment
      ) {
        existing.lastAppointment = appointment.scheduledAt;
      }
      existing.hasActivePaidSubscription ||=
        appointment.patient.subscriptions.length > 0;
    } else {
      clientMap.set(appointment.patientId, {
        patientId: appointment.patient.id,
        name: appointment.patient.name,
        image: appointment.patient.image,
        hasActivePaidSubscription:
          appointment.patient.subscriptions.length > 0,
        lastAppointment: appointment.scheduledAt,
      });
    }
  }

  for (const message of messages) {
    const partner =
      message.senderId === professionalId ? message.receiver : message.sender;

    if (partner.role !== UserRole.PATIENT) {
      continue;
    }

    const existing = clientMap.get(partner.id);

    if (existing) {
      existing.hasActivePaidSubscription ||=
        partner.subscriptions.length > 0;
    } else {
      clientMap.set(partner.id, {
        patientId: partner.id,
        name: partner.name,
        image: partner.image,
        hasActivePaidSubscription: partner.subscriptions.length > 0,
        lastAppointment: null,
      });
    }
  }

  return Array.from(clientMap.values()).sort((a, b) => {
    if (!a.lastAppointment) return 1;
    if (!b.lastAppointment) return -1;
    return b.lastAppointment.getTime() - a.lastAppointment.getTime();
  });
}

export async function getAppointmentsThisWeekCount(
  professionalId?: string
): Promise<number> {
  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const startOfWeek = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - dayOfWeek,
      0,
      0,
      0,
      0
    )
  );
  const endOfWeek = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + (6 - dayOfWeek),
      23,
      59,
      59,
      999
    )
  );

  return prisma.appointment.count({
    where: {
      scheduledAt: { gte: startOfWeek, lte: endOfWeek },
      status: { not: AppointmentStatus.CANCELLED },
      ...(professionalId ? { professionalId } : {}),
    },
  });
}

export interface EngagementDataPoint {
  date: string;
  count: number;
}

export async function getProfessionalEngagementData(
  professionalId: string
): Promise<EngagementDataPoint[]> {
  const now = new Date();
  const startDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 29)
  );

  const appointments = await prisma.appointment.findMany({
    where: {
      professionalId,
      status: AppointmentStatus.COMPLETED,
      scheduledAt: { gte: startDate },
    },
    select: { scheduledAt: true },
    orderBy: { scheduledAt: "asc" },
  });

  const dateMap = new Map<string, number>();

  for (let i = 0; i < 30; i++) {
    const date = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - (29 - i)
      )
    );
    const dateKey = date.toISOString().split("T")[0];
    dateMap.set(dateKey, 0);
  }

  for (const appointment of appointments) {
    const dateKey = appointment.scheduledAt.toISOString().split("T")[0];
    dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1);
  }

  return Array.from(dateMap.entries()).map(([date, count]) => ({
    date,
    count,
  }));
}

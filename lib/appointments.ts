import { prisma } from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";

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

function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
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

export async function getAppointmentsThisWeekCount(): Promise<number> {
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

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

  const activePatients = await prisma.appointment.groupBy({
    by: ["patientId"],
    where: {
      professionalId: userId,
      status: {
        in: [AppointmentStatus.REQUESTED, AppointmentStatus.CONFIRMED],
      },
    },
  });

  return { upcoming, activePatients: activePatients.length };
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

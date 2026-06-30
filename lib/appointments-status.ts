import { AppointmentStatus } from "@prisma/client";

export const allowedTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
  REQUESTED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["CANCELLED", "COMPLETED"],
  CANCELLED: [],
  COMPLETED: [],
};

export function isValidTransition(
  from: AppointmentStatus,
  to: AppointmentStatus
): boolean {
  return allowedTransitions[from]?.includes(to) ?? false;
}

export function getNextStatuses(from: AppointmentStatus): AppointmentStatus[] {
  return allowedTransitions[from] ?? [];
}

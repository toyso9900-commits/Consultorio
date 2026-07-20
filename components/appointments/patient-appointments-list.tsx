"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PatientAppointmentCard } from "./patient-appointment-card";
import { AppointmentsRealtimeListener } from "./appointments-realtime-listener";
import type { AppointmentWithUsers } from "@/lib/appointments";
import type { Dictionary } from "@/lib/i18n/dictionaries";

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

type FilterKey = "all" | "upcoming" | "past";

interface PatientAppointmentsListProps {
  appointments: AppointmentWithUsers[];
  patientId: string;
  locale: string;
  dictionary: Dictionary;
}

export function PatientAppointmentsList({
  appointments,
  patientId,
  locale,
  dictionary,
}: PatientAppointmentsListProps) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAppointments = useMemo(() => {
    const today = startOfToday();
    const query = searchQuery.trim().toLowerCase();

    return appointments.filter((appointment) => {
      const status = appointment.status;
      const scheduledAt = appointment.scheduledAt;

      let matchesFilter = true;
      if (filter === "upcoming") {
        matchesFilter =
          (status === "REQUESTED" || status === "CONFIRMED") &&
          scheduledAt >= today;
      } else if (filter === "past") {
        matchesFilter =
          status === "COMPLETED" ||
          status === "CANCELLED" ||
          (status === "CONFIRMED" && scheduledAt < today);
      }

      if (!matchesFilter) return false;

      if (!query) return true;

      const professionalName = appointment.professional.name ?? "";
      const notes = appointment.notes ?? "";
      return (
        professionalName.toLowerCase().includes(query) ||
        notes.toLowerCase().includes(query)
      );
    });
  }, [appointments, filter, searchQuery]);

  const filters: FilterKey[] = ["all", "upcoming", "past"];

  return (
    <>
      {patientId && <AppointmentsRealtimeListener userId={patientId} />}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-white">
          {dictionary.patientAppointments.title}
        </h1>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={dictionary.appointments.search.placeholder}
                className="h-10 w-40 rounded-full bg-[#2c2c2c] pl-9 pr-4 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#4ade22] sm:w-56"
                aria-label={dictionary.appointments.search.placeholder}
              />
            </div>

            <div className="flex items-center gap-2">
              {filters.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#4ade22] focus:ring-offset-2 focus:ring-offset-[#212121] ${
                    filter === key
                      ? "bg-white/10 text-white border-b-2 border-[#4ade22]"
                      : "bg-[#2c2c2c] text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                  aria-pressed={filter === key}
                >
                  {dictionary.appointments.filters[key]}
                </button>
              ))}
            </div>
          </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#2c2c2c] p-12 text-center">
          <p className="text-white/70">
            {dictionary.appointments.empty.patient}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAppointments.map((appointment) => (
            <PatientAppointmentCard
              key={appointment.id}
              appointment={appointment}
              patientId={patientId}
              locale={locale}
              dictionary={dictionary}
            />
          ))}
        </div>
      )}
    </>
  );
}

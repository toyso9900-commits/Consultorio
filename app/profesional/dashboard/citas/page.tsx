import { CalendarDays } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocale, getDictionary } from "@/lib/i18n/server";
import {
  getAppointmentsForProfessional,
  startOfToday,
} from "@/lib/appointments";
import { AppointmentStatus } from "@prisma/client";
import { AppointmentRequestList } from "@/components/appointments/appointment-request-list";
import { ProfessionalUpcomingAppointments } from "@/components/appointments/professional-upcoming-appointments";

export default async function ProfessionalAppointmentsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const role = session.user.role;
  const locale = await getLocale(session.user.id);
  const dictionary = await getDictionary(locale);

  if (role !== "PROFESSIONAL") {
    redirect("/profesional/dashboard");
  }

  const today = startOfToday();
  const appointments = await getAppointmentsForProfessional(session.user.id);
  const requests = appointments.filter(
    (appointment) => appointment.status === AppointmentStatus.REQUESTED
  );
  const upcoming = appointments.filter(
    (appointment) =>
      appointment.status === AppointmentStatus.CONFIRMED &&
      appointment.scheduledAt >= today
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#2f2c28] bg-[#23201d] p-5 shadow-sm">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#55eb55]/10">
          <CalendarDays className="h-6 w-6 text-[#55eb55]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {dictionary.professionalAppointments.title}
          </h1>
          <p className="text-white/60">
            {dictionary.professionalAppointments.description}
          </p>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">
          {dictionary.appointments.sections.requests}
        </h2>
        <AppointmentRequestList
          appointments={requests}
          locale={locale}
          dictionary={dictionary}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">
          {dictionary.appointments.sections.upcoming}
        </h2>
        <ProfessionalUpcomingAppointments
          appointments={upcoming}
          locale={locale}
          dictionary={dictionary}
        />
      </section>
    </div>
  );
}

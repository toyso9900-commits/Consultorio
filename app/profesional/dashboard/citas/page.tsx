import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { getLocale, getDictionary } from "@/lib/i18n/server";
import { getAppointmentsForProfessional } from "@/lib/appointments";
import { AppointmentRequestList } from "@/components/appointments/appointment-request-list";
import { DateGroupedAppointments } from "@/components/appointments/date-grouped-appointments";
import { AppointmentStatus } from "@prisma/client";

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

  const appointments = await getAppointmentsForProfessional(session.user.id);
  const requests = appointments.filter(
    (appointment) => appointment.status === "REQUESTED"
  );
  const upcoming = appointments.filter(
    (appointment) =>
      appointment.status === AppointmentStatus.CONFIRMED ||
      appointment.status === AppointmentStatus.COMPLETED
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950">
          <CalendarDays className="h-5 w-5 text-rose-600" />
        </div>
        <div>
            <h1 className="text-2xl font-bold text-card-foreground">
              {dictionary.professionalAppointments.title}
            </h1>
            <p className="text-muted-foreground">
              {dictionary.professionalAppointments.description}
            </p>
          </div>
        </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-card-foreground">
          {dictionary.appointments.sections.requests}
        </h2>
        <AppointmentRequestList
          appointments={requests}
          locale={locale}
          dictionary={dictionary}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-card-foreground">
          {dictionary.appointments.sections.upcoming}
        </h2>
        <DateGroupedAppointments
          appointments={upcoming}
          role="professional"
          locale={locale}
          dictionary={dictionary}
        />
      </section>
    </div>
  );
}

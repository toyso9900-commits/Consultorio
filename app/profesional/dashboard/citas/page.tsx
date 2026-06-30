import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { getLocale, getDictionary } from "@/lib/i18n/server";
import { getAppointmentsForProfessional } from "@/lib/appointments";
import { AppointmentRequestList } from "@/components/appointments/appointment-request-list";

export default async function ProfessionalAppointmentsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const role = session.user.role;
  const locale = await getLocale(session.user.id);
  const dictionary = await getDictionary(locale);

  if (role === "ADMIN") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950">
            <CalendarDays className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {dictionary.adminAppointments.title}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {dictionary.adminAppointments.description}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-slate-600 dark:text-slate-400">
            {dictionary.adminAppointments.empty}
          </p>
        </div>
      </div>
    );
  }

  if (role !== "PROFESSIONAL") {
    redirect("/login");
  }

  const appointments = await getAppointmentsForProfessional(session.user.id);
  const requests = appointments.filter(
    (appointment) => appointment.status === "REQUESTED"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950">
          <CalendarDays className="h-5 w-5 text-rose-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {dictionary.professionalAppointments.title}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {dictionary.professionalAppointments.description}
          </p>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {dictionary.appointments.sections.requests}
        </h2>
        <AppointmentRequestList
          appointments={requests}
          locale={locale}
          dictionary={dictionary}
        />
      </section>
    </div>
  );
}

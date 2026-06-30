import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { getLocale, getDictionary } from "@/lib/i18n/server";
import { getAppointmentsForPatient } from "@/lib/appointments";
import { AppointmentCard } from "@/components/appointments/appointment-card";

export default async function PatientAppointmentsPage() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "PATIENT") {
    redirect("/login");
  }

  const locale = await getLocale(session.user.id);
  const dictionary = await getDictionary(locale);
  const appointments = await getAppointmentsForPatient(session.user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
          <CalendarDays className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {dictionary.patientAppointments.title}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {dictionary.patientAppointments.description}
          </p>
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-slate-600 dark:text-slate-400">
            {dictionary.appointments.empty.patient}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              role="patient"
              locale={locale}
              dictionary={dictionary}
            />
          ))}
        </div>
      )}
    </div>
  );
}

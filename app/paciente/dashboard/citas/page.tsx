import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { getLocale, getDictionary } from "@/lib/i18n/server";
import { getAppointmentsForPatient } from "@/lib/appointments";
import { getPendingReviewsForPatient } from "@/lib/reviews";
import { AppointmentCard } from "@/components/appointments/appointment-card";
import { RatingPrompt } from "@/components/rating/rating-prompt";

export default async function PatientAppointmentsPage() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "PATIENT") {
    redirect("/login");
  }

  const locale = await getLocale(session.user.id);
  const dictionary = await getDictionary(locale);
  const appointments = await getAppointmentsForPatient(session.user.id);
  const pendingReviews = await getPendingReviewsForPatient(session.user.id);

  return (
    <div className="space-y-6" data-role="patient">
      <RatingPrompt patientId={session.user.id} pendingReviews={pendingReviews} />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
          <CalendarDays className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
            <h1 className="text-2xl font-bold text-card-foreground">
              {dictionary.patientAppointments.title}
            </h1>
            <p className="text-muted-foreground">
              {dictionary.patientAppointments.description}
            </p>
          </div>
        </div>

        {appointments.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
            <p className="text-muted-foreground">
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

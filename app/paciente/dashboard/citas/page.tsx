import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocale, getDictionary } from "@/lib/i18n/server";
import { getAppointmentsForPatient } from "@/lib/appointments";
import { getPendingReviewsForPatient } from "@/lib/reviews";
import { PatientAppointmentsList } from "@/components/appointments/patient-appointments-list";
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

      <PatientAppointmentsList
        appointments={appointments}
        patientId={session.user.id}
        locale={locale}
        dictionary={dictionary}
      />
    </div>
  );
}

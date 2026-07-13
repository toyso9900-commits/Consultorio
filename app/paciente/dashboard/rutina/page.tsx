import Link from "next/link";
import { redirect } from "next/navigation";
import { Dumbbell, Leaf, Lock } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listActiveSubscriptionsForPatient } from "@/lib/patient-subscriptions";
import { getLocale, getDictionary } from "@/lib/i18n/server";

export default async function PatientRoutinePage() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "PATIENT") {
    redirect("/login");
  }

  const patientId = session.user.id;
  const locale = await getLocale(patientId);
  const dictionary = await getDictionary(locale);
  const t = dictionary.patientRoutine;

  // Lazy expiry: ACTIVE or CANCELLED-but-not-expired subscriptions still
  // grant access until expiresAt passes (see lib/patient-subscriptions).
  const activeSubscriptions = await listActiveSubscriptionsForPatient(patientId);
  const isSubscribed = activeSubscriptions.length > 0;

  // Only fetch personalized content when at least one subscription is
  // active — non-subscribers must never receive routine content (REQ-004).
  const routines = isSubscribed
    ? await prisma.routine.findMany({
        where: {
          patientId,
          professionalId: {
            in: activeSubscriptions.map((sub) => sub.professionalId),
          },
        },
        include: { professional: { select: { id: true, name: true } } },
        orderBy: { updatedAt: "desc" },
      })
    : [];

  return (
    <div className="space-y-6" data-role="patient">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
          <Dumbbell className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">{t.title}</h1>
        </div>
      </div>

      {!isSubscribed ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
            <Lock className="h-6 w-6 text-amber-600" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-card-foreground">
            {t.paywallTitle}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{t.paywallBody}</p>
          <Link
            href="/paciente/dashboard/expertos"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            {t.paywallCta}
          </Link>
        </div>
      ) : routines.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <p className="text-muted-foreground">{t.noRoutineYet}</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {routines.map((routine) => (
            <li
              key={routine.id}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-card-foreground">
                {routine.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t.publishedBy.replace(
                  "{name}",
                  routine.professional.name ?? ""
                )}{" "}
                ·{" "}
                {t.updatedAt.replace(
                  "{date}",
                  routine.updatedAt.toLocaleDateString(locale)
                )}
              </p>
              <p className="mt-3 whitespace-pre-line text-sm text-foreground">
                {routine.content}
              </p>
            </li>
          ))}
        </ul>
      )}

      {/* FREE plan: static default content, identical for every patient and
          never editable by professionals (REQ-005). */}
      <div className="rounded-2xl border border-dashed border-border bg-card/60 p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-emerald-600" />
          <h2 className="text-base font-semibold text-card-foreground">
            {t.freePlanTitle}
          </h2>
        </div>
        <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
          {t.freePlanBody}
        </p>
      </div>
    </div>
  );
}

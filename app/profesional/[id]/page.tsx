import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Shield, Sparkles, Leaf } from "lucide-react";
import { auth } from "@/lib/auth";
import { getApprovedProfessionalById } from "@/lib/professionals-db";
import { hasActivePatientSubscription } from "@/lib/patient-subscriptions";
import { getLocale, getDictionary } from "@/lib/i18n/server";
import { ChatButton } from "@/components/chat/chat-button";
import { AppointmentRequestModal } from "@/components/appointments/appointment-request-modal";
import { SubscribeButton } from "./subscribe-button";

export default async function ProfessionalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const prof = await getApprovedProfessionalById(id);
  const session = await auth();
  const locale = await getLocale(session?.user?.id);
  const dictionary = await getDictionary(locale);

  if (!prof) {
    notFound();
  }

  const isPatient = session?.user?.role === "PATIENT";
  const hasPaidPlan = prof.planPrice != null && prof.planPrice > 0;
  const alreadySubscribed =
    isPatient && session?.user?.id
      ? await hasActivePatientSubscription(session.user.id, prof.id)
      : false;
  const t = dictionary.patientSubscription;

  return (
    <main className="mx-auto max-w-4xl flex-1 px-6 py-12">
      <Link
        href="/paciente/dashboard/expertos"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a la Guía de Expertos
      </Link>

      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="relative h-64 w-full bg-slate-100 dark:bg-slate-800">
          <Image
            src={prof.image}
            alt={prof.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/90 px-3 py-1 text-xs font-semibold">
              <Shield className="h-3 w-3" />
              {prof.specialty}
            </span>
            <h1 className="mt-2 text-3xl font-bold">{prof.name}</h1>
            <p className="text-white/90">{prof.title}</p>
          </div>
        </div>

        <div className="p-8">
          <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
            {prof.bio || "Sin biografía disponible."}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-800">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Ubicación
              </span>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                {prof.location}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-800">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Modalidad
              </span>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                {prof.modality}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-start justify-end gap-6 border-t border-slate-100 pt-8 dark:border-slate-800 sm:flex-row sm:items-center">
            <div className="flex w-full gap-3 sm:w-auto">
              <ChatButton professionalId={prof.id} professionalName={prof.name} />
              {isPatient ? (
                <AppointmentRequestModal
                  professionalId={prof.id}
                  professionalName={prof.name}
                  locale={locale}
                  dictionary={dictionary}
                />
              ) : (
                <button
                  disabled
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white opacity-60 sm:flex-none"
                >
                  <Calendar className="h-4 w-4" />
                  Agendar (próximamente)
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {prof.freePlanContent ? prof.freePlanTitle || t.freePlanTitle : t.freePlanTitle}
                </h2>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-600 dark:text-slate-400">
                {prof.freePlanContent || t.freePlanBody}
              </p>
            </div>

            {hasPaidPlan && (
              <div className="rounded-2xl border border-indigo-300 bg-indigo-50/50 p-6 dark:border-indigo-800 dark:bg-indigo-950/20">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {t.paidPlanTitle}
                    </h2>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    {t.testModeBadge}
                  </span>
                </div>
                <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-slate-100">
                  ${prof.planPrice}{" "}
                  <span className="text-base font-medium text-slate-500 dark:text-slate-400">
                    {prof.planDuration ?? ""}
                  </span>
                </p>
                <div className="mt-4">
                  {!isPatient ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {t.loginToSubscribe}
                    </p>
                  ) : alreadySubscribed ? (
                    <div className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
                      {t.alreadySubscribedBadge}
                    </div>
                  ) : (
                    <SubscribeButton professionalId={prof.id} />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

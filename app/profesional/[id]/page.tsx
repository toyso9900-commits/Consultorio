import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Leaf,
  MapPin,
  Shield,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { getApprovedProfessionalById } from "@/lib/professionals-db";
import { hasActivePatientSubscription } from "@/lib/patient-subscriptions";
import { getLocale, getDictionary } from "@/lib/i18n/server";
import { ChatButton } from "@/components/chat/chat-button";
import { AppointmentRequestModal } from "@/components/appointments/appointment-request-modal";
import { SubscribeButton } from "./subscribe-button";

function parseFreePlanContent(content: string | null | undefined): string[] {
  if (!content) return [];
  return content
    .split(/\n+/)
    .map((line) => line.trim().replace(/^[-•*]\s*/, ""))
    .filter(Boolean);
}

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

  const freePlanTitle = prof.freePlanTitle || t.freePlanTitle;
  const freePlanItems = parseFreePlanContent(
    prof.freePlanContent || t.freePlanBody
  );

  return (
    <main className="min-h-screen bg-[#1c1917] text-white">
      <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
        <Link
          href="/paciente/dashboard/expertos"
          className="inline-flex items-center gap-2 pt-6 text-sm font-medium text-white/70 transition-colors hover:text-[#55eb55]"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.backToExperts}
        </Link>

        {/* Banner */}
        <div className="relative mt-6 h-56 w-full overflow-hidden rounded-3xl sm:h-72">
          <Image
            src={prof.image}
            alt={prof.name}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-amber-900/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1c1917] via-transparent to-transparent" />
        </div>

        {/* Profile header */}
        <div className="relative -mt-16 flex flex-col items-center px-4">
          <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-[#1c1917] bg-[#23201d] shadow-xl">
            <Image
              src={prof.image}
              alt={prof.name}
              fill
              className="object-cover"
            />
          </div>

          <h1 className="mt-4 text-center text-3xl font-bold text-white">
            {prof.name}
          </h1>
          <p className="text-center text-white/70">{prof.title}</p>

          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/15 px-3 py-1.5 text-sm font-medium text-purple-300">
            <Shield className="h-4 w-4" />
            {prof.specialty}
          </span>

          <p className="mt-5 max-w-2xl text-left text-base leading-relaxed text-white/70">
            {prof.bio || "Sin biografía disponible."}
          </p>
        </div>

        {/* Info cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-[#23201d] p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-[#55eb55]/10 p-2.5">
                <MapPin className="h-5 w-5 text-[#55eb55]" />
              </div>
              <div>
                <p className="text-sm text-white/50">{t.locationLabel}</p>
                <p className="font-semibold text-white">{prof.location}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#23201d] p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-[#55eb55]/10 p-2.5">
                <Users className="h-5 w-5 text-[#55eb55]" />
              </div>
              <div>
                <p className="text-sm text-white/50">{t.modalityLabel}</p>
                <p className="font-semibold text-white">{prof.modality}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-col gap-3">
          <ChatButton
            professionalId={prof.id}
            professionalName={prof.name}
            label={t.messageCta}
            className="w-full rounded-2xl border border-white/10 bg-transparent py-3 text-white hover:border-white/20 hover:bg-white/5 hover:text-white dark:border-white/10 dark:hover:border-white/20 dark:hover:bg-white/5 dark:hover:text-white sm:flex-1"
          />
          {isPatient ? (
            <AppointmentRequestModal
              professionalId={prof.id}
              professionalName={prof.name}
              locale={locale}
              dictionary={dictionary}
              triggerLabel={t.appointmentCta}
              triggerClassName="w-full rounded-2xl bg-purple-600 py-3 shadow-lg shadow-purple-500/25 hover:bg-purple-700 sm:flex-1"
            />
          ) : (
            <button
              disabled
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white opacity-60"
            >
              <Calendar className="h-4 w-4" />
              {t.appointmentCta}
            </button>
          )}
        </div>

        {/* Plans */}
        <section className="mt-14">
          <h2 className="text-center text-2xl font-bold text-white sm:text-3xl">
            {t.plansTitle}
          </h2>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {/* Free plan */}
            <div className="rounded-2xl bg-[#23201d] p-6">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-[#55eb55]/10 p-2">
                  <Leaf className="h-5 w-5 text-[#55eb55]" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {freePlanTitle}
                </h3>
              </div>

              {freePlanItems.length > 0 ? (
                <ul className="mt-5 space-y-3">
                  {freePlanItems.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-sm text-white/70"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#55eb55]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-5 text-sm text-white/50">{t.freePlanBody}</p>
              )}
            </div>

            {/* Paid plan */}
            {hasPaidPlan ? (
              <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-[#23201d] to-[#2a1f3d] p-6">
                <div className="absolute right-4 top-4">
                  <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
                    {t.testModeBadge}
                  </span>
                </div>

                <div className="pointer-events-none absolute -right-4 -top-4 text-purple-400/20">
                  <Star className="h-16 w-16 fill-current" />
                </div>
                <div className="pointer-events-none absolute bottom-4 left-4 text-purple-400/10">
                  <Sparkles className="h-12 w-12" />
                </div>

                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-purple-500/15 p-2">
                    <Sparkles className="h-5 w-5 text-purple-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {t.paidPlanTitle}
                  </h3>
                </div>

                <p className="mt-6 text-4xl font-bold text-white">
                  ${prof.planPrice}
                </p>
                <p className="text-white/60">{prof.planDuration}</p>

                <div className="mt-6">
                  {!isPatient ? (
                    <p className="text-sm text-white/50">
                      {t.loginToSubscribe}
                    </p>
                  ) : alreadySubscribed ? (
                    <div className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#55eb55]/30 bg-[#55eb55]/10 px-5 py-2.5 text-sm font-semibold text-[#55eb55]">
                      {t.alreadySubscribedBadge}
                    </div>
                  ) : (
                    <SubscribeButton professionalId={prof.id} />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-2xl bg-[#23201d] p-6">
                <p className="text-center text-sm text-white/50">
                  {dictionary.subscription.planPriceMissing}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Shield } from "lucide-react";
import { getApprovedProfessionalById } from "@/lib/professionals-db";
import { ChatButton } from "@/components/chat/chat-button";

export default async function ProfessionalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const prof = await getApprovedProfessionalById(id);

  if (!prof) {
    notFound();
  }

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

          <div className="mt-8 flex flex-col items-start justify-between gap-6 border-t border-slate-100 pt-8 dark:border-slate-800 sm:flex-row sm:items-center">
            <div>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Precio por asesoría
              </span>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                ${prof.price} MXN
              </p>
            </div>
            <div className="flex w-full gap-3 sm:w-auto">
              <ChatButton professionalId={prof.id} professionalName={prof.name} />
              <button
                disabled
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white opacity-60 sm:flex-none"
              >
                <Calendar className="h-4 w-4" />
                Agendar (próximamente)
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

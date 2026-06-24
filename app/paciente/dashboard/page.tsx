import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Activity,
  Apple,
  CalendarDays,
  FileText,
  MessageSquare,
  User,
  Search,
} from "lucide-react";
import { OnboardingModal } from "./onboarding-modal";

export default async function PatientDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "PATIENT") {
    redirect("/login");
  }

  const userId = session.user.id!;

  const patientProfile = await prisma.patientProfile.findUnique({
    where: { userId },
  });

  const needsOnboarding =
    !patientProfile ||
    !session.user.name ||
    patientProfile.gender == null ||
    patientProfile.height == null ||
    patientProfile.weight == null;

  return (
    <div>
      {needsOnboarding && <OnboardingModal userId={userId} />}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Panel del Paciente
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Bienvenido, {session.user.name || session.user.email}. Acá podés
          gestionar tu salud y bienestar.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
            <Activity className="h-5 w-5 text-indigo-600" />
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Peso actual
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {patientProfile?.weight ? `${patientProfile.weight} kg` : "-- kg"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-950">
            <Apple className="h-5 w-5 text-teal-600" />
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Calorías hoy
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">0 kcal</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
            <CalendarDays className="h-5 w-5 text-amber-600" />
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Próximas citas
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">0</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950">
            <MessageSquare className="h-5 w-5 text-rose-600" />
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Mensajes
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">0</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
              <User className="h-5 w-5 text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Mi expediente
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">Estatura</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {patientProfile?.height
                  ? `${patientProfile.height} cm`
                  : "No completado"}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">Género</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 capitalize">
                {patientProfile?.gender
                  ? formatGender(patientProfile.gender)
                  : "No completado"}
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-950">
                <FileText className="h-5 w-5 text-teal-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Documentos
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Subí estudios médicos para compartirlos con tus especialistas.
            </p>
          </div>
          <Link
            href="/paciente/dashboard/expertos"
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
                <Search className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Guía de Expertos
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Buscá nutriólogos y entrenadores.
                </p>
              </div>
            </div>
            <svg
              className="h-5 w-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

function formatGender(value: string) {
  const map: Record<string, string> = {
    male: "Masculino",
    female: "Femenino",
    "non-binary": "No binario",
    "prefer-not-to-say": "Prefiero no decirlo",
  };
  return map[value] || value;
}

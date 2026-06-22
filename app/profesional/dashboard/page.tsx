import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import {
  BadgeCheck,
  CalendarDays,
  Crown,
  Users,
  ShieldCheck,
  ClipboardList,
} from "lucide-react";

export default async function ProfessionalDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Public professional registration is disabled in beta.
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <main className="mx-auto max-w-6xl flex-1 px-6 py-12">
      <div className="mb-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
          <ShieldCheck className="h-4 w-4" />
          Panel de Super Admin
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Administración
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Gestión de profesionales, validaciones y suscripciones.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
            <Users className="h-5 w-5 text-indigo-600" />
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Profesionales registrados
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            0
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
            <BadgeCheck className="h-5 w-5 text-amber-600" />
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Validaciones pendientes
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            0
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-950">
            <Crown className="h-5 w-5 text-teal-600" />
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Suscripciones activas
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            0
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950">
            <CalendarDays className="h-5 w-5 text-rose-600" />
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Citas esta semana
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            0
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
              <BadgeCheck className="h-5 w-5 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Validaciones pendientes
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Acá aparecerán los profesionales que enviaron documentos para ser
            verificados.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
              <ClipboardList className="h-5 w-5 text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Actividad reciente
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Registro de nuevos profesionales, pagos y cambios de suscripción.
          </p>
        </div>
      </div>
    </main>
  );
}

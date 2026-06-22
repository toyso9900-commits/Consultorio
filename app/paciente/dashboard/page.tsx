import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import {
  Activity,
  Apple,
  CalendarDays,
  FileText,
  MessageSquare,
  User,
} from "lucide-react";

export default async function PatientDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-6xl flex-1 px-6 py-12">
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
            -- kg
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-950">
            <Apple className="h-5 w-5 text-teal-600" />
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Calorías hoy
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            0 kcal
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
            <CalendarDays className="h-5 w-5 text-amber-600" />
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Próximas citas
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            0
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950">
            <MessageSquare className="h-5 w-5 text-rose-600" />
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Mensajes
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            0
          </p>
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
          <p className="text-slate-600 dark:text-slate-400">
            Peso, altura, tipo de sangre, alergias y restricciones. En la beta
            podés ver esta sección, pronto podrás editarla.
          </p>
        </div>
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
      </div>
    </main>
  );
}

import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  BadgeCheck,
  CalendarDays,
  Crown,
  Users,
  ShieldCheck,
  ClipboardList,
  Briefcase,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
} from "lucide-react";
import { validateProfessional, rejectProfessional } from "./actions";

export default async function ProfessionalDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;

  if (role !== "ADMIN" && role !== "PROFESSIONAL") {
    redirect("/");
  }

  const isAdmin = role === "ADMIN";

  const professionalCount = await prisma.user.count({
    where: { role: "PROFESSIONAL" },
  });
  const pendingValidations = await prisma.professionalProfile.count({
    where: { isValidated: false },
  });
  const activeSubscriptions = await prisma.subscription.count({
    where: { status: "ACTIVE" },
  });
  const appointmentsThisWeek = 0; // placeholder until scheduling is built

  const pendingProfessionals = isAdmin
    ? await prisma.professionalProfile.findMany({
        where: { isValidated: false },
        include: { user: { select: { id: true, email: true, name: true } } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  if (isAdmin) {
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
              {professionalCount}
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
              {pendingValidations}
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
              {activeSubscriptions}
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
              {appointmentsThisWeek}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
                <BadgeCheck className="h-5 w-5 text-amber-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Validaciones pendientes
              </h2>
            </div>

            {pendingProfessionals.length === 0 ? (
              <p className="text-slate-600 dark:text-slate-400">
                No hay profesionales pendientes de validación.
              </p>
            ) : (
              <div className="space-y-4">
                {pendingProfessionals.map((prof) => (
                  <div
                    key={prof.id}
                    className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {prof.user.name || "Sin nombre"}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" />
                          {prof.user.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <ClipboardList className="h-3.5 w-3.5" />
                          Cédula: {prof.licenseNumber || "No registrada"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <form action={validateProfessional}>
                        <input type="hidden" name="profileId" value={prof.id} />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Aceptar
                        </button>
                      </form>
                      <form action={rejectProfessional}>
                        <input type="hidden" name="profileId" value={prof.id} />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
                        >
                          <XCircle className="h-4 w-4" />
                          Rechazar
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

  // Professional basic dashboard
  const professional = await prisma.professionalProfile.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <main className="mx-auto max-w-6xl flex-1 px-6 py-12">
      <div className="mb-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
          <Briefcase className="h-4 w-4" />
          Panel del Profesional
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Bienvenido, {session.user.name || session.user.email}
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Acá podés gestionar tu perfil, citas y pacientes.
        </p>
      </div>

      {!professional?.isValidated && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          <p className="text-sm">
            Tu cuenta está pendiente de validación por el equipo de Consultorio.
            Una vez aprobada, podrás aparecer en la Guía de Expertos.
          </p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
            <CalendarDays className="h-5 w-5 text-indigo-600" />
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Próximas citas</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">0</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-950">
            <Users className="h-5 w-5 text-teal-600" />
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Pacientes activos</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">0</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
            <Star className="h-5 w-5 text-amber-600" />
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Valoraciones</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">0</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950">
            <Clock className="h-5 w-5 text-rose-600" />
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Horas esta semana</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">0</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
              <Briefcase className="h-5 w-5 text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Mi perfil profesional
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Cédula profesional: {professional?.licenseNumber || "No registrada"}.
            Pronto podrás editar tu especialidad, bio y precios.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-950">
              <CalendarDays className="h-5 w-5 text-teal-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Disponibilidad
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Configurá tus horarios y modalidades de atención.
          </p>
        </div>
      </div>
    </main>
  );
}

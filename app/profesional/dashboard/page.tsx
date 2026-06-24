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
  Mail,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { AdminStatsChart } from "@/components/admin/admin-stats-chart";
import { ValidationActions } from "@/components/admin/validation-actions";

export default async function ProfessionalDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
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
  const appointmentsThisWeek = 0;

  const pendingProfessionals = isAdmin
    ? await prisma.professionalProfile.findMany({
        where: { isValidated: false },
        include: { user: { select: { id: true, email: true, name: true } } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  if (isAdmin) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              <ShieldCheck className="h-4 w-4" />
              Panel de Super Admin
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Administración
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Gestión de profesionales, validaciones y suscripciones.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <TrendingUp className="h-4 w-4" />
            +{pendingValidations} pendientes hoy
          </div>
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

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Tráfico y registros
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Últimos 7 días
                  </p>
                </div>
              </div>
            </div>
            <AdminStatsChart />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
                <BadgeCheck className="h-5 w-5 text-amber-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Usuarios en espera
              </h2>
            </div>

            {pendingProfessionals.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No hay profesionales pendientes de validación.
              </p>
            ) : (
              <ul className="space-y-3">
                {pendingProfessionals.slice(0, 5).map((prof) => (
                  <li
                    key={prof.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                        {prof.user.name || "Sin nombre"}
                      </p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {prof.user.email}
                      </p>
                    </div>
                    <span className="ml-2 shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                      Pendiente
                    </span>
                  </li>
                ))}
                {pendingProfessionals.length > 5 && (
                  <li className="text-center text-sm text-slate-500 dark:text-slate-400">
                    +{pendingProfessionals.length - 5} más en Validaciones
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
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
                  <ValidationActions profileId={prof.id} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const professional = await prisma.professionalProfile.findUnique({
    where: { userId: session.user.id },
  });

  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      userId: session.user.id,
      status: "ACTIVE",
    },
  });

  const hasActiveSubscription = activeSubscription != null;

  const latestSubscription = activeSubscription
    ? activeSubscription
    : await prisma.subscription.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 1,
      });

  return (
    <div>
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

      {!hasActiveSubscription && professional?.isValidated && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
          <p className="text-sm font-medium">
            Tu suscripción no está activa.
          </p>
          <p className="mt-1 text-sm">
            Algunas funciones están limitadas.{" "}
            <Link
              href="/profesional/dashboard/suscripcion"
              className="underline hover:text-rose-900 dark:hover:text-rose-100"
            >
              Suscribite a un plan
            </Link>{" "}
            para desbloquear todo el potencial.
          </p>
          {latestSubscription && (
            <p className="mt-2 text-xs opacity-80">
              Estado actual: {latestSubscription.status.toLowerCase()} — plan{" "}
              {latestSubscription.plan.toLowerCase()}
            </p>
          )}
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
    </div>
  );
}

import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { CalendarDays } from "lucide-react";

export default async function AdminAppointmentsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "PROFESSIONAL") {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950">
          <CalendarDays className="h-5 w-5 text-rose-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Citas
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Visión global de todas las citas agendadas.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-slate-600 dark:text-slate-400">
          Esta sección está en construcción. Pronto verás acá el calendario y
          estado de citas de la plataforma.
        </p>
      </div>
    </div>
  );
}

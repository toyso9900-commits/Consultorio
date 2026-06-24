import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Users } from "lucide-react";

export default async function ProfessionalClientsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "PROFESSIONAL") {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-950">
          <Users className="h-5 w-5 text-teal-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Clientes
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Lista de pacientes que han contactado o agendado con vos.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-slate-600 dark:text-slate-400">
          No tenés clientes registrados todavía. Cuando un paciente te contacte,
          aparecerá acá.
        </p>
      </div>
    </div>
  );
}

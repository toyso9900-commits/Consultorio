import { auth } from "@/lib/auth";
import { BadgeCheck } from "lucide-react";

export default async function AdminValidationsPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
          <BadgeCheck className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Validaciones pendientes
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Revisá documentos y aprobá o rechazá profesionales.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-slate-600 dark:text-slate-400">
          Esta sección está en construcción. Pronto verás acá el flujo detallado
          de validación con documentos adjuntos.
        </p>
      </div>
    </div>
  );
}

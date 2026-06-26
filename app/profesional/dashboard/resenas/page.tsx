import { auth } from "@/lib/auth";
import { MessageSquare, Star } from "lucide-react";

export default async function AdminReviewsPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
          <Star className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Reseñas
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {isAdmin
              ? "Moderación de reseñas de pacientes hacia profesionales."
              : "Tus reseñas y valoraciones."}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <MessageSquare className="mx-auto mb-4 h-10 w-10 text-slate-300 dark:text-slate-700" />
        <p className="text-slate-600 dark:text-slate-400">
          El módulo de reseñas estará disponible próximamente.
        </p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Mientras tanto, los mensajes directos entre pacientes y profesionales siguen activos.
        </p>
      </div>
    </div>
  );
}

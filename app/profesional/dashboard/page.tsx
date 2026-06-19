export default function ProfessionalDashboardPage() {
  return (
    <main className="mx-auto max-w-5xl flex-1 px-6 py-12">
      <h1 className="text-3xl font-bold">Panel del Profesional</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Gestioná tu perfil público, pacientes y suscripciones.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold">Mi perfil público</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Aparecé en la Guía de Expertos.
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold">Validación</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Subí tu cédula o certificación para ser verificado.
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold">Suscripción</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Plan gratis: hasta 3 pacientes activos.
          </p>
        </div>
      </div>
    </main>
  );
}

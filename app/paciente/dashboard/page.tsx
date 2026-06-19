export default function PatientDashboardPage() {
  return (
    <main className="mx-auto max-w-5xl flex-1 px-6 py-12">
      <h1 className="text-3xl font-bold">Panel del Paciente</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Bienvenido a tu espacio de seguimiento.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold">Mi expediente</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Peso, altura, alergias y documentos médicos.
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold">Contador de calorías</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            1 registro diario gratis en la beta.
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold">Mis citas</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Próximas sesiones con tus especialistas.
          </p>
        </div>
      </div>
    </main>
  );
}

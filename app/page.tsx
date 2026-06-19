import Link from "next/link";
import { Heart, Search, Calendar, MessageCircle } from "lucide-react";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto flex max-w-5xl flex-col items-center px-6 py-24 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
          <Heart className="h-4 w-4" />
          Versión beta
        </div>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
          Tu salud, nutrición y entrenamiento en un solo lugar
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          Unifica tu expediente clínico y físico. Encuentra nutriólogos y
          entrenadores certificados en nuestra{" "}
          <strong>Guía de Expertos</strong> y recibe planes personalizados.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/register?rol=paciente"
            className="inline-flex h-12 items-center justify-center rounded-full bg-emerald-600 px-8 font-semibold text-white hover:bg-emerald-700"
          >
            Soy Paciente
          </Link>
          <Link
            href="/register?rol=profesional"
            className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 bg-white px-8 font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Soy Profesional
          </Link>
        </div>
      </section>

      <section className="bg-zinc-50 py-20 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            ¿Cómo funciona?
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900">
              <Search className="mb-4 h-8 w-8 text-emerald-600" />
              <h3 className="text-lg font-semibold">1. Explora</h3>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                Busca especialistas por ciudad, especialidad o modalidad en la{" "}
                <strong>Guía de Expertos</strong>.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900">
              <Calendar className="mb-4 h-8 w-8 text-emerald-600" />
              <h3 className="text-lg font-semibold">2. Agenda</h3>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                Solicita una cita y recibe un plan de alimentación o rutina hecho
                a tu medida.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900">
              <MessageCircle className="mb-4 h-8 w-8 text-emerald-600" />
              <h3 className="text-lg font-semibold">3. Sigue tu progreso</h3>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                Comunícate con tu experto y registra tus avances desde tu panel.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Guía de Expertos</h2>
        <p className="mx-auto mt-4 max-w-2xl text-zinc-600 dark:text-zinc-400">
          Descubre nutriólogos y entrenadores verificados. Compara perfiles,
          precios y modalidades antes de contratar.
        </p>
        <Link
          href="/guia-expertos"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-foreground px-8 font-semibold text-background hover:bg-zinc-800 dark:hover:bg-zinc-200"
        >
          Ver Guía de Expertos
        </Link>
      </section>
    </main>
  );
}

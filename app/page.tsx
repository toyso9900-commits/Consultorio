import Link from "next/link";
import Image from "next/image";
import { Search, Calendar, MessageCircle, Shield, Users, Heart } from "lucide-react";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden bg-white dark:bg-slate-950">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">
                <Heart className="h-4 w-4" />
                Versión beta
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-slate-100">
                Tu salud, nutrición y entrenamiento en un solo lugar
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
                Unifica tu expediente clínico y físico. Encontrá nutriólogos y
                entrenadores certificados en nuestra{" "}
                <strong className="text-indigo-600 dark:text-indigo-400">Guía de Expertos</strong>{" "}
                y recibí planes personalizados.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/register"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-indigo-600 px-8 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-indigo-300 dark:shadow-indigo-950"
                >
                  Soy Paciente
                </Link>
                <Link
                  href="/register?rol=profesional"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-slate-300 bg-white px-8 text-base font-semibold text-slate-900 transition-all hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-indigo-800 dark:hover:bg-indigo-950"
                >
                  Soy Profesional
                </Link>
              </div>
            </div>

            <div className="relative mx-auto max-w-md lg:max-w-full">
              <div className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-100 to-teal-100 shadow-2xl dark:from-indigo-900 dark:to-teal-900">
                <Image
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80"
                  alt="Profesionales de la salud y bienestar"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-white/90 p-4 shadow-lg backdrop-blur dark:bg-slate-900/90">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
                      <Users className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        +50 especialistas
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Verificados y listos para ayudarte
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20 dark:bg-slate-900/50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              ¿Cómo funciona?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
              Tres pasos simples para empezar a cuidar tu salud con
              profesionales.
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md dark:bg-slate-900">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
                <Search className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                1. Explorá
              </h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Buscá especialistas por ciudad, especialidad o modalidad en la{" "}
                <strong>Guía de Expertos</strong>.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md dark:bg-slate-900">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-950">
                <Calendar className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                2. Agendá
              </h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Solicitá una cita y recibí un plan de alimentación o rutina hecho
                a tu medida.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md dark:bg-slate-900">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
                <MessageCircle className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                3. Seguí tu progreso
              </h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Comunicate con tu experto y registrá tus avances desde tu panel.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-900">
                <Image
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80"
                  alt="Consulta médica digital"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Guía de Expertos
              </h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                Descubrí nutriólogos y entrenadores verificados. Compará
                perfiles, precios y modalidades antes de contratar.
              </p>
              <ul className="mt-8 space-y-4">
                <li className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 text-indigo-600" />
                  <span className="text-slate-700 dark:text-slate-300">
                    Profesionales validados por nuestro equipo.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Users className="mt-0.5 h-5 w-5 text-indigo-600" />
                  <span className="text-slate-700 dark:text-slate-300">
                    Perfiles con especialidad, ubicación y precios claros.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-5 w-5 text-indigo-600" />
                  <span className="text-slate-700 dark:text-slate-300">
                    Agenda integrada para online o presencial.
                  </span>
                </li>
              </ul>
              <Link
                href="/guia-expertos"
                className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-indigo-600 px-8 font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                Ver Guía de Expertos
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

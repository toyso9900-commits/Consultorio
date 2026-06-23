import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  Users,
  ArrowRight,
  Search,
  Calendar,
  MessageCircle,
  Shield,
  FileText,
} from "lucide-react";
import { MOCK_PROFESSIONALS } from "@/lib/professionals";

export default function Home() {
  const topExperts = MOCK_PROFESSIONALS.filter((p) => p.isPremium).slice(0, 10);

  const features = [
    {
      icon: Search,
      title: "Encontrá expertos",
      description:
        "Buscá nutriólogos y entrenadores certificados por especialidad, ubicación o modalidad.",
    },
    {
      icon: Calendar,
      title: "Agendá citas",
      description:
        "Reservá consultas online o presenciales y recibí recordatorios automáticos.",
    },
    {
      icon: FileText,
      title: "Unificá tu expediente",
      description:
        "Guardá tu historial clínico, físico, estudios y avances en un solo lugar.",
    },
    {
      icon: MessageCircle,
      title: "Comunicate con tu experto",
      description:
        "Mantené contacto directo con tu nutriólogo o entrenador durante tu plan.",
    },
    {
      icon: Shield,
      title: "Profesionales verificados",
      description:
        "Todos los especialistas pasan por un proceso de validación de credenciales.",
    },
  ];

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
                Unificá tu expediente clínico y físico. Conectá con nutriólogos
                y entrenadores certificados para recibir planes personalizados.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/register"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-indigo-600 px-8 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-indigo-300 dark:shadow-indigo-950"
                >
                  Registrarse
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-slate-300 bg-white px-8 text-base font-semibold text-slate-900 transition-all hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-indigo-800 dark:hover:bg-indigo-950"
                >
                  Iniciar sesión
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
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              ¿Qué hace la plataforma?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              Consultorio te conecta con profesionales de la salud y el
              bienestar para que cuides tu cuerpo y tu mente de forma integral.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md dark:bg-slate-900"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
                  <feature.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {feature.title}
                </h3>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Top 10 Expertos Destacados
              </h2>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Profesionales verificados con las mejores valoraciones.
              </p>
            </div>
            <Link
              href="/register"
              className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {topExperts.map((prof) => (
              <div
                key={prof.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800">
                  <Image
                    src={prof.image}
                    alt={prof.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    Destacado
                  </div>
                </div>
                <div className="p-5">
                  <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {prof.specialty}
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-slate-100">
                    {prof.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {prof.title}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    ${prof.price} MXN
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

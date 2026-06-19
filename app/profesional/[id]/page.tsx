import Link from "next/link";
import { ArrowLeft, Calendar, MessageCircle } from "lucide-react";

const MOCK_PROFESSIONALS: Record<
  string,
  {
    name: string;
    title: string;
    bio: string;
    specialty: string;
    location: string;
    modality: string;
    price: number;
  }
> = {
  "1": {
    name: "Dra. Ana López",
    title: "Nutrióloga clínica",
    bio:
      "Especialista en nutrición clínica y planes de alimentación personalizados. Más de 10 años de experiencia ayudando a pacientes a alcanzar sus objetivos de salud.",
    specialty: "Nutrición",
    location: "Ciudad de México",
    modality: "Online / Presencial",
    price: 800,
  },
  "2": {
    name: "Carlos Ruiz",
    title: "Entrenador personal",
    bio:
      "Diseño de rutinas de entrenamiento adaptadas a tu somatotipo y objetivos. Certificado en entrenamiento funcional y rehabilitación.",
    specialty: "Entrenamiento",
    location: "Guadalajara",
    modality: "Online",
    price: 600,
  },
  "3": {
    name: "Dra. María Torres",
    title: "Nutrióloga deportiva",
    bio:
      "Nutrióloga enfocada en rendimiento deportivo y composición corporal. Acompañamiento profesional para atletas y aficionados.",
    specialty: "Nutrición",
    location: "Monterrey",
    modality: "Presencial",
    price: 950,
  },
};

export default async function ProfessionalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const prof = MOCK_PROFESSIONALS[id];

  if (!prof) {
    return (
      <main className="mx-auto max-w-3xl flex-1 px-6 py-12">
        <p>Profesional no encontrado.</p>
        <Link href="/guia-expertos" className="text-emerald-600 hover:underline">
          Volver a la Guía de Expertos
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl flex-1 px-6 py-12">
      <Link
        href="/guia-expertos"
        className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a la Guía de Expertos
      </Link>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{prof.name}</h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              {prof.title}
            </p>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            {prof.specialty}
          </span>
        </div>

        <p className="mt-6 text-zinc-700 dark:text-zinc-300">{prof.bio}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
            <span className="text-sm text-zinc-500">Ubicación</span>
            <p className="font-medium">{prof.location}</p>
          </div>
          <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
            <span className="text-sm text-zinc-500">Modalidad</span>
            <p className="font-medium">{prof.modality}</p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <div>
            <span className="text-sm text-zinc-500">Precio por asesoría</span>
            <p className="text-2xl font-bold">${prof.price} MXN</p>
          </div>
          <div className="flex gap-3">
            <button
              disabled
              className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium opacity-60 dark:border-zinc-700"
            >
              <MessageCircle className="h-4 w-4" />
              Chat
            </button>
            <button
              disabled
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white opacity-60"
            >
              <Calendar className="h-4 w-4" />
              Agendar (próximamente)
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

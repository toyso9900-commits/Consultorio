import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, MessageCircle, Shield } from "lucide-react";

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
    image: string;
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
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80",
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
    image:
      "https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=800&q=80",
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
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=800&q=80",
  },
  "4": {
    name: "Luis Hernández",
    title: "Preparador físico",
    bio:
      "Especialista en preparación física para deportistas y personas que buscan mejorar su condición. Enfoque en técnica y prevención de lesiones.",
    specialty: "Entrenamiento",
    location: "Ciudad de México",
    modality: "Presencial",
    price: 700,
    image:
      "https://images.unsplash.com/photo-1597347343908-2937e7dcc560?auto=format&fit=crop&w=800&q=80",
  },
  "5": {
    name: "Dra. Sofía Méndez",
    title: "Nutrióloga pediátrica",
    bio:
      "Nutrióloga especializada en alimentación infantil y adolescente. Apoyo a familias para crear hábitos saludables desde la infancia.",
    specialty: "Nutrición",
    location: "Puebla",
    modality: "Online",
    price: 850,
    image:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=800&q=80",
  },
  "6": {
    name: "Diego Castillo",
    title: "Entrenador de fuerza",
    bio:
      "Entrenador especializado en hipertrofia y fuerza. Diseño de planes progresivos según tu nivel y disponibilidad.",
    specialty: "Entrenamiento",
    location: "Querétaro",
    modality: "Online / Presencial",
    price: 650,
    image:
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80",
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
        <p className="text-lg">Profesional no encontrado.</p>
        <Link
          href="/guia-expertos"
          className="mt-4 inline-block text-indigo-600 hover:underline"
        >
          Volver a la Guía de Expertos
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl flex-1 px-6 py-12">
      <Link
        href="/guia-expertos"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a la Guía de Expertos
      </Link>

      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="relative h-64 w-full bg-slate-100 dark:bg-slate-800">
          <Image
            src={prof.image}
            alt={prof.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/90 px-3 py-1 text-xs font-semibold">
              <Shield className="h-3 w-3" />
              {prof.specialty}
            </span>
            <h1 className="mt-2 text-3xl font-bold">{prof.name}</h1>
            <p className="text-white/90">{prof.title}</p>
          </div>
        </div>

        <div className="p-8">
          <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
            {prof.bio}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-800">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Ubicación
              </span>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                {prof.location}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-800">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Modalidad
              </span>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                {prof.modality}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-start justify-between gap-6 border-t border-slate-100 pt-8 dark:border-slate-800 sm:flex-row sm:items-center">
            <div>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Precio por asesoría
              </span>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                ${prof.price} MXN
              </p>
            </div>
            <div className="flex w-full gap-3 sm:w-auto">
              <button
                disabled
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 opacity-60 dark:border-slate-700 dark:text-slate-300 sm:flex-none"
              >
                <MessageCircle className="h-4 w-4" />
                Chat
              </button>
              <button
                disabled
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white opacity-60 sm:flex-none"
              >
                <Calendar className="h-4 w-4" />
                Agendar (próximamente)
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

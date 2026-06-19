import Link from "next/link";
import { MapPin, Video, User } from "lucide-react";

const MOCK_PROFESSIONALS = [
  {
    id: "1",
    name: "Dra. Ana López",
    title: "Nutrióloga clínica",
    specialty: "Nutrición",
    location: "Ciudad de México",
    modality: "Online / Presencial",
    price: 800,
    isPremium: true,
  },
  {
    id: "2",
    name: "Carlos Ruiz",
    title: "Entrenador personal",
    specialty: "Entrenamiento",
    location: "Guadalajara",
    modality: "Online",
    price: 600,
    isPremium: false,
  },
  {
    id: "3",
    name: "Dra. María Torres",
    title: "Nutrióloga deportiva",
    specialty: "Nutrición",
    location: "Monterrey",
    modality: "Presencial",
    price: 950,
    isPremium: true,
  },
];

export default function GuiaExpertosPage() {
  return (
    <main className="mx-auto max-w-5xl flex-1 px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Guía de Expertos</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Encontrá nutriólogos y entrenadores verificados.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar por nombre o especialidad..."
          className="rounded-lg border border-zinc-300 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800"
        />
        <select className="rounded-lg border border-zinc-300 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800">
          <option>Todas las ciudades</option>
          <option>Ciudad de México</option>
          <option>Guadalajara</option>
          <option>Monterrey</option>
        </select>
        <select className="rounded-lg border border-zinc-300 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800">
          <option>Todas las especialidades</option>
          <option>Nutrición</option>
          <option>Entrenamiento</option>
        </select>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_PROFESSIONALS.map((prof) => (
          <Link
            key={prof.id}
            href={`/profesional/${prof.id}`}
            className="group rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <User className="h-6 w-6 text-zinc-500" />
              </div>
              {prof.isPremium && (
                <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  Destacado
                </span>
              )}
            </div>
            <h2 className="mt-4 text-lg font-semibold group-hover:text-emerald-600">
              {prof.name}
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{prof.title}</p>
            <div className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {prof.location}
              </div>
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                {prof.modality}
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <span className="font-semibold">${prof.price} MXN</span>
              <span className="text-sm text-emerald-600 group-hover:underline">
                Ver perfil
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

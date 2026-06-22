import Link from "next/link";
import Image from "next/image";
import { MapPin, Video, Star } from "lucide-react";

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
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&h=400&q=80",
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
    image:
      "https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=400&h=400&q=80",
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
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&h=400&q=80",
  },
  {
    id: "4",
    name: "Luis Hernández",
    title: "Preparador físico",
    specialty: "Entrenamiento",
    location: "Ciudad de México",
    modality: "Presencial",
    price: 700,
    isPremium: false,
    image:
      "https://images.unsplash.com/photo-1597347343908-2937e7dcc560?auto=format&fit=crop&w=400&h=400&q=80",
  },
  {
    id: "5",
    name: "Dra. Sofía Méndez",
    title: "Nutrióloga pediátrica",
    specialty: "Nutrición",
    location: "Puebla",
    modality: "Online",
    price: 850,
    isPremium: true,
    image:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=400&h=400&q=80",
  },
  {
    id: "6",
    name: "Diego Castillo",
    title: "Entrenador de fuerza",
    specialty: "Entrenamiento",
    location: "Querétaro",
    modality: "Online / Presencial",
    price: 650,
    isPremium: false,
    image:
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=400&h=400&q=80",
  },
];

export default function GuiaExpertosPage() {
  return (
    <main className="mx-auto max-w-6xl flex-1 px-6 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Guía de Expertos
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          Encontrá nutriólogos y entrenadores verificados. Compará perfiles,
          precios y modalidades antes de contratar.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
        <input
          type="text"
          placeholder="Buscar por nombre o especialidad..."
          className="w-full max-w-xs rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 sm:w-auto"
        />
        <select className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
          <option>Todas las ciudades</option>
          <option>Ciudad de México</option>
          <option>Guadalajara</option>
          <option>Monterrey</option>
          <option>Puebla</option>
          <option>Querétaro</option>
        </select>
        <select className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
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
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800">
              <Image
                src={prof.image}
                alt={prof.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              {prof.isPremium && (
                <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  <Star className="h-3 w-3 fill-current" />
                  Destacado
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span className="rounded-full bg-indigo-50 px-2 py-1 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {prof.specialty}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">
                {prof.name}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {prof.title}
              </p>
              <div className="mt-4 space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {prof.location}
                </div>
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  {prof.modality}
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  ${prof.price} MXN
                </span>
                <span className="text-sm font-medium text-indigo-600 group-hover:underline dark:text-indigo-400">
                  Ver perfil
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

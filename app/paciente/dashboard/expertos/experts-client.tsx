"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Video, Star, Search, SlidersHorizontal } from "lucide-react";
import { Professional } from "@/lib/professionals";
import { useI18n } from "@/lib/i18n/client";

const SPECIALTIES = [
  { value: "Todas", labelKey: "all" as const },
  { value: "Nutrición", labelKey: "nutrition" as const },
  { value: "Entrenamiento", labelKey: "training" as const },
  { value: "Nutrición y Entrenamiento", labelKey: "both" as const },
];

interface PatientExpertsPageProps {
  professionals: Professional[];
}

export function PatientExpertsClient({ professionals }: PatientExpertsPageProps) {
  const { dictionary } = useI18n();
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState("Todas");

  const filtered = useMemo(() => {
    return professionals.filter((prof) => {
      const matchesName = prof.name
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesSpecialty =
        specialty === "Todas" || prof.specialty === specialty;
      return matchesName && matchesSpecialty;
    });
  }, [query, specialty, professionals]);

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/paciente/dashboard"
          className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          {dictionary.patientExperts.backToDashboard}
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-slate-100">
          {dictionary.patientExperts.title}
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {dictionary.patientExperts.description}
        </p>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={dictionary.patientExperts.searchPlaceholder}
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 sm:w-auto"
          />
        </div>
        <div className="relative">
          <SlidersHorizontal className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-8 text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            {SPECIALTIES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.labelKey === "all"
                  ? dictionary.patientExperts.allSpecialties
                  : dictionary.patientExperts.specialties[s.labelKey]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-slate-600 dark:text-slate-400">
          {dictionary.patientExperts.noResults}
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((prof) => (
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
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    <Star className="h-3 w-3 fill-current" />
                    {dictionary.patientExperts.featured}
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
                    {dictionary.patientExperts.viewProfile}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Video, Search, Star } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Professional } from "@/lib/professionals";
import { useI18n } from "@/lib/i18n/client";

type TypeFilter = "all" | "nutritionist" | "trainer";

const TYPE_FILTERS: TypeFilter[] = ["all", "nutritionist", "trainer"];

const NUTRITION_SPECIALTIES = ["Nutrición", "Nutrición y Entrenamiento"];
const TRAINING_SPECIALTIES = ["Entrenamiento", "Nutrición y Entrenamiento"];

interface PatientExpertsPageProps {
  professionals: Professional[];
}

export function PatientExpertsClient({ professionals }: PatientExpertsPageProps) {
  const { dictionary } = useI18n();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const filtered = useMemo(() => {
    return professionals.filter((prof) => {
      const matchesName = prof.name
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesType =
        typeFilter === "all" ||
        (typeFilter === "nutritionist" &&
          NUTRITION_SPECIALTIES.includes(prof.specialty)) ||
        (typeFilter === "trainer" &&
          TRAINING_SPECIALTIES.includes(prof.specialty));
      return matchesName && matchesType;
    });
  }, [query, typeFilter, professionals]);

  const clearFilters = () => {
    setQuery("");
    setTypeFilter("all");
  };

  return (
    <div className="-m-4 min-h-[calc(100vh-4rem)] bg-stone-50 p-4 dark:bg-stone-900 sm:-m-6 sm:p-6">
      <div className="mb-8">
        <Link
          href="/paciente/dashboard"
          className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
        >
          {dictionary.patientExperts.backToDashboard}
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">
          {dictionary.patientExperts.title}
        </h1>
        <p className="mt-2 text-stone-600 dark:text-stone-400">
          {dictionary.patientExperts.description}
        </p>
      </div>

      <div className="mb-8 flex flex-wrap items-end gap-4">
        <div className="relative w-full min-w-56 flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={dictionary.patientExperts.searchPlaceholder}
            className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-9 pr-4 text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
          />
        </div>
        <div>
          <label
            htmlFor="expert-type-filter"
            className="mb-1 block text-xs font-medium text-stone-500 dark:text-stone-400"
          >
            {dictionary.patientExperts.typeFilterLabel}
          </label>
          <select
            id="expert-type-filter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            className="rounded-xl border border-stone-200 bg-white py-2.5 pl-4 pr-8 text-sm text-stone-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
          >
            {TYPE_FILTERS.map((value) => (
              <option key={value} value={value}>
                {dictionary.patientExperts.typeOptions[value]}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={clearFilters}
          className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-600 shadow-sm transition-colors hover:bg-stone-100 hover:text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 dark:hover:text-stone-100"
        >
          {dictionary.patientExperts.clearFilters}
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-stone-600 dark:text-stone-400">
          {dictionary.patientExperts.noResults}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((prof) => {
            const profileHref = `/profesional/${prof.id}`;
            const messageHref = `/paciente/dashboard/mensajes?profesional=${encodeURIComponent(prof.id)}&nombre=${encodeURIComponent(prof.name)}`;
            return (
              <div
                key={prof.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-stone-700/60 dark:bg-stone-800/60"
              >
                <div className="relative h-56 w-full bg-stone-100 dark:bg-stone-700">
                  <Image
                    src={prof.image}
                    alt={prof.name}
                    fill
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-stone-950/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                    {prof.specialty}
                  </span>
                  {prof.isPremiumActive && (
                    <span className="absolute right-3 top-3 rounded-full bg-emerald-600/90 px-2.5 py-1 text-xs font-semibold text-white">
                      {dictionary.patientExperts.featured}
                    </span>
                  )}
                </div>
                <div className="flex flex-grow flex-col gap-4 p-5">
                  <div>
                    <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                      {prof.name}
                    </h2>
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                      {prof.title}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 text-sm text-stone-600 dark:text-stone-400">
                    {prof.reviewCount > 0 && (
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium text-stone-900 dark:text-stone-100">
                          {prof.averageRating.toFixed(1)}
                        </span>
                        <span>
                          {dictionary.patientExperts.ratingCount.replace(
                            "{count}",
                            String(prof.reviewCount)
                          )}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {prof.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      {prof.modality}
                    </div>
                  </div>
                  <div className="mt-auto grid grid-cols-2 gap-3">
                    <Link
                      href={profileHref}
                      className="rounded-xl bg-emerald-600 px-3 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-emerald-700 dark:hover:bg-emerald-500"
                    >
                      {dictionary.patientExperts.viewProfile}
                    </Link>
                    <Link
                      href={messageHref}
                      className="rounded-xl border border-stone-300 px-3 py-2 text-center text-sm font-semibold text-stone-600 transition-colors hover:border-emerald-500 hover:text-emerald-700 dark:border-stone-600 dark:text-stone-300 dark:hover:border-emerald-500 dark:hover:text-emerald-300"
                    >
                      {dictionary.patientExperts.sendMessage}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

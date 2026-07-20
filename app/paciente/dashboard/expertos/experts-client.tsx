"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Search, Star } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Professional } from "@/lib/professionals";
import { useI18n } from "@/lib/i18n/client";

type TypeFilter = "all" | "nutritionist" | "trainer" | "both";

const TYPE_FILTERS: TypeFilter[] = ["all", "nutritionist", "trainer", "both"];

const NUTRITION_SPECIALTIES = ["Nutrición", "Nutrición y Entrenamiento"];
const TRAINING_SPECIALTIES = ["Entrenamiento", "Nutrición y Entrenamiento"];

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&h=400&q=80";

interface PatientExpertsClientProps {
  professionals: Professional[];
}

export function PatientExpertsClient({
  professionals,
}: PatientExpertsClientProps) {
  const { dictionary } = useI18n();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("both");
  const [selectedId, setSelectedId] = useState<string | null>(
    professionals[0]?.id ?? null
  );

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
          TRAINING_SPECIALTIES.includes(prof.specialty)) ||
        (typeFilter === "both" &&
          prof.specialty === "Nutrición y Entrenamiento");
      return matchesName && matchesType;
    });
  }, [query, typeFilter, professionals]);

  const clearFilters = () => {
    setQuery("");
    setTypeFilter("both");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] text-white">
      <div className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">
          {dictionary.patientExperts.title}
        </h1>
        <p className="mt-2 text-white/70">
          {dictionary.patientExperts.description}
        </p>
      </div>

      <div className="mb-8 flex flex-wrap items-end gap-4">
        <div className="relative w-full min-w-56 flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={dictionary.patientExperts.searchPlaceholder}
            aria-label={dictionary.patientExperts.searchPlaceholder}
            className="w-full rounded-xl border border-[#3a3a3a] bg-[#2c2c2c] py-2.5 pl-9 pr-4 text-white placeholder:text-white/50 focus:border-[#55eb55] focus:outline-none focus:ring-1 focus:ring-[#55eb55]"
          />
        </div>
        <div>
          <label
            htmlFor="expert-type-filter"
            className="mb-1 block text-xs font-medium text-white/70"
          >
            {dictionary.patientExperts.typeFilterLabel}
          </label>
          <select
            id="expert-type-filter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            className="rounded-xl border border-[#3a3a3a] bg-[#2c2c2c] py-2.5 pl-4 pr-8 text-sm text-white focus:border-[#55eb55] focus:outline-none focus:ring-1 focus:ring-[#55eb55]"
          >
            {TYPE_FILTERS.map((value) => (
              <option
                key={value}
                value={value}
                className="bg-[#2c2c2c] text-white"
              >
                {dictionary.patientExperts.typeOptions[value]}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={clearFilters}
          className="rounded-xl border border-[#3a3a3a] bg-[#2c2c2c] px-4 py-2.5 text-sm font-medium text-white/90 transition-colors hover:border-[#55eb55]/50 hover:text-[#55eb55]"
        >
          {dictionary.patientExperts.clearFilters}
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-white/70">
          {dictionary.patientExperts.noResults}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {filtered.map((prof) => {
            const isSelected = selectedId === prof.id;
            const profileHref = `/profesional/${prof.id}`;
            const messageHref = `/paciente/dashboard/mensajes?profesional=${encodeURIComponent(
              prof.id
            )}&nombre=${encodeURIComponent(prof.name)}`;

            return (
              <article
                key={prof.id}
                tabIndex={0}
                onClick={() => setSelectedId(prof.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedId(prof.id);
                  }
                }}
                className={[
                  "group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-[#2c2c2c] shadow-lg transition-all",
                  "hover:shadow-[0_0_16px_rgba(85,235,85,0.15)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#55eb55] focus-visible:ring-offset-2 focus-visible:ring-offset-[#212121]",
                  isSelected
                    ? "border-[#55eb55] shadow-[0_0_20px_rgba(85,235,85,0.35)]"
                    : "border-transparent",
                ].join(" ")}
              >
                <div className="relative h-56 w-full bg-[#3a3a3a]">
                  <Image
                    src={prof.image || FALLBACK_IMAGE}
                    alt={prof.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-1 flex-col gap-4 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#3a3a3a] px-2.5 py-1 text-xs font-semibold text-white/90">
                      {prof.specialty}
                    </span>
                    {(prof.isPremiumActive || prof.isPremium) && (
                      <span className="rounded-full bg-[#55eb55]/15 px-2.5 py-1 text-xs font-semibold text-[#55eb55]">
                        {dictionary.patientExperts.featured}
                      </span>
                    )}
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {prof.name}
                    </h2>
                    <p className="text-sm text-white/60">
                      {prof.title || prof.specialty}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 text-sm text-white/70">
                    {prof.reviewCount > 0 ? (
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium text-white">
                          {prof.averageRating.toFixed(1)}
                        </span>
                        <span>
                          {dictionary.patientExperts.ratingCount.replace(
                            "{count}",
                            String(prof.reviewCount)
                          )}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-white/50">
                        <Star className="h-4 w-4" />
                        <span>{dictionary.patientExperts.noRating}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {prof.location} {prof.modality}
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto grid grid-cols-2 gap-3 pt-4">
                    <Link
                      href={profileHref}
                      className="rounded-xl bg-[#55eb55] px-3 py-2.5 text-center text-sm font-semibold text-[#0a0a0a] shadow-[0_0_12px_rgba(85,235,85,0.45)] transition-all hover:shadow-[0_0_20px_rgba(85,235,85,0.65)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#55eb55] focus-visible:ring-offset-2 focus-visible:ring-offset-[#2c2c2c]"
                    >
                      {dictionary.patientExperts.viewProfile}
                    </Link>
                    <Link
                      href={messageHref}
                      className="rounded-xl border border-[#55eb55]/30 bg-[#2c2c2c] px-3 py-2.5 text-center text-sm font-semibold text-white transition-all hover:border-[#55eb55]/60 hover:bg-[#55eb55]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#55eb55] focus-visible:ring-offset-2 focus-visible:ring-offset-[#2c2c2c]"
                    >
                      {dictionary.patientExperts.sendMessage}
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

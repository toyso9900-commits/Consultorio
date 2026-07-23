"use client";

import { useRouter } from "next/navigation";
import { Apple, Dumbbell, User } from "lucide-react";

export type ProfessionalSummary = {
  id: string;
  name: string;
  specialty: string | null;
  title: string | null;
  image: string | null;
};

type ProfessionalSelectorLabels = {
  activeProfessional: string;
};

export function SpecialtyIcon({
  specialty,
}: {
  specialty: string | null;
}) {
  switch (specialty) {
    case "NUTRITION":
      return (
        <span
          className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400"
          aria-hidden="true"
        >
          <Apple className="h-3 w-3" />
        </span>
      );
    case "TRAINING":
      return (
        <span
          className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/15 text-amber-400"
          aria-hidden="true"
        >
          <Dumbbell className="h-3 w-3" />
        </span>
      );
    case "BOTH":
      return (
        <span
          className="relative inline-flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-violet-500/15"
          aria-hidden="true"
        >
          <Apple className="relative z-10 h-2.5 w-2.5 text-emerald-400" />
          <Dumbbell className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 text-amber-400" />
        </span>
      );
    default:
      return (
        <span
          className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white/60"
          aria-hidden="true"
        >
          <User className="h-3 w-3" />
        </span>
      );
  }
}

type ProfessionalSelectorProps = {
  professionals: ProfessionalSummary[];
  selectedId: string;
  labels: ProfessionalSelectorLabels;
};

export function ProfessionalSelector({
  professionals,
  selectedId,
  labels,
}: ProfessionalSelectorProps) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          {labels.activeProfessional}
        </h2>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {professionals.map((professional) => {
          const isSelected = professional.id === selectedId;
          return (
            <button
              key={professional.id}
              type="button"
              onClick={() => {
                router.push(
                  `/paciente/dashboard/rutina?professional=${encodeURIComponent(
                    professional.id
                  )}`
                );
              }}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isSelected
                  ? "bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.35)]"
                  : "bg-[#292524] text-white/80 hover:bg-[#34302c] hover:text-white"
              }`}
            >
              <SpecialtyIcon specialty={professional.specialty} />
              <span className="uppercase tracking-wide">{professional.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

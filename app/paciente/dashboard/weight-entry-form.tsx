"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { recordWeight } from "@/lib/weight";
import type { Dictionary } from "@/lib/i18n/server";

interface WeightEntryFormProps {
  patientProfileId: string;
  dictionary: Dictionary;
}

export function WeightEntryForm({
  patientProfileId,
  dictionary,
}: WeightEntryFormProps) {
  const [weight, setWeight] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const value = Number(weight);
    if (Number.isNaN(value) || value <= 0) {
      setError(dictionary.patientHome.weightInvalid);
      return;
    }

    startTransition(async () => {
      try {
        await recordWeight(patientProfileId, value);
        setWeight("");
      } catch {
        setError(dictionary.patientHome.weightError);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-2">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={20}
            max={500}
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={dictionary.patientHome.addWeight}
            disabled={isPending}
            className="w-28 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <button
            type="submit"
            disabled={isPending || weight === ""}
            className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
            aria-label={dictionary.patientHome.addWeight}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    </form>
  );
}

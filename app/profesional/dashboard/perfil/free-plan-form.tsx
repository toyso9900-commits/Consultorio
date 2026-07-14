"use client";

import { useState, useTransition } from "react";
import { updateFreePlan, UpdateFreePlanData } from "./actions";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n/client";

interface FreePlanFormProps {
  defaultValues: {
    freePlanTitle: string;
    freePlanContent: string;
  };
}

export function FreePlanForm({ defaultValues }: FreePlanFormProps) {
  const { dictionary } = useI18n();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(defaultValues);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const payload: UpdateFreePlanData = {
        freePlanTitle: form.freePlanTitle || null,
        freePlanContent: form.freePlanContent || null,
      };

      const result = await updateFreePlan(payload);

      if (result.success) {
        toast.success(dictionary.professionalProfile.updated);
      } else {
        toast.error(result.error || dictionary.professionalProfile.updateError);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {dictionary.professionalProfile.freePlanHelp}
      </p>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {dictionary.professionalProfile.freePlanTitleLabel}
        </label>
        <input
          type="text"
          name="freePlanTitle"
          value={form.freePlanTitle}
          onChange={handleChange}
          maxLength={120}
          placeholder={dictionary.professionalProfile.freePlanTitlePlaceholder}
          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {dictionary.professionalProfile.freePlanContentLabel}
        </label>
        <textarea
          name="freePlanContent"
          value={form.freePlanContent}
          onChange={handleChange}
          rows={8}
          maxLength={5000}
          placeholder={dictionary.professionalProfile.freePlanContentPlaceholder}
          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
      >
        {isPending ? dictionary.professionalProfile.saving : dictionary.professionalProfile.save}
      </button>
    </form>
  );
}

"use client";

import { useState, useTransition } from "react";
import { updatePatientProfile } from "./actions";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n/client";

interface PatientProfileFormProps {
  userId: string;
  defaultValues: {
    name: string;
    height: string;
    weight: string;
    gender: string;
  };
}

export function PatientProfileForm({ userId, defaultValues }: PatientProfileFormProps) {
  const { dictionary } = useI18n();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(defaultValues);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updatePatientProfile({
        userId,
        name: form.name,
        height: Number(form.height),
        weight: Number(form.weight),
        gender: form.gender,
      });

      if (result.success) {
        toast.success(dictionary.patientProfile.updated);
      } else {
        toast.error(result.error || dictionary.patientProfile.updateError);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {dictionary.patientProfile.fullName}
        </label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {dictionary.patientProfile.height}
          </label>
          <input
            type="number"
            name="height"
            value={form.height}
            onChange={handleChange}
            required
            min={50}
            max={300}
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {dictionary.patientProfile.weight}
          </label>
          <input
            type="number"
            name="weight"
            value={form.weight}
            onChange={handleChange}
            required
            min={20}
            max={500}
            step="0.1"
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {dictionary.patientProfile.gender}
        </label>
        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="male">{dictionary.gender.male}</option>
          <option value="female">{dictionary.gender.female}</option>
          <option value="non-binary">{dictionary.gender.nonBinary}</option>
          <option value="prefer-not-to-say">{dictionary.gender.preferNotToSay}</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
      >
        {isPending ? dictionary.patientProfile.saving : dictionary.patientProfile.save}
      </button>
    </form>
  );
}

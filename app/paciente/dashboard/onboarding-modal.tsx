"use client";

import { useState, useTransition } from "react";
import { savePatientOnboarding, SaveOnboardingResult } from "./actions";

interface OnboardingModalProps {
  userId: string;
}

export function OnboardingModal({ userId }: OnboardingModalProps) {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const data = {
      name: formData.get("name") as string,
      gender: formData.get("gender") as string,
      height: Number(formData.get("height")),
      weight: Number(formData.get("weight")),
    };

    startTransition(async () => {
      const result: SaveOnboardingResult = await savePatientOnboarding(
        userId,
        data
      );

      if (!result.success) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Completá tu perfil
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Antes de continuar necesitamos conocer unos datos básicos para
            personalizar tu experiencia.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="onboarding-name"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Nombre completo
            </label>
            <input
              id="onboarding-name"
              name="name"
              type="text"
              required
              minLength={2}
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Juan Pérez"
            />
          </div>

          <div>
            <label
              htmlFor="onboarding-gender"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Sexo / Género
            </label>
            <select
              id="onboarding-gender"
              name="gender"
              required
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="">Seleccioná una opción</option>
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
              <option value="non-binary">No binario</option>
              <option value="prefer-not-to-say">Prefiero no decirlo</option>
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="onboarding-height"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Estatura (cm)
              </label>
              <input
                id="onboarding-height"
                name="height"
                type="number"
                required
                min={50}
                max={300}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                placeholder="170"
              />
            </div>
            <div>
              <label
                htmlFor="onboarding-weight"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Peso (kg)
              </label>
              <input
                id="onboarding-weight"
                name="weight"
                type="number"
                required
                min={20}
                max={500}
                step="0.1"
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                placeholder="70"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-indigo-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
          >
            {isPending ? "Guardando..." : "Guardar y continuar"}
          </button>
        </form>
      </div>
    </div>
  );
}

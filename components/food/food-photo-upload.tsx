"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import { Camera, Upload } from "lucide-react";
import { analyzeFoodImage, type AnalyzeFoodImageResult } from "@/app/paciente/dashboard/nutricion/actions";
import type { Dictionary } from "@/lib/i18n/server";

interface FoodPhotoUploadProps {
  dictionary: Dictionary;
  onAnalysis: (result: Extract<AnalyzeFoodImageResult, { success: true }>) => void;
}

export function FoodPhotoUpload({ dictionary, onAnalysis }: FoodPhotoUploadProps) {
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError(null);

    if (!file) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
  }

  function handleAnalyze() {
    const input = inputRef.current;
    const file = input?.files?.[0];

    if (!file) {
      setError(dictionary.nutrition.errorInvalidFile);
      return;
    }

    setError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("image", file);

      const result = await analyzeFoodImage(formData);

      if (!result.success) {
        setError(
          (dictionary.nutrition[result.error as keyof typeof dictionary.nutrition] as string | undefined) ??
            dictionary.errors.generic
        );
        return;
      }

      onAnalysis(result);
    });
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {dictionary.nutrition.uploadLabel}
      </label>

      <input
        ref={inputRef}
        type="file"
        name="image"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        onChange={handleFileChange}
        disabled={isPending}
        className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-emerald-700 disabled:opacity-60 dark:text-slate-400"
      />

      {preview && (
        <div className="relative h-64 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <Image
            src={preview}
            alt="Selected meal"
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleAnalyze}
        disabled={isPending || !preview}
        className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
      >
        {isPending ? (
          <>
            <Upload className="h-4 w-4 animate-bounce" />
            {dictionary.nutrition.analyzing}
          </>
        ) : (
          <>
            <Camera className="h-4 w-4" />
            {dictionary.nutrition.analyze}
          </>
        )}
      </button>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        {dictionary.nutrition.playgroundHint}
      </p>
    </div>
  );
}

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
    <div className="flex flex-col items-center gap-4">
      <input
        ref={inputRef}
        type="file"
        name="image"
        id="food-photo-input"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        onChange={handleFileChange}
        disabled={isPending}
        className="sr-only"
      />

      {preview ? (
        <div className="relative h-64 w-full overflow-hidden rounded-xl bg-[#212121]">
          <Image
            src={preview}
            alt={dictionary.nutrition.uploadLabel}
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      ) : (
        <label
          htmlFor="food-photo-input"
          className="flex h-64 w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-white/10 bg-[#212121] p-6 text-center transition-colors hover:border-[#55eb55]/50 hover:bg-[#262626] focus-within:border-[#55eb55] focus-within:ring-1 focus-within:ring-[#55eb55]"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2c2c2c]">
            <Camera className="h-7 w-7 text-[#55eb55]" />
          </div>
          <span className="text-sm font-medium text-white/90">
            {dictionary.nutrition.uploadLabel}
          </span>
          <span className="text-xs text-white/50">
            JPG, PNG, WebP · max 5 MB
          </span>
        </label>
      )}

      {error && (
        <p className="w-full rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleAnalyze}
        disabled={isPending || !preview}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#55eb55] px-4 py-3 font-semibold text-black transition-colors hover:bg-[#45db45] disabled:opacity-60"
      >
        {isPending ? (
          <>
            <Upload className="h-5 w-5 animate-bounce" />
            {dictionary.nutrition.analyzing}
          </>
        ) : (
          <>
            <Camera className="h-5 w-5" />
            {dictionary.nutrition.analyze}
          </>
        )}
      </button>

      <p className="text-xs text-white/40">
        {dictionary.nutrition.playgroundHint}
      </p>
    </div>
  );
}

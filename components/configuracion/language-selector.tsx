"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n/client";
import { updateUserLanguage } from "@/lib/actions/preferences";
import type { Locale } from "@/lib/i18n/server";

interface LanguageSelectorProps {
  userId: string;
  currentLocale: Locale;
}

export function LanguageSelector({ userId, currentLocale }: LanguageSelectorProps) {
  const { dictionary, locale } = useI18n();
  const [isPending, startTransition] = useTransition();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const next = event.target.value as Locale;
    if (next === locale) return;

    startTransition(async () => {
      const result = await updateUserLanguage(userId, next);
      if (result.success) {
        toast.success(next === "en" ? "Language updated" : "Idioma actualizado");
      } else {
        toast.error(result.error || dictionary.errors.generic);
      }
    });
  };

  return (
    <select
      defaultValue={currentLocale}
      onChange={handleChange}
      disabled={isPending}
      className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      aria-label={dictionary.settings.language}
    >
      <option value="es">Español</option>
      <option value="en">English</option>
    </select>
  );
}

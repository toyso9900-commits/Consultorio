"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/lib/i18n/client";
import type { Locale, Dictionary } from "@/lib/i18n/server";

interface ProvidersProps {
  children: React.ReactNode;
  locale: Locale;
  dictionary: Dictionary;
}

export function Providers({ children, locale, dictionary }: ProvidersProps) {
  return (
    <SessionProvider basePath="/api/auth" refetchInterval={0}>
      <I18nProvider locale={locale} dictionary={dictionary}>
        <ThemeProvider attribute="class">{children}</ThemeProvider>
      </I18nProvider>
    </SessionProvider>
  );
}

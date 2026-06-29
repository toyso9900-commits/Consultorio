"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { dictionaries, type Locale, type Dictionary } from "./dictionaries";

interface I18nContextValue {
  locale: Locale;
  dictionary: Dictionary;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

interface I18nProviderProps {
  locale: Locale;
  dictionary: Dictionary;
  children: ReactNode;
}

export function I18nProvider({
  locale: initialLocale,
  dictionary: initialDictionary,
  children,
}: I18nProviderProps) {
  const [state, setState] = useState({
    locale: initialLocale,
    dictionary: initialDictionary,
  });

  const setLocale = useCallback((nextLocale: Locale) => {
    setState({ locale: nextLocale, dictionary: dictionaries[nextLocale] });
  }, []);

  return (
    <I18nContext.Provider value={{ ...state, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

import { es } from "./es";
import { en } from "./en";

export type Locale = "es" | "en";

export interface Dictionary {
  common: Record<keyof typeof es.common, string>;
  meta: Record<keyof typeof es.meta, string>;
  header: Record<keyof typeof es.header, string>;
  footer: Record<keyof typeof es.footer, string>;
  userMenu: Record<keyof typeof es.userMenu, string>;
  nav: Record<keyof typeof es.nav, string>;
  settings: {
    title: string;
    appearance: string;
    language: string;
    theme: Record<keyof typeof es.settings.theme, string>;
    themeDescription: string;
    languageDescription: string;
  };
  dashboard: Record<keyof typeof es.dashboard, string>;
  roles: Record<keyof typeof es.roles, string>;
  landing: {
    badge: string;
    headline: string;
    description: string;
    register: string;
    login: string;
    specialists: string;
    specialistsLabel: string;
    featuresTitle: string;
    featuresDescription: string;
    expertsTitle: string;
    expertsDescription: string;
    viewAll: string;
    featured: string;
    features: Record<
      keyof typeof es.landing.features,
      { title: string; description: string }
    >;
  };
  auth: Record<keyof typeof es.auth, string>;
  errors: Record<keyof typeof es.errors, string>;
}

export const dictionaries: Record<Locale, Dictionary> = { es, en };

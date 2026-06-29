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
  patientHome: Record<keyof typeof es.patientHome, string>;
  patientExperts: {
    backToDashboard: string;
    title: string;
    description: string;
    searchPlaceholder: string;
    allSpecialties: string;
    noResults: string;
    featured: string;
    viewProfile: string;
    specialties: Record<keyof typeof es.patientExperts.specialties, string>;
  };
  patientDocuments: Record<keyof typeof es.patientDocuments, string>;
  patientAppointments: Record<keyof typeof es.patientAppointments, string>;
  patientMessages: Record<keyof typeof es.patientMessages, string>;
  patientProfile: Record<keyof typeof es.patientProfile, string>;
  onboarding: Record<keyof typeof es.onboarding, string>;
  gender: Record<keyof typeof es.gender, string>;
}

export const dictionaries: Record<Locale, Dictionary> = { es, en };

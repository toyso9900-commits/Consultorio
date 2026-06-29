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
    noFeatured: string;
    noFeaturedDescription: string;
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
    ratingCount: string;
    viewProfile: string;
    specialties: Record<keyof typeof es.patientExperts.specialties, string>;
  };
  patientDocuments: Record<keyof typeof es.patientDocuments, string>;
  patientAppointments: Record<keyof typeof es.patientAppointments, string>;
  patientMessages: Record<keyof typeof es.patientMessages, string>;
  patientProfile: Record<keyof typeof es.patientProfile, string>;
  onboarding: Record<keyof typeof es.onboarding, string>;
  gender: Record<keyof typeof es.gender, string>;
  professionalDashboard: Record<keyof typeof es.professionalDashboard, string>;
  adminDashboard: Record<keyof typeof es.adminDashboard, string>;
  adminUsers: Record<keyof typeof es.adminUsers, string>;
  adminProfessionals: Record<keyof typeof es.adminProfessionals, string>;
  adminSubscriptions: Record<keyof typeof es.adminSubscriptions, string>;
  adminValidations: Record<keyof typeof es.adminValidations, string>;
  adminAppointments: Record<keyof typeof es.adminAppointments, string>;
  adminReviews: Record<keyof typeof es.adminReviews, string>;
  professionalProfile: Record<keyof typeof es.professionalProfile, string>;
  professionalClients: Record<keyof typeof es.professionalClients, string>;
  professionalMessages: Record<keyof typeof es.professionalMessages, string>;
  subscription: {
    title: string;
    subtitle: string;
    testMode: string;
    mostPopular: string;
    freePlanName: string;
    freePlanDescription: string;
    freePlanPeriod: string;
    freePlanCta: string;
    premiumPlanName: string;
    premiumPlanDescription: string;
    premiumPlanPeriod: string;
    premiumPlanCta: string;
    proPlanName: string;
    proPlanDescription: string;
    proPlanPeriod: string;
    proPlanCta: string;
    freeFeatures: readonly string[];
    premiumFeatures: readonly string[];
    proFeatures: readonly string[];
    processing: string;
    paymentSimulatorTitle: string;
    paymentSimulatorDescription: string;
    paymentSuccess: string;
    subscriptionConfirmation: string;
    paymentError: string;
  };
  specialties: Record<keyof typeof es.specialties, string>;
  modalities: Record<keyof typeof es.modalities, string>;
  userActions: Record<keyof typeof es.userActions, string>;
  validationActions: Record<keyof typeof es.validationActions, string>;
  chart: Record<keyof typeof es.chart, string>;
}

export const dictionaries: Record<Locale, Dictionary> = { es, en };

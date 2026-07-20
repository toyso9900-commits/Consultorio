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
  nutrition: Record<keyof typeof es.nutrition, string>;
  patientExperts: {
    backToDashboard: string;
    title: string;
    description: string;
    searchPlaceholder: string;
    typeFilterLabel: string;
    typeOptions: Record<keyof typeof es.patientExperts.typeOptions, string>;
    clearFilters: string;
    noResults: string;
    featured: string;
    ratingCount: string;
    viewProfile: string;
    sendMessage: string;
    specialties: Record<keyof typeof es.patientExperts.specialties, string>;
  };
  patientDocuments: Record<keyof typeof es.patientDocuments, string>;
  patientAppointments: Record<keyof typeof es.patientAppointments, string>;
  patientMessages: Record<keyof typeof es.patientMessages, string>;
  patientProfile: Record<keyof typeof es.patientProfile, string>;
  onboarding: Record<keyof typeof es.onboarding, string>;
  gender: Record<keyof typeof es.gender, string>;
  rating: Record<keyof typeof es.rating, string>;
  professionalDashboard: Record<keyof typeof es.professionalDashboard, string>;
  adminDashboard: Record<keyof typeof es.adminDashboard, string>;
  notifications: Record<keyof typeof es.notifications, string>;
  adminUsers: Record<keyof typeof es.adminUsers, string>;
  adminProfessionals: Record<keyof typeof es.adminProfessionals, string>;
  adminSubscriptions: Record<keyof typeof es.adminSubscriptions, string>;
  adminValidations: Record<keyof typeof es.adminValidations, string>;
  adminAppointments: Record<keyof typeof es.adminAppointments, string>;
  adminReviews: Record<keyof typeof es.adminReviews, string>;
  professionalAppointments: Record<keyof typeof es.professionalAppointments, string>;
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
    alreadySubscribed: string;
    planPriceMissing: string;
  };
  patientSubscription: Record<keyof typeof es.patientSubscription, string>;
  patientRoutine: Record<keyof typeof es.patientRoutine, string>;
  professionalRoutines: Record<keyof typeof es.professionalRoutines, string>;
  specialties: Record<keyof typeof es.specialties, string>;
  modalities: Record<keyof typeof es.modalities, string>;
  userActions: Record<keyof typeof es.userActions, string>;
  validationActions: Record<keyof typeof es.validationActions, string>;
  chart: Record<keyof typeof es.chart, string>;
  appointments: {
    request: {
      title: string;
      date: string;
      time: string;
      notes: string;
      notesHint: string;
      submit: string;
      submitting: string;
      success: string;
    };
    status: Record<keyof typeof es.appointments.status, string>;
    actions: Record<keyof typeof es.appointments.actions, string>;
    confirmations: Record<keyof typeof es.appointments.confirmations, string>;
    empty: Record<keyof typeof es.appointments.empty, string>;
    errors: Record<keyof typeof es.appointments.errors, string>;
    filters: Record<keyof typeof es.appointments.filters, string>;
    search: Record<keyof typeof es.appointments.search, string>;
    card: Record<keyof typeof es.appointments.card, string>;
    sections: Record<keyof typeof es.appointments.sections, string>;
    meeting: Record<keyof typeof es.appointments.meeting, string>;
  };
}

export const dictionaries: Record<Locale, Dictionary> = { es, en };

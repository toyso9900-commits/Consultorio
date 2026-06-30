# Design: Theme + Settings (Slice 1)

## Technical Approach

Keep the theme entirely on the client and the language preference in the database, as decided. Introduce a small, self-contained i18n layer built on dictionary files rather than a routing-based locale prefix, because the project already uses plain `/` routes. All shared chrome (`layout.tsx`, `DashboardShell`, `Sidebar`, `DashboardHeader`, `UserAvatarMenu`) moves from hardcoded `slate-*` colors to Tailwind v4 semantic variables (`bg-background`, `text-foreground`, `border-border`). A synchronous inline script prevents the theme flash before hydration.

## Architecture Decisions

| Decision | Alternatives | Rationale |
|---|---|---|
| Class-based theme (`light`/`dark` on `<html>`) | `data-theme` attribute or media-query-only | Tailwind v4 `@theme inline` maps CSS variables to utility classes; class switching is instantaneous and avoids fighting `prefers-color-scheme`. |
| Inline blocking script in `<head>` for initial theme | Only a React `useEffect` | `useEffect` runs after first paint and causes a flash. A `<script>` runs before the body is rendered. |
| Custom `ThemeProvider` instead of `next-themes` | Add `next-themes` dependency | The product requires localStorage-only persistence with `system` fallback; a custom provider is tiny and keeps full control. |
| Dictionary i18n, no route locale prefix | Next.js i18n routing or `next-intl` | The app has no `/[locale]` structure and this slice must stay small; a dictionary loader keeps URLs unchanged. |
| `UserPreference` model for language only | One column on `User` | Theme must not touch the DB per spec; separating preferences keeps the model extensible. |
| Zod-validated server action with `auth()` check | Pass raw userId to the action | Existing actions use `auth()` for authorization; trusting the cookie is safer than trusting a client param. |

## Data Flow

```text
Server render
-------------
auth() ──► getLocale(userId?) ──► Prisma UserPreference ──► html lang="..."
                                    │                            │
                                    ▼                            ▼
                              default "es"              Providers(locale, dict)
                                                               │
Client hydration                                               ▼
                                                   I18nContext ──► useI18n()
                                                   ThemeProvider ──► document.documentElement.classList

Theme interaction
-----------------
ThemeToggle ──► ThemeProvider.setTheme() ──► localStorage + classList update

Language interaction
--------------------
LanguageSelector ──► updateUserLanguage() ──► Prisma upsert
                                              revalidatePath()
                                              toast.success()
```

## File Changes

| File | Action | Description |
|---|---|---|
| `prisma/schema.prisma` | Modify | Add `UserPreference` model and `preference` relation on `User`. |
| `app/globals.css` | Modify | Replace media-query variables with class-based semantic variables for light/off-white and dark palettes. |
| `app/layout.tsx` | Modify | Resolve `locale`, dynamic `lang`, inject no-flash theme script in `<head>`, remove hardcoded slate body classes. |
| `app/providers.tsx` | Modify | Accept `locale`/`dictionary`; wrap children in `I18nProvider` and `ThemeProvider`. |
| `components/theme-provider.tsx` | Create | Client provider that reads localStorage, resolves `system`, and syncs the `<html>` class. |
| `components/theme-toggle.tsx` | Create | Segmented `light`/`dark`/`system` control. |
| `components/user-avatar-menu.tsx` | Modify | Add `Configuración`/`Settings` link above sign-out; translate labels via `useI18n`. |
| `app/configuracion/page.tsx` | Create | Server page with Appearance and Language sections. |
| `components/configuracion/language-selector.tsx` | Create | Client select that calls the language server action. |
| `lib/i18n/dictionaries/es.ts` | Create | Spanish dictionary. |
| `lib/i18n/dictionaries/en.ts` | Create | English dictionary. |
| `lib/i18n/server.ts` | Create | `getLocale()` and `getDictionary()` helpers. |
| `lib/i18n/client.tsx` | Create | `I18nProvider` and `useI18n` hook. |
| `lib/actions/preferences.ts` | Create | `getUserLanguage` and `updateUserLanguage` server actions. |
| `components/layout/dashboard-shell.tsx` | Modify | Use `bg-background`/`text-foreground` instead of `bg-slate-50 dark:bg-slate-950`. |
| `components/layout/dashboard-header.tsx` | Modify | Use semantic color utilities. |
| `components/layout/sidebar.tsx` | Modify | Use semantic color utilities; translate nav labels via dictionary prop. |

## Interfaces / Contracts

### Theme

```ts
type Theme = "light" | "dark" | "system";
const STORAGE_KEY = "consultorio-theme";
```

Inline no-flash script (placed in `app/layout.tsx` `<head>`):

```html
<script dangerouslySetInnerHTML={{
  __html: `
    (function () {
      const saved = localStorage.getItem('consultorio-theme');
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const resolved = saved === 'dark' || (saved === 'system' && systemDark) || (!saved && systemDark) ? 'dark' : 'light';
      document.documentElement.classList.add(resolved);
    })();
  `,
}} />
```

`ThemeProvider` initializes `resolvedTheme` to the same value and updates `classList` on changes. `suppressHydrationWarning` is set on `<html>`/`<body>` because the server emits no theme class.

### i18n

```ts
type Locale = "es" | "en";

// lib/i18n/server.ts
export async function getLocale(userId?: string): Promise<Locale>;
export async function getDictionary(locale: Locale): Promise<Dictionary>;

// lib/i18n/client.tsx
export function I18nProvider(props: {
  locale: Locale;
  dictionary: Dictionary;
  children: React.ReactNode;
}): JSX.Element;
export function useI18n(): { locale: Locale; dictionary: Dictionary };
```

Dictionary shape (nested namespaces):

```ts
export const es = {
  common: { save: "Guardar", cancel: "Cancelar" },
  userMenu: { profile: "Editar perfil", settings: "Configuración", logout: "Cerrar sesión" },
  nav: { home: "Inicio", experts: "Guía de Expertos", appointments: "Citas", messages: "Mensajes" },
  settings: {
    title: "Configuración",
    appearance: "Apariencia",
    language: "Idioma",
    theme: { light: "Claro", dark: "Oscuro", system: "Sistema" },
  },
} as const;
```

### Server actions

```ts
// lib/actions/preferences.ts
"use server";
export async function getUserLanguage(userId: string): Promise<Locale>;
export async function updateUserLanguage(
  userId: string,
  language: Locale
): Promise<{ success: boolean; error?: string }>;
```

`updateUserLanguage` validates `language` with Zod, verifies `auth()` matches `userId`, upserts `UserPreference`, and revalidates `/configuracion`, `/paciente/dashboard`, and `/profesional/dashboard`.

### CSS variables

`app/globals.css` defines `:root, .light` and `.dark` blocks. Semantic variables include `--background`, `--foreground`, `--card`, `--card-foreground`, `--border`, `--muted`, `--muted-foreground`, `--primary`, `--primary-foreground`. `@theme inline` exposes each as a Tailwind color utility. Components reference `bg-background text-foreground border-border` instead of literal color scales.

## Testing Strategy

| Layer | What | Approach |
|---|---|---|
| Type | New actions, providers, dictionary types | `npm run typecheck` |
| Lint | New components and actions | `npm run lint` |
| Build | Static + dynamic routes | `npm run build` |
| Manual | Theme persistence | Toggle `light`/`dark`/`system`, reload, clear localStorage, verify OS fallback. |
| Manual | Language persistence | Select `en`, reload on another browser, confirm `UserPreference` row and `html lang="en"`. |
| Manual | Navigation | Reach `/configuracion` from patient and professional dashboards via avatar menu. |

## Migration / Rollout

Run `npx prisma migrate dev --name add_user_preference` and `npx prisma generate`. No seed changes are required; missing preferences are created lazily on first read.

## Open Questions

- [ ] Should the role-specific accent colors from later slices be anticipated now by adding an `--accent` variable, or should that wait until the dashboard-differentiation slice?
- [ ] Do we want to translate every existing literal string in this slice, or only the shared chrome and settings page and leave page-specific copy for follow-up slices?

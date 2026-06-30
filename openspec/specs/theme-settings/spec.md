# Theme and Settings Specification (Slice 1)

## Purpose
Define the first slice of the patient-professional experience improvements: a centralized `/configuracion` page, a manual theme toggle with `localStorage` persistence, a persisted language preference, and the dictionary-based i18n foundation used by the rest of the app.

## Requirements

### REQ-001 — Settings route
The system MUST expose a protected `/configuracion` route that is reachable from both the patient and professional dashboards.

#### Scenario: Navigating from a dashboard
- GIVEN an authenticated user on `/paciente/dashboard` or `/profesional/dashboard`
- WHEN the user clicks the settings entry in the avatar menu
- THEN the browser navigates to `/configuracion`
- AND the page renders inside the shared application layout

---

### REQ-002 — Avatar menu entry
The `UserAvatarMenu` component MUST include a "Configuración" / "Settings" item that links to `/configuracion`.

#### Scenario: Opening the user menu
- GIVEN any authenticated user
- WHEN the avatar menu is opened
- THEN a settings option is visible between the profile option and the sign-out option

---

### REQ-003 — Theme selector options
The settings page MUST provide a theme selector with three explicit choices: `light`, `dark`, and `system`.

#### Scenario: Choosing each theme mode
- GIVEN a user on `/configuracion`
- WHEN the user selects `light`, `dark`, or `system`
- THEN the UI immediately applies the selected mode
- AND `system` reflects the current OS color scheme

---

### REQ-004 — Theme persistence in `localStorage` only
The selected theme MUST be persisted in `localStorage` under a stable key; the database MUST NOT store the theme preference.

#### Scenario: Returning after reload
- GIVEN a user selected `dark` mode
- WHEN the page is reloaded
- THEN the UI renders in `dark` mode by reading the saved value from `localStorage`
- AND no network request is made for the theme

---

### REQ-005 — Default theme without flash
When no `localStorage` value exists, the UI MUST default to the OS color scheme and MUST avoid a visible theme flash during hydration.

#### Scenario: First visit on a light OS
- GIVEN a new visitor with OS set to light mode
- WHEN the page first loads
- THEN the light palette is rendered before any React hydration paint

---

### REQ-006 — Off-white light palette
The light theme MUST use an off-white / bone background such as `#f8f5f2` instead of pure white; the dark theme MUST keep the existing dark palette or refine it without breaking components.

#### Scenario: Toggling to light mode
- GIVEN the current theme is dark
- WHEN the user selects light mode
- THEN the background shifts to the off-white / bone tone
- AND text, borders, and cards maintain accessible contrast

---

### REQ-007 — Language selector
The settings page MUST provide a language selector that allows choosing between `es` (Spanish) and `en` (English).

#### Scenario: Changing language
- GIVEN a user on `/configuracion`
- WHEN the user selects `en`
- THEN the settings labels and all other translatable UI strings switch to English

---

### REQ-008 — Language persistence in the database
The selected language MUST be persisted in a `UserPreference` record linked to the authenticated user; if no record exists, the default value MUST be `es`.

#### Scenario: Returning on a different device
- GIVEN a user changed the language to `en`
- WHEN the same account logs in on another browser
- THEN the UI renders in English by reading the stored `UserPreference`

---

### REQ-009 — Server-side language resolution
A server-safe i18n helper MUST resolve the active language from the authenticated user's `UserPreference` record, falling back to `es` for guests or missing records.

#### Scenario: Rendering the landing page as a guest
- GIVEN an unauthenticated visitor
- WHEN the server renders any page
- THEN the active language is `es`
- AND `html lang="es"` is emitted

---

### REQ-010 — Dictionary-based i18n foundation
All current UI strings MUST be translatable through dictionary files at `lib/i18n/dictionaries/es.ts` and `lib/i18n/dictionaries/en.ts`, consumed by a server helper and a client hook/context.

#### Scenario: Translating a shared component
- GIVEN a shared client component that renders a label
- WHEN the active language is `en`
- THEN the component displays the English value from the dictionary
- AND server components receive the same dictionary for their labels

---

### REQ-011 — Hydration-safe theme provider
The `ThemeProvider` MUST read the resolved theme before the first paint, apply the corresponding class to `<html>`, and suppress React hydration mismatches.

#### Scenario: Hard refresh with saved light mode
- GIVEN a saved theme of `light`
- WHEN the user performs a hard refresh
- THEN `<html class="light">` is present in the initial markup or applied before paint
- AND no hydration warning is logged

---

### REQ-012 — Build/typecheck/lint pass
The slice MUST leave `npm run build`, `npm run typecheck`, and `npm run lint` passing.

#### Scenario: CI verification
- GIVEN the slice is implemented
- WHEN the verification commands run
- THEN all three commands exit with code zero

## Data Model Changes

Add a `UserPreference` model to `prisma/schema.prisma`:

```prisma
model UserPreference {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  language  String   @default("es")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Add the inverse relation to the `User` model:

```prisma
model User {
  // ... existing fields
  preference UserPreference?
}
```

A Prisma migration is required.

## API / Server Actions

- `getUserLanguage(userId: string): Promise<"es" | "en">`
  - Returns the user's stored language or creates a default `es` record and returns `es`.
- `updateUserLanguage(userId: string, language: "es" | "en"): Promise<void>`
  - Validates `language` with Zod.
  - Upserts the `UserPreference` record.
  - Revalidates `/configuracion` and the current dashboard path.

Theme is handled entirely on the client; no server action or DB column is created for it.

## UI/UX Notes

- `/configuracion` is a protected root-level route rendered inside `app/layout.tsx`.
- The page shows two clear sections: **Apariencia / Appearance** and **Idioma / Language**.
- Theme control uses a segmented button group (`light`, `dark`, `system`) with Lucide icons.
- Language control uses a native `<select>` or a Radix select.
- Theme changes apply instantly; language changes persist via server action and show a Sonner toast on completion.
- The avatar menu adds a settings entry with a `Settings` icon above the sign-out option.

## Affected Files

| Path | Change |
|---|---|
| `app/layout.tsx` | Dynamic `lang` attribute; remove hardcoded `bg-slate-50` classes from `<body>` in favor of theme variables. |
| `app/globals.css` | Update CSS variables for the off-white light palette; keep or refine dark variables. |
| `app/providers.tsx` | Wrap children with `ThemeProvider` and `I18nProvider`. |
| `app/configuracion/page.tsx` | New settings page. |
| `components/user-avatar-menu.tsx` | Add settings menu entry. |
| `components/theme-provider.tsx` | New client provider that reads `localStorage` and applies the theme class. |
| `components/theme-toggle.tsx` | New segmented theme selector. |
| `lib/i18n/dictionaries/es.ts` | New Spanish dictionary. |
| `lib/i18n/dictionaries/en.ts` | New English dictionary. |
| `lib/i18n/server.ts` | New server-safe dictionary loader. |
| `lib/i18n/client.tsx` | New client context/hook for translations. |
| `lib/actions/preferences.ts` | New server actions for language preference. |
| `prisma/schema.prisma` | Add `UserPreference` model and relation. |
| `components/layout/dashboard-shell.tsx` | Remove hardcoded background colors; rely on theme variables. |
| `components/layout/dashboard-header.tsx` | Remove hardcoded background/border colors where they should follow theme. |
| `components/layout/sidebar.tsx` | Translate labels and respect theme variables. |

## Out of Scope

- Translating dynamic content stored in the database (professional bios, names, etc.).
- Other slices: Destacados, Appointments, Dashboard differentiation, Ratings.
- Payment gateway or subscription changes.
- Session/multi-device enforcement or device management.
- Document upload, calorie tracker, or OCR.

## Acceptance Criteria

- [x] `/configuracion` is reachable from both patient and professional dashboards.
- [x] The avatar menu includes a settings entry.
- [x] Theme can be set to light, dark, or system; `system` follows the OS.
- [x] Theme choice persists across reloads via `localStorage` only.
- [x] First-load fallback to OS preference shows no visible flash.
- [x] Light theme uses an off-white / bone background.
- [x] Language can be set to Spanish or English.
- [x] Language choice persists in the database via `UserPreference`.
- [x] All existing UI strings are represented in both `es.ts` and `en.ts` dictionaries.
- [x] `npm run build`, `npm run typecheck`, and `npm run lint` pass.

## Verification Approach

1. Run `npm run typecheck` to validate the new Prisma types and i18n helpers.
2. Run `npm run lint` to check the new components and actions.
3. Run `npm run build` to confirm static and dynamic routes compile.
4. Manual checks:
   - Toggle theme across `light`/`dark`/`system`, reload and verify persistence.
   - Clear `localStorage` and confirm OS fallback without flash.
   - Change language to `en`, reload, and confirm UI strings are English.
   - Verify the `UserPreference` row is created/updated in PostgreSQL.

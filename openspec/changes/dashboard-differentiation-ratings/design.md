# Design: Dashboard Differentiation + Ratings (Slice 4)

## Technical Approach

Build on the existing role-based dashboard shell and server-action pattern. Add a `WeightEntry` history table, expose real metrics via new Prisma-backed helpers, differentiate patient and professional dashboards with role-specific CSS accent variables, and render charts with Recharts client components. The rating flow is triggered by the existing `completeAppointment` action and surfaced to the patient as a dismissible prompt.

## Architecture Decisions

| Decision | Options | Tradeoffs | Choice |
|---|---|---|---|
| Role accent tokens | A) Inline Tailwind classes per component B) Role CSS variables in `globals.css` | A) Faster but scattered; B) Centralized and theme-friendly | B — add `--role-patient-*` and `--role-professional-*` variables, apply via page wrapper |
| Weight history storage | A) Only latest weight on `PatientProfile` B) New `WeightEntry` model | A) No chart history; B) Migration required but enables trend chart | B — add `WeightEntry` with index on `[patientProfileId, recordedAt]` |
| Weight entry UX | A) Separate modal/page B) Inline form in "Mi expediente" | A) More code; B) Faster interaction in visible context | B — inline "Add current weight" form on the patient dashboard |
| Chart rendering | A) Server-rendered SVG B) Recharts client component | A) Complex; B) Already used by admin chart, consistent | B — new `WeightChart` and `EngagementChart` client components |
| Rating prompt placement | A) Patient dashboard only B) Dashboard + appointments page | A) May be missed; B) Higher visibility | B — show prompt on `/paciente/dashboard` and `/paciente/dashboard/citas` |
| Active patient definition | A) Any patient with appointment B) Paid subscription + active appointment | A) Inflates count; B) Matches product decision | B — query joins `Subscription` with `Appointment` |
| "Horario de esta semana" replacement | A) Remove card B) Replace with "Citas esta semana" | B) Reuses existing data and keeps a useful metric | B — replace with weekly appointment count |

## Data Flow

```
Patient dashboard:
  auth() → patientProfile + weightEntries + appointments + pendingReviews
  → PatientDashboardPage (server)
  → WeightChart / RatingPrompt (client)

Professional dashboard:
  auth() → professionalProfile + appointments + reviews + subscriptions
  → ProfessionalDashboardPage (server)
  → EngagementChart (client)

Rating flow:
  Professional clicks "Completar"
    → completeAppointment (server action)
    → revalidate patient + professional paths
  Patient sees prompt
    → submitReview(appointmentId, rating, comment?)
    → create Review row
    → revalidate paths
```

## File Changes

| File | Action | Description |
|---|---|---|
| `prisma/schema.prisma` | Modify | Add `WeightEntry` model; add `weightEntries` relation to `PatientProfile` |
| `prisma/migrations/` | Create | Migration for `WeightEntry` |
| `app/globals.css` | Modify | Add role accent CSS variables |
| `app/paciente/dashboard/page.tsx` | Modify | Emerald/teal theme, weight chart, quick actions, rating prompt |
| `app/paciente/dashboard/actions.ts` | Modify | `savePatientOnboarding` also records a `WeightEntry` |
| `app/paciente/dashboard/perfil/actions.ts` | Modify | `updatePatientProfile` also records a `WeightEntry` |
| `app/profesional/dashboard/page.tsx` | Modify | Indigo/blue theme, engagement chart, real stats, replace hours card |
| `app/profesional/dashboard/clientes/page.tsx` | Modify | Replace conversation list with patient/client list |
| `app/profesional/dashboard/mensajes/page.tsx` | Modify | Keep chat; remove from sidebar |
| `components/layout/sidebar.tsx` | Modify | Remove "Mensajes" from `PROFESSIONAL` navigation |
| `app/profesional/dashboard/appointment-actions.ts` | Modify | `completeAppointment` already transitions; ensure patient paths revalidated |
| `lib/appointments.ts` | Modify | Update `getAppointmentDashboardCounts` active patient rule; add engagement grouping |
| `lib/weight.ts` | Create | Weight history queries and recording |
| `lib/reviews.ts` | Create | Review queries and submission |
| `components/dashboard/weight-chart.tsx` | Create | Recharts area/line chart for weight |
| `components/dashboard/engagement-chart.tsx` | Create | Recharts bar chart for appointments |
| `components/rating/rating-prompt.tsx` | Create | Dismissible rating prompt card |
| `components/rating/rating-form.tsx` | Create | Star input + optional comment form |
| `lib/i18n/dictionaries/es.ts` | Modify | New Spanish strings |
| `lib/i18n/dictionaries/en.ts` | Modify | New English strings |

## Interfaces / Contracts

```typescript
// lib/weight.ts
export async function recordWeight(
  patientProfileId: string,
  weight: number
): Promise<void>;

export async function getWeightHistory(
  patientProfileId: string
): Promise<{ recordedAt: Date; weight: number }[]>;

// lib/reviews.ts
export interface RatingSummary {
  average: number;
  count: number;
}

export async function getProfessionalRating(
  professionalId: string
): Promise<RatingSummary>;

export async function submitReview(
  appointmentId: string,
  patientId: string,
  rating: number,
  comment?: string
): Promise<{ success: boolean; error?: string }>;

export async function getPendingReviewsForPatient(
  patientId: string
): Promise<Appointment[]>;

// lib/appointments.ts
export async function getActivePatients(professionalId: string): Promise<number>;

export async function getProfessionalEngagementData(
  professionalId: string
): Promise<{ date: string; count: number }[]>;
```

Rating validation: `z.number().int().min(1).max(5)` inside `submitReview`. `Review.appointmentId` is already unique in the schema, preventing duplicate reviews at the DB level.

## Theme / Role Differentiation Strategy

Add role-specific CSS variables to `app/globals.css`:

```css
:root {
  --role-patient-primary: #10b981;
  --role-patient-secondary: #0d9488;
  --role-professional-primary: #4f46e5;
  --role-professional-secondary: #2563eb;
}
```

Each dashboard page wraps its content in `data-role="patient"` or `data-role="professional"`. Components use the variables for icon backgrounds, badges, and quick-action borders. Tailwind utility classes remain for layout and typography.

## Chart Strategy

Recharts runs only inside client components. Server pages fetch the data, serialize it as JSON, and pass it to:

- `WeightChart` — `Area` + `Line` over `recordedAt`.
- `EngagementChart` — `BarChart` of appointment counts grouped by date for the last 30 days.

Both use `ResponsiveContainer` to match the existing admin chart pattern.

## i18n Key Strategy

Add new nested keys under existing namespaces:

- `patientHome.weightHistory`, `patientHome.addWeight`, `patientHome.weightEmpty`
- `professionalDashboard.appointmentsThisWeek` (replacement), `professionalDashboard.engagementTitle`
- `professionalClients.subscriptionStatus`, `professionalClients.lastAppointment`, `professionalClients.message`
- `rating.title`, `rating.submit`, `rating.placeholder`, `rating.thankYou`

Keep Spanish copy in `es.ts` and English copy in `en.ts`. Follow existing string interpolation patterns such as `{name}` and `{count}`.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Server action input validation | Manual code review; Zod schemas |
| Integration | Prisma queries for active patients, engagement, and reviews | Manual seed data checks |
| E2E / Manual | Theme, chart render, rating flow, language switch | Verification checklist from spec |

No automated test runner exists; rely on `npm run typecheck`, `npm run lint`, `npm run build`, and the spec's manual verification steps.

## Migration / Rollout

1. Create Prisma migration for `WeightEntry`.
2. Run `prisma migrate deploy` against the target database.
3. Existing `PatientProfile.weight` values remain; future updates also create a `WeightEntry`.
4. Rollback: revert the migration and remove `WeightEntry` references.

## Open Questions

- Should a weight entry on profile update replace today's entry or append a new one? Recommendation: append; deduplicate same-day entries in the UI if needed.
- Should the rating prompt auto-dismiss after submission or only on explicit close? Recommendation: dismiss after successful submission.

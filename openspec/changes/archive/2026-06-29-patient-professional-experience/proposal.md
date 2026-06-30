# Proposal: Patient & Professional Experience Improvements

## Intent
Move the `consultorio` beta from placeholder scaffolding to differentiated, usable patient and professional flows: a real DB-driven "Destacados" section, appointment booking/request, role-specific dashboards with charts and ratings, and a settings page for theme and language—while keeping the simulated subscription flow and clarifying the current session behavior.

## Scope

### In Scope
- **Theme & settings:** `/configuracion` page, manual light/dark toggle, off-white/bone light palette, language preference selector.
- **Landing "Destacados":** rename from "Top 10", query active subscribed professionals from the DB, improve design.
- **Patient dashboard:** weight progress chart in "Mi expediente", price filter in "Guía de expertos", appointment request/booking flow.
- **Professional dashboard:** engagement chart, calendar with upcoming appointments, active patient count, 5-star rating system, remove/replace "Horario de esta semana", "Clientes" view replacing "Mensajes", sorted appointments, conversation-only messages.
- **Visual differentiation:** role-specific accent colors, headers, and quick actions for patient vs professional dashboards.
- **Session clarification:** document/explain current JWT multi-device behavior and add UI guidance; no enforcement.

### Out of Scope
- Real payment gateway integration (Stripe/Mercado Pago); the simulated payment flow stays.
- Full i18n copy translation; only language preference UI/persistence.
- True global single-session enforcement or device management.
- Document upload, calorie tracker, OCR, native mobile apps.

## Proposed Split
1. **Theme + Settings** — small, shared-layout change that establishes `/configuracion` and the preference persistence pattern.
2. **Landing Destacados + Subscription Status** — DB-driven landing list and subscription plumbing; no payment gateway changes.
3. **Appointments + Calendar** — largest slice: patient booking/request flow and professional calendar/availability view.
4. **Dashboard Differentiation + Ratings + Engagement Metrics** — role-specific UI, 5-star ratings, charts, and client/patient metrics.

Splitting keeps each PR within the 400-line review budget and isolates shared-component risk.

## Capabilities

### New Capabilities
- `theme-settings`: `/configuracion`, theme toggle, language preference.
- `landing-destacados`: DB-driven Destacados list.
- `appointment-booking`: Patient appointment request/booking and professional calendar.
- `dashboard-differentiation`: Role-specific dashboard shells, ratings, engagement charts.

### Modified Capabilities
- `client-list`: Replace `/profesional/dashboard/mensajes` with a client-centric view; keep the conversation list.
- `professional-validation`: Subscription status may affect admin/professional feature gating.

## Approach
Use Next.js App Router server components and server actions; extend Prisma schema only for ratings/availability if needed; use Recharts for charts; persist theme/language preference via a new `UserPreference` model or localStorage with fallback; parameterize `DashboardShell` by role.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `app/globals.css` | Modified | Off-white light variables, theme classes. |
| `app/configuracion/page.tsx` | New | Settings page. |
| `app/page.tsx` | Modified | Destacados section. |
| `app/paciente/dashboard/*` | Modified | Charts, filters, booking. |
| `app/profesional/dashboard/*` | Modified | Calendar, ratings, client view. |
| `components/layout/*` | Modified | Role differentiation in shell/sidebar. |

## Open Product Questions
1. ¿Cómo se ordena/rankea la sección "Destacados"? ¿Solo por suscripción activa, o también por valoración, cantidad de citas u otro criterio?
2. ¿El paciente reserva una cita directamente (confirmación automática) o solicita un turno que el profesional debe aceptar/rechazar?
3. ¿Qué significa exactamente "pacientes activos"? ¿Pacientes con suscripción pagada, con citas activas, o que iniciaron conversación en los últimos N días?
4. ¿Las valoraciones de 5 estrellas son por cita, por profesional, o ambas? ¿Quién puede valorar y cuándo (después de cada cita, una sola vez, etc.)?
5. ¿La preferencia de tema se persiste por usuario en la base de datos o solo en `localStorage`?
6. ¿Qué paleta/accento distintivo querés para cada rol (paciente vs profesional) y qué tan diferente debe ser el layout?
7. ¿Cuál es el alcance mínimo viable para la primera entrega: settings, destacados, citas o dashboards?
8. ¿El selector de idioma en `/configuracion` solo guarda la preferencia o también requiere traducir toda la UI en este ciclo?

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Shared `DashboardShell` changes break admin views | Med | Parameterize by role; verify admin routes after each slice. |
| NextAuth v5 beta JWT strategy limits true single-session enforcement | High | Keep enforcement out of scope; document behavior instead. |
| Simulated payment flow may conflict with a future real gateway | Med | Maintain clear boundary; no gateway code in this cycle. |
| Appointment booking needs a new availability model | Med | Start with request/booking flow, defer complex real-time scheduling. |
| No automated tests; UI regressions likely | High | Keep slices small; verify with build, typecheck, and lint. |

## Rollback Plan
Revert each merged PR via `git revert`; theme preference falls back to system default; Destacados can fall back to the previous static list; appointment features can be hidden behind a feature flag if needed.

## Dependencies
- None blocking. A Prisma migration may be needed for `UserPreference` or `Review`.

## Success Criteria
- [x] `/configuracion` allows theme and language selection.
- [ ] Landing "Destacados" renders subscribed professionals from the DB.
- [ ] Patient can request/book an appointment; professional sees it in a calendar.
- [ ] Dashboards have visually distinct role accents and real data for key stats.
- [ ] Build, typecheck, and lint pass for every slice.

## Recommended First Slice
**Theme + Settings**: smallest blast radius, immediate user value, and establishes the preference persistence pattern for later features.

## Next Recommended Phase
`sdd-spec`

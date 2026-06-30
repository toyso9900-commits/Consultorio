# Design: Landing Destacados + Subscription Status

## Technical Approach

Replace the hardcoded landing "Top 10 Expertos Destacados" with a DB-driven "Destacados" list. Add a minimal `Review` model to support rating aggregation and future Slice 4 review submission. Introduce a single source of truth for active premium status in `lib/subscription.ts`, use it to filter the landing list and to badge the Guía de Expertos, and keep `ProfessionalProfile.isPremium` in sync when the simulated payment succeeds. All new UI strings flow through the existing dictionary-based i18n layer.

## Architecture Decisions

| Decision | Alternatives | Rationale |
|---|---|---|
| Compute ratings in memory after fetching reviews | Prisma `_avg` aggregate | Relation aggregate sorting is limited in the current Prisma setup; loading reviews per profile keeps the query simple and the sort explicit. |
| `hasActiveSubscription(userId)` queries per professional in Guía de Expertos | Single batched join query | Follows the spec requirement to use the helper; acceptable N+1 for the current small catalogue, with a documented optimization path. |
| Keep `isPremium` as a denormalized flag | Remove `isPremium` and query `Subscription` everywhere | Reads stay fast; the flag is updated transactionally by `activateSubscription` to avoid drift. |
| Shared `StarRating` component | Inline SVG in each card | One place controls partial-star rendering and accessibility labels. |
| Set `expiresAt` on simulated activation | Leave `expiresAt` null | Makes the expiry check meaningful and matches requirement F8. |

## Data Flow

```text
Landing page
  getFeaturedProfessionals(limit)
    └── Prisma: validated profiles + active PREMIUM subscription + reviews
    └── map: averageRating, reviewCount
    └── sort: rating desc, reviewCount desc
    └── render cards with StarRating + Destacado badge

Guía de Expertos
  getApprovedProfessionals()
    └── map: averageRating, reviewCount, isPremiumActive=hasActiveSubscription(id)
    └── PatientExpertsClient renders StarRating + badge when isPremiumActive

Subscription simulator
  activateSubscription(userId, planId)
    └── upsert Subscription ACTIVE + expiresAt
    └── tx update ProfessionalProfile.isPremium=true
    └── revalidatePath("/") + /profesional/dashboard
```

## File Changes

| File | Action | Description |
|---|---|---|
| `prisma/schema.prisma` | Modify | Add `Review` model, relations on `User`, and indexes. |
| `lib/subscription.ts` | Create | `hasActiveSubscription(userId)` helper. |
| `lib/professionals-db.ts` | Modify | Add `getFeaturedProfessionals(limit)`; enrich `getApprovedProfessionals` with ratings and active status. |
| `lib/professionals.ts` | Modify | Extend `Professional` type with `averageRating` and `reviewCount`. |
| `app/page.tsx` | Modify | Query Destacados from DB; add empty state. |
| `components/ui/star-rating.tsx` | Create | Reusable partial-star rating display. |
| `app/paciente/dashboard/expertos/page.tsx` | Modify | Fetch and pass enriched professional list. |
| `app/paciente/dashboard/expertos/experts-client.tsx` | Modify | Show StarRating and Destacado badge based on active subscription. |
| `app/profesional/dashboard/suscripcion/actions.ts` | Modify | Set `expiresAt` and update `ProfessionalProfile.isPremium`; revalidate `/`. |
| `lib/i18n/dictionaries/es.ts` | Modify | Update `landing.expertsTitle`, add empty-state keys. |
| `lib/i18n/dictionaries/en.ts` | Modify | Same in English. |
| `lib/i18n/dictionaries/index.ts` | Modify | Update `Dictionary` interfaces. |

## Interfaces / Contracts

```ts
// lib/professionals.ts
export type Professional = {
  id: string;
  name: string;
  title: string;
  bio: string;
  specialty: string;
  location: string;
  modality: string;
  price: number;
  isPremium: boolean; // kept for compat; prefer isPremiumActive
  image: string;
  averageRating: number;
  reviewCount: number;
  isPremiumActive?: boolean;
};

// lib/subscription.ts
export async function hasActiveSubscription(userId: string): Promise<boolean>;
```

`StarRating` props:

```ts
interface StarRatingProps {
  rating: number;      // 0-5
  reviewCount?: number;
  size?: "sm" | "md";
}
```

## Query Design

`getFeaturedProfessionals` fetches validated profiles whose user has an active `PREMIUM` subscription, includes `receivedReviews` to compute average and count, limits results, and sorts in memory:

```ts
const profiles = await prisma.professionalProfile.findMany({
  where: {
    isValidated: true,
    user: {
      subscriptions: {
        some: {
          plan: "PREMIUM",
          status: "ACTIVE",
          OR: [{ expiresAt: { gt: new Date() } }, { expiresAt: null }],
        },
      },
    },
  },
  include: {
    user: { select: { id: true, name: true, image: true } },
    receivedReviews: { select: { rating: true } },
  },
  take: limit,
});
```

Results are mapped and sorted by `averageRating` descending, then `reviewCount` descending.

## i18n Key Strategy

Modify existing `landing.expertsTitle` to "Destacados" / "Featured". Add:

```ts
landing: {
  expertsDescription: "Verified professionals with active premium subscriptions and the best ratings.",
  noFeatured: "No featured professionals available right now.",
  noFeaturedDescription: "Check back soon for new specialists.",
}
```

`patientExperts.featured` already exists; add `patientExperts.ratingCount` for screen reader text if needed.

## Testing Strategy

| Layer | What | Approach |
|---|---|---|
| Type | New helpers, schema, component props | `npm run typecheck` |
| Lint | New/updated files | `npm run lint` |
| Build | Static + dynamic routes | `npm run build` |
| Manual | Landing ranking | Seed professionals with varied ratings/subscriptions and verify order. |
| Manual | Subscription sync | Activate premium, confirm `isPremium` true and landing shows the professional. |
| Manual | Guía badges | Confirm badge + stars only for active subscribers. |

## Migration / Rollout

1. `npx prisma migrate dev --name add_review_model`
2. `npx prisma generate`
3. Seed a few test professionals with subscriptions and reviews for manual verification.

No destructive schema changes.

## Open Questions

- [ ] Should `expiresAt: null` be treated as active for backward compatibility, or should existing rows be backfilled?
- [ ] Is the fractional partial-star rendering acceptable, or should ratings round to the nearest half-star?

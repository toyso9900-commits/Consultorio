import { prisma } from "@/lib/prisma";
import { Professional } from "./professionals";
import { hasActiveSubscription } from "./subscription";

function mapSpecialty(specialty: string): string {
  switch (specialty) {
    case "NUTRITION":
      return "Nutrición";
    case "TRAINING":
      return "Entrenamiento";
    case "BOTH":
      return "Nutrición y Entrenamiento";
    default:
      return specialty;
  }
}

function mapModality(modality: string): string {
  switch (modality) {
    case "ONLINE":
      return "Online";
    case "IN_PERSON":
      return "Presencial";
    case "BOTH":
      return "Online / Presencial";
    default:
      return modality;
  }
}

function computeAverageRating(reviews: { rating: number }[]): number {
  if (reviews.length === 0) return 0;
  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  return Number(average.toFixed(1));
}

function mapProfessional(
  profile: {
    user: { id: string; name: string | null; image: string | null };
    title: string | null;
    bio: string | null;
    specialty: string;
    location: string | null;
    modality: string;
    price: number | null;
    isPremium: boolean;
  },
  averageRating: number,
  reviewCount: number,
  isPremiumActive?: boolean
): Professional {
  return {
    id: profile.user.id,
    name: profile.user.name || "Profesional",
    title: profile.title || "Especialista",
    bio: profile.bio || "",
    specialty: mapSpecialty(profile.specialty),
    location: profile.location || "No especificada",
    modality: mapModality(profile.modality),
    price: profile.price ?? 0,
    isPremium: profile.isPremium,
    image:
      profile.user.image ||
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&h=400&q=80",
    averageRating,
    reviewCount,
    isPremiumActive,
  };
}

async function fetchActivePremiumUserIds(userIds: string[]): Promise<Set<string>> {
  if (userIds.length === 0) return new Set();

  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: { in: userIds },
      plan: "PREMIUM",
      status: "ACTIVE",
      OR: [{ expiresAt: { gt: new Date() } }, { expiresAt: null }],
    },
    select: { userId: true },
    distinct: ["userId"],
  });

  return new Set(subscriptions.map((subscription) => subscription.userId));
}

export async function getApprovedProfessionals(): Promise<Professional[]> {
  const profiles = await prisma.professionalProfile.findMany({
    where: { isValidated: true },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          receivedReviews: { select: { rating: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const activeUserIds = await fetchActivePremiumUserIds(
    profiles.map((profile) => profile.user.id)
  );

  return profiles.map((profile) => {
    const averageRating = computeAverageRating(profile.user.receivedReviews);
    const reviewCount = profile.user.receivedReviews.length;
    const isPremiumActive = activeUserIds.has(profile.user.id);
    return mapProfessional(profile, averageRating, reviewCount, isPremiumActive);
  });
}

export async function getFeaturedProfessionals(limit = 10): Promise<Professional[]> {
  const profiles = await prisma.professionalProfile.findMany({
    where: { isValidated: true },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          receivedReviews: { select: { rating: true } },
        },
      },
    },
  });

  const activeUserIds = await fetchActivePremiumUserIds(
    profiles.map((profile) => profile.user.id)
  );

  const featured = profiles
    .filter((profile) => activeUserIds.has(profile.user.id))
    .map((profile) => {
      const averageRating = computeAverageRating(profile.user.receivedReviews);
      const reviewCount = profile.user.receivedReviews.length;
      return mapProfessional(profile, averageRating, reviewCount, true);
    });

  featured.sort((a, b) => {
    if (b.averageRating !== a.averageRating) {
      return b.averageRating - a.averageRating;
    }
    return b.reviewCount - a.reviewCount;
  });

  return featured.slice(0, limit);
}

export async function getApprovedProfessionalById(
  id: string
): Promise<Professional | null> {
  const profile = await prisma.professionalProfile.findFirst({
    where: { userId: id, isValidated: true },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          receivedReviews: { select: { rating: true } },
        },
      },
    },
  });

  if (!profile) return null;

  const averageRating = computeAverageRating(profile.user.receivedReviews);
  const reviewCount = profile.user.receivedReviews.length;
  const isPremiumActive = await hasActiveSubscription(profile.user.id);

  return mapProfessional(profile, averageRating, reviewCount, isPremiumActive);
}

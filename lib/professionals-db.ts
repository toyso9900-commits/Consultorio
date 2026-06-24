import { prisma } from "@/lib/prisma";
import { Professional } from "./professionals";

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

export async function getApprovedProfessionals(): Promise<Professional[]> {
  const profiles = await prisma.professionalProfile.findMany({
    where: { isValidated: true },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return profiles.map((profile) => ({
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
  }));
}

export async function getApprovedProfessionalById(
  id: string
): Promise<Professional | null> {
  const profile = await prisma.professionalProfile.findFirst({
    where: { userId: id, isValidated: true },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });

  if (!profile) return null;

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
  };
}

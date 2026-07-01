import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dictionaries, type Locale, type Dictionary } from "./dictionaries";

export async function getLocale(userId?: string): Promise<Locale> {
  const resolvedUserId = userId ?? (await auth())?.user?.id;
  if (!resolvedUserId) return "es";

  const preference = await prisma.userPreference.findUnique({
    where: { userId: resolvedUserId },
  });

  if (preference?.language === "en") return "en";

  // Only create a default preference if the user still exists in the database.
  // The session JWT may reference a deleted or reset user, which would violate
  // the UserPreference_userId_fkey foreign key constraint on insert.
  const userExists = await prisma.user.findUnique({
    where: { id: resolvedUserId },
    select: { id: true },
  });

  if (userExists) {
    await prisma.userPreference.upsert({
      where: { userId: resolvedUserId },
      create: { userId: resolvedUserId, language: "es" },
      update: {},
    });
  }

  return "es";
}

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale];
}

export type { Locale, Dictionary };

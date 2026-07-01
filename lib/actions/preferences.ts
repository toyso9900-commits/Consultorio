"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Locale } from "@/lib/i18n/server";

const languageSchema = z.enum(["es", "en"]);

export async function getUserLanguage(userId: string): Promise<Locale> {
  const preference = await prisma.userPreference.findUnique({
    where: { userId },
  });
  return preference?.language === "en" ? "en" : "es";
}

export async function updateUserLanguage(
  userId: string,
  language: Locale
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (session?.user?.id !== userId) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = languageSchema.safeParse(language);
  if (!parsed.success) {
    return { success: false, error: "Invalid language" };
  }

  try {
    await prisma.userPreference.upsert({
      where: { userId },
      create: { userId, language: parsed.data },
      update: { language: parsed.data },
    });

    revalidatePath("/configuracion");
    revalidatePath("/paciente/dashboard");
    revalidatePath("/profesional/dashboard");

    return { success: true };
  } catch {
    return { success: false, error: "Failed to update language preference" };
  }
}

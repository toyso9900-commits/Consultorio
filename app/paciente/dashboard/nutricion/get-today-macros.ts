import { prisma } from "@/lib/prisma";

export type TodayMacros = {
  calories: number;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999
  );
}

export async function getTodayMacros(userId: string): Promise<TodayMacros> {
  const now = new Date();
  const start = startOfDay(now);
  const end = endOfDay(now);

  const entries = await prisma.mealEntry.findMany({
    where: {
      userId,
      consumedAt: {
        gte: start,
        lte: end,
      },
    },
    include: {
      ingredients: true,
    },
  });

  return entries.reduce<TodayMacros>(
    (acc, entry) => {
      if (entry.ingredients.length > 0) {
        for (const ingredient of entry.ingredients) {
          acc.calories += ingredient.calories;
          acc.proteinG = (acc.proteinG ?? 0) + (ingredient.proteinG ?? 0);
          acc.carbsG = (acc.carbsG ?? 0) + (ingredient.carbsG ?? 0);
          acc.fatG = (acc.fatG ?? 0) + (ingredient.fatG ?? 0);
        }
      } else {
        acc.calories += entry.calories;
      }
      return acc;
    },
    {
      calories: 0,
      proteinG: null,
      carbsG: null,
      fatG: null,
    }
  );
}

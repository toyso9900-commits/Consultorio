import { prisma } from "@/lib/prisma";

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

export async function getTodayCalories(userId: string): Promise<number> {
  const now = new Date();
  const start = startOfDay(now);
  const end = endOfDay(now);

  const result = await prisma.mealEntry.aggregate({
    where: {
      userId,
      consumedAt: {
        gte: start,
        lte: end,
      },
    },
    _sum: {
      calories: true,
    },
  });

  return result._sum.calories ?? 0;
}

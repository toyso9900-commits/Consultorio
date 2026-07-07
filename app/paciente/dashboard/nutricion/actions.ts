"use server";

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { computeIngredient } from "@/lib/nutrition-data";
import type { MealType, MealSource } from "@prisma/client";

const GEMINI_MODEL = "gemini-flash-latest";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "meals");

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const requestTimestamps = new Map<string, number[]>();

const ingredientSchema = z.object({
  name: z.string().min(1),
  weightG: z.number().min(0),
  calories: z.number().int().min(0),
  proteinG: z.number().min(0).optional(),
  carbsG: z.number().min(0).optional(),
  fatG: z.number().min(0).optional(),
  confidence: z.number().min(0).max(1),
});

const foodAnalysisSchema = z.object({
  description: z.string().min(1),
  referenceScale: z.object({
    type: z.enum(["coin", "card", "spoon", "hand", "none"]),
    detected: z.boolean(),
    confidence: z.number().min(0).max(1),
  }),
  ingredients: z.array(ingredientSchema),
  calories: z.number().int().min(0),
  proteinG: z.number().min(0).optional(),
  carbsG: z.number().min(0).optional(),
  fatG: z.number().min(0).optional(),
  confidence: z.number().min(0).max(1),
});

export type FoodAnalysisData = z.infer<typeof foodAnalysisSchema>;

export type AnalyzeFoodImageResult =
  | {
      success: true;
      data: FoodAnalysisData;
      imageUrl: string;
      needsReferenceWarning: boolean;
    }
  | { success: false; error: string };

export type SaveMealEntryResult =
  | { success: true; id: string }
  | { success: false; error: string };

export type MealEntryListItem = {
  id: string;
  imageUrl: string | null;
  description: string;
  mealType: MealType;
  calories: number;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  aiConfidence: number | null;
  source: MealSource;
  consumedAt: Date;
};

export type GetMealEntriesResult =
  | { success: true; entries: MealEntryListItem[] }
  | { success: false; error: string };

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const timestamps = requestTimestamps.get(userId) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  requestTimestamps.set(userId, recent);
  return recent.length >= RATE_LIMIT_MAX_REQUESTS;
}

function recordRequest(userId: string): void {
  const timestamps = requestTimestamps.get(userId) ?? [];
  timestamps.push(Date.now());
  requestTimestamps.set(userId, timestamps);
}

function recomputeIngredient(
  ingredient: z.infer<typeof ingredientSchema>
): z.infer<typeof ingredientSchema> {
  const computed = computeIngredient(
    ingredient.name,
    ingredient.weightG,
    {
      calories: ingredient.calories,
      proteinG: ingredient.proteinG,
      carbsG: ingredient.carbsG,
      fatG: ingredient.fatG,
    }
  );

  return {
    ...ingredient,
    calories: computed.calories,
    proteinG: computed.proteinG,
    carbsG: computed.carbsG,
    fatG: computed.fatG,
  };
}

export async function analyzeFoodImage(
  formData: FormData
): Promise<AnalyzeFoodImageResult> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "errors.unauthorized" };
  }

  const file = formData.get("image") as File | null;

  if (!file || !ALLOWED_TYPES.includes(file.type) || file.size === 0) {
    return { success: false, error: "nutrition.errorInvalidFile" };
  }

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return { success: false, error: "nutrition.errorInvalidFile" };
  }

  if (isRateLimited(userId)) {
    return { success: false, error: "nutrition.errorRateLimited" };
  }

  try {
    await mkdir(UPLOAD_DIR, { recursive: true });

    const ext = file.type.split("/")[1] || "jpg";
    const fileName = `${randomUUID()}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const imageUrl = `/uploads/meals/${fileName}`;

    recordRequest(userId);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { success: false, error: "nutrition.errorAnalysis" };
    }

    const base64 = Buffer.from(bytes).toString("base64");

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Analyze this food photo and estimate the nutritional content. First, look for a common reference object in the image (coin, card, spoon, or hand) to estimate portion size. If no reference is visible, set referenceScale.type to "none", referenceScale.detected to false, and lower the confidence. Then break the dish into ingredients, estimate each ingredient's weight in grams based on the reference, and provide per-ingredient calories and macros. Respond ONLY with a JSON object matching this exact schema, no markdown, no extra text:
{
  "description": "short description of the dish",
  "referenceScale": {
    "type": "coin" | "card" | "spoon" | "hand" | "none",
    "detected": boolean,
    "confidence": number between 0 and 1
  },
  "ingredients": [
    {
      "name": "ingredient name",
      "weightG": number,
      "calories": integer,
      "proteinG": number (optional),
      "carbsG": number (optional),
      "fatG": number (optional),
      "confidence": number between 0 and 1
    }
  ],
  "calories": integer (total),
  "proteinG": number (optional, total),
  "carbsG": number (optional, total),
  "fatG": number (optional, total),
  "confidence": number between 0 and 1
}`,
            },
            {
              inlineData: {
                mimeType: file.type,
                data: base64,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const rawText = response.text;
    if (!rawText) {
      return { success: false, error: "nutrition.errorAnalysis" };
    }

    const parsedJson = JSON.parse(rawText);
    const parsed = foodAnalysisSchema.safeParse(parsedJson);

    if (!parsed.success) {
      return { success: false, error: "nutrition.errorAnalysis" };
    }

    const recomputedIngredients = parsed.data.ingredients.map(recomputeIngredient);

    const totals = recomputedIngredients.reduce(
      (acc, ingredient) => ({
        calories: acc.calories + ingredient.calories,
        proteinG: acc.proteinG + (ingredient.proteinG ?? 0),
        carbsG: acc.carbsG + (ingredient.carbsG ?? 0),
        fatG: acc.fatG + (ingredient.fatG ?? 0),
      }),
      { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
    );

    const finalData: FoodAnalysisData = {
      ...parsed.data,
      ingredients: recomputedIngredients,
      calories: totals.calories,
      proteinG: totals.proteinG,
      carbsG: totals.carbsG,
      fatG: totals.fatG,
    };

    return {
      success: true,
      data: finalData,
      imageUrl,
      needsReferenceWarning: !finalData.referenceScale.detected,
    };
  } catch {
    return { success: false, error: "nutrition.errorAnalysis" };
  }
}

const mealIngredientSchema = z.object({
  name: z.string().min(1),
  weightG: z.number().min(0).optional(),
  calories: z.number().int().min(0),
  proteinG: z.number().min(0).optional(),
  carbsG: z.number().min(0).optional(),
  fatG: z.number().min(0).optional(),
});

const saveMealEntrySchema = z.object({
  description: z.string().min(1),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK", "OTHER"]),
  calories: z.number().int().min(0),
  proteinG: z.number().min(0).optional(),
  carbsG: z.number().min(0).optional(),
  fatG: z.number().min(0).optional(),
  confidence: z.number().min(0).max(1).optional(),
  imageUrl: z.string().optional(),
  consumedAt: z.string().datetime().optional(),
  ingredients: z.array(mealIngredientSchema).optional(),
});

export async function saveMealEntry(
  data: unknown
): Promise<SaveMealEntryResult> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "errors.unauthorized" };
  }

  const parsed = saveMealEntrySchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "nutrition.errorAnalysis" };
  }

  const {
    description,
    mealType,
    calories: inputCalories,
    proteinG: inputProteinG,
    carbsG: inputCarbsG,
    fatG: inputFatG,
    confidence,
    imageUrl,
    consumedAt,
    ingredients,
  } = parsed.data;

  const hasIngredients = ingredients && ingredients.length > 0;

  const calories = hasIngredients
    ? ingredients.reduce((sum, ingredient) => sum + ingredient.calories, 0)
    : inputCalories;
  const proteinG = hasIngredients
    ? ingredients.reduce(
        (sum, ingredient) => sum + (ingredient.proteinG ?? 0),
        0
      )
    : inputProteinG;
  const carbsG = hasIngredients
    ? ingredients.reduce(
        (sum, ingredient) => sum + (ingredient.carbsG ?? 0),
        0
      )
    : inputCarbsG;
  const fatG = hasIngredients
    ? ingredients.reduce((sum, ingredient) => sum + (ingredient.fatG ?? 0), 0)
    : inputFatG;

  try {
    const entry = await prisma.mealEntry.create({
      data: {
        userId,
        description,
        mealType,
        calories,
        proteinG,
        carbsG,
        fatG,
        aiConfidence: confidence,
        aiModel: GEMINI_MODEL,
        source: "AI",
        imageUrl,
        consumedAt: consumedAt ? new Date(consumedAt) : new Date(),
        ingredients:
          hasIngredients
            ? {
                create: ingredients.map((ingredient) => ({
                  name: ingredient.name,
                  weightG: ingredient.weightG,
                  calories: ingredient.calories,
                  proteinG: ingredient.proteinG,
                  carbsG: ingredient.carbsG,
                  fatG: ingredient.fatG,
                })),
              }
            : undefined,
      },
    });

    revalidatePath("/paciente/dashboard/nutricion");
    revalidatePath("/paciente/dashboard");

    return { success: true, id: entry.id };
  } catch {
    return { success: false, error: "errors.generic" };
  }
}

export async function getMealEntries(
  userId: string
): Promise<GetMealEntriesResult> {
  const session = await auth();
  const sessionUserId = session?.user?.id;

  if (!sessionUserId || sessionUserId !== userId) {
    return { success: false, error: "errors.unauthorized" };
  }

  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfNextDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );

    const entries = await prisma.mealEntry.findMany({
      where: {
        userId,
        consumedAt: {
          gte: startOfDay,
          lt: startOfNextDay,
        },
      },
      orderBy: { consumedAt: "desc" },
      take: 50,
    });

    return { success: true, entries };
  } catch {
    return { success: false, error: "errors.generic" };
  }
}

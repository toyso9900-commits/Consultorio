"use server";

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { MealType, MealSource } from "@prisma/client";

const GEMINI_MODEL = "gemini-flash-latest";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "meals");

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const requestTimestamps = new Map<string, number[]>();

const foodAnalysisSchema = z.object({
  description: z.string().min(1),
  calories: z.number().int().min(0),
  proteinG: z.number().min(0).optional(),
  carbsG: z.number().min(0).optional(),
  fatG: z.number().min(0).optional(),
  confidence: z.number().min(0).max(1),
});

export type FoodAnalysisData = z.infer<typeof foodAnalysisSchema>;

export type AnalyzeFoodImageResult =
  | { success: true; data: FoodAnalysisData; imageUrl: string }
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
              text: `Analyze this food photo and estimate the nutritional content. Respond ONLY with a JSON object matching this exact schema, no markdown, no extra text:
{
  "description": "short description of the dish",
  "calories": integer,
  "proteinG": number (optional),
  "carbsG": number (optional),
  "fatG": number (optional),
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

    return {
      success: true,
      data: parsed.data,
      imageUrl,
    };
  } catch {
    return { success: false, error: "nutrition.errorAnalysis" };
  }
}

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
    calories,
    proteinG,
    carbsG,
    fatG,
    confidence,
    imageUrl,
    consumedAt,
  } = parsed.data;

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
    const entries = await prisma.mealEntry.findMany({
      where: { userId },
      orderBy: { consumedAt: "desc" },
      take: 50,
    });

    return { success: true, entries };
  } catch {
    return { success: false, error: "errors.generic" };
  }
}

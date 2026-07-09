"use server";

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "progress");

export interface ProgressPhoto {
  id: string;
  url: string;
  createdAt: Date;
}

export async function uploadProgressPhoto(
  formData: FormData
): Promise<{ success: true; photo: ProgressPhoto } | { success: false; error: string }> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "No autorizado." };
  }

  const file = formData.get("photo") as File | null;

  if (!file || !ALLOWED_TYPES.includes(file.type) || file.size === 0) {
    return { success: false, error: "La imagen debe ser JPG, PNG o WebP." };
  }

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return { success: false, error: "La imagen no puede superar los 5 MB." };
  }

  try {
    await mkdir(UPLOAD_DIR, { recursive: true });

    const ext = file.type.split("/")[1] || "jpg";
    const fileName = `${randomUUID()}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const url = `/uploads/progress/${fileName}`;

    const photo = await prisma.progressPhoto.create({
      data: {
        patientId: userId,
        url,
      },
    });

    revalidatePath("/paciente/dashboard");
    revalidatePath("/profesional/dashboard/clientes");

    return { success: true, photo };
  } catch {
    return { success: false, error: "No se pudo guardar la foto." };
  }
}

export async function getProgressPhotos(
  patientId: string,
  limit = 4
): Promise<ProgressPhoto[]> {
  const photos = await prisma.progressPhoto.findMany({
    where: { patientId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, url: true, createdAt: true },
  });

  return photos;
}

export async function getLatestProgressPhoto(
  patientId: string
): Promise<ProgressPhoto | null> {
  const photo = await prisma.progressPhoto.findFirst({
    where: { patientId },
    orderBy: { createdAt: "desc" },
    select: { id: true, url: true, createdAt: true },
  });

  return photo;
}

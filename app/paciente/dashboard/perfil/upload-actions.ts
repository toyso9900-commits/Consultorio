"use server";

import { writeFile } from "fs/promises";
import { mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "avatars");
const MAX_SIZE_MB = 2;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function uploadPatientAvatar(formData: FormData): Promise<{
  success: boolean;
  imageUrl?: string;
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "PATIENT") {
    return { success: false, error: "No autorizado." };
  }
  const userId = session.user.id;

  const file = formData.get("avatar") as File | null;

  if (!file) {
    return { success: false, error: "Faltan datos para subir la imagen." };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      success: false,
      error: "Formato no válido. Usá JPG, PNG o WebP.",
    };
  }

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return { success: false, error: "La imagen no puede superar los 2 MB." };
  }

  try {
    await mkdir(UPLOAD_DIR, { recursive: true });

    const ext = file.type.split("/")[1] || "jpg";
    const fileName = `${userId}-${Date.now()}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const imageUrl = `/uploads/avatars/${fileName}`;

    await prisma.user.update({
      where: { id: userId },
      data: { image: imageUrl },
    });

    revalidatePath("/paciente/dashboard/perfil");
    revalidatePath("/paciente/dashboard");

    return { success: true, imageUrl };
  } catch {
    return { success: false, error: "No se pudo subir la imagen." };
  }
}

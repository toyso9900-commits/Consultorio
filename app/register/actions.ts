"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { triggerAdminUpdate } from "@/lib/pusher-server";
import { UserRole } from "@prisma/client";

const baseRegisterSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  email: z.string().email("Ingresá un correo electrónico válido."),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres."),
  role: z.enum(["PATIENT", "PROFESSIONAL"], {
    message: "Seleccioná un rol válido.",
  }),
});

const professionalRegisterSchema = baseRegisterSchema.extend({
  licenseNumber: z
    .string()
    .min(3, "La cédula profesional debe tener al menos 3 caracteres."),
});

export type RegisterUserResult =
  | { success: true }
  | { success: false; error: string };

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  role: string;
  licenseNumber?: string;
}): Promise<RegisterUserResult> {
  const schema =
    data.role === "PROFESSIONAL" ? professionalRegisterSchema : baseRegisterSchema;

  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Datos inválidos.",
    };
  }

  const { name, email, password, role } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return { success: false, error: "El correo ya está registrado." };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    if (role === "PROFESSIONAL") {
      const user = await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          role: UserRole.PROFESSIONAL,
          professionalProfile: {
            create: {
              licenseNumber: data.licenseNumber as string,
            },
          },
        },
      });

      triggerAdminUpdate({ type: "professional-registered", userId: user.id }).catch(
        (err) => console.error("Pusher trigger error:", err)
      );
    } else {
      await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          role: UserRole.PATIENT,
          patientProfile: {
            create: {},
          },
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: "Ocurrió un error al registrarte. Intentá de nuevo más tarde.",
    };
  }
}

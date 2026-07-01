import { PrismaClient, UserRole, AppointmentStatus, Specialty, Modality } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

const DEFAULT_ADMIN_PASSWORD = "Admin123!";
const DEFAULT_PROFESSIONAL_PASSWORD = "Pro123!";
const DEFAULT_PATIENT_PASSWORD = "Patient123!";

async function main() {
  const adminEmail = "admin@consultorio.local";

  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existing) {
    console.log("Super admin already exists. Skipping seed.");
    return;
  }

  const adminPassword = process.env["ADMIN_PASSWORD"] ?? DEFAULT_ADMIN_PASSWORD;
  const professionalPassword =
    process.env["PROFESSIONAL_PASSWORD"] ?? DEFAULT_PROFESSIONAL_PASSWORD;
  const patientPassword =
    process.env["PATIENT_PASSWORD"] ?? DEFAULT_PATIENT_PASSWORD;

  if (adminPassword === DEFAULT_ADMIN_PASSWORD) {
    console.warn(
      "\n⚠️  WARNING: You are using the default admin password."
    );
    console.warn(
      "Set ADMIN_PASSWORD in your .env file before deploying to production.\n"
    );
  }

  const adminHashedPassword = await bcrypt.hash(adminPassword, 12);
  const professionalHashedPassword = await bcrypt.hash(professionalPassword, 12);
  const patientHashedPassword = await bcrypt.hash(patientPassword, 12);

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      name: "Super Admin",
      role: UserRole.ADMIN,
      password: adminHashedPassword,
    },
  });

  const professional = await prisma.user.create({
    data: {
      email: "pro@consultorio.local",
      name: "Dra. Ana López",
      role: UserRole.PROFESSIONAL,
      password: professionalHashedPassword,
      professionalProfile: {
        create: {
          specialty: Specialty.BOTH,
          title: "Licenciada en Nutrición y Entrenamiento",
          bio: "Especialista en acompañamiento integral de hábitos saludables, con más de 10 años de experiencia en consulta ambulatoria.",
          licenseNumber: "MP-12345",
          location: "Buenos Aires, Argentina",
          modality: Modality.BOTH,
          price: 15000,
          isValidated: true,
        },
      },
    },
  });

  const patient = await prisma.user.create({
    data: {
      email: "patient@consultorio.local",
      name: "Carlos Pérez",
      role: UserRole.PATIENT,
      password: patientHashedPassword,
      patientProfile: {
        create: {
          weight: 78.5,
          height: 1.75,
          gender: "male",
          bloodType: "O+",
          birthDate: new Date("1988-03-15"),
          allergies: "Ninguna conocida",
          restrictions: "Sin restricciones alimentarias",
          goals: "Bajar de peso y mejorar condición física",
        },
      },
    },
  });

  await prisma.appointment.create({
    data: {
      patientId: patient.id,
      professionalId: professional.id,
      scheduledAt: new Date("2025-06-15T10:00:00.000Z"),
      status: AppointmentStatus.COMPLETED,
      notes: "Consulta inicial de nutrición completada.",
    },
  });

  console.log("Seed completed successfully.");
  console.log(`Admin — Email: ${admin.email}`);
  console.log(`Professional — Email: pro@consultorio.local`);
  console.log(`Patient — Email: patient@consultorio.local`);
  console.log(
    "Passwords are set via ADMIN_PASSWORD, PROFESSIONAL_PASSWORD, and PATIENT_PASSWORD environment variables."
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

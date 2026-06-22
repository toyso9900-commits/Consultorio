import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = "admin@consultorio.local";

  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existing) {
    console.log("Super admin already exists. Skipping seed.");
    return;
  }

  const hashedPassword = await bcrypt.hash("Admin123!", 12);

  await prisma.user.create({
    data: {
      email: adminEmail,
      name: "Super Admin",
      role: UserRole.ADMIN,
      password: hashedPassword,
    },
  });

  console.log("Super admin created successfully.");
  console.log("Email: admin@consultorio.local");
  console.log("Password: Admin123!");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

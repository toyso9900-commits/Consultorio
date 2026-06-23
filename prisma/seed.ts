import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

const DEFAULT_ADMIN_PASSWORD = "Admin123!";

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

  if (adminPassword === DEFAULT_ADMIN_PASSWORD) {
    console.warn(
      "\n⚠️  WARNING: You are using the default admin password."
    );
    console.warn(
      "Set ADMIN_PASSWORD in your .env file before deploying to production.\n"
    );
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.user.create({
    data: {
      email: adminEmail,
      name: "Super Admin",
      role: UserRole.ADMIN,
      password: hashedPassword,
    },
  });

  console.log("Super admin created successfully.");
  console.log(`Email: ${adminEmail}`);
  console.log(
    "Password: [hidden] (set via ADMIN_PASSWORD environment variable)"
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

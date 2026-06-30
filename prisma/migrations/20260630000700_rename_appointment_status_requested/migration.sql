-- AlterEnum
ALTER TYPE "AppointmentStatus" RENAME VALUE 'PENDING' TO 'REQUESTED';

-- AlterTable
ALTER TABLE "Appointment" ALTER COLUMN "status" SET DEFAULT 'REQUESTED';

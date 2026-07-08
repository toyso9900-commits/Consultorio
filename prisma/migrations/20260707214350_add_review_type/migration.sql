-- CreateEnum
CREATE TYPE "ReviewType" AS ENUM ('PROFESSIONAL', 'PLATFORM');

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "type" "ReviewType" NOT NULL DEFAULT 'PROFESSIONAL',
ALTER COLUMN "appointmentId" DROP NOT NULL,
ALTER COLUMN "professionalId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Review_type_idx" ON "Review"("type");

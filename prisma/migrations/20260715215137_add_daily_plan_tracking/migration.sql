-- CreateEnum
CREATE TYPE "RoutineItemType" AS ENUM ('CHECK', 'WATER', 'AUTO_MEALS');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "timezone" TEXT;

-- CreateTable
CREATE TABLE "RoutineItem" (
    "id" TEXT NOT NULL,
    "routineId" TEXT NOT NULL,
    "type" "RoutineItemType" NOT NULL DEFAULT 'CHECK',
    "title" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "goal" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoutineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineItemCompletion" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "RoutineItemCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoutineItem_routineId_sortOrder_idx" ON "RoutineItem"("routineId", "sortOrder");

-- CreateIndex
CREATE INDEX "RoutineItemCompletion_patientId_date_idx" ON "RoutineItemCompletion"("patientId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "RoutineItemCompletion_itemId_patientId_date_key" ON "RoutineItemCompletion"("itemId", "patientId", "date");

-- AddForeignKey
ALTER TABLE "RoutineItem" ADD CONSTRAINT "RoutineItem_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineItemCompletion" ADD CONSTRAINT "RoutineItemCompletion_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "RoutineItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineItemCompletion" ADD CONSTRAINT "RoutineItemCompletion_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('TEST', 'STRIPE', 'MERCADOPAGO');

-- AlterTable
ALTER TABLE "ProfessionalProfile" ADD COLUMN     "planDuration" TEXT,
ADD COLUMN     "planPrice" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "PatientSubscription" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "pricePaid" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MXN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Routine" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Routine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "payerId" TEXT NOT NULL,
    "payeeId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MXN',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PAID',
    "provider" "PaymentProvider" NOT NULL DEFAULT 'TEST',
    "providerRef" TEXT,
    "patientSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PatientSubscription_professionalId_expiresAt_idx" ON "PatientSubscription"("professionalId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "PatientSubscription_patientId_professionalId_key" ON "PatientSubscription"("patientId", "professionalId");

-- CreateIndex
CREATE UNIQUE INDEX "Routine_patientId_professionalId_key" ON "Routine"("patientId", "professionalId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_patientSubscriptionId_key" ON "Payment"("patientSubscriptionId");

-- CreateIndex
CREATE INDEX "Payment_payerId_createdAt_idx" ON "Payment"("payerId", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_payeeId_createdAt_idx" ON "Payment"("payeeId", "createdAt");

-- AddForeignKey
ALTER TABLE "PatientSubscription" ADD CONSTRAINT "PatientSubscription_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientSubscription" ADD CONSTRAINT "PatientSubscription_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Routine" ADD CONSTRAINT "Routine_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Routine" ADD CONSTRAINT "Routine_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_payeeId_fkey" FOREIGN KEY ("payeeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_patientSubscriptionId_fkey" FOREIGN KEY ("patientSubscriptionId") REFERENCES "PatientSubscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

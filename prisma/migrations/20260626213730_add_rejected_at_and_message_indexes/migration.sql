-- AlterTable
ALTER TABLE "ProfessionalProfile" ADD COLUMN     "rejectedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Message_receiverId_readAt_idx" ON "Message"("receiverId", "readAt");

-- CreateIndex
CREATE INDEX "Message_senderId_receiverId_idx" ON "Message"("senderId", "receiverId");

-- CreateIndex
CREATE INDEX "ProfessionalProfile_isValidated_rejectedAt_idx" ON "ProfessionalProfile"("isValidated", "rejectedAt");

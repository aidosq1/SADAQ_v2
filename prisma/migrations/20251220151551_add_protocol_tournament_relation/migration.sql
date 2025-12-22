-- AlterTable
ALTER TABLE "Protocol" ADD COLUMN     "tournamentId" INTEGER;

-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "regulationUrl" TEXT;

-- CreateIndex
CREATE INDEX "Protocol_tournamentId_idx" ON "Protocol"("tournamentId");

-- AddForeignKey
ALTER TABLE "Protocol" ADD CONSTRAINT "Protocol_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE SET NULL ON UPDATE CASCADE;

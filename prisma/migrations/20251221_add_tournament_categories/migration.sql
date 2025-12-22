-- CreateTable
CREATE TABLE "TournamentCategory" (
    "id" SERIAL NOT NULL,
    "tournamentId" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "regulationUrl" TEXT,

    CONSTRAINT "TournamentCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentResult" (
    "id" SERIAL NOT NULL,
    "tournamentCategoryId" INTEGER NOT NULL,
    "athleteId" INTEGER NOT NULL,
    "place" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "score" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TournamentResult_pkey" PRIMARY KEY ("id")
);

-- AlterTable Protocol: rename tournamentId to tournamentCategoryId
ALTER TABLE "Protocol" RENAME COLUMN "tournamentId" TO "tournamentCategoryId";

-- AlterTable Registration: rename tournamentId to tournamentCategoryId
ALTER TABLE "Registration" RENAME COLUMN "tournamentId" TO "tournamentCategoryId";

-- DropIndex
DROP INDEX IF EXISTS "Protocol_tournamentId_idx";
DROP INDEX IF EXISTS "Registration_tournamentId_idx";

-- AlterTable Tournament: drop regulationUrl
ALTER TABLE "Tournament" DROP COLUMN IF EXISTS "regulationUrl";

-- CreateIndex
CREATE UNIQUE INDEX "TournamentCategory_tournamentId_category_gender_type_key" ON "TournamentCategory"("tournamentId", "category", "gender", "type");

-- CreateIndex
CREATE INDEX "TournamentCategory_tournamentId_idx" ON "TournamentCategory"("tournamentId");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentResult_tournamentCategoryId_athleteId_key" ON "TournamentResult"("tournamentCategoryId", "athleteId");

-- CreateIndex
CREATE INDEX "TournamentResult_athleteId_idx" ON "TournamentResult"("athleteId");

-- CreateIndex
CREATE INDEX "TournamentResult_tournamentCategoryId_idx" ON "TournamentResult"("tournamentCategoryId");

-- CreateIndex
CREATE INDEX "Protocol_tournamentCategoryId_idx" ON "Protocol"("tournamentCategoryId");

-- CreateIndex
CREATE INDEX "Registration_tournamentCategoryId_idx" ON "Registration"("tournamentCategoryId");

-- CreateIndex
CREATE INDEX "Tournament_startDate_idx" ON "Tournament"("startDate");

-- CreateIndex
CREATE INDEX "Tournament_isActive_idx" ON "Tournament"("isActive");

-- AddForeignKey
ALTER TABLE "TournamentCategory" ADD CONSTRAINT "TournamentCategory_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentResult" ADD CONSTRAINT "TournamentResult_tournamentCategoryId_fkey" FOREIGN KEY ("tournamentCategoryId") REFERENCES "TournamentCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentResult" ADD CONSTRAINT "TournamentResult_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Update Protocol foreign key
ALTER TABLE "Protocol" DROP CONSTRAINT IF EXISTS "Protocol_tournamentId_fkey";
ALTER TABLE "Protocol" ADD CONSTRAINT "Protocol_tournamentCategoryId_fkey" FOREIGN KEY ("tournamentCategoryId") REFERENCES "TournamentCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Update Registration foreign key
ALTER TABLE "Registration" DROP CONSTRAINT IF EXISTS "Registration_tournamentId_fkey";
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_tournamentCategoryId_fkey" FOREIGN KEY ("tournamentCategoryId") REFERENCES "TournamentCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

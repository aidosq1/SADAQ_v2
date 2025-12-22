/*
  Warnings:

  - You are about to drop the column `category` on the `Athlete` table. All the data in the column will be lost.
  - You are about to drop the column `coachName` on the `Athlete` table. All the data in the column will be lost.
  - You are about to drop the column `coachNameEn` on the `Athlete` table. All the data in the column will be lost.
  - You are about to drop the column `coachNameKk` on the `Athlete` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Athlete` table. All the data in the column will be lost.
  - You are about to drop the column `isMain` on the `News` table. All the data in the column will be lost.
  - You are about to drop the column `judgeCategory` on the `Registration` table. All the data in the column will be lost.
  - You are about to drop the column `judgeName` on the `Registration` table. All the data in the column will be lost.
  - You are about to drop the column `judgeRegion` on the `Registration` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Tournament` table. All the data in the column will be lost.
  - You are about to drop the column `regulationUrl` on the `TournamentCategory` table. All the data in the column will be lost.
  - You are about to drop the `Slide` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[registrationNumber]` on the table `Registration` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tournamentCategoryId,regionId]` on the table `Registration` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `registrationNumber` to the `Registration` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN');

-- DropIndex
DROP INDEX "Athlete_category_idx";

-- DropIndex
DROP INDEX "Athlete_region_idx";

-- DropIndex
DROP INDEX "Athlete_type_gender_idx";

-- DropIndex
DROP INDEX "Athlete_type_idx";

-- DropIndex
DROP INDEX "Tournament_isActive_idx";

-- AlterTable
ALTER TABLE "Athlete" DROP COLUMN "category",
DROP COLUMN "coachName",
DROP COLUMN "coachNameEn",
DROP COLUMN "coachNameKk",
DROP COLUMN "type",
ADD COLUMN     "regionId" INTEGER,
ALTER COLUMN "region" DROP NOT NULL;

-- AlterTable
ALTER TABLE "AthleteRegistration" ADD COLUMN     "coachId" INTEGER;

-- AlterTable
ALTER TABLE "Document" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "GalleryItem" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "HistoryEvent" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "News" DROP COLUMN "isMain",
ADD COLUMN     "showInSlider" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sliderOrder" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Partner" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Protocol" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "RankingEntry" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Region" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Registration" DROP COLUMN "judgeCategory",
DROP COLUMN "judgeName",
DROP COLUMN "judgeRegion",
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "judgeId" INTEGER,
ADD COLUMN     "regionId" INTEGER,
ADD COLUMN     "registrationNumber" TEXT NOT NULL,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "SiteContent" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "SiteStat" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Staff" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Tournament" DROP COLUMN "isActive",
ADD COLUMN     "isRegistrationOpen" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "registrationDeadline" TIMESTAMP(3),
ADD COLUMN     "regulationUrl" TEXT;

-- AlterTable
ALTER TABLE "TournamentCategory" DROP COLUMN "regulationUrl";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "email" TEXT,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "regionId" INTEGER;

-- DropTable
DROP TABLE "Slide";

-- CreateTable
CREATE TABLE "Coach" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nameKk" TEXT,
    "nameEn" TEXT,
    "iin" TEXT,
    "dob" TEXT,
    "regionId" INTEGER,
    "image" TEXT,
    "bio" TEXT,
    "bioKk" TEXT,
    "bioEn" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Coach_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Judge" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nameKk" TEXT,
    "nameEn" TEXT,
    "iin" TEXT,
    "dob" TEXT,
    "category" TEXT NOT NULL,
    "categoryKk" TEXT,
    "categoryEn" TEXT,
    "regionId" INTEGER,
    "image" TEXT,
    "bio" TEXT,
    "bioKk" TEXT,
    "bioEn" TEXT,
    "certifications" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Judge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AthleteCoach" (
    "id" SERIAL NOT NULL,
    "athleteId" INTEGER NOT NULL,
    "coachId" INTEGER NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AthleteCoach_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistrationJudge" (
    "id" SERIAL NOT NULL,
    "registrationId" INTEGER NOT NULL,
    "judgeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistrationJudge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Translation" (
    "id" SERIAL NOT NULL,
    "namespace" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "ru" TEXT NOT NULL,
    "kk" TEXT,
    "en" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Coach_isActive_idx" ON "Coach"("isActive");

-- CreateIndex
CREATE INDEX "Coach_regionId_idx" ON "Coach"("regionId");

-- CreateIndex
CREATE INDEX "Judge_isActive_idx" ON "Judge"("isActive");

-- CreateIndex
CREATE INDEX "Judge_regionId_idx" ON "Judge"("regionId");

-- CreateIndex
CREATE INDEX "Judge_category_idx" ON "Judge"("category");

-- CreateIndex
CREATE INDEX "AthleteCoach_athleteId_idx" ON "AthleteCoach"("athleteId");

-- CreateIndex
CREATE INDEX "AthleteCoach_coachId_idx" ON "AthleteCoach"("coachId");

-- CreateIndex
CREATE UNIQUE INDEX "AthleteCoach_athleteId_coachId_key" ON "AthleteCoach"("athleteId", "coachId");

-- CreateIndex
CREATE INDEX "RegistrationJudge_registrationId_idx" ON "RegistrationJudge"("registrationId");

-- CreateIndex
CREATE INDEX "RegistrationJudge_judgeId_idx" ON "RegistrationJudge"("judgeId");

-- CreateIndex
CREATE UNIQUE INDEX "RegistrationJudge_registrationId_judgeId_key" ON "RegistrationJudge"("registrationId", "judgeId");

-- CreateIndex
CREATE INDEX "Translation_namespace_idx" ON "Translation"("namespace");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_namespace_key_key" ON "Translation"("namespace", "key");

-- CreateIndex
CREATE INDEX "Athlete_regionId_idx" ON "Athlete"("regionId");

-- CreateIndex
CREATE INDEX "Athlete_gender_idx" ON "Athlete"("gender");

-- CreateIndex
CREATE INDEX "AthleteRegistration_coachId_idx" ON "AthleteRegistration"("coachId");

-- CreateIndex
CREATE INDEX "News_showInSlider_idx" ON "News"("showInSlider");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_registrationNumber_key" ON "Registration"("registrationNumber");

-- CreateIndex
CREATE INDEX "Registration_status_idx" ON "Registration"("status");

-- CreateIndex
CREATE INDEX "Registration_judgeId_idx" ON "Registration"("judgeId");

-- CreateIndex
CREATE INDEX "Registration_regionId_idx" ON "Registration"("regionId");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_tournamentCategoryId_regionId_key" ON "Registration"("tournamentCategoryId", "regionId");

-- CreateIndex
CREATE INDEX "Tournament_isRegistrationOpen_idx" ON "Tournament"("isRegistrationOpen");

-- CreateIndex
CREATE INDEX "User_regionId_idx" ON "User"("regionId");

-- AddForeignKey
ALTER TABLE "Athlete" ADD CONSTRAINT "Athlete_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coach" ADD CONSTRAINT "Coach_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Judge" ADD CONSTRAINT "Judge_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AthleteCoach" ADD CONSTRAINT "AthleteCoach_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AthleteCoach" ADD CONSTRAINT "AthleteCoach_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AthleteRegistration" ADD CONSTRAINT "AthleteRegistration_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "Judge"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistrationJudge" ADD CONSTRAINT "RegistrationJudge_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistrationJudge" ADD CONSTRAINT "RegistrationJudge_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "Judge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentResult" ADD CONSTRAINT "TournamentResult_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

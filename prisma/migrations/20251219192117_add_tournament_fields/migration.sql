-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "description" TEXT,
ADD COLUMN     "descriptionEn" TEXT,
ADD COLUMN     "descriptionKk" TEXT,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;

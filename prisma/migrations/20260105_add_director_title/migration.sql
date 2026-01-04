-- AlterTable
ALTER TABLE "Region" ADD COLUMN "directorTitle" TEXT NOT NULL DEFAULT 'Президент филиала';
ALTER TABLE "Region" ADD COLUMN "directorTitleKk" TEXT;
ALTER TABLE "Region" ADD COLUMN "directorTitleEn" TEXT;

-- Update existing regions with translations
UPDATE "Region" SET
  "directorTitleKk" = 'Филиал президенті',
  "directorTitleEn" = 'Branch President';

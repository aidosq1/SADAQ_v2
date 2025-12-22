-- Migration: Refactor National Team Memberships and Rankings
-- Adds NationalTeamMembership table, updates RankingEntry with category/gender/type

-- ============ STEP 1: Create NationalTeamMembership table ============
CREATE TABLE IF NOT EXISTS "NationalTeamMembership" (
    "id" SERIAL NOT NULL,
    "athleteId" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "NationalTeamMembership_pkey" PRIMARY KEY ("id")
);

-- ============ STEP 2: Migrate existing national team athletes ============
-- If isNationalTeam column exists, migrate data to NationalTeamMembership
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'Athlete' AND column_name = 'isNationalTeam') THEN
        INSERT INTO "NationalTeamMembership" ("athleteId", "category", "gender", "type", "isActive")
        SELECT "id", "category", "gender", "type", true
        FROM "Athlete"
        WHERE "isNationalTeam" = true;
    END IF;
END $$;

-- ============ STEP 3: Drop isNationalTeam column if exists ============
ALTER TABLE "Athlete" DROP COLUMN IF EXISTS "isNationalTeam";

-- ============ STEP 4: Update RankingEntry - add new columns ============
ALTER TABLE "RankingEntry" ADD COLUMN IF NOT EXISTS "category" TEXT;
ALTER TABLE "RankingEntry" ADD COLUMN IF NOT EXISTS "gender" TEXT;
ALTER TABLE "RankingEntry" ADD COLUMN IF NOT EXISTS "type" TEXT;

-- ============ STEP 5: Migrate ranking data from athlete ============
UPDATE "RankingEntry" r
SET
    "category" = a."category",
    "gender" = a."gender",
    "type" = a."type"
FROM "Athlete" a
WHERE r."athleteId" = a."id" AND r."category" IS NULL;

-- Set defaults for any orphaned records
UPDATE "RankingEntry"
SET
    "category" = COALESCE("category", 'Adults'),
    "gender" = COALESCE("gender", 'M'),
    "type" = COALESCE("type", 'Recurve');

-- ============ STEP 6: Make new columns NOT NULL ============
ALTER TABLE "RankingEntry" ALTER COLUMN "category" SET NOT NULL;
ALTER TABLE "RankingEntry" ALTER COLUMN "gender" SET NOT NULL;
ALTER TABLE "RankingEntry" ALTER COLUMN "type" SET NOT NULL;

-- ============ STEP 7: Drop old season column and constraints ============
ALTER TABLE "RankingEntry" DROP CONSTRAINT IF EXISTS "RankingEntry_athleteId_season_key";
ALTER TABLE "RankingEntry" DROP COLUMN IF EXISTS "season";
ALTER TABLE "RankingEntry" DROP COLUMN IF EXISTS "recordedAt";

-- ============ STEP 8: Add new indexes and constraints ============
-- NationalTeamMembership indexes
ALTER TABLE "NationalTeamMembership" ADD CONSTRAINT "NationalTeamMembership_athleteId_fkey"
    FOREIGN KEY ("athleteId") REFERENCES "Athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE UNIQUE INDEX IF NOT EXISTS "NationalTeamMembership_athleteId_category_gender_type_key"
    ON "NationalTeamMembership"("athleteId", "category", "gender", "type");
CREATE INDEX IF NOT EXISTS "NationalTeamMembership_category_gender_type_idx"
    ON "NationalTeamMembership"("category", "gender", "type");
CREATE INDEX IF NOT EXISTS "NationalTeamMembership_athleteId_idx"
    ON "NationalTeamMembership"("athleteId");

-- RankingEntry indexes
CREATE UNIQUE INDEX IF NOT EXISTS "RankingEntry_athleteId_category_gender_type_key"
    ON "RankingEntry"("athleteId", "category", "gender", "type");
CREATE INDEX IF NOT EXISTS "RankingEntry_category_gender_type_points_idx"
    ON "RankingEntry"("category", "gender", "type", "points");

-- Drop old index if exists
DROP INDEX IF EXISTS "RankingEntry_season_idx";

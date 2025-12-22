-- Migration: Merge TeamMember into Athlete and restructure
-- Handles: TeamMember (national team) + old Athlete (tournament registrations) → unified Athlete

-- ============ STEP 1: Backup old Athlete data to temp table ============
CREATE TEMP TABLE temp_old_athlete AS SELECT * FROM "Athlete";

-- ============ STEP 2: Drop old Athlete table and foreign keys ============
ALTER TABLE "Athlete" DROP CONSTRAINT IF EXISTS "Athlete_registrationId_fkey";
DROP TABLE IF EXISTS "Athlete" CASCADE;

-- ============ STEP 3: Create new unified Athlete table ============
CREATE TABLE "Athlete" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameKk" TEXT,
    "nameEn" TEXT,
    "iin" TEXT,
    "birthYear" INTEGER,
    "dob" TEXT,
    "gender" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "coachName" TEXT,
    "coachNameKk" TEXT,
    "coachNameEn" TEXT,
    "image" TEXT,
    "bio" TEXT,
    "bioKk" TEXT,
    "bioEn" TEXT,
    "isNationalTeam" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Athlete_pkey" PRIMARY KEY ("id")
);

-- ============ STEP 4: Create AthleteRegistration junction table ============
CREATE TABLE IF NOT EXISTS "AthleteRegistration" (
    "id" SERIAL NOT NULL,
    "athleteId" INTEGER NOT NULL,
    "registrationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AthleteRegistration_pkey" PRIMARY KEY ("id")
);

-- ============ STEP 5: Import TeamMember data into Athlete (isNationalTeam = true) ============
INSERT INTO "Athlete" (
    "id", "slug", "name", "nameKk", "nameEn", "birthYear", "gender", "type", "category",
    "region", "coachName", "coachNameKk", "coachNameEn", "image", "bio", "bioKk", "bioEn",
    "isNationalTeam", "isActive", "sortOrder", "createdAt", "updatedAt"
)
SELECT
    "id", "slug", "name", "nameKk", "nameEn", "birthYear", "gender", "type", "category",
    "region", "coachName", "coachNameKk", "coachNameEn", "image", "bio", "bioKk", "bioEn",
    true, "isActive", "sortOrder", "createdAt", "updatedAt"
FROM "TeamMember";

-- Set sequence to continue after TeamMember IDs
SELECT setval('"Athlete_id_seq"', COALESCE((SELECT MAX(id) FROM "Athlete"), 0) + 1, false);

-- ============ STEP 6: Import old Athlete (registration) data ============
-- Convert weaponClass (Recurve/Compound) to type, generate slug from fullName
INSERT INTO "Athlete" (
    "slug", "name", "iin", "dob", "gender", "type", "category", "region", "coachName",
    "isNationalTeam", "isActive", "createdAt", "updatedAt"
)
SELECT
    LOWER(REPLACE(REPLACE(REPLACE("fullName", ' ', '-'), '.', ''), '''', '')) || '-' || "id"::TEXT as slug,
    "fullName" as name,
    "iin",
    "dob",
    "gender",
    "weaponClass" as type,
    "category",
    'unknown' as region,
    "coachName",
    false as isNationalTeam,
    true as isActive,
    "createdAt",
    "createdAt" as updatedAt
FROM temp_old_athlete;

-- ============ STEP 7: Create AthleteRegistration records ============
-- Link old athletes to their registrations
INSERT INTO "AthleteRegistration" ("athleteId", "registrationId", "createdAt")
SELECT a.id, toa."registrationId", toa."createdAt"
FROM "Athlete" a
JOIN temp_old_athlete toa ON a.name = toa."fullName" AND a.iin = toa.iin
WHERE toa."registrationId" IS NOT NULL;

-- ============ STEP 8: Update RankingEntry to use athleteId ============
ALTER TABLE "RankingEntry" ADD COLUMN IF NOT EXISTS "athleteId" INTEGER;

UPDATE "RankingEntry" SET "athleteId" = "teamMemberId";

ALTER TABLE "RankingEntry" ALTER COLUMN "athleteId" SET NOT NULL;

-- Drop old constraint and column
ALTER TABLE "RankingEntry" DROP CONSTRAINT IF EXISTS "RankingEntry_teamMemberId_fkey";
ALTER TABLE "RankingEntry" DROP CONSTRAINT IF EXISTS "RankingEntry_teamMemberId_season_key";
ALTER TABLE "RankingEntry" DROP COLUMN IF EXISTS "teamMemberId";

-- ============ STEP 9: Add constraints and indexes ============
-- Athlete constraints
CREATE UNIQUE INDEX IF NOT EXISTS "Athlete_slug_key" ON "Athlete"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "Athlete_iin_key" ON "Athlete"("iin") WHERE "iin" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "Athlete_type_idx" ON "Athlete"("type");
CREATE INDEX IF NOT EXISTS "Athlete_type_gender_idx" ON "Athlete"("type", "gender");
CREATE INDEX IF NOT EXISTS "Athlete_category_idx" ON "Athlete"("category");
CREATE INDEX IF NOT EXISTS "Athlete_region_idx" ON "Athlete"("region");
CREATE INDEX IF NOT EXISTS "Athlete_isActive_idx" ON "Athlete"("isActive");
CREATE INDEX IF NOT EXISTS "Athlete_isNationalTeam_idx" ON "Athlete"("isNationalTeam");

-- AthleteRegistration constraints
ALTER TABLE "AthleteRegistration" ADD CONSTRAINT "AthleteRegistration_athleteId_fkey"
    FOREIGN KEY ("athleteId") REFERENCES "Athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AthleteRegistration" ADD CONSTRAINT "AthleteRegistration_registrationId_fkey"
    FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE UNIQUE INDEX IF NOT EXISTS "AthleteRegistration_athleteId_registrationId_key" ON "AthleteRegistration"("athleteId", "registrationId");
CREATE INDEX IF NOT EXISTS "AthleteRegistration_athleteId_idx" ON "AthleteRegistration"("athleteId");
CREATE INDEX IF NOT EXISTS "AthleteRegistration_registrationId_idx" ON "AthleteRegistration"("registrationId");

-- RankingEntry constraints
ALTER TABLE "RankingEntry" ADD CONSTRAINT "RankingEntry_athleteId_fkey"
    FOREIGN KEY ("athleteId") REFERENCES "Athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE UNIQUE INDEX IF NOT EXISTS "RankingEntry_athleteId_season_key" ON "RankingEntry"("athleteId", "season");
CREATE INDEX IF NOT EXISTS "RankingEntry_athleteId_idx" ON "RankingEntry"("athleteId");

-- ============ STEP 10: Drop TeamMember table ============
DROP TABLE IF EXISTS "TeamMember";

-- ============ STEP 11: Cleanup ============
DROP TABLE IF EXISTS temp_old_athlete;

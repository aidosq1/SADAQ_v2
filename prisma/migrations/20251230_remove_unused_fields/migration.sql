-- Remove unused fields from database schema

-- Drop AthleteCoach table (athlete-coach relationship no longer needed)
DROP TABLE IF EXISTS "AthleteCoach";

-- Remove bio fields from Athlete
ALTER TABLE "Athlete" DROP COLUMN IF EXISTS "bio";
ALTER TABLE "Athlete" DROP COLUMN IF EXISTS "bioKk";
ALTER TABLE "Athlete" DROP COLUMN IF EXISTS "bioEn";
ALTER TABLE "Athlete" DROP COLUMN IF EXISTS "birthYear";
ALTER TABLE "Athlete" DROP COLUMN IF EXISTS "region";

-- Remove bio fields from Coach
ALTER TABLE "Coach" DROP COLUMN IF EXISTS "bio";
ALTER TABLE "Coach" DROP COLUMN IF EXISTS "bioKk";
ALTER TABLE "Coach" DROP COLUMN IF EXISTS "bioEn";

-- Remove bio and certifications fields from Judge
ALTER TABLE "Judge" DROP COLUMN IF EXISTS "bio";
ALTER TABLE "Judge" DROP COLUMN IF EXISTS "bioKk";
ALTER TABLE "Judge" DROP COLUMN IF EXISTS "bioEn";
ALTER TABLE "Judge" DROP COLUMN IF EXISTS "certifications";

-- Remove judgeId from Registration (using RegistrationJudge instead)
ALTER TABLE "Registration" DROP CONSTRAINT IF EXISTS "Registration_judgeId_fkey";
ALTER TABLE "Registration" DROP COLUMN IF EXISTS "judgeId";

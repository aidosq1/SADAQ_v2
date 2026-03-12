-- 1. Change AthleteRegistration -> Athlete from CASCADE to RESTRICT
-- Prevents deletion of athletes that are part of registrations
ALTER TABLE "AthleteRegistration" DROP CONSTRAINT "AthleteRegistration_athleteId_fkey";
ALTER TABLE "AthleteRegistration" ADD CONSTRAINT "AthleteRegistration_athleteId_fkey"
  FOREIGN KEY ("athleteId") REFERENCES "Athlete"("id") ON UPDATE CASCADE ON DELETE RESTRICT;

-- 2. Replace absolute unique constraint with partial unique index on Registration
-- Allows re-registration after REJECTED or WITHDRAWN status
DROP INDEX IF EXISTS "Registration_tournamentCategoryId_regionId_key";
CREATE UNIQUE INDEX "Registration_tournamentCategoryId_regionId_key"
  ON "Registration" ("tournamentCategoryId", "regionId")
  WHERE status NOT IN ('REJECTED', 'WITHDRAWN');

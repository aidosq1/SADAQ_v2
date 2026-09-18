-- Add isGeneral flag to distinguish general (title) partners from regular partners
ALTER TABLE "Partner" ADD COLUMN "isGeneral" BOOLEAN NOT NULL DEFAULT false;

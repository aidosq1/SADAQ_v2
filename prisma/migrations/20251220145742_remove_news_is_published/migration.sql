/*
  Warnings:

  - You are about to drop the column `isPublished` on the `News` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "News_isPublished_publishedAt_idx";

-- AlterTable
ALTER TABLE "News" DROP COLUMN "isPublished";

-- CreateIndex
CREATE INDEX "News_publishedAt_idx" ON "News"("publishedAt");

-- CreateTable
CREATE TABLE "SiteStat" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "labelKk" TEXT,
    "labelEn" TEXT,
    "iconType" TEXT NOT NULL DEFAULT 'default',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SiteStat_key_key" ON "SiteStat"("key");

-- CreateIndex
CREATE INDEX "SiteStat_isActive_idx" ON "SiteStat"("isActive");

-- CreateIndex
CREATE INDEX "SiteStat_sortOrder_idx" ON "SiteStat"("sortOrder");

-- CreateTable
CREATE TABLE "Region" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nameKk" TEXT,
    "nameEn" TEXT,
    "director" TEXT NOT NULL,
    "directorKk" TEXT,
    "directorEn" TEXT,
    "address" TEXT NOT NULL,
    "addressKk" TEXT,
    "addressEn" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoryEvent" (
    "id" SERIAL NOT NULL,
    "year" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleKk" TEXT,
    "titleEn" TEXT,
    "description" TEXT NOT NULL,
    "descriptionKk" TEXT,
    "descriptionEn" TEXT,
    "iconType" TEXT NOT NULL DEFAULT 'calendar',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HistoryEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Protocol" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "titleKk" TEXT,
    "titleEn" TEXT,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "locationKk" TEXT,
    "locationEn" TEXT,
    "fileUrl" TEXT,
    "year" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Protocol_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Region_isActive_idx" ON "Region"("isActive");

-- CreateIndex
CREATE INDEX "HistoryEvent_isActive_idx" ON "HistoryEvent"("isActive");

-- CreateIndex
CREATE INDEX "HistoryEvent_sortOrder_idx" ON "HistoryEvent"("sortOrder");

-- CreateIndex
CREATE INDEX "Protocol_year_idx" ON "Protocol"("year");

-- CreateIndex
CREATE INDEX "Protocol_isPublished_idx" ON "Protocol"("isPublished");

-- CreateTable
CREATE TABLE "SiteContent" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "valueKk" TEXT,
    "valueEn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SiteContent_key_key" ON "SiteContent"("key");

-- CreateIndex
CREATE INDEX "SiteContent_section_idx" ON "SiteContent"("section");

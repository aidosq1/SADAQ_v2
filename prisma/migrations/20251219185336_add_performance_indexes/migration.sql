-- CreateIndex
CREATE INDEX "Document_section_idx" ON "Document"("section");

-- CreateIndex
CREATE INDEX "Document_isPublished_idx" ON "Document"("isPublished");

-- CreateIndex
CREATE INDEX "GalleryItem_type_idx" ON "GalleryItem"("type");

-- CreateIndex
CREATE INDEX "GalleryItem_eventDate_idx" ON "GalleryItem"("eventDate");

-- CreateIndex
CREATE INDEX "GalleryItem_isPublished_idx" ON "GalleryItem"("isPublished");

-- CreateIndex
CREATE INDEX "News_category_idx" ON "News"("category");

-- CreateIndex
CREATE INDEX "News_isPublished_publishedAt_idx" ON "News"("isPublished", "publishedAt");

-- CreateIndex
CREATE INDEX "Registration_tournamentId_idx" ON "Registration"("tournamentId");

-- CreateIndex
CREATE INDEX "Registration_userId_idx" ON "Registration"("userId");

-- CreateIndex
CREATE INDEX "TeamMember_type_idx" ON "TeamMember"("type");

-- CreateIndex
CREATE INDEX "TeamMember_type_gender_idx" ON "TeamMember"("type", "gender");

-- CreateIndex
CREATE INDEX "TeamMember_category_idx" ON "TeamMember"("category");

-- CreateIndex
CREATE INDEX "TeamMember_region_idx" ON "TeamMember"("region");

-- CreateIndex
CREATE INDEX "TeamMember_isActive_idx" ON "TeamMember"("isActive");

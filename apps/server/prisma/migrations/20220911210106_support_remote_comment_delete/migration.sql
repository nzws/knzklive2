/*
  Warnings:

  - A unique constraint covering the columns `[liveId,sourceUrl,sourceId]` on the table `Comment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "sourceId" VARCHAR(100);

-- CreateIndex
CREATE UNIQUE INDEX "Comment_liveId_sourceUrl_sourceId_key" ON "Comment"("liveId", "sourceUrl", "sourceId");

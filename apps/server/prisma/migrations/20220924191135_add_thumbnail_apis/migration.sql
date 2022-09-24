-- CreateEnum
CREATE TYPE "ImageType" AS ENUM ('Thumbnail', 'CustomThumbnail');

-- CreateEnum
CREATE TYPE "ImageBucket" AS ENUM ('Static');

-- AlterTable
ALTER TABLE "Live" ADD COLUMN     "config" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "thumbnailId" INTEGER;

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "url" VARCHAR(200) NOT NULL,
    "userId" INTEGER NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "type" "ImageType" NOT NULL,
    "bucket" "ImageBucket" NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdLiveId" INTEGER,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Image_type_tenantId_isDeleted_createdAt_idx" ON "Image"("type", "tenantId", "isDeleted", "createdAt");

-- AddForeignKey
ALTER TABLE "Live" ADD CONSTRAINT "Live_thumbnailId_fkey" FOREIGN KEY ("thumbnailId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_createdLiveId_fkey" FOREIGN KEY ("createdLiveId") REFERENCES "Live"("id") ON DELETE SET NULL ON UPDATE CASCADE;

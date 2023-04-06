/*
  Warnings:

  - You are about to drop the column `pushFirstStartedAt` on the `Live` table. All the data in the column will be lost.
  - You are about to drop the column `pushLastEndedAt` on the `Live` table. All the data in the column will be lost.
  - You are about to drop the column `pushLastStartedAt` on the `Live` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "LiveRecordingStatus" AS ENUM ('NotFound', 'Processing', 'Completed', 'Failed', 'Deleted');

-- AlterEnum
ALTER TYPE "LivePrivacy" ADD VALUE 'Hidden';

-- AlterTable
ALTER TABLE "Live" DROP COLUMN "pushFirstStartedAt",
DROP COLUMN "pushLastEndedAt",
DROP COLUMN "pushLastStartedAt",
ADD COLUMN     "isPushing" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isRecording" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "LiveStreamProgress" (
    "id" SERIAL NOT NULL,
    "liveId" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "LiveStreamProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveRecording" (
    "id" INTEGER NOT NULL,
    "originalKey" VARCHAR(200),
    "originalStatus" "LiveRecordingStatus" NOT NULL DEFAULT 'NotFound',
    "originalSize" BIGINT,
    "originalCompletedAt" TIMESTAMP(3),
    "cacheStatus" "LiveRecordingStatus" NOT NULL DEFAULT 'NotFound',
    "cacheSize" BIGINT,
    "cacheCompletedAt" TIMESTAMP(3),
    "watchCount" INTEGER NOT NULL DEFAULT 0,
    "watchCountUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiveRecording_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LiveStreamProgress_liveId_startedAt_idx" ON "LiveStreamProgress"("liveId", "startedAt");

-- AddForeignKey
ALTER TABLE "LiveStreamProgress" ADD CONSTRAINT "LiveStreamProgress_liveId_fkey" FOREIGN KEY ("liveId") REFERENCES "Live"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveRecording" ADD CONSTRAINT "LiveRecording_id_fkey" FOREIGN KEY ("id") REFERENCES "Live"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

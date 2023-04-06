/*
  Warnings:

  - You are about to drop the column `cacheStatus` on the `LiveRecording` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LiveRecording" DROP COLUMN "cacheStatus",
ADD COLUMN     "cacheHqStatus" "LiveRecordingStatus" NOT NULL DEFAULT 'NotFound';

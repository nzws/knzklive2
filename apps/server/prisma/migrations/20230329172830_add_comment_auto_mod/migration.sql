-- CreateEnum
CREATE TYPE "CommentAutoModType" AS ENUM ('Account', 'Domain', 'Text');

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "CommentAutoMod" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "CommentAutoModType" NOT NULL,
    "value" VARCHAR(200) NOT NULL,
    "temporary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CommentAutoMod_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CommentAutoMod" ADD CONSTRAINT "CommentAutoMod_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

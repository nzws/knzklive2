/*
  Warnings:

  - You are about to drop the column `customDomain` on the `Tenant` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Tenant_customDomain_key";

-- AlterTable
ALTER TABLE "Tenant" DROP COLUMN "customDomain";

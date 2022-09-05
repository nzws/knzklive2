-- CreateEnum
CREATE TYPE "AuthProviderType" AS ENUM ('Mastodon');

-- CreateEnum
CREATE TYPE "LiveStatus" AS ENUM ('Provisioning', 'Ready', 'Live', 'Ended');

-- CreateEnum
CREATE TYPE "LivePrivacy" AS ENUM ('Public', 'Private');

-- CreateEnum
CREATE TYPE "StreamingServerStatus" AS ENUM ('Provisioning', 'Ready', 'Using', 'Retied');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "account" VARCHAR(200) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSignedInAt" TIMESTAMP(3),
    "displayName" VARCHAR(200),
    "avatarUrl" VARCHAR(200),
    "config" JSONB NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" SERIAL NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "displayName" VARCHAR(200),
    "customDomain" VARCHAR(100),
    "config" JSONB NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthProvider" (
    "type" "AuthProviderType" NOT NULL,
    "domain" VARCHAR(100) NOT NULL,
    "clientId" VARCHAR(100) NOT NULL,
    "clientSecret" VARCHAR(100) NOT NULL,

    CONSTRAINT "AuthProvider_pkey" PRIMARY KEY ("domain")
);

-- CreateTable
CREATE TABLE "Live" (
    "id" SERIAL NOT NULL,
    "idInTenant" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "displayName" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "status" "LiveStatus" NOT NULL,
    "privacy" "LivePrivacy" NOT NULL,
    "streamingServerId" INTEGER NOT NULL,

    CONSTRAINT "Live_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreamingServer" (
    "id" SERIAL NOT NULL,
    "domain" VARCHAR(100) NOT NULL,
    "status" "StreamingServerStatus" NOT NULL,
    "originalIp" VARCHAR(100) NOT NULL,
    "dnsId" VARCHAR(100) NOT NULL,
    "vmId" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "retiedAt" TIMESTAMP(3),

    CONSTRAINT "StreamingServer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "liveId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "sourceUrl" VARCHAR(200),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_account_key" ON "User"("account");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_customDomain_key" ON "Tenant"("customDomain");

-- CreateIndex
CREATE UNIQUE INDEX "Live_idInTenant_tenantId_key" ON "Live"("idInTenant", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "StreamingServer_domain_key" ON "StreamingServer"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "StreamingServer_originalIp_key" ON "StreamingServer"("originalIp");

-- CreateIndex
CREATE UNIQUE INDEX "StreamingServer_dnsId_key" ON "StreamingServer"("dnsId");

-- CreateIndex
CREATE UNIQUE INDEX "StreamingServer_vmId_key" ON "StreamingServer"("vmId");

-- CreateIndex
CREATE INDEX "StreamingServer_status_idx" ON "StreamingServer"("status");

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Live" ADD CONSTRAINT "Live_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Live" ADD CONSTRAINT "Live_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Live" ADD CONSTRAINT "Live_streamingServerId_fkey" FOREIGN KEY ("streamingServerId") REFERENCES "StreamingServer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_liveId_fkey" FOREIGN KEY ("liveId") REFERENCES "Live"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

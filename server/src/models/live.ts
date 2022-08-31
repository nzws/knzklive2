import type {
  Live,
  LiveStatus,
  LivePrivacy,
  StreamStatus,
  PrismaClient
} from '@prisma/client';

export { LiveStatus, LivePrivacy, StreamStatus };

export type LivePublic = {
  id: number;
  idInTenant: number;
  userId: number;
  tenantId: number;
  startedAt?: Date;
  endedAt?: Date;
  displayName: string;
  description?: string;
  status: LiveStatus;
};

export const Lives = (client: PrismaClient['live']) =>
  Object.assign(client, {
    getPublic: (live: Live): LivePublic => ({
      id: live.id,
      idInTenant: live.idInTenant,
      userId: live.userId,
      tenantId: live.tenantId,
      startedAt: live.startedAt || undefined,
      endedAt: live.endedAt || undefined,
      displayName: live.displayName,
      description: live.description || undefined,
      status: live.status
    })
  });

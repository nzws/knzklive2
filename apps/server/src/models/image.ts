import type { Image, Live, PrismaClient } from '@prisma/client';
import { ImagePublic } from 'api-types/common/types';
import { lives } from '.';
import { StaticStorageClient } from '../services/storage/_client';

export const Images = (prismaImage: PrismaClient['image']) =>
  Object.assign(prismaImage, {
    get: async (id: number) => {
      const data = await prismaImage.findUnique({
        where: {
          id
        }
      });

      return data || undefined;
    },
    getPublic: (image: Image): ImagePublic => ({
      id: image.id,
      publicUrl:
        image.bucket === 'Static'
          ? StaticStorageClient.getUrl(image.url)
          : 'unknown bucket'
    }),
    createForGeneratedLiveThumbnail: async (live: Live, url: string) => {
      const image = await prismaImage.create({
        data: {
          url,
          type: 'Thumbnail',
          bucket: 'Static',
          userId: live.userId,
          tenantId: live.tenantId,
          createdLiveId: live.id
        }
      });

      if (lives.getConfig(live).preferThumbnailType === 'generate') {
        await lives.update({
          where: {
            id: live.id
          },
          data: {
            thumbnailId: image.id
          }
        });
      }

      return image;
    },
    createForCustomLiveThumbnail: async (
      url: string, // path?
      userId: number,
      tenantId: number
    ) => {
      const image = await prismaImage.create({
        data: {
          url,
          type: 'CustomThumbnail',
          bucket: 'Static',
          userId,
          tenantId
        }
      });

      return image;
    }
  });

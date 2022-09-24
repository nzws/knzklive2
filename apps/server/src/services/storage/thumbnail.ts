import { randomUUID } from 'crypto';
import { StaticStorageClient } from './_client';

export class ThumbnailStorage extends StaticStorageClient {
  constructor() {
    super();
  }

  async getUploadUrlFromPushServer(tenantId: number, liveId: number) {
    const key = `live_thumbnails/${tenantId}/live/${liveId}_${randomUUID()}.png`;
    const url = await this.getSignedUploadUrl(key);

    return {
      key,
      url
    };
  }

  async putObject(tenantId: number, ext: string, buffer: Buffer) {
    const key = `live_thumbnails/${tenantId}/custom/${randomUUID()}.${ext}`;

    await super.putObjectFromBuffer(key, buffer);

    return { key };
  }
}

export const thumbnailStorage = new ThumbnailStorage();

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ReadStream, createReadStream } from 'fs';
import { generateToken } from '../../utils/token';

class StorageClient {
  s3: S3Client;

  constructor(
    id: string,
    secret: string,
    endpoint: string,
    region: string,
    protected bucket: string,
    protected acl = 'public-read'
  ) {
    this.s3 = new S3Client({
      credentials: {
        accessKeyId: id,
        secretAccessKey: secret
      },
      endpoint,
      region
    });
  }

  protected async putObjectFromBuffer(key: string, buffer: Buffer) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ACL: this.acl
    });

    await this.s3.send(command);
  }

  protected async putObjectFromStream(
    key: string,
    stream: ReadStream | ReadableStream
  ) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: stream,
      ACL: this.acl
    });

    await this.s3.send(command);
  }
}

export class VideoStorageClient extends StorageClient {
  constructor() {
    super(
      process.env.VIDEO_STORAGE_S3_ID || '',
      process.env.VIDEO_STORAGE_S3_SECRET || '',
      process.env.VIDEO_STORAGE_S3_ENDPOINT || '',
      process.env.VIDEO_STORAGE_S3_REGION || '',
      process.env.VIDEO_STORAGE_S3_BUCKET || '',
      process.env.VIDEO_STORAGE_S3_OVERRIDE_ACL
    );
  }

  static getUrl(key: string) {
    return `${process.env.STATIC_STORAGE_S3_URL_PREFIX || ''}/${key}`;
  }

  async putMp4(liveId: number, filePath: string) {
    const token = generateToken();
    const key = `video_original/${liveId}_${token}/recording.mp4`;
    const stream = createReadStream(filePath);

    await this.putObjectFromStream(key, stream);

    return { key };
  }
}

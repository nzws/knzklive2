import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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

  async getSignedUploadUrl(key: string) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ACL: this.acl
    });

    const signedUrl = await getSignedUrl(this.s3, command, {
      expiresIn: 60 * 5
    });

    return signedUrl;
  }

  async getSignedDownloadUrl(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key
    });

    const signedUrl = await getSignedUrl(this.s3, command, {
      expiresIn: 60 * 60
    });

    return signedUrl;
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
}

export class StaticStorageClient extends StorageClient {
  constructor() {
    super(
      process.env.STATIC_STORAGE_S3_ID || '',
      process.env.STATIC_STORAGE_S3_SECRET || '',
      process.env.STATIC_STORAGE_S3_ENDPOINT || '',
      process.env.STATIC_STORAGE_S3_REGION || '',
      process.env.STATIC_STORAGE_S3_BUCKET || '',
      process.env.STATIC_STORAGE_S3_OVERRIDE_ACL
    );
  }

  static getUrl(key: string) {
    return `${process.env.STATIC_STORAGE_S3_URL_PREFIX || ''}/${key}`;
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
      process.env.VIDEO_STORAGE_S3_OVERRIDE_ACL || 'private'
    );
  }

  static getUrl(key: string) {
    return `${process.env.STATIC_STORAGE_S3_URL_PREFIX || ''}/${key}`;
  }
}

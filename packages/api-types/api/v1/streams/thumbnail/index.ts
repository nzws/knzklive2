import type { ReadStream } from 'fs';
import { AuthorizationHeader, ImagePublic } from '../../../../common/types';

export type Methods = {
  post: {
    reqFormat: FormData;

    reqHeaders: AuthorizationHeader;

    reqBody: {
      tenantId: number;
      file: File | ReadStream;
    };

    resBody: ImagePublic;
  };
};

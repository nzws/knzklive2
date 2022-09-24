import { JSONSchemaType } from 'ajv';
import { Methods } from 'api-types/api/v1/streams/thumbnail';
import { images, tenants } from '../../../models';
import { formatImage } from '../../../services/image';
import { thumbnailStorage } from '../../../services/storage/thumbnail';
import { APIRoute, UserState } from '../../../utils/types';
import { validateWithType } from '../../../utils/validate';

type Request = Methods['post']['reqBody'];
type Response = Methods['post']['resBody'];

const reqBodySchema: JSONSchemaType<Omit<Request, 'file'>> = {
  type: 'object',
  properties: {
    tenantId: {
      type: 'number'
    }
  },
  required: ['tenantId'],
  additionalProperties: false
};

export const postV1StreamsThumbnail: APIRoute<
  never,
  never,
  Request,
  Response,
  UserState
> = async ctx => {
  const body = {
    tenantId: ctx.request.body.tenantId
  };
  if (!validateWithType(reqBodySchema, body)) {
    ctx.status = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }
  const tenant = await tenants.get(body.tenantId);
  if (!tenant || tenant.ownerId !== ctx.state.user.id) {
    ctx.status = 400;
    ctx.body = {
      errorCode: 'tenant_not_found'
    };
    return;
  }

  try {
    const { buffer, extension } = await formatImage(ctx.file.buffer);

    const { key } = await thumbnailStorage.putObject(
      tenant.id,
      extension,
      buffer
    );

    const image = await images.createForCustomLiveThumbnail(
      key,
      ctx.state.user.id,
      tenant.id
    );

    if (!image) {
      throw new Error('failed to create image');
    }

    ctx.status = 200;
    ctx.body = images.getPublic(image);
  } catch (e) {
    console.error(e);

    ctx.status = 500;
    ctx.body = {
      errorCode: 'internal_server_error',
      message:
        '画像を処理できませんでした。正常な画像ファイルか確認してください。引き続き問題が発生する場合は、管理者にお問い合わせください。'
    };
    return;
  }
};

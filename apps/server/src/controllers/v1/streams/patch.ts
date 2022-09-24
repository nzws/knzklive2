import { JSONSchemaType } from 'ajv';
import { Methods } from 'api-types/api/v1/streams/_liveId@number';
import { images, lives } from '../../../models';
import { APIRoute, LiveState, UserState } from '../../../utils/types';
import { validateWithType } from '../../../utils/validate';

type Request = Methods['patch']['reqBody'];
type Response = Methods['patch']['resBody'];

const reqBodySchema: JSONSchemaType<Request> = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
      nullable: true
    },
    description: {
      type: 'string',
      minLength: 0,
      maxLength: 1000,
      nullable: true
    },
    sensitive: {
      type: 'boolean',
      nullable: true
    },
    privacy: {
      type: 'string',
      enum: ['Public', 'Private'],
      nullable: true
    },
    config: {
      type: 'object',
      properties: {
        preferThumbnailType: {
          type: 'string',
          enum: ['generate', 'custom'],
          nullable: true
        }
      },
      nullable: true
    },
    customThumbnailId: {
      type: 'number',
      nullable: true
    }
  },
  additionalProperties: false
};

export const patchV1Streams: APIRoute<
  never,
  never,
  Request,
  Response,
  UserState & LiveState
> = async ctx => {
  if (!validateWithType(reqBodySchema, ctx.request.body)) {
    ctx.status = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }
  const body = ctx.request.body;

  if (body.customThumbnailId !== undefined) {
    const image = await images.get(body.customThumbnailId);
    if (!image || ctx.state.live.tenantId !== image.tenantId) {
      ctx.status = 400;
      ctx.body = {
        errorCode: 'not_found',
        message:
          '指定されたカスタムサムネイル ID は存在しません。詳しくは管理者にお問い合わせください。'
      };
      return;
    }
  }

  await lives.update({
    where: {
      id: ctx.state.live.id
    },
    data: {
      title: body.title,
      description: body.description,
      sensitive: body.sensitive,
      privacy: body.privacy,
      config: body.config,
      thumbnailId: body.customThumbnailId
    }
  });

  ctx.body = {
    success: true
  };
};

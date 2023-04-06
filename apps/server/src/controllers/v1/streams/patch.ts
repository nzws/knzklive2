import { JSONSchemaType } from 'ajv';
import { Methods } from 'api-types/api/v1/streams/_liveId@number';
import { LiveConfig } from 'api-types/common/types';
import { LiveUpdateUpdate } from 'api-types/streaming/live-update';
import { images, lives } from '../../../models';
import { pubsub } from '../../../services/redis/pubsub/client';
import { getLiveUpdateKey } from '../../../services/redis/pubsub/keys';
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
      enum: ['Public', 'Private', 'Hidden'],
      nullable: true
    },
    config: {
      type: 'object',
      properties: {
        preferThumbnailType: {
          type: 'string',
          enum: ['generate', 'custom'],
          nullable: true
        },
        isRequiredFollowing: {
          type: 'boolean',
          nullable: true
        },
        isRequiredFollower: {
          type: 'boolean',
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

  const oldConfig = ctx.state.live.config as Partial<LiveConfig>;

  const newLive = await lives.update({
    where: {
      id: ctx.state.live.id
    },
    data: {
      title: body.title,
      description: body.description,
      sensitive: body.sensitive,
      privacy: body.privacy,
      config: {
        ...oldConfig,
        ...body.config
      },
      thumbnailId: body.customThumbnailId
    },
    include: {
      thumbnail: true,
      tenant: true
    }
  });

  await pubsub.publish(
    getLiveUpdateKey(newLive.id),
    JSON.stringify({
      type: 'live:update',
      data: lives.getPublic(newLive)
    } as LiveUpdateUpdate)
  );

  ctx.body = {
    success: true
  };
};

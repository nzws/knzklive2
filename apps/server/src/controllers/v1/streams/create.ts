import { JSONSchemaType } from 'ajv';
import { Methods } from 'api-types/api/v1/streams';
import { images, lives, tenants } from '../../../models';
import { LiveNotEndedError } from '../../../models/live';
import { pubsub } from '../../../services/redis/pubsub/client';
import { RelationCache } from '../../../services/redis/relation-cache';
import { APIRoute, UserState } from '../../../utils/types';
import { validateWithType } from '../../../utils/validate';
import { enableVideo } from '../../../utils/constants';

type Request = Methods['post']['reqBody'];
type Response = Methods['post']['resBody'];

const reqBodySchema: JSONSchemaType<Request> = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      minLength: 1,
      maxLength: 100
    },
    description: {
      type: 'string',
      minLength: 0,
      maxLength: 1000,
      nullable: true
    },
    privacy: {
      type: 'string',
      enum: ['Public', 'Private']
    },
    sensitive: {
      type: 'boolean'
    },
    hashtag: {
      type: 'string',
      minLength: 0,
      maxLength: 100,
      nullable: true
    },
    tenantId: {
      type: 'number'
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
      }
    },
    customThumbnailId: {
      type: 'number',
      nullable: true
    },
    isRecording: {
      type: 'boolean'
    }
  },
  required: [
    'title',
    'privacy',
    'sensitive',
    'tenantId',
    'config',
    'isRecording'
  ],
  additionalProperties: false
};

export const postV1Streams: APIRoute<
  never,
  never,
  Request,
  Response,
  UserState
> = async ctx => {
  if (!validateWithType(reqBodySchema, ctx.request.body)) {
    ctx.status = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }
  const body = ctx.request.body;
  const tenant = await tenants.get(body.tenantId);
  if (!tenant || tenant.ownerId !== ctx.state.user.id) {
    ctx.status = 400;
    ctx.body = {
      errorCode: 'tenant_not_found'
    };
    return;
  }

  if (body.customThumbnailId !== undefined) {
    const image = await images.get(body.customThumbnailId);
    if (!image || image.tenantId !== tenant.id) {
      ctx.status = 400;
      ctx.body = {
        errorCode: 'not_found',
        message:
          '指定されたカスタムサムネイル ID は存在しません。詳しくは管理者にお問い合わせください。'
      };
      return;
    }
  }

  if (!enableVideo && body.isRecording) {
    ctx.status = 400;
    ctx.body = {
      errorCode: 'invalid_request',
      message: 'レコーディングは現在無効になっています。'
    };
    return;
  }

  try {
    const live = await lives.createLive(
      tenant.id,
      ctx.state.user.id,
      body.title,
      body.privacy,
      body.isRecording,
      body.description,
      body.hashtag,
      body.config,
      body.customThumbnailId
    );
    if (body.hashtag) {
      await pubsub.publish(
        'update:hashtag',
        JSON.stringify({
          hashtag: body.hashtag,
          type: 'add',
          liveId: live.id
        })
      );
    }

    await new RelationCache(ctx.state.user.id).reset();

    const livePublic = lives.getPublic(live);

    ctx.body = {
      live: livePublic
    };
  } catch (e) {
    if (e instanceof LiveNotEndedError) {
      ctx.status = 400;
      ctx.body = {
        errorCode: 'live_not_ended',
        message:
          '終了されていない配信がテナント内に存在します。新たに配信を作成するには、先に既存の配信を終了させてください。'
      };
      return;
    }

    throw e;
  }
};

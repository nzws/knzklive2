import { Image, Live, Tenant } from '@prisma/client';
import { JSONSchemaType } from 'ajv';
import { Methods } from 'api-types/api/v1/internals/push/action';
import { LiveUpdateUpdate } from 'api-types/streaming/live-update';
import { lives } from '../../../../models';
import { pubsub } from '../../../../services/redis/pubsub/client';
import { getLiveUpdateKey } from '../../../../services/redis/pubsub/keys';
import { APIRoute } from '../../../../utils/types';
import { validateWithType } from '../../../../utils/validate';
import { thumbnailQueue } from '../../../../services/queues/thumbnail';

type Request = Methods['post']['reqBody'];
type Response = Methods['post']['resBody'];

const reqBodySchema: JSONSchemaType<Request> = {
  type: 'object',
  properties: {
    liveId: {
      type: 'number',
      minimum: 1
    },
    action: {
      type: 'string'
    },
    serverToken: {
      type: 'string'
    }
  },
  required: ['liveId', 'action', 'serverToken'],
  additionalProperties: false
};

export const postV1InternalsPushAction: APIRoute<
  never,
  never,
  Request,
  Response
> = async ctx => {
  const body = ctx.request.body;
  if (!validateWithType(reqBodySchema, body)) {
    ctx.status = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }

  const live = await lives.get(body.liveId);
  if (!live) {
    ctx.status = 404;
    ctx.body = {
      errorCode: 'not_found'
    };
    return;
  }

  let newLive: Live & {
    thumbnail?: Image | null;
    tenant: Tenant;
  };
  if (body.action === 'start') {
    newLive = await lives.startStream(live);
    const date = new Date();
    date.setSeconds(date.getSeconds() + 3);
    await thumbnailQueue.createJob({ live }).delayUntil(date).retries(0).save();
  } else if (body.action === 'stop') {
    newLive = await lives.stopStream(live);
  } else {
    ctx.status = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }

  if (newLive) {
    void pubsub.publish(
      getLiveUpdateKey(newLive.id),
      JSON.stringify({
        type: 'live:update',
        data: lives.getPublic(newLive)
      } as LiveUpdateUpdate)
    );
  }

  ctx.status = 200;
  ctx.body = {
    success: true
  };
};

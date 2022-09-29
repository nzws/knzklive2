import { Live } from '@prisma/client';
import { JSONSchemaType } from 'ajv';
import { Methods } from 'api-types/api/v1/internals/push/action';
import { LiveUpdateUpdate } from 'api-types/streaming/live-update';
import { images, lives } from '../../../../models';
import { pubsub } from '../../../../services/redis/pubsub/client';
import { getLiveUpdateKey } from '../../../../services/redis/pubsub/keys';
import { pushApi } from '../../../../services/push-api';
import { thumbnailStorage } from '../../../../services/storage/thumbnail';
import { basePushStream, serverToken } from '../../../../utils/constants';
import { APIRoute } from '../../../../utils/types';
import { validateWithType } from '../../../../utils/validate';

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

  let newLive: Live;
  if (body.action === 'start') {
    newLive = await lives.startStream(live);

    // todo: to worker
    setTimeout(() => {
      void (async () => {
        try {
          const { key, url } =
            await thumbnailStorage.getUploadUrlFromPushServer(
              live.tenantId,
              live.id
            );

          await pushApi(basePushStream).api.externals.v1.thumbnail.$post({
            body: {
              liveId: live.id,
              serverToken,
              signedUploadUrl: url
            }
          });

          await images.createForGeneratedLiveThumbnail(live, key);
        } catch (e) {
          console.error(e);
        }
      })();
    }, 1000);
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

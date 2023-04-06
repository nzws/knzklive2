import { Image, Live, LiveRecordingStatus, Tenant } from '@prisma/client';
import { JSONSchemaType } from 'ajv';
import { Methods } from 'api-types/api/v1/internals/push/action';
import { LiveUpdateUpdate } from 'api-types/streaming/live-update';
import { liveRecordings, lives } from '../../../../models';
import { pubsub } from '../../../../services/redis/pubsub/client';
import { getLiveUpdateKey } from '../../../../services/redis/pubsub/keys';
import { APIRoute } from '../../../../utils/types';
import { validateWithType } from '../../../../utils/validate';
import { webhookQueue } from '../../../../services/queues/webhook';
import { videoApi } from '../../../../services/video-api';
import { baseVideoStream, serverToken } from '../../../../utils/constants';

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
      type: 'string',
      enum: [
        'stream:start',
        'stream:stop',
        'record:processing',
        'record:done',
        'record:failed'
      ]
    },
    serverToken: {
      type: 'string'
    },
    recordingKey: {
      type: 'string',
      nullable: true
    },
    fileSize: {
      type: 'string',
      nullable: true
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

  let newLive:
    | (Live & {
        thumbnail?: Image | null;
        tenant: Tenant;
      })
    | undefined;
  if (body.action === 'stream:start') {
    newLive = await lives.startStream(live);
  } else if (body.action === 'stream:stop') {
    newLive = await lives.stopStream(live);
  } else if (body.action === 'record:processing') {
    await liveRecordings.createOrUpdateOriginalStatus(
      live.id,
      LiveRecordingStatus.Processing
    );
  } else if (body.action === 'record:done') {
    if (!body.recordingKey || !body.fileSize) {
      ctx.status = 400;
      ctx.body = {
        errorCode: 'invalid_request'
      };
      return;
    }

    await liveRecordings.createOrUpdateOriginalStatus(
      live.id,
      LiveRecordingStatus.Completed,
      body.recordingKey,
      BigInt(body.fileSize)
    );

    if (live.watchToken) {
      await webhookQueue.add('system:video:publish', {
        url: videoApi(
          baseVideoStream
        ).api.externals.v1.recording.publish.$path(),
        postBody: {
          liveId: live.id,
          watchToken: live.watchToken,
          serverToken
        },
        timeout: 1000 * 60
      });
    }
  } else if (body.action === 'record:failed') {
    await liveRecordings.createOrUpdateOriginalStatus(
      live.id,
      LiveRecordingStatus.Failed
    );
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

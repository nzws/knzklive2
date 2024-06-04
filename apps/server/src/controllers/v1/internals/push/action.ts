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
import { VideoStorageClient } from '../../../../services/storage/_client';

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
        'record:failed',
        'stream:heartbeat'
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
    },
    stats: {
      type: 'object',
      properties: {
        kbps: {
          type: 'object',
          properties: {
            recv_30s: {
              type: 'number'
            },
            send_30s: {
              type: 'number'
            }
          },
          required: ['recv_30s', 'send_30s']
        },
        video: {
          type: 'object',
          properties: {
            codec: {
              type: 'string'
            },
            profile: {
              type: 'string'
            },
            level: {
              type: 'string'
            },
            width: {
              type: 'number'
            },
            height: {
              type: 'number'
            }
          },
          required: ['codec', 'profile', 'level', 'width', 'height'],
          nullable: true
        },
        audio: {
          type: 'object',
          properties: {
            codec: {
              type: 'string'
            },
            sample_rate: {
              type: 'number'
            },
            channel: {
              type: 'number'
            },
            profile: {
              type: 'string'
            }
          },
          required: ['codec', 'sample_rate', 'channel', 'profile'],
          nullable: true
        }
      },
      required: ['kbps'],
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

    const downloadUrl = await new VideoStorageClient().getSignedDownloadUrl(
      body.recordingKey
    );

    if (live.watchToken) {
      await webhookQueue.add('system:video:publish', {
        url: videoApi(
          baseVideoStream
        ).api.externals.v1.recording.publish.$path(),
        postBody: {
          liveId: live.id,
          watchToken: live.watchToken,
          serverToken,
          downloadUrl,
          originalBytes: body.fileSize
        },
        timeout: 1000 * 60
      });
    }
  } else if (body.action === 'record:failed') {
    await liveRecordings.createOrUpdateOriginalStatus(
      live.id,
      LiveRecordingStatus.Failed
    );
  } else if (body.action === 'stream:heartbeat') {
    if (!body.stats) {
      ctx.status = 400;
      ctx.body = {
        errorCode: 'invalid_request'
      };
      return;
    }

    await lives.updateStats(live, body.stats);
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

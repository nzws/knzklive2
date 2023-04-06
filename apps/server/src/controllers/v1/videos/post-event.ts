import { JSONSchemaType } from 'ajv';
import { Methods } from 'api-types/api/v1/videos/_liveId@number/event';
import { liveRecordings } from '../../../models';
import { APIRoute, LiveState, UserState } from '../../../utils/types';
import { validateWithType } from '../../../utils/validate';
import { LiveRecordingStatus } from '@prisma/client';
import { VideoWatchingLogCache } from '../../../services/redis/video-watching-log-cache';
import { getIP } from '../../../utils/ip';

type Request = Methods['post']['reqBody'];
type Response = Methods['post']['resBody'];

const reqBodySchema: JSONSchemaType<Request> = {
  type: 'object',
  properties: {
    status: {
      type: 'string',
      enum: ['playing', 'paused', 'ended']
    },
    seek: {
      type: 'number',
      minimum: 0
    }
  },
  required: ['status', 'seek'],
  additionalProperties: false
};

export const postV1VideoEvent: APIRoute<
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

  const recording = await liveRecordings.get(ctx.state.live.id);
  if (!recording || recording.cacheStatus !== LiveRecordingStatus.Completed) {
    ctx.status = 404;
    ctx.body = {
      errorCode: 'not_found'
    };
    return;
  }

  const body = ctx.request.body;
  const videoWatchingLog = new VideoWatchingLogCache(recording.id);
  await videoWatchingLog.insert(getIP(ctx), body.status, body.seek);

  ctx.body = {
    success: true
  };
};
